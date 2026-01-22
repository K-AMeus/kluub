'use client';

import { useState, useMemo, useCallback } from 'react';
import { Event, City } from '@/lib/types';
import { groupEventsByDate } from '@/lib/event-utils';
import EventCard, { EventCardTranslations } from './EventCard';
import DateHeader from './DateHeader';
import EventFiltersComponent, { EventFilters } from './EventFilters';
import CityHeader from './CityHeader';

interface EventListTranslations extends EventCardTranslations {
  noEvents: string;
  loadMore: string;
}

interface EventListProps {
  events: Event[];
  translations: EventListTranslations;
  city: City;
  initialDisplayCount?: number;
}

function toCityDisplay(city: City): string {
  const names: Record<City, string> = {
    TARTU: 'Tartu',
    TALLINN: 'Tallinn',
    PÄRNU: 'Pärnu',
  };
  return names[city];
}

export default function EventList({
  events,
  translations,
  city,
  initialDisplayCount = 10,
}: EventListProps) {
  const cityDisplay = toCityDisplay(city);
  const [displayCount, setDisplayCount] = useState(initialDisplayCount);
  const [filters, setFilters] = useState<EventFilters>({
    topPicks: false,
    freeOnly: false,
    venueId: null,
    startDate: null,
    endDate: null,
  });

  const handleFiltersChange = useCallback(
    (newFilters: EventFilters) => {
      setFilters(newFilters);
      setDisplayCount(initialDisplayCount);
    },
    [initialDisplayCount]
  );

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      if (filters.topPicks && !event.topPick) {
        return false;
      }

      if (filters.freeOnly && event.priceTier !== 0) {
        return false;
      }

      if (filters.venueId && event.venueId !== filters.venueId) {
        return false;
      }

      if (filters.startDate || filters.endDate) {
        const eventDate = event.startTime.split('T')[0];
        if (filters.startDate && eventDate < filters.startDate) {
          return false;
        }
        if (filters.endDate && eventDate > filters.endDate) {
          return false;
        }
      }

      return true;
    });
  }, [events, filters]);

  // Only show events up to displayCount
  const displayedEvents = useMemo(() => {
    return filteredEvents.slice(0, displayCount);
  }, [filteredEvents, displayCount]);

  const hasMore = displayCount < filteredEvents.length;

  const groupedEvents = useMemo(() => {
    return groupEventsByDate(displayedEvents);
  }, [displayedEvents]);

  const loadMore = () => {
    setDisplayCount((prev) => prev + 10);
  };

  return (
    <div>
      <div className='pb-3 md:pb-6 border-b border-white/10'>
        <div className='flex flex-col md:flex-row md:items-end md:justify-between gap-4 md:gap-4'>
          <CityHeader city={cityDisplay} />
          <EventFiltersComponent
            city={city}
            onFiltersChange={handleFiltersChange}
          />
        </div>
      </div>

      {filteredEvents.length === 0 ? (
        <div className='flex items-center justify-center py-12 md:py-16'>
          <div className='text-center'>
            <p className='text-white/60 font-sans text-base md:text-lg'>
              {translations.noEvents}
            </p>
          </div>
        </div>
      ) : (
        <div className='space-y-4 md:space-y-8 pt-3 md:pt-6'>
          {Object.entries(groupedEvents).map(([dateKey, dateEvents]) => (
            <div key={dateKey}>
              <DateHeader dateKey={dateKey} isSticky />

              <div className='space-y-3 md:space-y-6'>
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
            <div className='flex justify-center pt-6 md:pt-8 pb-4'>
              <button
                onClick={loadMore}
                className='px-6 md:px-8 py-2.5 md:py-3 border border-white/30 text-white/80 font-sans text-sm tracking-wide rounded-full hover:border-white/50 hover:text-white transition-colors duration-200 cursor-pointer'
              >
                {translations.loadMore}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
