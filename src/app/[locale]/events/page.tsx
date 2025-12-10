import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import CityClock from '@/components/events/CityClock';
import TopPicksMarquee from '@/components/events/TopPicksMarquee';
import EventList from '@/components/events/EventList';
import EventsBackground from '@/components/events/background/EventsBackground';
import { getEventsByCity, getTopPicks } from '@/lib/db';
import { City } from '@/lib/types';
import EventCardSkeleton from '@/components/events/skeletons/EventCardSkeleton';
import DateHeaderSkeleton from '@/components/events/skeletons/DateHeaderSkeleton';

interface EventsPageProps {
  searchParams: { city?: string };
}

// Map URL param to database enum
function toCityEnum(city: string): City {
  const upper = city.toUpperCase();
  if (upper === 'TARTU' || upper === 'TALLINN' || upper === 'PÄRNU') {
    return upper as City;
  }
  return 'TARTU'; // Default
}

// Map database enum to display name
function toCityDisplay(city: City): string {
  const names: Record<City, string> = {
    TARTU: 'Tartu',
    TALLINN: 'Tallinn',
    PÄRNU: 'Pärnu',
  };
  return names[city];
}

function EventListSkeleton() {
  return (
    <div className='space-y-6 md:space-y-8'>
      <DateHeaderSkeleton />
      <div className='space-y-4 md:space-y-6'>
        <EventCardSkeleton />
        <EventCardSkeleton />
        <EventCardSkeleton />
      </div>
    </div>
  );
}

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const { city: cityParam = 'Tartu' } = await searchParams;
  const city = toCityEnum(cityParam);
  const cityDisplay = toCityDisplay(city);

  const [events, topPicks] = await Promise.all([
    getEventsByCity(city),
    getTopPicks(city),
  ]);

  const t = await getTranslations('eventsPage');
  const translations = {
    readMore: t('readMore'),
    free: t('free'),
    facebookEvent: t('facebookEvent'),
    noEvents: t('noEvents'),
    loadMore: t('loadMore'),
  };

  return (
    <div className='relative min-h-screen'>
      <div className='fixed inset-0'>
        <EventsBackground />
      </div>

      <div className='relative z-10 flex flex-col min-h-screen'>
        <Header />

        <div className='mt-14 md:mt-16'>
          <TopPicksMarquee events={topPicks} />
        </div>

        <CityClock city={cityDisplay} />

        <main className='flex-1 px-4 md:px-8 lg:px-12 max-w-6xl mx-auto w-full'>
          <Suspense fallback={<EventListSkeleton />}>
            <EventList events={events} translations={translations} />
          </Suspense>
        </main>

        <div className='mt-20 md:mt-32'>
          <Footer />
        </div>
      </div>
    </div>
  );
}
