import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import EventsBackground from '@/components/events/background/EventsBackground';
import EventCardSkeleton from '@/components/events/skeletons/EventCardSkeleton';

function EventListSkeleton() {
  return (
    <div className='space-y-6 md:space-y-8'>
      <EventCardSkeleton />
      <EventCardSkeleton />
      <EventCardSkeleton />
      <EventCardSkeleton />
      <EventCardSkeleton />
    </div>
  );
}

export default function Loading() {
  return (
    <div className='relative min-h-screen'>
      <div className='fixed inset-0'>
        <EventsBackground />
      </div>

      <div className='relative z-10 flex flex-col min-h-screen'>
        <Header />

        <div className='mt-14 md:mt-16 h-12 bg-white/5 animate-pulse' />

        <div className='flex justify-center py-8'>
          <div className='h-24 w-48 bg-white/5 rounded-lg animate-pulse' />
        </div>

        <main className='flex-1 px-4 md:px-8 lg:px-12 max-w-6xl mx-auto w-full'>
          <EventListSkeleton />
        </main>

        <div className='mt-20 md:mt-32'>
          <Footer />
        </div>
      </div>
    </div>
  );
}
