'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { createBrowserSupabaseClient } from '@/supabase/client';
import BackstageBackground from '@/components/backstage/BackstageBackground';

export default function WelcomePage() {
  const t = useTranslations('backstage');
  const [mounted, setMounted] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const supabase = createBrowserSupabaseClient();

  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      setMounted(true);
    });

    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email ?? null);
      }
    };

    getUser();

    return () => cancelAnimationFrame(frameId);
  }, [supabase.auth]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/backstage';
  };

  return (
    <div className='flex flex-col min-h-screen w-screen bg-black overflow-hidden'>
      <div className='absolute inset-0 overflow-hidden'>
        <BackstageBackground />
      </div>

      <main className='relative z-10 flex-1 flex items-center justify-center px-4 py-12'>
        <div
          className={`transform transition-all duration-700 ease-out ${
            mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}
        >
          <div className='text-center max-w-md'>
            <div className='mb-6 inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#E4DD3B]/10 border border-[#E4DD3B]/30'>
              <svg
                className='w-8 h-8 text-[#E4DD3B]'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M5 13l4 4L19 7'
                />
              </svg>
            </div>

            <h1 className='font-display text-2xl md:text-3xl text-white tracking-wider mb-3'>
              {t('welcomeTitle')}
            </h1>

            <p className='text-white/50 mb-2'>{t('welcomeSubtitle')}</p>

            {userEmail && (
              <p className='text-[#E4DD3B]/80 text-sm mb-8'>{userEmail}</p>
            )}

            <p className='text-white/40 text-sm mb-8'>{t('welcomeMessage')}</p>

            <button
              onClick={handleSignOut}
              className='px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/70 hover:text-white text-sm rounded-lg transition-all duration-200'
            >
              {t('signOut')}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
