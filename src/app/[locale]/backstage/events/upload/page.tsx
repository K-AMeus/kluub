'use client';

import BackstageLayout from '@/components/backstage/BackstageLayout';
import EventUploadForm from '@/components/backstage/EventUploadForm';

export default function EventUploadPage() {
  return (
    <BackstageLayout>
      <div className='flex items-center justify-center min-h-[calc(100vh-3.5rem)] md:min-h-[calc(100vh-4rem)] px-4 py-8 md:py-12'>
        <div className='animate-fade-in-up w-full max-w-2xl'>
          <EventUploadForm />
        </div>
      </div>
    </BackstageLayout>
  );
}
