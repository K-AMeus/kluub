'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';

const LOCALE_LABELS: Record<'et' | 'en', string> = {
  et: 'EST',
  en: 'ENG',
};

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleLocaleChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <div className='flex items-center gap-1 text-sm font-medium tracking-wide'>
      {routing.locales.map((loc, index) => (
        <span key={loc} className='flex items-center'>
          {index > 0 && <span className='text-white/20 mx-1'>|</span>}
          <button
            onClick={() => handleLocaleChange(loc)}
            disabled={locale === loc}
            className={`px-1 py-0.5 transition-colors duration-300 ${
              locale === loc
                ? 'text-[#E4DD3B] cursor-default'
                : 'text-white/50 hover:text-white cursor-pointer'
            }`}
          >
            {LOCALE_LABELS[loc]}
          </button>
        </span>
      ))}
    </div>
  );
}
