'use client';

import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import LanguageSwitcher from './LanguageSwitcher';

export default function Header() {
  const t = useTranslations('header');

  return (
    <header className='bg-black/80 backdrop-blur-sm fixed top-0 left-0 right-0 z-50 border-b border-[#E4DD3B]/30'>
      <nav className='grid grid-cols-[1fr_auto_1fr] items-center px-4 md:px-8 lg:px-10 h-14 md:h-16'>
        <div className='md:hidden w-fit'>
          <LanguageSwitcher />
        </div>
        <div className='hidden md:block' />

        <Link
          href='/'
          className='text-white font-display text-xl md:text-3xl tracking-wider hover:text-[#E4DD3B] transition-colors duration-300'
        >
          KLUUB.EE
        </Link>

        <div className='flex items-center gap-3 justify-self-end'>
          <div className='hidden md:block'>
            <LanguageSwitcher />
          </div>

          <Link
            href='/backstage'
            className='group flex items-center gap-1.5 text-[11px] font-sans font-semibold uppercase tracking-wider text-white/50 hover:text-[#E4DD3B] transition-colors duration-200'
          >
            {t('login')}
            <svg className='w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
              <path strokeLinecap='round' strokeLinejoin='round' d='M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3' />
            </svg>
          </Link>
        </div>
      </nav>
    </header>
  );
}
