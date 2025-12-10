import { createClient } from '@/supabase/server';
import { Event, City, PriceTier } from './types';

interface EventDbRow {
  id: string;
  title: string;
  description: string;
  price_tier: number;
  venue_id: string;
  city: City;
  top_pick: boolean;
  image_url: string | null;
  facebook_url: string | null;
  start_time: string;
  end_time: string;
  venues: { name: string } | null;
}

function transformEvent(row: EventDbRow): Event {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    priceTier: row.price_tier as PriceTier,
    venueId: row.venue_id,
    venue: row.venues?.name ?? 'Unknown Venue',
    city: row.city,
    topPick: row.top_pick,
    imageUrl: row.image_url,
    facebookUrl: row.facebook_url,
    startTime: row.start_time,
    endTime: row.end_time,
  };
}

export async function getEventsByCity(city: City): Promise<Event[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('events')
    .select(
      `
      id,
      title,
      description,
      price_tier,
      venue_id,
      city,
      top_pick,
      image_url,
      facebook_url,
      start_time,
      end_time,
      venues (name)
    `
    )
    .eq('city', city)
    .gte('start_time', new Date().toISOString())
    .order('start_time', { ascending: true });

  if (error) {
    console.error('Error fetching events by city:', error);
    return [];
  }

  return (data ?? []).map((row) =>
    transformEvent(row as unknown as EventDbRow)
  );
}

export async function getTopPicks(city: City): Promise<Event[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('events')
    .select(
      `
      id,
      title,
      description,
      price_tier,
      venue_id,
      city,
      top_pick,
      image_url,
      facebook_url,
      start_time,
      end_time,
      venues (name)
    `
    )
    .eq('city', city)
    .eq('top_pick', true)
    .gte('start_time', new Date().toISOString())
    .order('start_time', { ascending: true });

  if (error) {
    console.error('Error fetching top picks:', error);
    return [];
  }

  return (data ?? []).map((row) =>
    transformEvent(row as unknown as EventDbRow)
  );
}

export async function getEventById(id: string): Promise<Event | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('events')
    .select(
      `
      id,
      title,
      description,
      price_tier,
      venue_id,
      city,
      top_pick,
      image_url,
      facebook_url,
      start_time,
      end_time,
      venues (name)
    `
    )
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching event by id:', error);
    return null;
  }

  return transformEvent(data as unknown as EventDbRow);
}
