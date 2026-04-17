import { NextResponse } from 'next/server';
import { createClient } from '@/supabase/server';

const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST!;
const POSTHOG_PERSONAL_API_KEY = process.env.POSTHOG_PERSONAL_API_KEY!;
const POSTHOG_PROJECT_ID = process.env.POSTHOG_PROJECT_ID!;

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface HostRow {
  id: string;
  name: string;
}

interface HostUserRow {
  host_id: string;
  hosts: HostRow | HostRow[] | null;
}

interface EventRow {
  id: string;
  host_id: string;
}

type HogQLValue = string | number | boolean | string[] | number[];

interface HogQLResponse<TRow = unknown[]> {
  results?: TRow[];
}

async function queryPostHog<TRow = unknown[]>(
  query: string,
  values: Record<string, HogQLValue> = {},
): Promise<HogQLResponse<TRow>> {
  const res = await fetch(
    `${POSTHOG_HOST}/api/projects/${POSTHOG_PROJECT_ID}/query/`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${POSTHOG_PERSONAL_API_KEY}`,
      },
      body: JSON.stringify({
        query: {
          kind: 'HogQLQuery',
          query,
          values,
        },
      }),
    },
  );

  if (!res.ok) {
    throw new Error(`PostHog query failed: ${res.status}`);
  }

  return res.json();
}

function emptyAnalyticsResponse(hosts: HostRow[]) {
  return NextResponse.json({
    hosts,
    hostAnalytics: {},
    eventAnalytics: {},
    viewsByWeekday: Array(7).fill(0),
    viewsByHour: Array(24).fill(0),
  });
}

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const hostUsersQuery = await supabase
      .from('host_users')
      .select(`host_id, hosts (id, name)`)
      .eq('user_id', user.id);
    const hostError = hostUsersQuery.error;
    const hostUserData = hostUsersQuery.data as HostUserRow[] | null;

    if (hostError) {
      return NextResponse.json(
        { error: 'Failed to fetch hosts' },
        { status: 500 },
      );
    }

    const hosts: HostRow[] = (hostUserData ?? [])
      .flatMap((hu) =>
        Array.isArray(hu.hosts) ? hu.hosts : hu.hosts ? [hu.hosts] : [],
      )
      .filter((h): h is HostRow => Boolean(h));

    if (hosts.length === 0) {
      return emptyAnalyticsResponse([]);
    }

    const validHostIds = hosts
      .map((h) => h.id)
      .filter((id) => UUID_REGEX.test(id));

    if (validHostIds.length === 0) {
      return emptyAnalyticsResponse([]);
    }

    const eventsQuery = await supabase
      .from('events')
      .select('id, host_id')
      .in('host_id', validHostIds);
    const eventsError = eventsQuery.error;
    const eventRows = eventsQuery.data as EventRow[] | null;

    if (eventsError) {
      return NextResponse.json(
        { error: 'Failed to fetch events' },
        { status: 500 },
      );
    }

    const eventIds = (eventRows ?? [])
      .map((e) => e.id)
      .filter((id) => UUID_REGEX.test(id));

    if (eventIds.length === 0) {
      return emptyAnalyticsResponse(hosts);
    }

    // All HogQL queries use bound parameters ({event_ids}) rather than string
    // interpolation so untrusted data can never alter query structure.
    const [eventResult, viewsDistributionResult] = await Promise.all([
      queryPostHog<[string, number, number]>(
        `
          SELECT
            properties.event_id AS event_id,
            countIf(event = 'event_detail_viewed') AS detail_views,
            countIf(event = 'facebook_event_clicked') AS facebook_clicks
          FROM events
          WHERE event IN ('event_detail_viewed', 'facebook_event_clicked')
            AND properties.event_id IN {event_ids}
          GROUP BY properties.event_id
        `,
        { event_ids: eventIds },
      ),
      queryPostHog<[string, number, number]>(
        `
          SELECT 'weekday' AS type, days.day AS slot, coalesce(counts.count, 0) AS count
          FROM (SELECT arrayJoin([1,2,3,4,5,6,7]) AS day) AS days
          LEFT JOIN (
            SELECT toDayOfWeek(toTimeZone(timestamp, 'Europe/Tallinn')) AS day, count() AS count
            FROM events
            WHERE event = 'event_detail_viewed'
              AND properties.event_id IN {event_ids}
            GROUP BY day
          ) AS counts ON days.day = counts.day
          UNION ALL
          SELECT 'hour' AS type, hours.hour AS slot, coalesce(counts.count, 0) AS count
          FROM (SELECT arrayJoin(range(0, 24)) AS hour) AS hours
          LEFT JOIN (
            SELECT toHour(toTimeZone(timestamp, 'Europe/Tallinn')) AS hour, count() AS count
            FROM events
            WHERE event = 'event_detail_viewed'
              AND properties.event_id IN {event_ids}
            GROUP BY hour
          ) AS counts ON hours.hour = counts.hour
          ORDER BY type, slot
        `,
        { event_ids: eventIds },
      ),
    ]);

    const eventAnalytics: Record<
      string,
      { detailViews: number; facebookClicks: number }
    > = {};
    for (const [eventId, detailViews, facebookClicks] of eventResult.results ??
      []) {
      eventAnalytics[eventId] = { detailViews, facebookClicks };
    }

    const distributionRows = viewsDistributionResult.results ?? [];
    const viewsByWeekday = distributionRows
      .filter(([type]) => type === 'weekday')
      .map(([, , count]) => count);
    const viewsByHour = distributionRows
      .filter(([type]) => type === 'hour')
      .map(([, , count]) => count);

    const hostAnalytics: Record<
      string,
      { detailViews: number; facebookClicks: number }
    > = {};
    for (const id of validHostIds) {
      hostAnalytics[id] = { detailViews: 0, facebookClicks: 0 };
    }
    for (const row of eventRows ?? []) {
      const stats = eventAnalytics[row.id] ?? {
        detailViews: 0,
        facebookClicks: 0,
      };
      const bucket = hostAnalytics[row.host_id];
      if (bucket) {
        bucket.detailViews += stats.detailViews;
        bucket.facebookClicks += stats.facebookClicks;
      }
    }

    const response = NextResponse.json({
      hosts,
      hostAnalytics,
      eventAnalytics,
      viewsByWeekday,
      viewsByHour,
    });
    response.headers.set(
      'Cache-Control',
      'private, max-age=300, stale-while-revalidate=60',
    );
    return response;
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 },
    );
  }
}
