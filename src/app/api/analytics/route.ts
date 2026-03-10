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
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
