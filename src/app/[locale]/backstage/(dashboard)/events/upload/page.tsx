'use client';

import { useTranslations } from 'next-intl';
import EventUploadForm from '@/components/backstage/EventUploadForm';

export default function EventUploadPage() {
  const t = useTranslations('backstage');

  return (
    <div className='px-4 md:px-8 py-6 md:py-10'>
      <div className='max-w-5xl mx-auto'>
        <div className='mb-6'>
          <h1 className='font-display text-2xl md:text-3xl text-white tracking-wider mb-1'>
            {t('uploadEvent')}
          </h1>
          <p className='text-white/40 text-sm'>{t('uploadEventSubtitle')}</p>
        </div>

        <EventUploadForm />
      </div>
    </div>
  );
}
