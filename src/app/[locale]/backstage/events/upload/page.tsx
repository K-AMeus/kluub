'use client';

import { useTranslations } from 'next-intl';
import BackstageLayout from '@/components/backstage/BackstageLayout';
import EventUploadForm from '@/components/backstage/EventUploadForm';

export default function EventUploadPage() {
  const t = useTranslations('backstage');

  return (
    <BackstageLayout>
      <div className='px-4 py-8 md:py-12'>
        <div className='max-w-6xl mx-auto'>
          {/* Header */}
          <div className='mb-8'>
            <h1 className='font-display text-2xl md:text-3xl text-white tracking-wider mb-2'>
              {t('uploadEvent')}
            </h1>
            <p className='text-white/50 text-sm'>{t('uploadEventSubtitle')}</p>
          </div>

          <EventUploadForm />
        </div>
      </div>
    </BackstageLayout>
  );
}
