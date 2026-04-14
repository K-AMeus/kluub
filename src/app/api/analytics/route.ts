import { NextResponse } from 'next/server';
import { createClient } from '@/supabase/server';

const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST!;
const POSTHOG_PERSONAL_API_KEY = process.env.POSTHOG_PERSONAL_API_KEY!;
const POSTHOG_PROJECT_ID = process.env.POSTHOG_PROJECT_ID!;

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function queryPostHog(hogql: string) {
  const res = await fetch(`${POSTHOG_HOST}/api/projects/${POSTHOG_PROJECT_ID}/query/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${POSTHOG_PERSONAL_API_KEY}`,
    },
    body: JSON.stringify({
      query: {
        kind: 'HogQLQuery',
        query: hogql,
      },
    }),
  });

  if (!res.ok) {
    throw new Error(`PostHog query failed: ${res.status}`);
  }

  return res.json();
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: hostUserData, error: hostError } = await supabase
      .from('host_users')
      .select(`
        host_id,
        hosts (id, name)
      `)
      .eq('user_id', user.id);

    if (hostError) {
      return NextResponse.json({ error: 'Failed to fetch hosts' }, { status: 500 });
    }

    const hosts = (hostUserData?.map((hu: any) => hu.hosts).filter(Boolean) || []);

    if (hosts.length === 0) {
      return NextResponse.json({ hosts: [], hostAnalytics: {}, eventAnalytics: {}, viewsByWeekday: Array(7).fill(0), viewsByHour: Array(24).fill(0) });
    }

    const validHostIds = hosts
      .map((h: any) => h.id as string)
      .filter((id: string) => UUID_REGEX.test(id));

    if (validHostIds.length === 0) {
      return NextResponse.json({ hosts: [], hostAnalytics: {}, eventAnalytics: {}, viewsByWeekday: Array(7).fill(0), viewsByHour: Array(24).fill(0) });
    }

    const { data: eventRows, error: eventsError } = await supabase
      .from('events')
      .select('id, host_id')
      .in('host_id', validHostIds);

    if (eventsError) {
      return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
    }

    const eventIds = (eventRows || []).map((e: any) => e.id as string).filter((id: string) => UUID_REGEX.test(id));

    if (eventIds.length === 0) {
      return NextResponse.json({ hosts, hostAnalytics: {}, eventAnalytics: {}, viewsByWeekday: Array(7).fill(0), viewsByHour: Array(24).fill(0) });
    }

    const eventIdList = eventIds.map((id: string) => `'${id}'`).join(', ');

    const [eventResult, viewsDistributionResult] = await Promise.all([
      // Event-level analytics: views + clicks per event
      queryPostHog(`
        SELECT
          properties.event_id AS event_id,
          countIf(event = 'event_detail_viewed') AS detail_views,
          countIf(event = 'facebook_event_clicked') AS facebook_clicks
        FROM events
        WHERE event IN ('event_detail_viewed', 'facebook_event_clicked')
          AND properties.event_id IN (${eventIdList})
        GROUP BY properties.event_id
      `),
      // Views distribution by weekday and hour
      queryPostHog(`
        SELECT 'weekday' AS type, days.day AS slot, coalesce(counts.count, 0) AS count
        FROM (SELECT arrayJoin([1,2,3,4,5,6,7]) AS day) AS days
        LEFT JOIN (
          SELECT toDayOfWeek(toTimeZone(timestamp, 'Europe/Tallinn')) AS day, count() AS count
          FROM events
          WHERE event = 'event_detail_viewed'
            AND properties.event_id IN (${eventIdList})
          GROUP BY day
        ) AS counts ON days.day = counts.day
        UNION ALL
        SELECT 'hour' AS type, hours.hour AS slot, coalesce(counts.count, 0) AS count
        FROM (SELECT arrayJoin(range(0, 24)) AS hour) AS hours
        LEFT JOIN (
          SELECT toHour(toTimeZone(timestamp, 'Europe/Tallinn')) AS hour, count() AS count
          FROM events
          WHERE event = 'event_detail_viewed'
            AND properties.event_id IN (${eventIdList})
          GROUP BY hour
        ) AS counts ON hours.hour = counts.hour
        ORDER BY type, slot
      `),
    ]);

    // Build event analytics map
    const eventAnalytics: Record<string, { detailViews: number; facebookClicks: number }> = {};
    for (const row of eventResult.results || []) {
      const [eventId, detailViews, facebookClicks] = row;
      eventAnalytics[eventId] = { detailViews, facebookClicks };
    }

    // Parse distribution results
    const distributionRows: [string, number, number][] = viewsDistributionResult.results || [];
    const viewsByWeekday = distributionRows.filter(([type]) => type === 'weekday').map(([, , count]) => count);
    const viewsByHour = distributionRows.filter(([type]) => type === 'hour').map(([, , count]) => count);

    const hostAnalytics: Record<string, { detailViews: number; facebookClicks: number }> = {};
    for (const id of validHostIds) {
      hostAnalytics[id] = { detailViews: 0, facebookClicks: 0 };
    }
    for (const row of eventRows || []) {
      const hId = row.host_id as string;
      const eStats = eventAnalytics[row.id] || { detailViews: 0, facebookClicks: 0 };
      if (hostAnalytics[hId]) {
        hostAnalytics[hId].detailViews += eStats.detailViews;
        hostAnalytics[hId].facebookClicks += eStats.facebookClicks;
      }
    }

    const response = NextResponse.json({ hosts, hostAnalytics, eventAnalytics, viewsByWeekday, viewsByHour });
    response.headers.set('Cache-Control', 'private, max-age=300, stale-while-revalidate=60');
    return response;
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
