'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { createBrowserSupabaseClient } from '@/supabase/client';
import Link from 'next/link';
import { formatDateTime } from '@/lib/event-utils';

interface RecentEvent {
  id: string;
  title: string;
  startTime: string;
  venue: string;
}

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
  const [recentEvents, setRecentEvents] = useState<RecentEvent[]>([]);
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

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setIsLoading(false);
          return;
        }

        setUserEmail(user.email ?? null);

        const { data: venueUserData } = await supabase
          .from('venue_users')
          .select('venue_id')
          .eq('user_id', user.id);

        if (!venueUserData || venueUserData.length === 0) {
          setIsLoading(false);
          return;
        }

        const venueIds = venueUserData.map((vu) => vu.venue_id);
        const now = new Date().toISOString();

        // Run all three queries in parallel:
        // 1. Count upcoming events (head: true = no data, just count)
        // 2. Count past events (head: true = no data, just count)
        // 3. Fetch only 5 recent events with minimal columns
        const [upcomingResult, pastResult, recentResult] = await Promise.all([
          supabase
            .from('events')
            .select('*', { count: 'exact', head: true })
            .in('venue_id', venueIds)
            .gte('start_time', now),
          supabase
            .from('events')
            .select('*', { count: 'exact', head: true })
            .in('venue_id', venueIds)
            .lt('start_time', now),
          supabase
            .from('events')
            .select('id, title, start_time, venues (name)')
            .in('venue_id', venueIds)
            .order('start_time', { ascending: false })
            .limit(5),
        ]);

        const upcomingCount = upcomingResult.count ?? 0;
        const pastCount = pastResult.count ?? 0;

        setStats({
          total: upcomingCount + pastCount,
          upcoming: upcomingCount,
          past: pastCount,
        });

        if (recentResult.data) {
          setRecentEvents(
            recentResult.data.map((row: any) => ({
              id: row.id,
              title: row.title,
              startTime: row.start_time,
              venue: row.venues?.name || '',
            }))
          );
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [supabase]);

  return (
    <div className='px-4 md:px-8 py-6 md:py-10'>
      <div className={`max-w-5xl mx-auto transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>

        {/* Welcome Header */}
        <div className='mb-8'>
          <h1 className='font-display text-2xl md:text-3xl text-white tracking-wider mb-1'>
            {t('welcomeTitle')}
          </h1>
          {userEmail && (
            <p className='text-white/40 text-sm'>{userEmail}</p>
          )}
        </div>

        {/* Stats Row */}
        <div className='grid grid-cols-3 gap-3 md:gap-4 mb-8'>
          {/* Total */}
          <div className='bg-white/3 border border-white/6 p-4 md:p-5'>
            <p className='text-white/40 text-xs font-medium mb-2 uppercase tracking-wider'>{t('totalEvents')}</p>
            <div className='flex items-end justify-between'>
              <p className='text-2xl md:text-3xl font-bold text-white tabular-nums'>
                {isLoading ? (
                  <span className='inline-block w-8 h-7 bg-white/6 animate-pulse' />
                ) : stats.total}
              </p>
              <div className='w-8 h-8 flex items-center justify-center bg-[#E4DD3B]/8'>
                <svg className='w-4 h-4 text-[#E4DD3B]' fill='none' stroke='currentColor' viewBox='0 0 24 24' strokeWidth={1.5}>
                  <path strokeLinecap='round' strokeLinejoin='round' d='M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5' />
                </svg>
              </div>
            </div>
          </div>

          {/* Upcoming */}
          <div className='bg-white/3 border border-white/6 p-4 md:p-5'>
            <p className='text-white/40 text-xs font-medium mb-2 uppercase tracking-wider'>{t('upcomingCount')}</p>
            <div className='flex items-end justify-between'>
              <p className='text-2xl md:text-3xl font-bold text-white tabular-nums'>
                {isLoading ? (
                  <span className='inline-block w-8 h-7 bg-white/6 animate-pulse' />
                ) : stats.upcoming}
              </p>
              <div className='w-8 h-8 flex items-center justify-center bg-emerald-500/8'>
                <svg className='w-4 h-4 text-emerald-400' fill='none' stroke='currentColor' viewBox='0 0 24 24' strokeWidth={1.5}>
                  <path strokeLinecap='round' strokeLinejoin='round' d='M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941' />
                </svg>
              </div>
            </div>
          </div>

          {/* Past */}
          <div className='bg-white/3 border border-white/6 p-4 md:p-5'>
            <p className='text-white/40 text-xs font-medium mb-2 uppercase tracking-wider'>{t('pastCount')}</p>
            <div className='flex items-end justify-between'>
              <p className='text-2xl md:text-3xl font-bold text-white tabular-nums'>
                {isLoading ? (
                  <span className='inline-block w-8 h-7 bg-white/6 animate-pulse' />
                ) : stats.past}
              </p>
              <div className='w-8 h-8 flex items-center justify-center bg-blue-500/8'>
                <svg className='w-4 h-4 text-blue-400' fill='none' stroke='currentColor' viewBox='0 0 24 24' strokeWidth={1.5}>
                  <path strokeLinecap='round' strokeLinejoin='round' d='M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z' />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className='mb-8'>
          <h2 className='text-white/60 text-xs font-semibold uppercase tracking-wider mb-3'>{t('quickActions')}</h2>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
            <Link
              href={`/${locale}/backstage/events/upload`}
              className='group relative bg-[#E4DD3B]/4 hover:bg-[#E4DD3B]/8 border border-[#E4DD3B]/12 hover:border-[#E4DD3B]/25 p-5 transition-all duration-300'
            >
              <div className='flex items-center gap-4'>
                <div className='w-10 h-10 bg-[#E4DD3B] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300'>
                  <svg className='w-5 h-5 text-black' fill='none' stroke='currentColor' viewBox='0 0 24 24' strokeWidth={2}>
                    <path strokeLinecap='round' strokeLinejoin='round' d='M12 4.5v15m7.5-7.5h-15' />
                  </svg>
                </div>
                <div>
                  <h3 className='text-white font-semibold text-sm mb-0.5 group-hover:text-[#E4DD3B] transition-colors duration-200'>
                    {t('addNewEvent')}
                  </h3>
                  <p className='text-white/35 text-xs'>{t('uploadEventSubtitle')}</p>
                </div>
              </div>
            </Link>

            <Link
              href={`/${locale}/backstage/events`}
              className='group bg-white/2 hover:bg-white/5 border border-white/6 hover:border-white/12 p-5 transition-all duration-300'
            >
              <div className='flex items-center gap-4'>
                <div className='w-10 h-10 bg-white/6 flex items-center justify-center shrink-0 group-hover:bg-white/1 transition-colors duration-300'>
                  <svg className='w-5 h-5 text-white/60' fill='none' stroke='currentColor' viewBox='0 0 24 24' strokeWidth={1.5}>
                    <path strokeLinecap='round' strokeLinejoin='round' d='M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5' />
                  </svg>
                </div>
                <div>
                  <h3 className='text-white font-semibold text-sm mb-0.5 group-hover:text-[#E4DD3B] transition-colors duration-200'>
                    {t('myEvents')}
                  </h3>
                  <p className='text-white/35 text-xs'>{t('viewAll')}</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Events */}
        {!isLoading && recentEvents.length > 0 && (
          <div>
            <div className='flex items-center justify-between mb-3'>
              <h2 className='text-white/60 text-xs font-semibold uppercase tracking-wider'>{t('recentEvents')}</h2>
              <Link
                href={`/${locale}/backstage/events`}
                className='text-[#E4DD3B]/70 hover:text-[#E4DD3B] text-xs font-medium transition-colors duration-200 flex items-center gap-1'
              >
                {t('viewAll')}
                <svg className='w-3 h-3' fill='none' stroke='currentColor' viewBox='0 0 24 24' strokeWidth={2}>
                  <path strokeLinecap='round' strokeLinejoin='round' d='M8.25 4.5l7.5 7.5-7.5 7.5' />
                </svg>
              </Link>
            </div>

            <div className='bg-white/2 border border-white/6 overflow-hidden divide-y divide-white/4'>
              {recentEvents.map((event) => (
                  <Link
                    key={event.id}
                    href={`/${locale}/backstage/events`}
                    className='flex items-center justify-between p-4 hover:bg-white/3 transition-colors duration-200 group'
                  >
                    <div className='min-w-0'>
                      <h3 className='text-white text-sm font-medium truncate group-hover:text-[#E4DD3B] transition-colors duration-200'>
                        {event.title}
                      </h3>
                      <p className='text-white/30 text-xs truncate'>{event.venue}</p>
                    </div>
                    <div className='text-white/40 text-xs font-mono shrink-0 ml-4'>
                      {formatDateTime(event.startTime)}
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        )}

        {/* Loading skeleton for recent events */}
        {isLoading && (
          <div>
            <div className='h-3 w-24 bg-white/4 mb-3' />
            <div className='bg-white/2 border border-white/6 overflow-hidden divide-y divide-white/4'>
              {[1, 2, 3].map((i) => (
                <div key={i} className='flex items-center justify-between p-4'>
                  <div>
                    <div className='h-4 w-40 bg-white/4 mb-1' />
                    <div className='h-3 w-24 bg-white/3' />
                  </div>
                  <div className='h-3 w-20 bg-white/4' />
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
