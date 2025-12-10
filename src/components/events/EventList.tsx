'use client';

import { useState, useMemo } from 'react';
import { Event } from '@/lib/types';
import { groupEventsByDate } from '@/lib/event-utils';
import EventCard, { EventCardTranslations } from './EventCard';
import DateHeader from './DateHeader';

interface EventListTranslations extends EventCardTranslations {
  noEvents: string;
  loadMore: string;
}

interface EventListProps {
  events: Event[];
  translations: EventListTranslations;
  initialDisplayCount?: number;
}

export default function EventList({
  events,
  translations,
  initialDisplayCount = 10,
}: EventListProps) {
  const [displayCount, setDisplayCount] = useState(initialDisplayCount);

  // Only show events up to displayCount
  const displayedEvents = useMemo(() => {
    return events.slice(0, displayCount);
  }, [events, displayCount]);

  const hasMore = displayCount < events.length;

  const groupedEvents = useMemo(() => {
    return groupEventsByDate(displayedEvents);
  }, [displayedEvents]);

  const loadMore = () => {
    setDisplayCount((prev) => prev + 10);
  };

  if (events.length === 0) {
    return (
      <div className='flex items-center justify-center py-16'>
        <div className='text-center'>
          <p className='text-white/60 font-sans text-lg'>
            {translations.noEvents}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6 md:space-y-8'>
      {Object.entries(groupedEvents).map(([dateKey, dateEvents]) => (
        <div key={dateKey}>
          <DateHeader dateKey={dateKey} isSticky />

          <div className='space-y-4 md:space-y-6'>
            {dateEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                translations={translations}
              />
            ))}
          </div>
        </div>
      ))}

      {hasMore && (
        <div className='flex justify-center pt-8 pb-4'>
          <button
            onClick={loadMore}
            className='px-8 py-3 border border-[#E4DD3B] text-[#E4DD3B] font-sans text-sm tracking-wide hover:bg-[#E4DD3B]/10 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E4DD3B] focus-visible:ring-offset-2 focus-visible:ring-offset-black cursor-pointer'
          >
            {translations.loadMore}
          </button>
        </div>
      )}
    </div>
  );
}
