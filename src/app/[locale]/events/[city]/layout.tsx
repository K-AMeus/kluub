import EventsBackground from '@/components/events/background/EventsBackground';

export default function CityEventsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='relative min-h-screen'>
      <div className='fixed inset-0'>
        <EventsBackground />
      </div>

      <div className='relative z-10'>{children}</div>
    </div>
  );
}
