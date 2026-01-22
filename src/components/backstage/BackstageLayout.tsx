'use client';

import { useState } from 'react';
import BackstageBackground from '@/components/backstage/BackstageBackground';
import BackstageSidebar from '@/components/backstage/BackstageSidebar';
import BackstageHeader from '@/components/backstage/BackstageHeader';

interface BackstageLayoutProps {
  children: React.ReactNode;
}

export default function BackstageLayout({ children }: BackstageLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className='h-screen w-full bg-black overflow-hidden'>
      {/* Background */}
      <div className='fixed inset-0 overflow-hidden -z-10'>
        <BackstageBackground />
      </div>

      {/* Header */}
      <BackstageHeader
        onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isMobileMenuOpen={isMobileMenuOpen}
      />

      {/* Content with sidebar */}
      <div className='relative z-10 flex w-full h-[calc(100vh-3.5rem)] md:h-[calc(100vh-4rem)] mt-14 md:mt-16 overflow-y-auto overflow-x-hidden'>
        {/* Sidebar */}
        <BackstageSidebar
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        />

        {/* Main content area */}
        <main className='flex-1 w-full lg:ml-64'>
          {children}
        </main>
      </div>
    </div>
  );
}
