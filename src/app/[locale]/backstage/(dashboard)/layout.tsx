'use client';

import { useState } from 'react';
import BackstageBackground from '@/components/backstage/BackstageBackground';
import BackstageSidebar from '@/components/backstage/BackstageSidebar';
import BackstageHeader from '@/components/backstage/BackstageHeader';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className='min-h-screen w-full bg-[#0a0a0a]'>
      <BackstageBackground />

      <BackstageHeader
        onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isMobileMenuOpen={isMobileMenuOpen}
      />

      <div className='relative z-10 flex w-full min-h-screen pt-14 md:pt-16'>
        <BackstageSidebar
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        />

        <main className='flex-1 w-full lg:pl-64'>
          <div className='w-full'>{children}</div>
        </main>
      </div>
    </div>
  );
}
