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

      <div className='relative z-10 grow flex flex-col px-6 md:px-12 lg:px-20 pb-24 pt-16 md:pt-20 md:pb-16'>
        {/* Desktop layout */}
        <div className='hidden md:flex flex-col justify-center grow'>
          <div
            className={`max-w-5xl transform transition-all duration-1000 ease-out ${
              mounted ? 'translate-y-0 opacity-100' : '-translate-y-8 opacity-0'
            }`}
          >
            <h1 className='text-white font-display uppercase leading-[0.85] tracking-tight mb-5'>
              <span className='block text-5xl lg:text-6xl xl:text-7xl'>
                {t('titlePart1')}
              </span>
              <span className='block text-5xl lg:text-6xl xl:text-7xl mt-1'>
                <span className='italic text-[#E4DD3B]'>{t('titleHighlight')}</span>
                {' '}
                {t('titlePart2')}
              </span>
            </h1>

            <p className='text-white/40 font-sans text-base max-w-md mb-16'>
              {t('subtitle')}
            </p>

            <div className='flex items-center gap-4'>
              <CityCard
                name='Tartu'
                isActive={true}
                href='/events/tartu'
                delay={200}
              />
              <CityCard name='Tallinn' isActive={false} delay={400} />
              <CityCard name='Pärnu' isActive={false} delay={600} />
            </div>

            <div
              className={`mt-8 flex items-center gap-3 transform transition-all duration-1000 delay-500 ease-out ${
                mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              }`}
            >
              <div className='h-px w-6 bg-white/15' />
              <span className='text-white/40 text-sm'>{t('venueOwner')}</span>
              <Link
                href='/join'
                className='group flex items-center gap-1 text-sm text-[#E4DD3B] hover:text-[#E4DD3B] transition-colors duration-300'
              >
                {t('registerVenue')}
                <svg className='w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
                  <path strokeLinecap='round' strokeLinejoin='round' d='M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3' />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile layout */}
        <div className='flex md:hidden flex-col items-center justify-center grow'>
          <div
            className={`text-center mb-6 transform transition-all duration-1000 ease-out ${
              mounted ? 'translate-y-0 opacity-100' : '-translate-y-8 opacity-0'
            }`}
          >
            <h1 className='text-white font-display uppercase leading-[0.85] tracking-tight mb-3'>
              <span className='block text-3xl sm:text-4xl'>
                {t('titlePart1')}
              </span>
              <span className='block text-3xl sm:text-4xl mt-1'>
                <span className='italic text-[#E4DD3B]'>{t('titleHighlight')}</span>
                {' '}
                {t('titlePart2')}
              </span>
            </h1>

            <p className='text-white/40 font-sans text-xs sm:text-sm max-w-xs mx-auto'>
              {t('subtitle')}
            </p>
          </div>

          <div className='flex flex-col items-center gap-3'>
            <div className='flex justify-center'>
              <CityCard name='Tallinn' isActive={false} delay={400} />
            </div>
            <div className='flex gap-3'>
              <CityCard
                name='Tartu'
                isActive={true}
                href='/events/tartu'
                delay={200}
              />
              <CityCard name='Pärnu' isActive={false} delay={600} />
            </div>
          </div>

          <div
            className={`mt-10 flex items-center justify-center gap-2 transform transition-all duration-1000 delay-500 ease-out ${
              mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
          >
            <span className='text-white/40 text-xs'>{t('venueOwner')}</span>
            <Link
              href='/join'
              className='group flex items-center gap-1 text-xs text-[#E4DD3B] hover:text-[#E4DD3B] transition-colors duration-300'
            >
              {t('registerVenue')}
              <svg className='w-3 h-3 transition-transform duration-300 group-hover:translate-x-0.5' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
                <path strokeLinecap='round' strokeLinejoin='round' d='M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3' />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      <div className='w-full z-40 absolute bottom-0'>
        <Footer />
      </div>
    </div>
  );
}
