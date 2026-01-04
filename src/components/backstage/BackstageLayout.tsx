'use client';

import BackstageBackground from '@/components/backstage/BackstageBackground';
import BackstageSidebar from '@/components/backstage/BackstageSidebar';

interface BackstageLayoutProps {
  children: React.ReactNode;
}

export default function BackstageLayout({ children }: BackstageLayoutProps) {
  return (
    <div className='flex min-h-screen w-screen bg-black overflow-hidden'>
      {/* Background */}
      <div className='absolute inset-0 overflow-hidden'>
        <BackstageBackground />
      </div>

      {/* Content with sidebar */}
      <div className='relative z-10 flex w-full'>
        {/* Sidebar */}
        <BackstageSidebar />

        {/* Main content area */}
        <main className='flex-1 overflow-y-auto'>
          {children}
        </main>
      </div>
    </div>
  );
}
