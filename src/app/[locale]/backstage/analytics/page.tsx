'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { createBrowserSupabaseClient } from '@/supabase/client';
import BackstageLayout from '@/components/backstage/BackstageLayout';
import type { Venue } from '@/lib/types';

interface VenueAnalytics {
  venue: Venue;
  detailViews: number;
  facebookClicks: number;
}

export default function AnalyticsPage() {
  const t = useTranslations('backstage');
  const [analytics, setAnalytics] = useState<VenueAnalytics[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createBrowserSupabaseClient();

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true);

        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          setError(t('authError'));
          return;
        }

        // Fetch user's venues
        const { data: venueUserData, error: venueError } = await supabase
          .from('venue_users')
          .select(`
            venue_id,
            venues (id, name, city, address, lat, lng)
          `)
          .eq('user_id', user.id);

        if (venueError) {
          setError(t('venueLoadError'));
          return;
        }

        const venues = (venueUserData
          ?.map((vu: any) => vu.venues)
          .filter(Boolean) || []) as Venue[];

        if (venues.length === 0) {
          setAnalytics([]);
          return;
        }

        // Fetch PostHog analytics from our API
        const res = await fetch('/api/analytics');
        if (!res.ok) {
          setError(t('unexpectedError'));
          return;
        }

        const { analytics: counts } = await res.json();

        setAnalytics(
          venues.map((venue) => ({
            venue,
            detailViews: counts[venue.id]?.detailViews || 0,
            facebookClicks: counts[venue.id]?.facebookClicks || 0,
          }))
        );
      } catch {
        setError(t('unexpectedError'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  return (
    <BackstageLayout>
      <div className='min-h-screen px-4 py-12'>
        <div className='max-w-6xl mx-auto'>
          {/* Header */}
          <div className='mb-8'>
            <h1 className='font-display text-2xl md:text-3xl text-white tracking-wider mb-2'>
              {t('analyticsTitle')}
            </h1>
            <p className='text-white/50 text-sm'>{t('analyticsSubtitle')}</p>
          </div>

          {/* Loading */}
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
                <p className='text-white/50'>{t('analyticsLoading')}</p>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className='p-4 bg-red-500/10 border border-red-500/30 text-red-400 text-sm'>
              {error}
            </div>
          )}

          {/* Analytics Cards */}
          {!isLoading && !error && analytics.length > 0 && (
            <div className='space-y-6'>
              {analytics.map(({ venue, detailViews, facebookClicks }) => (
                <div
                  key={venue.id}
                  className='bg-white/5 border border-white/10 p-6'
                >
                  <h2 className='text-white font-semibold text-lg mb-1'>
                    {venue.name}
                  </h2>
                  <p className='text-white/40 text-sm mb-6'>{venue.city}</p>

                  <div className='grid grid-cols-2 gap-4'>
                    {/* Event Views */}
                    <div className='bg-white/5 border border-white/10 p-4'>
                      <div className='flex items-center gap-3 mb-3'>
                        <div className='w-9 h-9 bg-[#E4DD3B]/10 border border-[#E4DD3B]/30 flex items-center justify-center'>
                          <svg
                            className='w-5 h-5 text-[#E4DD3B]'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                            />
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
                            />
                          </svg>
                        </div>
                        <span className='text-white/60 text-sm'>
                          {t('totalEventViews')}
                        </span>
                      </div>
                      <p className='text-white font-display text-3xl'>
                        {detailViews}
                      </p>
                    </div>

                    {/* Facebook Clicks */}
                    <div className='bg-white/5 border border-white/10 p-4'>
                      <div className='flex items-center gap-3 mb-3'>
                        <div className='w-9 h-9 bg-[#E4DD3B]/10 border border-[#E4DD3B]/30 flex items-center justify-center'>
                          <svg
                            className='w-5 h-5 text-[#E4DD3B]'
                            fill='currentColor'
                            viewBox='0 0 24 24'
                          >
                            <path d='M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' />
                          </svg>
                        </div>
                        <span className='text-white/60 text-sm'>
                          {t('totalFacebookClicks')}
                        </span>
                      </div>
                      <p className='text-white font-display text-3xl'>
                        {facebookClicks}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No venues */}
          {!isLoading && !error && analytics.length === 0 && (
            <div className='text-center py-12'>
              <p className='text-white/50'>{t('noVenuesTitle')}</p>
            </div>
          )}
        </div>
      </div>
    </BackstageLayout>
  );
}
