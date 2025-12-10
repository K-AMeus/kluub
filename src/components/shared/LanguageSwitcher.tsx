'use client';

import { useLocale } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';

const LOCALE_LABELS: Record<'et' | 'en', string> = {
  et: 'EST',
  en: 'ENG',
};

export default function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();

  return (
    <div className='flex items-center gap-1 text-sm font-medium tracking-wide'>
      {routing.locales.map((loc, index) => (
        <span key={loc} className='flex items-center'>
          {index > 0 && <span className='text-white/20 mx-1'>|</span>}
          {locale === loc ? (
            <span className='px-1 py-0.5 text-[#E4DD3B] cursor-default'>
              {LOCALE_LABELS[loc]}
            </span>
          ) : (
            <Link
              href={pathname}
              locale={loc}
              className='px-1 py-0.5 text-white/50 hover:text-white transition-colors duration-300'
            >
              {LOCALE_LABELS[loc]}
            </Link>
          )}
        </span>
      ))}
    </div>
  );
}
