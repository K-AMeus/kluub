'use client';

import { useTranslations } from 'next-intl';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';

function HeroSection() {
  const t = useTranslations('joinPage');

  return (
    <section className='relative pt-28 md:pt-36 pb-8 md:pb-8 px-4 md:px-8'>
      {/* Background glow */}
      <div
        className='absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full pointer-events-none'
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(228, 221, 59, 0.08) 0%, rgba(228, 221, 59, 0.02) 40%, transparent 70%)',
        }}
      />

      <div className='relative max-w-4xl mx-auto text-center'>
        <h1 className='text-white font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight mb-6 md:mb-8 tracking-wide animate-fade-in-up'>
          {t('heroTitle')}
        </h1>
        <p className='text-white/50 font-sans text-base sm:text-lg md:text-xl lg:text-2xl max-w-2xl mx-auto leading-relaxed animate-fade-in-up [animation-delay:0.15s]'>
          {t('heroSubtitle')}
        </p>

        <div className='mt-8 md:mt-10 animate-fade-in-up [animation-delay:0.3s]'>
          <a
            href={`mailto:${t('ctaEmail')}`}
            className='inline-block px-8 py-3.5 bg-[#E4DD3B] text-black font-sans font-semibold text-sm md:text-base tracking-wider uppercase hover:bg-[#c8c234] transition-colors duration-300'
          >
            {t('joinNow')}
          </a>
        </div>
      </div>
    </section>
  );
}

const BENEFIT_ICONS = [
  // Reach new audiences
  <svg key='b1' className='w-7 h-7' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={1.5}>
    <path strokeLinecap='round' strokeLinejoin='round' d='M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z' />
  </svg>,
  // Facebook integration
  <svg key='b2' className='w-7 h-7' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={1.5}>
    <path strokeLinecap='round' strokeLinejoin='round' d='M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z' />
  </svg>,
  // Effortless management
  <svg key='b3' className='w-7 h-7' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={1.5}>
    <path strokeLinecap='round' strokeLinejoin='round' d='M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z' />
  </svg>,
  // Analytics
  <svg key='b4' className='w-7 h-7' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={1.5}>
    <path strokeLinecap='round' strokeLinejoin='round' d='M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z' />
  </svg>,
  // Custom solutions
  <svg key='b5' className='w-7 h-7' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={1.5}>
    <path strokeLinecap='round' strokeLinejoin='round' d='M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.049.58.025 1.193-.14 1.743' />
  </svg>,
  // Continuous development
  <svg key='b6' className='w-7 h-7' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={1.5}>
    <path strokeLinecap='round' strokeLinejoin='round' d='M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 0 0 6.16-12.12A14.98 14.98 0 0 0 9.631 8.41m5.96 5.96a14.926 14.926 0 0 1-5.841 2.58m-.119-8.54a6 6 0 0 0-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 0 0-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 0 1-2.448-2.448 14.9 14.9 0 0 1 .06-.312m-2.24 2.39a4.493 4.493 0 0 0-1.757 4.306 4.493 4.493 0 0 0 4.306-1.758M16.5 9a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z' />
  </svg>,
];

function BenefitsSection() {
  const t = useTranslations('joinPage');

  const benefits = [
    { title: t('benefit1Title'), desc: t('benefit1Desc') },
    { title: t('benefit2Title'), desc: t('benefit2Desc') },
    { title: t('benefit3Title'), desc: t('benefit3Desc') },
    { title: t('benefit4Title'), desc: t('benefit4Desc') },
    { title: t('benefit5Title'), desc: t('benefit5Desc') },
    { title: t('benefit6Title'), desc: t('benefit6Desc') },
  ];

  return (
    <section className='relative py-16 md:py-24 px-4 md:px-8'>
      <div className='max-w-6xl mx-auto'>
        <div className='text-center mb-12 md:mb-16'>
          <h2 className='text-white font-display text-2xl sm:text-3xl md:text-4xl tracking-wide mb-4'>
            {t('whyJoinTitle')}
          </h2>
          <p className='text-white/40 font-sans text-base md:text-lg max-w-xl mx-auto'>
            {t('whyJoinSubtitle')}
          </p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8'>
          {benefits.map((benefit, i) => (
            <div
              key={i}
              className='group relative p-6 md:p-8 border border-white/10 bg-white/5 hover:bg-white/10 hover:border-[#E4DD3B]/30 transition-all duration-500'
            >
              {/* Icon */}
              <div className='text-[#E4DD3B] mb-4 transition-transform duration-500 group-hover:scale-110'>
                {BENEFIT_ICONS[i]}
              </div>

              <h3 className='text-white font-display text-lg md:text-xl tracking-wide mb-3'>
                {benefit.title}
              </h3>
              <p className='text-white/40 font-sans text-sm md:text-base leading-relaxed'>
                {benefit.desc}
              </p>

              {/* Subtle corner accent on hover */}
              <div className='absolute top-0 right-0 w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500'>
                <div className='absolute top-0 right-0 w-full h-px bg-linear-to-l from-[#E4DD3B]/60 to-transparent' />
                <div className='absolute top-0 right-0 h-full w-px bg-linear-to-b from-[#E4DD3B]/60 to-transparent' />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  const t = useTranslations('joinPage');

  return (
    <section className='relative py-16 md:py-24 px-4 md:px-8'>
      <div className='absolute top-0 left-1/2 -translate-x-1/2 w-32 h-px bg-linear-to-r from-transparent via-[#E4DD3B]/30 to-transparent' />

      <div
        className='absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full pointer-events-none'
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(228, 221, 59, 0.05) 0%, transparent 70%)',
        }}
      />

      <div className='relative max-w-2xl mx-auto text-center'>
        <h2 className='text-white font-display text-2xl sm:text-3xl md:text-4xl tracking-wide mb-4'>
          {t('ctaTitle')}
        </h2>
        <p className='text-white/40 font-sans text-base md:text-lg mb-8 md:mb-10'>
          {t('ctaSubtitle')}
        </p>

        <a
          href={`mailto:${t('ctaEmail')}`}
          className='inline-flex items-center gap-3 px-8 py-4 bg-[#E4DD3B] text-black font-sans font-semibold text-base md:text-lg tracking-wide hover:bg-[#c8c234] transition-colors duration-300'
        >
          <svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
            <path strokeLinecap='round' strokeLinejoin='round' d='M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75' />
          </svg>
          {t('ctaButton')}
        </a>

        <p className='mt-4 text-white/30 text-sm'>
          {t('ctaEmail')}
        </p>
      </div>
    </section>
  );
}

export default function JoinPage() {
  return (
    <div className='flex flex-col min-h-screen w-screen bg-black'>
      {/* Background */}
      <div className='fixed inset-0 pointer-events-none'>
        <div className='absolute inset-0 bg-linear-to-b from-[#0a0a0a] via-[#0d0d08] to-[#141410]' />
        <div className='absolute top-[15%] left-[8%] w-[350px] h-[350px] bg-[#E4DD3B]/2 rounded-full blur-[120px]' />
        <div className='absolute top-[50%] right-[8%] w-[300px] h-[300px] bg-[#ff9500]/1.5 rounded-full blur-[100px]' />
        <div className='absolute bottom-[10%] left-[30%] w-[200px] h-[200px] bg-[#E4DD3B]/1.5 rounded-full blur-[80px]' />
        <div className='absolute inset-0 opacity-[0.015] bg-grain' />
      </div>

      <Header />

      <main className='relative z-10 grow'>
        <HeroSection />
        <BenefitsSection />
        <CTASection />

      </main>

      <Footer />
    </div>
  );
}
