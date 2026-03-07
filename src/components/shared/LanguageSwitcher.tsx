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
    <div className='flex items-center shrink-0 gap-1'>
      {routing.locales.map((loc) =>
        locale === loc ? (
          <span
            key={loc}
            className='px-2 py-1 text-[11px] font-sans font-semibold uppercase tracking-wider text-[#E4DD3B] cursor-default'
          >
            {LOCALE_LABELS[loc]}
          </span>
        ) : (
          <Link
            key={loc}
            href={pathname}
            locale={loc}
            className='px-2 py-1 text-[11px] font-sans font-semibold uppercase tracking-wider text-white/40 hover:text-white transition-colors duration-200'
          >
            {LOCALE_LABELS[loc]}
          </Link>
        )
      )}
    </div>
  );
}
