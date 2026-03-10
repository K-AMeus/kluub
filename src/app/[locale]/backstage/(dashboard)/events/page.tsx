'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { createBrowserSupabaseClient } from '@/supabase/client';
import { useBackstage } from '@/components/backstage/BackstageProvider';
import EventEditModal from '@/components/backstage/EventEditModal';
import type { Event, Venue } from '@/lib/types';
import { formatDateTimeWithYear } from '@/lib/event-utils';

export default function MyEventsPage() {
  const t = useTranslations('backstage');
  const locale = useLocale();
  const { venues: userVenues, venueIds, isLoading: contextLoading } = useBackstage();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [pastEvents, setPastEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const fetchEvents = useCallback(async () => {
    if (venueIds.length === 0) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const supabase = createBrowserSupabaseClient();

      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select(
          `
          id,
          title,
          description,
          price_tier,
          venue_id,
          city,
          top_pick,
          image_url,
          facebook_url,
          start_time,
          end_time,
          venues (name)
        `
        )
        .in('venue_id', venueIds)
        .order('start_time', { ascending: true });

      if (eventsError) {
        setError(t('loadingEvents'));
        console.error('Error fetching events:', eventsError);
        setIsLoading(false);
        return;
      }

      const now = new Date();
      const upcoming: Event[] = [];
      const past: Event[] = [];

      (eventsData || []).forEach((row: any) => {
        const event: Event = {
          id: row.id,
          title: row.title,
          description: row.description,
          priceTier: row.price_tier,
          venueId: row.venue_id,
          venue: row.venues?.name || '',
          city: row.city,
          topPick: row.top_pick,
          imageUrl: row.image_url,
          facebookUrl: row.facebook_url,
          startTime: row.start_time,
          endTime: row.end_time,
        };

        if (new Date(event.startTime) > now) {
          upcoming.push(event);
        } else {
          past.push(event);
        }
      });

      setUpcomingEvents(upcoming);
      setPastEvents(past.reverse());
    } catch (err) {
      setError(t('unexpectedError'));
      console.error('Unexpected error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [venueIds, t]);

  useEffect(() => {
    if (contextLoading) return;
    fetchEvents();
  }, [contextLoading, fetchEvents]);

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
  };

  const handleCloseModal = () => {
    setSelectedEvent(null);
  };

  const handleEventUpdated = () => {
    fetchEvents();
  };

  const handleEventDeleted = () => {
    fetchEvents();
  };

  const eventsToShow = activeTab === 'upcoming' ? upcomingEvents : pastEvents;

  const priceTierLabel = (tier: number) => {
    switch (tier) {
      case 0:
        return t('priceTierFree');
      case 1:
        return t('priceTierLow');
      case 2:
        return t('priceTierMedium');
      case 3:
        return t('priceTierHigh');
      default:
        return '';
    }
  };

  return (
    <>
      <div className='px-4 md:px-8 py-6 md:py-10'>
        <div className='max-w-5xl mx-auto'>

          {/* Header */}
          <div className='mb-6'>
            <h1 className='font-display text-2xl md:text-3xl text-white tracking-wider'>
              {t('myEvents')}
            </h1>
          </div>

          {/* Loading State */}
          {(contextLoading || isLoading) && (
            <div className='space-y-3'>
              {[1, 2, 3].map((i) => (
                <div key={i} className='bg-white/2 border border-white/6 p-5'>
                  <div className='flex items-center gap-4'>
                    <div className='w-12 h-12 bg-white/4 animate-pulse' />
                    <div className='flex-1'>
                      <div className='h-4 w-48 bg-white/4 mb-2 animate-pulse' />
                      <div className='h-3 w-32 bg-white/3 animate-pulse' />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className='flex items-center gap-3 p-4 bg-red-500/6 border border-red-500/20 text-red-400 text-sm'>
              <svg className='w-5 h-5 shrink-0' fill='none' stroke='currentColor' viewBox='0 0 24 24' strokeWidth={1.5}>
                <path strokeLinecap='round' strokeLinejoin='round' d='M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z' />
              </svg>
              {error}
            </div>
          )}

          {/* No Venues State */}
          {!contextLoading && !isLoading && !error && userVenues.length === 0 && (
            <div className='text-center py-16'>
              <div className='mb-5 inline-flex items-center justify-center w-14 h-14 bg-white/4 border border-white/6'>
                <svg className='w-7 h-7 text-white/30' fill='none' stroke='currentColor' viewBox='0 0 24 24' strokeWidth={1.5}>
                  <path strokeLinecap='round' strokeLinejoin='round' d='M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z' />
                </svg>
              </div>
              <h2 className='text-white text-lg font-semibold mb-2'>
                {t('noVenuesTitle')}
              </h2>
              <p className='text-white/40 text-sm max-w-sm mx-auto'>{t('noVenuesMessage')}</p>
            </div>
          )}

          {/* Events Content */}
          {!contextLoading && !isLoading && !error && userVenues.length > 0 && (
            <>
              {/* Tabs */}
              <div className='flex gap-1 mb-6 bg-white/3 border border-white/6 p-1 w-fit'>
                <button
                  onClick={() => setActiveTab('upcoming')}
                  className={`px-4 py-2 text-sm font-medium transition-all duration-200 cursor-pointer ${
                    activeTab === 'upcoming'
                      ? 'bg-[#E4DD3B]/12 text-[#E4DD3B]'
                      : 'text-white/40 hover:text-white/60'
                  }`}
                >
                  {t('upcomingEvents')} ({upcomingEvents.length})
                </button>
                <button
                  onClick={() => setActiveTab('past')}
                  className={`px-4 py-2 text-sm font-medium transition-all duration-200 cursor-pointer ${
                    activeTab === 'past'
                      ? 'bg-[#E4DD3B]/12 text-[#E4DD3B]'
                      : 'text-white/40 hover:text-white/60'
                  }`}
                >
                  {t('pastEvents')} ({pastEvents.length})
                </button>
              </div>

              {/* Events List */}
              {eventsToShow.length === 0 ? (
                <div className='text-center py-16'>
                  <div className='mb-4 inline-flex items-center justify-center w-12 h-12 bg-white/3 border border-white/6'>
                    <svg className='w-6 h-6 text-white/20' fill='none' stroke='currentColor' viewBox='0 0 24 24' strokeWidth={1.5}>
                      <path strokeLinecap='round' strokeLinejoin='round' d='M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5' />
                    </svg>
                  </div>
                  <p className='text-white/40 text-sm'>
                    {activeTab === 'upcoming'
                      ? t('noUpcomingEvents')
                      : t('noPastEvents')}
                  </p>
                </div>
              ) : (
                <div className='space-y-2'>
                  {eventsToShow.map((event) => (
                    <div
                      key={event.id}
                      onClick={() => handleEventClick(event)}
                      className='group bg-white/2 hover:bg-white/4 border border-white/6 hover:border-white/10 p-4 md:p-5 transition-all duration-200 cursor-pointer'
                    >
                      <div className='flex items-center gap-4'>
                        {/* Date badge */}
                        <div className='hidden sm:flex flex-col items-center justify-center w-12 h-12 bg-white/4 group-hover:bg-[#E4DD3B]/8 shrink-0 transition-colors duration-200'>
                          <span className='text-[10px] font-semibold text-white/40 uppercase leading-none'>
                            {new Date(event.startTime).toLocaleDateString(locale, { month: 'short' })}
                          </span>
                          <span className='text-lg font-bold text-white leading-tight'>
                            {new Date(event.startTime).getDate()}
                          </span>
                        </div>

                        {/* Event info */}
                        <div className='flex-1 min-w-0'>
                          <div className='flex items-center gap-2 mb-1'>
                            <h3 className='text-white font-semibold text-sm truncate group-hover:text-[#E4DD3B] transition-colors duration-200'>
                              {event.title}
                            </h3>
                            {event.topPick && (
                              <span className='inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold text-[#E4DD3B] bg-[#E4DD3B]/10'>
                                TOP
                              </span>
                            )}
                          </div>
                          <div className='flex items-center gap-3 text-xs text-white/35'>
                            <span>{event.venue}</span>
                            <span>·</span>
                            <span className='font-mono'>{formatDateTimeWithYear(event.startTime)}</span>
                            <span>·</span>
                            <span>{priceTierLabel(event.priceTier)}</span>
                          </div>
                        </div>

                        {/* Arrow */}
                        <svg className='w-4 h-4 text-white/20 group-hover:text-white/40 shrink-0 transition-colors duration-200' fill='none' stroke='currentColor' viewBox='0 0 24 24' strokeWidth={1.5}>
                          <path strokeLinecap='round' strokeLinejoin='round' d='M8.25 4.5l7.5 7.5-7.5 7.5' />
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {selectedEvent && (
        <EventEditModal
          event={selectedEvent}
          venues={userVenues}
          onClose={handleCloseModal}
          onEventUpdated={handleEventUpdated}
          onEventDeleted={handleEventDeleted}
        />
      )}
    </>
  );
}
