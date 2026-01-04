'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import BackstageBackground from '@/components/backstage/BackstageBackground';
import EventUploadForm from '@/components/backstage/EventUploadForm';

export default function EventUploadPage() {
  const t = useTranslations('backstage');
  const locale = useLocale();

  return (
    <div className='flex flex-col min-h-screen w-screen bg-black overflow-hidden'>
      <div className='absolute inset-0 overflow-hidden'>
        <BackstageBackground />
      </div>

      <main className='relative z-10 flex-1 flex items-center justify-center px-4 py-12'>
        <div className='animate-fade-in-up w-full max-w-2xl'>
          <EventUploadForm />

          <div className='text-center mt-6'>
            <Link
              href={`/${locale}/backstage/welcome`}
              className='text-white/40 hover:text-white/60 text-sm transition-colors duration-200'
            >
              ← {t('backToWelcome')}
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
