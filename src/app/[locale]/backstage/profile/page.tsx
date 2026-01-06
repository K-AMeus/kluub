'use client';

import { useTranslations } from 'next-intl';
import BackstageLayout from '@/components/backstage/BackstageLayout';

export default function MyProfilePage() {
  const t = useTranslations('backstage');

  return (
    <BackstageLayout>
      <div className='flex items-center justify-center min-h-[calc(100vh-3.5rem)] md:min-h-[calc(100vh-4rem)] px-4 py-8 md:py-12'>
        <div className='text-center max-w-md'>
          <div className='mb-6 inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#E4DD3B]/10 border border-[#E4DD3B]/30'>
            <svg
              className='w-8 h-8 text-[#E4DD3B]'
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
          </div>

          <h1 className='font-display text-2xl md:text-3xl text-white tracking-wider mb-3'>
            {t('comingSoon')}
          </h1>

          <p className='text-white/50 text-sm'>
            {t('comingSoonMessage')}
          </p>
        </div>
      </div>
    </BackstageLayout>
  );
}
