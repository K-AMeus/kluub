'use client';

import { useLocale } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';

const LOCALE_LABELS: Record<'et' | 'en', string> = {
  et: 'ET',
  en: 'EN',
};

export default function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();

  return (
    <div className='inline-flex items-stretch shrink-0 border border-white/15'>
      {routing.locales.map((loc, i) => {
        const isActive = locale === loc;
        const baseClasses =
          'px-2.5 py-1.5 text-[10px] md:text-[11px] font-sans font-semibold uppercase tracking-wider leading-none flex items-center transition-colors duration-200';
        const dividerClass = i > 0 ? 'border-l border-white/15' : '';

        return isActive ? (
          <span
            key={loc}
            aria-current='true'
            className={`${baseClasses} ${dividerClass} bg-[#E4DD3B] text-black cursor-default`}
          >
            {LOCALE_LABELS[loc]}
          </span>
        ) : (
          <Link
            key={loc}
            href={pathname}
            locale={loc}
            className={`${baseClasses} ${dividerClass} text-white/50 hover:text-white hover:bg-white/5`}
          >
            {LOCALE_LABELS[loc]}
          </Link>
        );
      })}
    </div>
  );
}
