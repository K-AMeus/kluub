import { useEffect, useState, MouseEvent } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

interface CityCardProps {
  name: string;
  isActive: boolean;
  href?: string;
  delay: number;
}

export default function CityCard({ name, isActive, href }: CityCardProps) {
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
    setIsLoading(true);
  };

  const cardContent = (
    <>
      {isActive && (
        <div className='absolute -inset-1 bg-linear-to-r from-[#E4DD3B]/20 via-[#E4DD3B]/40 to-[#E4DD3B]/20 rounded-lg blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500' />
      )}

      <div
        className={`relative px-8 py-4 md:px-16 md:py-8 rounded-lg border-2 transition-all duration-300 ${
          isActive
            ? 'bg-black/60 border-[#E4DD3B] group-hover:bg-[#E4DD3B]/10 group-hover:border-[#E4DD3B] group-hover:shadow-[0_0_40px_rgba(228,221,59,0.4)]'
            : 'bg-black/30 border-white/20'
        }`}
      >
        <span
          className={`font-display text-xl md:text-3xl tracking-wider uppercase transition-all duration-300 ${
            isActive ? 'text-[#E4DD3B] group-hover:text-white' : 'text-white/40'
          }`}
        >
          {name}
        </span>

        {!isActive && (
          <span className='absolute -top-2 -right-2 px-2 py-0.5 bg-white/10 text-white/50 text-[10px] font-medium uppercase tracking-wider rounded-full backdrop-blur-sm'>
            {t('soon')}
          </span>
        )}

        {isActive && (
          <span
            className={`absolute right-3 top-1/2 -translate-y-1/2 transition-all duration-300 ${
              isLoading
                ? 'opacity-100'
                : 'opacity-0 group-hover:opacity-100 group-hover:translate-x-1'
            }`}
          >
            {isLoading ? (
              <svg
                className='w-5 h-5 text-[#E4DD3B] animate-spin'
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
                className='w-5 h-5 text-[#E4DD3B]'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M9 5l7 7-7 7'
                />
              </svg>
            )}
          </span>
        )}
      </div>
    </>
  );

  const baseClasses = `relative group transform transition-all duration-700 ease-out ${
    isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
  } focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E4DD3B] focus-visible:ring-offset-2 focus-visible:ring-offset-black`;

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
        {cardContent}
      </Link>
    );
  }

  return (
    <button
      disabled
      aria-label={t('comingSoon', { city: name })}
      className={`${baseClasses} cursor-default`}
    >
      {cardContent}
    </button>
  );
}
