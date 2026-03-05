'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';

interface BackstageHeaderProps {
  onMenuToggle?: () => void;
  isMobileMenuOpen?: boolean;
}

export default function BackstageHeader({ onMenuToggle, isMobileMenuOpen }: BackstageHeaderProps) {
  const locale = useLocale();

  return (
    <header className='fixed top-0 left-0 right-0 z-30 bg-black/80 backdrop-blur-md border-b border-white/6'>
      <nav className='flex items-center h-14 md:h-16 px-4 md:px-6'>
        {/* Left: Mobile menu + Brand */}
        <div className='flex items-center gap-3'>
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuToggle}
            className='lg:hidden p-1.5 -ml-1.5 text-white/60 hover:text-white hover:bg-white/6 transition-all duration-200'
            aria-label='Toggle menu'
          >
            <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24' strokeWidth={1.5}>
              {isMobileMenuOpen ? (
                <path strokeLinecap='round' strokeLinejoin='round' d='M6 18L18 6M6 6l12 12' />
              ) : (
                <path strokeLinecap='round' strokeLinejoin='round' d='M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5' />
              )}
            </svg>
          </button>

          {/* Brand */}
          <Link
            href={`/${locale}/backstage/welcome`}
            className='flex items-center gap-2.5 group'
          >
            <span className='font-display text-lg md:text-xl text-white tracking-wider group-hover:text-[#E4DD3B] transition-colors duration-200'>
              KLUUB
            </span>
            <span className='hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-semibold tracking-widest uppercase text-[#E4DD3B]/80 bg-[#E4DD3B]/8 border border-[#E4DD3B]/20'>
              Backstage
            </span>
          </Link>
        </div>

        {/* Right: Back to site */}
        <div className='ml-auto flex items-center gap-2'>
          <Link
            href='/'
            className='flex items-center gap-1.5 text-sm font-medium text-[#E4DD3B]/70 hover:text-[#E4DD3B] transition-colors duration-200'
          >
            kluub.ee
            <svg className='w-3.5 h-3.5' fill='none' stroke='currentColor' viewBox='0 0 24 24' strokeWidth={2}>
              <path strokeLinecap='round' strokeLinejoin='round' d='M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25' />
            </svg>
          </Link>
        </div>
      </nav>
    </header>
  );
}
