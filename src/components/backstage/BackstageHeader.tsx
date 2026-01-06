'use client';

import { useTranslations } from 'next-intl';
import { createBrowserSupabaseClient } from '@/supabase/client';
import { useRouter } from 'next/navigation';

interface BackstageHeaderProps {
  onMenuToggle?: () => void;
  isMobileMenuOpen?: boolean;
}

export default function BackstageHeader({ onMenuToggle, isMobileMenuOpen }: BackstageHeaderProps) {
  const t = useTranslations('backstage');
  const router = useRouter();
  const supabase = createBrowserSupabaseClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/backstage');
  };

  return (
    <header className='bg-black/80 backdrop-blur-sm fixed top-0 left-0 right-0 z-30 border-b border-[#E4DD3B]/30'>
      <nav className='relative px-4 md:px-8 lg:px-10 flex items-center justify-between h-14 md:h-16'>
        {/* Mobile Menu Button */}
        <button
          onClick={onMenuToggle}
          className='lg:hidden p-2 text-white hover:text-[#E4DD3B] transition-colors'
          aria-label='Toggle menu'
        >
          {isMobileMenuOpen ? (
            <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
            </svg>
          ) : (
            <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 6h16M4 12h16M4 18h16' />
            </svg>
          )}
        </button>

        {/* Centered Title */}
        <div className='absolute left-1/2 -translate-x-1/2 text-white font-display text-xl md:text-3xl tracking-wider'>
          BACKSTAGE
        </div>

        {/* Sign Out Button */}
        <button
          onClick={handleSignOut}
          className='text-white/70 hover:text-white text-sm transition-colors duration-200 flex items-center gap-2 ml-auto'
        >
          <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1'
            />
          </svg>
          <span className='hidden sm:inline'>{t('signOut')}</span>
        </button>
      </nav>
    </header>
  );
}
