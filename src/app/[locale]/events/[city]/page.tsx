import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import TopPicksMarquee from '@/components/events/TopPicksMarquee';
import EventList from '@/components/events/EventList';
import EventsBackground from '@/components/events/background/EventsBackground';
import { getEventsByCity, getTopPicks } from '@/lib/db';
import { City } from '@/lib/types';

interface CityEventsPageProps {
  params: Promise<{ city: string }>;
}

function toCityEnum(city: string): City | null {
  const upper = city.toUpperCase();
  if (upper === 'TARTU' || upper === 'TALLINN' || upper === 'PÄRNU') {
    return upper as City;
  }
  return null;
}

export const revalidate = 86400;
export const dynamicParams = true;

export default async function CityEventsPage({ params }: CityEventsPageProps) {
  const { city: cityParam } = await params;
  const city = toCityEnum(cityParam);

  if (!city) {
    notFound();
  }

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

        {topPicks.length > 0 && (
          <section className='mt-12 md:mt-16'>
            <TopPicksMarquee events={topPicks} />
          </section>
        )}

        <main
          className={`flex-1 px-4 md:px-8 lg:px-12 max-w-6xl mx-auto w-full ${
            topPicks.length > 0 ? 'pt-2 md:pt-4' : 'mt-12 md:mt-16 pt-2 md:pt-4'
          }`}
        >
          <EventList events={events} translations={translations} city={city} />
        </main>

        <div className='mt-12 md:mt-32'>
          <Footer />
        </div>
      </div>
    </div>
  );
}
