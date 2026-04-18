import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import EventDetail from '@/components/events/EventDetail';
import { getEventById } from '@/lib/db';

interface EventDetailPageProps {
  params: Promise<{ locale: string; city: string; eventId: string }>;
}

export async function generateMetadata({
  params,
}: EventDetailPageProps): Promise<Metadata> {
  const { locale, city, eventId } = await params;
  const event = await getEventById(eventId);
  if (!event) return {};

  const description = event.description.slice(0, 160);
  const url = `/${locale}/events/${city}/${eventId}`;

  return {
    title: event.title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      url,
      title: event.title,
      description,
      images: event.imageUrl ? [{ url: event.imageUrl, alt: event.title }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: event.title,
      description,
      images: event.imageUrl ? [event.imageUrl] : [],
    },
  };
}

export default async function EventDetailPage({
  params,
}: EventDetailPageProps) {
  const { locale, eventId } = await params;
  setRequestLocale(locale);

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

  const numericPrice =
    event.price === '0' || /^\d+(\.\d{1,2})?$/.test(event.price)
      ? event.price
      : null;

  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    description: event.description,
    startDate: event.startTime,
    endDate: event.endTime,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: event.venue,
      address: {
        '@type': 'PostalAddress',
        addressLocality: event.city,
        addressCountry: 'EE',
      },
    },
  };
  if (event.imageUrl) jsonLd.image = [event.imageUrl];
  if (numericPrice !== null) {
    jsonLd.offers = {
      '@type': 'Offers',
      price: numericPrice,
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
      ...(event.facebookUrl ? { url: event.facebookUrl } : {}),
    };
  }

  return (
    <div className='flex flex-col min-h-screen'>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />

      <div className='h-14 md:h-16' />

      <main className='flex-1'>
        <EventDetail
          event={event}
          translations={translations}
          locale={locale}
        />
      </main>

      <div className='mt-20 md:mt-32'>
        <Footer />
      </div>
    </div>
  );
}
