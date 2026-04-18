import type { MetadataRoute } from 'next';
import { createStaticClient } from '@/supabase/server';

const BASE_URL = 'https://www.kluub.ee';

const locales = ['et', 'en'] as const;
const cities = ['tartu'] as const;

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    entries.push({
      url: `${BASE_URL}/${locale}`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1,
    });

    entries.push({
      url: `${BASE_URL}/${locale}/join`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    });
  }

  for (const locale of locales) {
    for (const city of cities) {
      entries.push({
        url: `${BASE_URL}/${locale}/events/${city}`,
        lastModified: now,
        changeFrequency: 'daily',
        priority: 0.9,
      });
    }
  }

  try {
    const supabase = createStaticClient();

    const { data: events } = await supabase
      .from('events')
      .select('id, city, start_time')
      .gte('start_time', now.toISOString())
      .order('start_time', { ascending: true })
      .limit(500);

    if (events) {
      for (const event of events) {
        const citySlug = event.city.toLowerCase();
        const lastModified = new Date(event.start_time ?? now);

        for (const locale of locales) {
          entries.push({
            url: `${BASE_URL}/${locale}/events/${citySlug}/${event.id}`,
            lastModified,
            changeFrequency: 'weekly',
            priority: 0.7,
          });
        }
      }
    }
  } catch (error) {
    console.error('Error generating sitemap events:', error);
  }

  return entries;
}
