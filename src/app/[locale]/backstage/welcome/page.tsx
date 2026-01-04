'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { createBrowserSupabaseClient } from '@/supabase/client';
import BackstageLayout from '@/components/backstage/BackstageLayout';
import Link from 'next/link';
import type { Event } from '@/lib/types';

export default function WelcomePage() {
  const t = useTranslations('backstage');
  const locale = useLocale();
  const [mounted, setMounted] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    upcoming: 0,
    past: 0,
  });
  const [recentEvents, setRecentEvents] = useState<Event[]>([]);
  const supabase = createBrowserSupabaseClient();

  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      setMounted(true);
    });

    return () => cancelAnimationFrame(frameId);
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);

        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          setUserEmail(user.email ?? null);

          // Fetch user's venues
          const { data: venueUserData } = await supabase
            .from('venue_users')
            .select('venue_id')
            .eq('user_id', user.id);

          if (venueUserData && venueUserData.length > 0) {
            const venueIds = venueUserData.map((vu) => vu.venue_id);

            // Fetch events for these venues
            const { data: eventsData } = await supabase
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
              .order('start_time', { ascending: false })
              .limit(5);

            if (eventsData) {
              const now = new Date();
              let upcomingCount = 0;
              let pastCount = 0;

              const events: Event[] = eventsData.map((row: any) => {
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
                  upcomingCount++;
                } else {
                  pastCount++;
                }

                return event;
              });

              setStats({
                total: eventsData.length >= 5 ? upcomingCount + pastCount : eventsData.length,
                upcoming: upcomingCount,
                past: pastCount,
              });

              setRecentEvents(events.slice(0, 5));
            }
          }
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/backstage';
  };

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month} ${hours}:${minutes}`;
  };

  return (
    <BackstageLayout>
      <div className='min-h-screen px-4 py-12'>
        <div
          className={`max-w-6xl mx-auto transform transition-all duration-700 ease-out ${
            mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}
        >
          {/* Header */}
          <div className='mb-8'>
            <h1 className='font-display text-2xl md:text-3xl text-white tracking-wider mb-2'>
              {t('welcomeTitle')}
            </h1>
            {userEmail && (
              <p className='text-[#E4DD3B]/80 text-sm'>{userEmail}</p>
            )}
          </div>

          {/* Stats Cards */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-8'>
            {/* Total Events */}
            <div className='bg-white/5 border border-white/10 rounded-lg p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-white/50 text-sm mb-1'>{t('totalEvents')}</p>
                  <p className='text-3xl font-bold text-white'>
                    {isLoading ? '...' : stats.total}
                  </p>
                </div>
                <div className='w-12 h-12 bg-[#E4DD3B]/10 rounded-lg flex items-center justify-center'>
                  <svg
                    className='w-6 h-6 text-[#E4DD3B]'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Upcoming Events */}
            <div className='bg-white/5 border border-white/10 rounded-lg p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-white/50 text-sm mb-1'>{t('upcomingCount')}</p>
                  <p className='text-3xl font-bold text-white'>
                    {isLoading ? '...' : stats.upcoming}
                  </p>
                </div>
                <div className='w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center'>
                  <svg
                    className='w-6 h-6 text-green-400'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M13 7h8m0 0v8m0-8l-8 8-4-4-6 6'
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Past Events */}
            <div className='bg-white/5 border border-white/10 rounded-lg p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-white/50 text-sm mb-1'>{t('pastCount')}</p>
                  <p className='text-3xl font-bold text-white'>
                    {isLoading ? '...' : stats.past}
                  </p>
                </div>
                <div className='w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center'>
                  <svg
                    className='w-6 h-6 text-blue-400'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className='mb-8'>
            <h2 className='text-white text-lg font-semibold mb-4'>{t('quickActions')}</h2>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <Link
                href={`/${locale}/backstage/events/upload`}
                className='bg-[#E4DD3B]/10 hover:bg-[#E4DD3B]/20 border border-[#E4DD3B]/30 rounded-lg p-6 transition-all duration-200 group'
              >
                <div className='flex items-center gap-4'>
                  <div className='w-12 h-12 bg-[#E4DD3B] rounded-lg flex items-center justify-center flex-shrink-0'>
                    <svg
                      className='w-6 h-6 text-black'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M12 4v16m8-8H4'
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className='text-white font-semibold mb-1 group-hover:text-[#E4DD3B] transition-colors'>
                      {t('addNewEvent')}
                    </h3>
                    <p className='text-white/50 text-sm'>{t('uploadEventSubtitle')}</p>
                  </div>
                </div>
              </Link>

              <Link
                href={`/${locale}/backstage/events`}
                className='bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg p-6 transition-all duration-200 group'
              >
                <div className='flex items-center gap-4'>
                  <div className='w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0'>
                    <svg
                      className='w-6 h-6 text-white'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className='text-white font-semibold mb-1 group-hover:text-[#E4DD3B] transition-colors'>
                      {t('myEvents')}
                    </h3>
                    <p className='text-white/50 text-sm'>{t('viewAll')}</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* Recent Events */}
          {!isLoading && recentEvents.length > 0 && (
            <div className='mb-8'>
              <div className='flex items-center justify-between mb-4'>
                <h2 className='text-white text-lg font-semibold'>{t('recentEvents')}</h2>
                <Link
                  href={`/${locale}/backstage/events`}
                  className='text-[#E4DD3B] hover:text-[#E4DD3B]/80 text-sm transition-colors'
                >
                  {t('viewAll')} →
                </Link>
              </div>
              <div className='space-y-3'>
                {recentEvents.map((event) => (
                  <Link
                    key={event.id}
                    href={`/${locale}/backstage/events`}
                    className='block bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#E4DD3B]/30 rounded-lg p-4 transition-all duration-200'
                  >
                    <div className='flex items-center justify-between'>
                      <div className='flex-1'>
                        <h3 className='text-white font-semibold mb-1'>{event.title}</h3>
                        <p className='text-white/50 text-sm'>{event.venue}</p>
                      </div>
                      <div className='text-[#E4DD3B] text-sm text-right'>
                        {formatDateTime(event.startTime)}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Sign Out */}
          <div className='text-center'>
            <button
              onClick={handleSignOut}
              className='px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/70 hover:text-white text-sm rounded-lg transition-all duration-200'
            >
              {t('signOut')}
            </button>
          </div>
        </div>
      </div>
    </BackstageLayout>
  );
}
