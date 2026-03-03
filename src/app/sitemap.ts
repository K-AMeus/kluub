import type { MetadataRoute } from 'next';
import { createStaticClient } from '@/supabase/server';

const BASE_URL = 'https://www.kluub.ee';

const locales = ['et', 'en'] as const;
const cities = ['tartu'] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];


  for (const locale of locales) {
    entries.push({
      url: `${BASE_URL}/${locale}`,
    });
  }

  for (const locale of locales) {
    for (const city of cities) {
      entries.push({
        url: `${BASE_URL}/${locale}/events/${city}`,
      });
    }
  }

  try {
    const supabase = createStaticClient();

    const { data: events } = await supabase
      .from('events')
      .select('id, city')
      .gte('start_time', new Date().toISOString())
      .order('start_time', { ascending: true })
      .limit(500);

    if (events) {
      for (const event of events) {
        const citySlug = event.city.toLowerCase();

        for (const locale of locales) {
          entries.push({
            url: `${BASE_URL}/${locale}/events/${citySlug}/${event.id}`,
          });
        }
      }
    }
  } catch (error) {
    console.error('Error generating sitemap events:', error);
  }

  return entries;
}