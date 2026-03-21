'use client';

import { useEffect, useState, MouseEvent } from 'react';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { usePostHog } from 'posthog-js/react';

interface CityCardProps {
  name: string;
  isActive: boolean;
  href?: string;
  delay: number;
}

export default function CityCard({ name, isActive, href }: CityCardProps) {
  const posthog = usePostHog();
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslations('cityCard');

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (isLoading) {
      e.preventDefault();
      return;
    }
    posthog.capture('city_selected', {
      city: name,
    });
    setIsLoading(true);
  };

  const baseClasses = `relative group transform transition-all duration-700 ease-out ${
    isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
  } focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E4DD3B] focus-visible:ring-offset-2 focus-visible:ring-offset-black`;

  const content = (
    <div
      className={`flex items-center justify-center gap-3 px-7 py-3.5 md:px-12 md:py-4.5 w-full transition-all duration-300 ${
        isActive
          ? 'bg-[#E4DD3B] group-hover:bg-[#d4cd2b]'
          : 'bg-white/6 backdrop-blur-sm'
      }`}
    >
      <span
        className={`font-display text-base md:text-xl tracking-[0.15em] uppercase transition-colors duration-300 ${
          isActive
            ? 'text-black'
            : 'text-white/40'
        }`}
      >
        {name}
      </span>

      {!isActive && (
        <span className='absolute -top-2 right-1 px-1.5 py-px text-[7px] text-[#E4DD3B]/80 uppercase tracking-widest font-display bg-black border border-[#E4DD3B]/25'>
          {t('soon')}
        </span>
      )}

      {isActive && (
        <span className='absolute right-3 md:right-4 w-4 h-4 flex items-center justify-center'>
          {isLoading ? (
            <svg
              className='w-4 h-4 text-black animate-spin'
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
          ) : (
            <svg
              className='w-4 h-4 text-black opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:translate-x-0.5'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3'
              />
            </svg>
          )}
        </span>
      )}
    </div>
  );

  if (isActive && href) {
    return (
      <Link
        href={href}
        onClick={handleClick}
        className={`${baseClasses} ${
          isLoading ? 'cursor-wait' : 'cursor-pointer'
        }`}
        aria-label={t('selectCity', { city: name })}
        aria-busy={isLoading}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      disabled
      aria-label={t('comingSoon', { city: name })}
      className={`${baseClasses} cursor-default`}
    >
      {content}
    </button>
  );
}
