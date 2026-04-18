'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('errors');

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className='flex flex-col min-h-screen bg-[#0a0a0a]'>
      <Header />

      <main className='relative z-10 flex-1 flex items-center justify-center px-4 pt-20 pb-12'>
        <div className='relative max-w-lg w-full'>
          <div className='absolute -inset-1 bg-linear-to-r from-[#E4DD3B]/10 via-[#E4DD3B]/20 to-[#E4DD3B]/10 blur-xl opacity-50' />

          <div className='relative bg-black/60 backdrop-blur-xl border border-[#E4DD3B]/30 p-8 md:p-10 text-center'>
            <p className='font-display text-[#E4DD3B] text-5xl md:text-6xl tracking-wider mb-4'>
              500
            </p>
            <h1 className='font-display text-white text-xl md:text-2xl uppercase tracking-wider mb-3'>
              {t('errorTitle')}
            </h1>
            <p className='text-white/50 font-sans text-sm md:text-base mb-8'>
              {t('errorMessage')}
            </p>
            <div className='flex flex-col sm:flex-row gap-3 justify-center'>
              <button
                onClick={reset}
                className='px-6 py-3 bg-[#E4DD3B] hover:bg-[#E4DD3B]/90 text-black font-sans font-semibold text-sm uppercase tracking-wider transition-colors duration-200 cursor-pointer'
              >
                {t('errorCta')}
              </button>
              <Link
                href='/'
                className='px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-sans font-semibold text-sm uppercase tracking-wider transition-all duration-200'
              >
                {t('goHome')}
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
