'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import BackgroundEffects from './BackgroundEffects';
import HoneycombPattern from './honeycomb/HoneycombPattern';
import CityCard from './CityCard';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import { Link } from '@/i18n/navigation';

const ParticleField = dynamic(() => import('./ParticleField'), {
  ssr: false,
});

export default function LandingPage() {
  const t = useTranslations('landingPage');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    setMounted(true);

    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div className='flex flex-col h-screen w-screen bg-black overflow-hidden'>
      <div className='absolute inset-0 overflow-hidden'>
        <BackgroundEffects />
        <HoneycombPattern />
        <ParticleField />
      </div>

      <Header />

      <div className='relative z-10 grow flex flex-col items-center justify-center px-4 md:px-6 pb-24 pt-16 md:pt-32 md:pb-16'>
        <div
          className={`text-center max-w-3xl mb-6 md:mb-20 transform transition-all duration-1000 ease-out ${
            mounted ? 'translate-y-0 opacity-100' : '-translate-y-8 opacity-0'
          }`}
        >
          <h1 className='text-white font-display text-xl sm:text-2xl md:text-4xl text-balance lg:text-5xl xl:text-6xl leading-tight mb-3 md:mb-8 tracking-wide'>
            {t('title')}
          </h1>
          <p className='text-white/50 font-sans text-sm sm:text-base md:text-xl lg:text-2xl'>
            {t('subtitle')}
          </p>
        </div>

        {/* Mobile layout */}
        <div className='flex flex-col items-center gap-3 md:hidden'>
          <div className='flex justify-center w-full'>
            <CityCard name='Tallinn' isActive={false} delay={400} />
          </div>
          <div className='flex w-full max-w-sm gap-3'>
            <div className='flex-1 flex justify-end'>
              <CityCard
                name='Tartu'
                isActive={true}
                href='/events/tartu'
                delay={200}
              />
            </div>
            <div className='flex-1 flex justify-start'>
              <CityCard name='Pärnu' isActive={false} delay={600} />
            </div>
          </div>
        </div>

        {/* Desktop and tablet layout */}
        <div className='hidden md:flex flex-row items-center gap-3 md:gap-6 lg:gap-8'>
          <CityCard
            name='Tartu'
            isActive={true}
            href='/events/tartu'
            delay={200}
          />
          <CityCard name='Tallinn' isActive={false} delay={400} />
          <CityCard name='Pärnu' isActive={false} delay={600} />
        </div>

        {/* join link */}
        <div
          className={`mt-8 md:mt-14 flex items-center gap-2 text-sm md:text-base transform transition-all duration-1000 delay-500 ease-out ${
            mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
        >
          <span className='text-white/40'>{t('venueOwner')}</span>
          <Link
            href='/join'
            className='group flex items-center gap-1.5 text-[#E4DD3B] hover:text-[#E4DD3B]/80 transition-colors duration-300 underline underline-offset-2 decoration-[#E4DD3B]/40 hover:decoration-[#E4DD3B]/80'
          >
            {t('registerVenue')}
            <svg className='w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
              <path strokeLinecap='round' strokeLinejoin='round' d='M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3' />
            </svg>
          </Link>
        </div>
      </div>

      <div className='w-full z-40 absolute bottom-0'>
        <Footer />
      </div>
    </div>
  );
}
