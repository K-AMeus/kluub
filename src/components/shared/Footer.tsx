import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { InstagramIcon, TikTokIcon } from './icons';

const SOCIAL_LINKS = [
  {
    href: 'https://www.instagram.com/kluub.ee_',
    Icon: InstagramIcon,
    label: 'Instagram',
  },
  {
    href: 'https://www.tiktok.com/@kluub.ee_',
    Icon: TikTokIcon,
    label: 'TikTok',
  },
];

export default function Footer() {
  const t = useTranslations('footer');
  const year = new Date().getFullYear();

  return (
    <footer className='w-full bg-black/80 backdrop-blur-sm border-t border-[#E4DD3B]/30 text-white/70'>
      <div className='w-full px-6 py-3 md:px-8 md:py-4 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-0 text-sm tracking-wide'>
        {/* Left: email */}
        <div className='flex flex-wrap items-center justify-center md:justify-start gap-3 md:gap-4'>
          <a
            href='mailto:info@kluub.ee'
            className='hover:text-[#E4DD3B] transition-colors duration-300 whitespace-nowrap'
          >
            info@kluub.ee
          </a>
        </div>

        {/* Right: socials + year + privacy */}
        <div className='flex flex-col md:flex-row items-center gap-3 md:gap-6'>
          <div className='flex items-center gap-4'>
            {SOCIAL_LINKS.map(({ href, Icon, label }) => (
              <a
                key={label}
                href={href}
                target='_blank'
                rel='noopener noreferrer'
                aria-label={label}
                className='text-white/60 hover:text-[#E4DD3B] transition-colors duration-300'
              >
                <Icon size={24} className='h-5 w-5 md:h-6 md:w-6' />
              </a>
            ))}
          </div>

          <div className='flex items-center gap-3 text-xs md:text-sm text-white/40'>
            <span>© Kluub {year}</span>
            <Link
              href='/privacy'
              className='hover:text-[#E4DD3B] transition-colors duration-300'
            >
              {t('privacy')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
