'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { signOutAction } from '@/lib/auth-actions';

interface BackstageSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BackstageSidebar({ isOpen, onClose }: BackstageSidebarProps) {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations('backstage');

  const handleSignOut = async () => {
    onClose();
    await signOutAction(locale);
  };

  const navItems = [
    {
      name: t('home'),
      href: `/${locale}/backstage/welcome`,
      icon: (
        <svg className='w-[18px] h-[18px]' fill='none' stroke='currentColor' viewBox='0 0 24 24' strokeWidth={1.5}>
          <path strokeLinecap='round' strokeLinejoin='round' d='M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25' />
        </svg>
      ),
    },
    {
      name: t('myEvents'),
      href: `/${locale}/backstage/events`,
      icon: (
        <svg className='w-[18px] h-[18px]' fill='none' stroke='currentColor' viewBox='0 0 24 24' strokeWidth={1.5}>
          <path strokeLinecap='round' strokeLinejoin='round' d='M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5' />
        </svg>
      ),
    },
    {
      name: t('addNewEvent'),
      href: `/${locale}/backstage/events/upload`,
      icon: (
        <svg className='w-[18px] h-[18px]' fill='none' stroke='currentColor' viewBox='0 0 24 24' strokeWidth={1.5}>
          <path strokeLinecap='round' strokeLinejoin='round' d='M12 4.5v15m7.5-7.5h-15' />
        </svg>
      ),
    },
    {
      name: t('analytics'),
      href: `/${locale}/backstage/analytics`,
      icon: (
        <svg
          className='w-5 h-5'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
          />
        </svg>
      ),
    },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className='lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300'
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-14 md:top-16 bottom-0 left-0 z-40
          lg:fixed lg:top-0 lg:bottom-0
          w-64 bg-black/90 backdrop-blur-md border-r border-white/6 flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo area (desktop only) */}
        <div className='hidden lg:flex items-center h-16 px-5 border-b border-white/6'>
          <Link href={`/${locale}/backstage/welcome`} className='flex items-center gap-2.5 group'>
            <span className='font-display text-lg text-white tracking-wider group-hover:text-[#E4DD3B] transition-colors duration-75 hover:duration-0'>
              KLUUB
            </span>
            <span className='inline-flex items-center px-2 py-0.5 text-[10px] font-semibold tracking-widest uppercase text-[#E4DD3B]/80 bg-[#E4DD3B]/8 border border-[#E4DD3B]/20'>
              Backstage
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className='flex-1 px-3 py-4 space-y-1'>
          <p className='px-3 mb-3 text-[10px] font-semibold tracking-widest uppercase text-white/30'>
            {t('menu')}
          </p>
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`
                  flex items-center gap-3 px-3 py-2.5 text-sm font-medium
                  transition-all duration-75 hover:duration-0 group
                  ${active
                    ? 'bg-[#E4DD3B]/1 text-[#E4DD3B]'
                    : 'text-white/50 hover:text-white/90 hover:bg-white/4'
                  }
                `}
              >
                <span className={`${active ? 'text-[#E4DD3B]' : 'text-white/40 group-hover:text-white/70'} transition-colors duration-75 hover:duration-0`}>
                  {item.icon}
                </span>
                <span>{item.name}</span>
                {active && (
                  <span className='ml-auto w-1.5 h-1.5 rounded-full bg-[#E4DD3B]' />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sign Out at the bottom */}
        <div className='px-3 py-4 border-t border-white/6'>
          <button
            onClick={handleSignOut}
            className='w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium
              text-white/40 hover:text-red-400 hover:bg-red-500/6
              transition-all duration-75 hover:duration-0 cursor-pointer group'
          >
            <svg className='w-[18px] h-[18px] text-white/30 group-hover:text-red-400 transition-colors duration-75 hover:duration-0' fill='none' stroke='currentColor' viewBox='0 0 24 24' strokeWidth={1.5}>
              <path strokeLinecap='round' strokeLinejoin='round' d='M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9' />
            </svg>
            <span>{t('signOut')}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
