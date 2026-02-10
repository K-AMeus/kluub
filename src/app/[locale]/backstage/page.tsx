'use client';

import { useSearchParams } from 'next/navigation';
import BackstageBackground from '@/components/backstage/BackstageBackground';
import LoginForm from '@/components/backstage/LoginForm';

export default function BackstagePage() {
  const searchParams = useSearchParams();
  const hasError = searchParams.get('error');

  return (
    <div className='flex flex-col min-h-screen w-screen bg-black overflow-hidden'>
      <div className='absolute inset-0 overflow-hidden'>
        <BackstageBackground />
      </div>

      <main className='relative z-10 flex-1 flex items-center justify-center px-4 py-12'>
        <div className='animate-fade-in-up'>
          <LoginForm />
          {hasError && (
            <div className='mt-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center'>
              Authentication failed. Please try again.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
