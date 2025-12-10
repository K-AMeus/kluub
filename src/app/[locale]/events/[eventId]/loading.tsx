import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import ScrollToTop from '@/components/shared/ScrollToTop';
import EventDetailSkeleton from '@/components/events/skeletons/EventDetailSkeleton';

export default function Loading() {
  return (
    <div className='flex flex-col min-h-screen bg-black'>
      <ScrollToTop />
      <Header />

      <div className='h-14 md:h-16' />

      <main className='flex-1'>
        <EventDetailSkeleton />
      </main>

      <div className='mt-20 md:mt-32'>
        <Footer />
      </div>
    </div>
  );
}
