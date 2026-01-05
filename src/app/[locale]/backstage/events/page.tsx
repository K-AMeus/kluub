'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { createBrowserSupabaseClient } from '@/supabase/client';
import BackstageLayout from '@/components/backstage/BackstageLayout';
import EventEditModal from '@/components/backstage/EventEditModal';
import type { Event, Venue } from '@/lib/types';
import { formatDateTimeWithYear } from '@/lib/event-utils';

export default function MyEventsPage() {
  const t = useTranslations('backstage');
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [pastEvents, setPastEvents] = useState<Event[]>([]);
  const [userVenues, setUserVenues] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const supabase = createBrowserSupabaseClient();

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get current user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        setError(t('authError'));
        setIsLoading(false);
        return;
      }

      // Fetch user's venues
      const { data: venueUserData, error: venueUserError } = await supabase
        .from('venue_users')
        .select(
          `
          venue_id,
          venues (
            id,
            name,
            city,
            address,
            lat,
            lng
          )
        `
        )
        .eq('user_id', user.id);

      if (venueUserError) {
        setError(t('venueLoadError'));
        setIsLoading(false);
        return;
      }

      const venues = (venueUserData
        ?.map((vu: any) => vu.venues)
        .filter(Boolean) || []) as Venue[];

      setUserVenues(venues);

      if (venues.length === 0) {
        setIsLoading(false);
        return;
      }

      // Get venue IDs
      const venueIds = venues.map((v) => v.id);

      // Fetch events for these venues
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

      // Transform events
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
      setPastEvents(past.reverse()); // Reverse past events to show most recent first
    } catch (err) {
      setError(t('unexpectedError'));
      console.error('Unexpected error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

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

  return (
    <BackstageLayout>
      <div className='min-h-screen px-4 py-12'>
        <div className='max-w-6xl mx-auto'>
          {/* Header */}
          <div className='mb-8'>
            <h1 className='font-display text-2xl md:text-3xl text-white tracking-wider mb-2'>
              {t('myEvents')}
            </h1>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className='flex items-center justify-center py-12'>
              <div className='text-center'>
                <svg
                  className='w-8 h-8 animate-spin mx-auto mb-4 text-[#E4DD3B]'
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
                <p className='text-white/50'>{t('loadingEvents')}</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className='p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm'>
              {error}
            </div>
          )}

          {/* No Venues State */}
          {!isLoading && !error && userVenues.length === 0 && (
            <div className='text-center py-12'>
              <div className='mb-6 inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 border border-white/10'>
                <svg
                  className='w-8 h-8 text-white/40'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'
                  />
                </svg>
              </div>
              <h2 className='font-display text-xl text-white mb-3'>
                {t('noVenuesTitle')}
              </h2>
              <p className='text-white/50 text-sm'>{t('noVenuesMessage')}</p>
            </div>
          )}

          {/* Events Content */}
          {!isLoading && !error && userVenues.length > 0 && (
            <>
              {/* Tabs */}
              <div className='flex gap-2 mb-6 border-b border-white/10'>
                <button
                  onClick={() => setActiveTab('upcoming')}
                  className={`px-6 py-3 font-medium transition-all duration-200 border-b-2 ${
                    activeTab === 'upcoming'
                      ? 'text-[#E4DD3B] border-[#E4DD3B]'
                      : 'text-white/50 border-transparent hover:text-white/70'
                  }`}
                >
                  {t('upcomingEvents')} ({upcomingEvents.length})
                </button>
                <button
                  onClick={() => setActiveTab('past')}
                  className={`px-6 py-3 font-medium transition-all duration-200 border-b-2 ${
                    activeTab === 'past'
                      ? 'text-[#E4DD3B] border-[#E4DD3B]'
                      : 'text-white/50 border-transparent hover:text-white/70'
                  }`}
                >
                  {t('pastEvents')} ({pastEvents.length})
                </button>
              </div>

              {/* Events Grid */}
              {eventsToShow.length === 0 ? (
                <div className='text-center py-12'>
                  <p className='text-white/50'>
                    {activeTab === 'upcoming'
                      ? t('noUpcomingEvents')
                      : t('noPastEvents')}
                  </p>
                </div>
              ) : (
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                  {eventsToShow.map((event) => (
                    <div
                      key={event.id}
                      onClick={() => handleEventClick(event)}
                      className='bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#E4DD3B]/30 rounded-lg p-4 transition-all duration-200 cursor-pointer group'
                    >
                      <div className='flex flex-col h-full'>
                        <div className='text-[#E4DD3B] text-sm mb-2'>
                          {formatDateTimeWithYear(event.startTime)}
                        </div>
                        <h3 className='text-white font-semibold text-lg mb-2 group-hover:text-[#E4DD3B] transition-colors'>
                          {event.title}
                        </h3>
                        <p className='text-white/50 text-sm'>{event.venue}</p>
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
    </BackstageLayout>
  );
}
