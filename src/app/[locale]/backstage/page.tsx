'use client';

import { useSearchParams } from 'next/navigation';
import BackstageBackground from '@/components/backstage/BackstageBackground';
import LoginForm from '@/components/backstage/LoginForm';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';

export default function BackstagePage() {
  const searchParams = useSearchParams();
  const hasError = searchParams.get('error');

  return (
    <div className='flex flex-col min-h-screen w-screen bg-[#0a0a0a] overflow-hidden'>
      <BackstageBackground />

      <Header />

      <main className='relative z-10 flex-1 flex items-center justify-center px-4 pt-20 pb-12'>
        <div className='animate-fade-in-up'>
          <LoginForm />
          {hasError && (
            <div className='mt-4 p-3 bg-red-500/6 border border-red-500/20 text-red-400 text-xs text-center'>
              Authentication failed. Please try again.
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
