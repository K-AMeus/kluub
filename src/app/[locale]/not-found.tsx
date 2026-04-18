import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';

export default async function NotFound() {
  const t = await getTranslations('errors');

  return (
    <div className='flex flex-col min-h-screen bg-[#0a0a0a]'>
      <Header />

      <main className='relative z-10 flex-1 flex items-center justify-center px-4 pt-20 pb-12'>
        <div className='relative max-w-lg w-full'>
          <div className='absolute -inset-1 bg-linear-to-r from-[#E4DD3B]/10 via-[#E4DD3B]/20 to-[#E4DD3B]/10 blur-xl opacity-50' />

          <div className='relative bg-black/60 backdrop-blur-xl border border-[#E4DD3B]/30 p-8 md:p-10 text-center'>
            <p className='font-display text-[#E4DD3B] text-5xl md:text-6xl tracking-wider mb-4'>
              404
            </p>
            <h1 className='font-display text-white text-xl md:text-2xl uppercase tracking-wider mb-3'>
              {t('notFoundTitle')}
            </h1>
            <p className='text-white/50 font-sans text-sm md:text-base mb-8'>
              {t('notFoundMessage')}
            </p>
            <Link
              href='/'
              className='inline-block px-6 py-3 bg-[#E4DD3B] hover:bg-[#E4DD3B]/90 text-black font-sans font-semibold text-sm uppercase tracking-wider transition-colors duration-200'
            >
              {t('notFoundCta')}
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
