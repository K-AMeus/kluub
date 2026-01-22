'use server';

import { unstable_cache } from 'next/cache';
import { createStaticClient } from '@/supabase/server';
import { Event, City, PriceTier } from './types';

const CACHE_REVALIDATE_SECONDS = 86400;

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

async function fetchEventsByCity(city: City): Promise<Event[]> {
  const supabase = createStaticClient();

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

export async function getEventsByCity(city: City) {
  return unstable_cache(fetchEventsByCity, ['events-by-city', city], {
    revalidate: CACHE_REVALIDATE_SECONDS,
    tags: ['events'],
  })(city);
}

async function fetchTopPicks(city: City): Promise<Event[]> {
  const supabase = createStaticClient();

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

export async function getTopPicks(city: City) {
  return unstable_cache(fetchTopPicks, ['top-picks', city], {
    revalidate: CACHE_REVALIDATE_SECONDS,
    tags: ['events'],
  })(city);
}

async function fetchEventById(id: string): Promise<Event | null> {
  const supabase = createStaticClient();

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

export async function getEventById(id: string) {
  return unstable_cache(fetchEventById, ['event-by-id', id], {
    revalidate: CACHE_REVALIDATE_SECONDS,
    tags: ['events'],
  })(id);
}

export async function revalidateEvents() {
  const { revalidateTag } = await import('next/cache');
  revalidateTag('events', 'max');
}

export interface VenueOption {
  id: string;
  name: string;
}

async function fetchVenuesByCity(city: City): Promise<VenueOption[]> {
  const supabase = createStaticClient();

  const { data, error } = await supabase
    .from('venues')
    .select('id, name')
    .eq('city', city)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching venues:', error);
    return [];
  }

  return data ?? [];
}

export async function getVenuesByCity(city: City) {
  return unstable_cache(fetchVenuesByCity, ['venues-by-city', city], {
    revalidate: CACHE_REVALIDATE_SECONDS,
    tags: ['venues'],
  })(city);
}