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

    const { data: venueUserData, error: venueError } = await supabase
      .from('venue_users')
      .select(`
        venue_id,
        venues (id, name, city, address, lat, lng)
      `)
      .eq('user_id', user.id);

    if (venueError) {
      return NextResponse.json({ error: 'Failed to fetch venues' }, { status: 500 });
    }

    const venues = (venueUserData?.map((vu: any) => vu.venues).filter(Boolean) || []);

    if (venues.length === 0) {
      return NextResponse.json({ venues: [], analytics: {} });
    }

    const validVenueIds = venues
      .map((v: any) => v.id as string)
      .filter((id: string) => UUID_REGEX.test(id));

    if (validVenueIds.length === 0) {
      return NextResponse.json({ venues: [], analytics: {} });
    }

    const venueIdList = validVenueIds.map((id: string) => `'${id}'`).join(', ');

    const result = await queryPostHog(`
      SELECT
        properties.venue_id AS venue_id,
        countIf(event = 'event_detail_viewed') AS detail_views,
        countIf(event = 'facebook_event_clicked') AS facebook_clicks
      FROM events
      WHERE event IN ('event_detail_viewed', 'facebook_event_clicked')
        AND properties.venue_id IN (${venueIdList})
      GROUP BY properties.venue_id
    `);
    const [viewsResult, clicksResult, eventViewsResult, eventClicksResult, viewsDistributionResult] = await Promise.all([
      queryPostHog(`
        SELECT properties.venue_id AS venue_id, count() AS count
        FROM events
        WHERE event = 'event_detail_viewed'
          AND properties.venue_id IN (${venueIdList})
        GROUP BY properties.venue_id
      `),
      queryPostHog(`
        SELECT properties.venue_id AS venue_id, count() AS count
        FROM events
        WHERE event = 'facebook_event_clicked'
          AND properties.venue_id IN (${venueIdList})
        GROUP BY properties.venue_id
      `),
      queryPostHog(`
        SELECT properties.event_id AS event_id, count() AS count
        FROM events
        WHERE event = 'event_detail_viewed'
          AND properties.venue_id IN (${venueIdList})
        GROUP BY properties.event_id
      `),
      queryPostHog(`
        SELECT properties.event_id AS event_id, count() AS count
        FROM events
        WHERE event = 'facebook_event_clicked'
          AND properties.venue_id IN (${venueIdList})
        GROUP BY properties.event_id
      `),
      queryPostHog(`
        SELECT 'weekday' AS type, days.day AS slot, coalesce(counts.count, 0) AS count
        FROM (SELECT arrayJoin([1,2,3,4,5,6,7]) AS day) AS days
        LEFT JOIN (
          SELECT toDayOfWeek(toTimeZone(timestamp, 'Europe/Tallinn')) AS day, count() AS count
          FROM events
          WHERE event = 'event_detail_viewed'
            AND properties.venue_id IN (${venueIdList})
          GROUP BY day
        ) AS counts ON days.day = counts.day
        UNION ALL
        SELECT 'hour' AS type, hours.hour AS slot, coalesce(counts.count, 0) AS count
        FROM (SELECT arrayJoin(range(0, 24)) AS hour) AS hours
        LEFT JOIN (
          SELECT toHour(toTimeZone(timestamp, 'Europe/Tallinn')) AS hour, count() AS count
          FROM events
          WHERE event = 'event_detail_viewed'
            AND properties.venue_id IN (${venueIdList})
          GROUP BY hour
        ) AS counts ON hours.hour = counts.hour
        ORDER BY type, slot
      `),
    ]);

    // Build analytics map: venue_id -> { detailViews, facebookClicks }
    const analytics: Record<string, { detailViews: number; facebookClicks: number }> = {};

    for (const id of validVenueIds) {
      analytics[id] = { detailViews: 0, facebookClicks: 0 };
    }

    for (const row of result.results || []) {
      const [venueId, detailViews, facebookClicks] = row;
      if (analytics[venueId]) {
        analytics[venueId].detailViews = detailViews;
        analytics[venueId].facebookClicks = facebookClicks;
      }
    }

    return NextResponse.json({ venues, analytics });
    for (const row of clicksResult.results || []) {
      const [venueId, count] = row;
      if (analytics[venueId]) {
        analytics[venueId].facebookClicks = count;
      }
    }

    // Build per-event analytics map: event_id -> { detailViews, facebookClicks }
    const eventAnalytics: Record<string, { detailViews: number; facebookClicks: number }> = {};

    for (const row of eventViewsResult.results || []) {
      const [eventId, count] = row;
      if (!eventAnalytics[eventId]) {
        eventAnalytics[eventId] = { detailViews: 0, facebookClicks: 0 };
      }
      eventAnalytics[eventId].detailViews = count;
    }

    for (const row of eventClicksResult.results || []) {
      const [eventId, count] = row;
      if (!eventAnalytics[eventId]) {
        eventAnalytics[eventId] = { detailViews: 0, facebookClicks: 0 };
      }
      eventAnalytics[eventId].facebookClicks = count;
    }

    const distributionRows: [string, number, number][] = viewsDistributionResult.results || [];
    const viewsByWeekday = distributionRows.filter(([type]) => type === 'weekday').map(([, , count]) => count);
    const viewsByHour = distributionRows.filter(([type]) => type === 'hour').map(([, , count]) => count);

    const response = NextResponse.json({ analytics, eventAnalytics, viewsByWeekday, viewsByHour });
    response.headers.set('Cache-Control', 'private, max-age=300, stale-while-revalidate=60');
    return response;
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
