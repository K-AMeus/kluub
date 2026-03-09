import { NextResponse } from 'next/server';
import { createClient } from '@/supabase/server';

const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST!;
const POSTHOG_PERSONAL_API_KEY = process.env.POSTHOG_PERSONAL_API_KEY!;
const POSTHOG_PROJECT_ID = process.env.POSTHOG_PROJECT_ID!;

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

    // Get user's venue IDs
    const { data: venueUserData, error: venueError } = await supabase
      .from('venue_users')
      .select('venue_id')
      .eq('user_id', user.id);

    if (venueError) {
      return NextResponse.json({ error: 'Failed to fetch venues' }, { status: 500 });
    }

    const venueIds = (venueUserData || []).map((vu: any) => vu.venue_id);

    if (venueIds.length === 0) {
      return NextResponse.json({ analytics: {} });
    }

    const venueIdList = venueIds.map((id: string) => `'${id}'`).join(', ');

    const [viewsResult, clicksResult, eventViewsResult, eventClicksResult] = await Promise.all([
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
    ]);

    // Build analytics map: venue_id -> { detailViews, facebookClicks }
    const analytics: Record<string, { detailViews: number; facebookClicks: number }> = {};

    for (const id of venueIds) {
      analytics[id] = { detailViews: 0, facebookClicks: 0 };
    }

    for (const row of viewsResult.results || []) {
      const [venueId, count] = row;
      if (analytics[venueId]) {
        analytics[venueId].detailViews = count;
      }
    }

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

    return NextResponse.json({ analytics, eventAnalytics });
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
