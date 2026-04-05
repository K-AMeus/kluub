'use client';

import { useEffect, useState } from 'react';
import { useMounted } from '@/lib/hooks';
import { useTranslations, useLocale } from 'next-intl';
import { useBackstage } from '@/components/backstage/BackstageProvider';

interface HostAnalyticsItem {
  host: { id: string; name: string };
  detailViews: number;
  facebookClicks: number;
}

function BarGraph({ data, labels, title }: { data: number[]; labels: string[]; title: string }) {
  const max = Math.max(...data, 1);

  return (
    <div className='bg-white/5 border border-white/10 p-5 overflow-hidden'>
      <h3 className='text-white font-semibold text-sm mb-5'>{title}</h3>
      <div className='flex items-end gap-px min-w-0 h-36'>
        {data.map((value, i) => (
          <div key={i} className='flex-1 min-w-0 flex flex-col items-center gap-1 h-full justify-end'>
            {value > 0 && (
              <span className='text-[#E4DD3B] text-[9px] font-bold font-mono truncate'>{value}</span>
            )}
            <div
              className='w-full bg-[#E4DD3B]/80 hover:bg-[#E4DD3B] transition-colors rounded-t min-h-[2px]'
              style={{ height: `${Math.max(Math.min((value / max) * 100, 75), value > 0 ? 3 : 0)}%` }}
            />
            <span className='text-white/40 text-[9px] font-medium truncate w-full text-center'>{labels[i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const t = useTranslations('backstage');
  const locale = useLocale();
  const { hosts: userHosts, isLoading: contextLoading } = useBackstage();
  const [analytics, setAnalytics] = useState<HostAnalyticsItem[]>([]);
  const [viewsByWeekday, setViewsByWeekday] = useState<number[]>(Array(7).fill(0));
  const [viewsByHour, setViewsByHour] = useState<number[]>(Array(24).fill(0));
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mounted = useMounted();

  useEffect(() => {
    if (contextLoading) return;

    if (userHosts.length === 0) {
      setIsLoading(false);
      return;
    }

    const fetchAnalytics = async () => {
      try {
        setIsLoading(true);

        const res = await fetch('/api/analytics');
        if (res.status === 401) {
          setError(t('authError'));
          return;
        }
        if (!res.ok) {
          setError(t('unexpectedError'));
          return;
        }

        const { hosts, hostAnalytics: counts, viewsByWeekday: wd, viewsByHour: hr } = await res.json();

        setAnalytics(
          (hosts as { id: string; name: string }[]).map((host) => ({
            host,
            detailViews: counts?.[host.id]?.detailViews || 0,
            facebookClicks: counts?.[host.id]?.facebookClicks || 0,
          }))
        );
        if (wd) setViewsByWeekday(wd);
        if (hr) setViewsByHour(hr);
      } catch {
        setError(t('unexpectedError'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [contextLoading, userHosts.length]);

  return (
    <div className='px-4 md:px-8 py-6 md:py-10'>
      <div className={`max-w-5xl mx-auto transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
          {/* Header */}
          <div className='mb-8'>
            <h1 className='font-display text-2xl md:text-3xl text-white tracking-wider mb-2'>
              {t('analyticsTitle')}
            </h1>
          </div>

          {/* Loading */}
          {(contextLoading || isLoading) && (
            <div className='space-y-3'>
              {[1, 2].map((i) => (
                <div key={i} className='bg-white/2 border border-white/6 p-6'>
                  <div className='h-4 w-40 bg-white/4 animate-pulse mb-2' />
                  <div className='h-3 w-24 bg-white/3 animate-pulse mb-6' />
                  <div className='grid grid-cols-2 gap-6'>
                    <div className='bg-white/3 border border-white/6 p-4'>
                      <div className='h-3 w-20 bg-white/4 animate-pulse mb-3' />
                      <div className='h-8 w-16 bg-white/4 animate-pulse' />
                    </div>
                    <div className='bg-white/3 border border-white/6 p-4'>
                      <div className='h-3 w-20 bg-white/4 animate-pulse mb-3' />
                      <div className='h-8 w-16 bg-white/4 animate-pulse' />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className='p-4 bg-red-500/10 border border-red-500/30 text-red-400 text-sm'>
              {error}
            </div>
          )}

          {/* No Hosts State */}
          {!contextLoading && !isLoading && !error && userHosts.length === 0 && (
            <div className='bg-white/2 border border-white/6 p-8 md:p-12'>
              <div className='text-center max-w-sm mx-auto'>
                <div className='mb-5 inline-flex items-center justify-center w-14 h-14 bg-white/4 border border-white/6'>
                  <svg className='w-7 h-7 text-white/30' fill='none' stroke='currentColor' viewBox='0 0 24 24' strokeWidth={1.5}>
                    <path strokeLinecap='round' strokeLinejoin='round' d='M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z' />
                  </svg>
                </div>
                <h2 className='text-white text-lg font-semibold mb-2'>
                  {t('noHostsTitle')}
                </h2>
                <p className='text-white/40 text-sm'>{t('noHostsMessage')}</p>
              </div>
            </div>
          )}

          {/* Analytics Cards */}
          {!contextLoading && !isLoading && !error && analytics.length > 0 && (
            <div className='space-y-6'>
              {analytics.map(({ host, detailViews, facebookClicks }) => (
                <div
                  key={host.id}
                  className='bg-white/5 border border-white/10 p-6'
                >
                  <h2 className='text-white font-semibold text-lg mb-4'>
                    {host.name}
                  </h2>

                  <div className='grid grid-cols-2 gap-6'>
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

          {!contextLoading && !isLoading && !error && userHosts.length > 0 && analytics.length === 0 && (
            <div className='text-center py-12'>
              <p className='text-white/40'>{t('analyticsTitle')}</p>
            </div>
          )}

          {/* Bar Graphs */}
          {!contextLoading && !isLoading && !error && analytics.length > 0 && (
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mt-6'>
              <BarGraph
                data={viewsByWeekday}
                labels={(() => {
                  const dateLocale = locale === 'et' ? 'et-EE' : 'en-US';
                  return Array.from({ length: 7 }, (_, i) => {
                    const d = new Date(2025, 0, 6 + i); // Mon=6 Jan 2025
                    return d.toLocaleDateString(dateLocale, { weekday: 'short' });
                  });
                })()}
                title={t('viewsByWeekday')}
              />
              <BarGraph
                data={viewsByHour}
                labels={Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))}
                title={t('viewsByHour')}
              />
            </div>
          )}
      </div>
    </div>
  );
}
