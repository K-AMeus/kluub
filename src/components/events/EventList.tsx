'use client';

import { useState, useMemo, useCallback } from 'react';
import { Event, City, EVENTS_PAGE_SIZE, DEFAULT_EVENT_FILTERS } from '@/lib/types';
import { groupEventsByDate } from '@/lib/event-utils';
import { getEventsByCity } from '@/lib/db';
import EventCard, { EventCardTranslations } from './EventCard';
import DateHeader from './DateHeader';
import EventFiltersComponent, { EventFilters } from './EventFilters';
import CityHeader from './CityHeader';

interface EventListTranslations extends EventCardTranslations {
  noEvents: string;
  loadMore: string;
  loadError: string;
  retry: string;
  loading: string;
}

interface EventListProps {
  initialEvents: Event[];
  initialHasMore: boolean;
  translations: EventListTranslations;
  city: City;
}

function toCityDisplay(city: City): string {
  const names: Record<City, string> = {
    TARTU: 'Tartu',
    TALLINN: 'Tallinn',
    PÄRNU: 'Pärnu',
  };
  return names[city];
}

const defaultFilters: EventFilters = DEFAULT_EVENT_FILTERS;

export default function EventList({
  initialEvents,
  initialHasMore,
  translations,
  city,
}: EventListProps) {
  const cityDisplay = toCityDisplay(city);
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState<EventFilters>(defaultFilters);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFiltersChange = useCallback(
    async (newFilters: EventFilters) => {
      setFilters(newFilters);
      setPage(0);
      setIsLoading(true);
      setError(null);

      try {
        const result = await getEventsByCity(city, newFilters, 0, EVENTS_PAGE_SIZE);
        setEvents(result.events);
        setHasMore(result.hasMore);
      } catch {
        setError(translations.loadError);
      } finally {
        setIsLoading(false);
      }
    },
    [city, translations.loadError]
  );

  const loadMore = useCallback(async () => {
    if (isLoading) return;

    const nextPage = page + 1;
    setPage(nextPage);
    setIsLoading(true);
    setError(null);

    try {
      const result = await getEventsByCity(city, filters, nextPage, EVENTS_PAGE_SIZE);
      setEvents((prev) => [...prev, ...result.events]);
      setHasMore(result.hasMore);
    } catch {
      setPage(page);
      setError(translations.loadError);
    } finally {
      setIsLoading(false);
    }
  }, [city, filters, page, isLoading, translations.loadError]);

  const retry = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getEventsByCity(city, filters, page, EVENTS_PAGE_SIZE);
      if (page === 0) {
        setEvents(result.events);
      } else {
        setEvents((prev) => [...prev, ...result.events]);
      }
      setHasMore(result.hasMore);
    } catch {
      setError(translations.loadError);
    } finally {
      setIsLoading(false);
    }
  }, [city, filters, page, translations.loadError]);

  const groupedEvents = useMemo(() => {
    return groupEventsByDate(events);
  }, [events]);

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

      {error && (
        <div className='flex items-center justify-between gap-3 mt-4 px-4 py-3 border border-white/10 bg-white/5'>
          <p className='text-white/60 font-sans text-sm'>{error}</p>
          <button
            onClick={retry}
            disabled={isLoading}
            className='shrink-0 px-4 py-1.5 text-xs font-sans font-semibold uppercase tracking-wide text-[#E4DD3B] border border-[#E4DD3B]/40 hover:border-[#E4DD3B] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {translations.retry}
          </button>
        </div>
      )}

      {events.length === 0 && !isLoading && !error ? (
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
                disabled={isLoading}
                aria-label={isLoading ? translations.loading : translations.loadMore}
                className='group relative px-8 md:px-12 py-3 md:py-4 border border-[#E4DD3B] bg-black/60 hover:bg-[#E4DD3B]/10 text-[#E4DD3B] hover:text-white font-display text-sm md:text-base uppercase tracking-wider transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-wait flex items-center justify-center gap-2'
              >
                {isLoading ? (
                  <>
                    <svg
                      className='w-5 h-5 animate-spin text-[#E4DD3B]'
                      aria-hidden='true'
                      fill='none'
                      viewBox='0 0 24 24'
                    >
                      <circle
                        className='opacity-25'
                        cx='12'
                        cy='12'
                        r='10'
                        stroke='currentColor'
                        strokeWidth='4'
                      />
                      <path
                        className='opacity-75'
                        fill='currentColor'
                        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                      />
                    </svg>
                    {translations.loadMore}
                  </>
                ) : (
                  translations.loadMore
                )}
              </button>
              <span className='sr-only' role='status' aria-live='polite'>
                {isLoading ? translations.loading : ''}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
