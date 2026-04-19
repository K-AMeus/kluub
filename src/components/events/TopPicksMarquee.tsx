'use client';

import Image from 'next/image';
import Marquee from 'react-fast-marquee';
import { Link } from '@/i18n/navigation';
import { Event } from '@/lib/types';
import { TIMEZONE, getDateFormatter, getDateLocale } from '@/lib/date-utils';
import { DEFAULT_EVENT_IMAGE } from '@/lib/constants';
import { useTranslations, useLocale } from 'next-intl';

interface TopPicksMarqueeProps {
  events: Event[];
}

function formatDate(dateString: string, locale: string): string {
  return getDateFormatter(getDateLocale(locale), {
    month: 'short',
    day: 'numeric',
    timeZone: TIMEZONE,
  }).format(new Date(dateString));
}

function TopPickCard({ event }: { event: Event }) {
  const citySlug = event.city.toLowerCase();
  const imageUrl = event.imageUrl || DEFAULT_EVENT_IMAGE;
  const t = useTranslations('eventsPage');
  const locale = useLocale();

  return (
    <Link
      href={`/events/${citySlug}/${event.id}`}
      className='group mx-1.5 md:mx-3 cursor-pointer inline-block'
    >
      <div className='relative w-44 h-28 md:w-80 md:h-44 overflow-hidden'>
        <Image
          src={imageUrl}
          alt={event.title}
          fill
          className='object-cover object-bottom transition-transform duration-300 group-hover:scale-105'
          sizes='(max-width: 768px) 256px, 320px'
        />

        <div className='absolute top-1 left-1 md:top-2 md:left-2'>
          <div className='bg-[#E4DD3B] shadow-[0_2px_8px_rgba(228,221,59,0.3)] px-1.5 py-0.5 md:px-2.5 md:py-1 flex items-center gap-1'>
            <svg
              viewBox='0 0 24 24'
              fill='currentColor'
              className='shrink-0 text-black w-2.5 h-2.5 md:w-3 md:h-3'
            >
              <path d='M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' />
            </svg>
            <span className='font-sans text-[9px] md:text-[11px] text-black font-bold uppercase tracking-wider'>
              {t('topPicks')}
            </span>
          </div>
        </div>

        <div
          aria-hidden='true'
          className='pointer-events-none absolute inset-x-0 bottom-0 h-3/5 bg-linear-to-t from-black/95 via-black/55 to-transparent'
        />

        <div className='absolute bottom-0 left-0 right-0 px-2 pt-6 pb-2 md:px-3 md:pt-10 md:pb-2.5'>
          <h3 className='text-white font-display text-xs md:text-base uppercase tracking-wide line-clamp-1 group-hover:text-[#E4DD3B] transition-colors'>
            {event.title}
          </h3>
          <div className='mt-0.5 md:mt-1 flex items-center justify-between gap-2 font-sans text-[10px] md:text-[11px] font-semibold uppercase tracking-[0.12em]'>
            <span className='truncate text-white/60'>{event.venue}</span>
            <span className='shrink-0 text-[#E4DD3B]'>
              {formatDate(event.startTime, locale)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function TopPicksMarquee({ events }: TopPicksMarqueeProps) {
  if (events.length === 0) {
    return null;
  }

  return (
    <div className='w-full py-2 md:py-5 bg-transparent'>
      <Marquee autoFill pauseOnHover speed={25} direction='left'>
        {events.map((event) => (
          <TopPickCard key={event.id} event={event} />
        ))}
      </Marquee>
    </div>
  );
}
