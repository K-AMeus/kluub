import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import ScrollToTop from '@/components/shared/ScrollToTop';
import EventDetail from '@/components/events/EventDetail';
import { getEventById } from '@/lib/db';

interface EventDetailPageProps {
  params: Promise<{ eventId: string }>;
}

export default async function EventDetailPage({
  params,
}: EventDetailPageProps) {
  const { eventId } = await params;

  const event = await getEventById(eventId);

  if (!event) {
    notFound();
  }

  const t = await getTranslations('eventsPage');
  const tDetail = await getTranslations('eventDetail');

  const translations = {
    free: t('free'),
    facebookEvent: t('facebookEvent'),
    backToEvents: tDetail('backToEvents'),
  };

  return (
    <div className='flex flex-col min-h-screen bg-black'>
      <ScrollToTop />
      <Header />

      <div className='h-14 md:h-16' />

      <main className='flex-1'>
        <EventDetail event={event} translations={translations} />
      </main>

      <div className='mt-20 md:mt-32'>
        <Footer />
      </div>
    </div>
  );
}
