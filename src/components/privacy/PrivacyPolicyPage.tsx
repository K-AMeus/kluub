'use client';

import { useTranslations } from 'next-intl';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';

export default function PrivacyPolicyPage() {
  const t = useTranslations('privacyPage');

  const sections = [
    { title: t('introTitle'), body: t('introBody') },
    { title: t('dataCollectedTitle'), body: t('dataCollectedBody') },
    { title: t('dataUseTitle'), body: t('dataUseBody') },
    { title: t('cookiesTitle'), body: t('cookiesBody') },
    { title: t('thirdPartyTitle'), body: t('thirdPartyBody') },
    { title: t('rightsTitle'), body: t('rightsBody') },
    { title: t('contactTitle'), body: t('contactBody') },
  ];

  return (
    <div className='flex flex-col min-h-screen w-screen bg-black'>
      <div className='fixed inset-0 pointer-events-none'>
        <div className='absolute inset-0 bg-linear-to-b from-[#0a0a0a] via-[#0d0d08] to-[#141410]' />
        <div className='absolute top-[15%] left-[8%] w-[350px] h-[350px] bg-[#E4DD3B]/2 rounded-full blur-[120px]' />
        <div className='absolute top-[50%] right-[8%] w-[300px] h-[300px] bg-[#ff9500]/1.5 rounded-full blur-[100px]' />
        <div className='absolute bottom-[10%] left-[30%] w-[200px] h-[200px] bg-[#E4DD3B]/1.5 rounded-full blur-[80px]' />
        <div className='absolute inset-0 opacity-[0.015] bg-grain' />
      </div>

      <Header />

      <main className='relative z-10 grow'>
        <section className='relative pt-28 md:pt-36 pb-16 md:pb-24 px-4 md:px-8'>
          <div className='relative max-w-3xl mx-auto'>
            <h1 className='text-white font-display text-3xl sm:text-4xl md:text-5xl tracking-wide mb-8 text-center'>
              {t('title')}
            </h1>

            <div className='border border-white/10 bg-white/5 p-6 md:p-10'>
              <p className='text-white/40 font-sans text-sm md:text-base mb-8'>
                {t('lastUpdated')}
              </p>

              <div className='space-y-6'>
                {sections.map((section, i) => (
                  <section key={i}>
                    <h2 className='text-white font-display text-lg md:text-xl tracking-wide mb-3'>
                      {section.title}
                    </h2>
                    <p className='text-white/70 font-sans text-sm md:text-base leading-relaxed whitespace-pre-line'>
                      {section.body}
                    </p>
                  </section>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
