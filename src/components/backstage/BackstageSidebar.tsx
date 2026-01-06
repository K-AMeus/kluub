'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';

export default function BackstageSidebar() {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations('backstage');

  const navItems = [
    {
      name: t('home'),
      href: `/${locale}/backstage/welcome`,
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
            d='M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
          />
        </svg>
      ),
    },
    {
      name: t('myEvents'),
      href: `/${locale}/backstage/events`,
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
            d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
          />
        </svg>
      ),
    },
    {
      name: t('addNewEvent'),
      href: `/${locale}/backstage/events/upload`,
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
            d='M12 4v16m8-8H4'
          />
        </svg>
      ),
    },
    {
      name: t('myProfile'),
      href: `/${locale}/backstage/profile`,
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
            d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
          />
        </svg>
      ),
    },
  ];

  const isActive = (href: string) => {
    return pathname === href;
  };

  return (
    <aside className='w-64 border-r border-white/10 bg-black/40 backdrop-blur-sm flex flex-col'>
      {/* Logo/Header */}
      <div className='p-6 border-b border-white/10'>
        <h2 className='font-display text-xl text-white tracking-wider'>
          {t('title')}
        </h2>
        <p className='text-white/40 text-xs mt-1'>{t('subtitle')}</p>
      </div>

      {/* Navigation */}
      <nav className='flex-1 p-4 space-y-2'>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              isActive(item.href)
                ? 'bg-[#E4DD3B]/10 text-[#E4DD3B] border border-[#E4DD3B]/30'
                : 'text-white/70 hover:text-white hover:bg-white/5'
            }`}
          >
            {item.icon}
            <span className='font-medium'>{item.name}</span>
          </Link>
        ))}
      </nav>

      {/* Footer - could add sign out here later */}
      <div className='p-4 border-t border-white/10'>
        <div className='text-white/40 text-xs text-center'>
          Kluub Backstage
        </div>
      </div>
    </aside>
  );
}
