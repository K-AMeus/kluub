'use client';

import Image from 'next/image';
import Marquee from 'react-fast-marquee';
import { Link } from '@/i18n/navigation';
import { Event } from '@/lib/types';
import { TIMEZONE } from '@/lib/date-utils';
import { DEFAULT_EVENT_IMAGE } from '@/lib/constants';

interface TopPicksMarqueeProps {
  events: Event[];
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: TIMEZONE,
  });
}

function TopPickCard({ event }: { event: Event }) {
  const citySlug = event.city.toLowerCase();
  const imageUrl = event.imageUrl || DEFAULT_EVENT_IMAGE;

  return (
    <Link
      href={`/events/${citySlug}/${event.id}`}
      className='group mx-1.5 md:mx-3 cursor-pointer inline-block'
    >
      <div className='relative w-44 h-28 md:w-80 md:h-44 rounded-lg overflow-hidden'>
        <Image
          src={imageUrl}
          alt={event.title}
          fill
          className='object-cover object-bottom transition-transform duration-300 group-hover:scale-105'
          sizes='(max-width: 768px) 256px, 320px'
          preload
        />

        <div className='absolute top-2 left-2 md:top-3 md:left-3'>
          <div className='bg-black/70 backdrop-blur-sm border border-[#E4DD3B]/60 px-1.5 py-0.5 md:px-2 md:py-0.5 flex items-center'>
            <span className='font-sans text-[9px] md:text-[10px] text-[#E4DD3B] font-semibold uppercase tracking-wide leading-tight'>
              TOP PICK
            </span>
          </div>
        </div>

        <div className='absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-[2px] px-2 py-1.5 md:px-3 md:py-2'>
          <h3 className='text-white font-display text-xs md:text-base uppercase tracking-wide line-clamp-1 group-hover:text-[#E4DD3B] transition-colors'>
            {event.title}
          </h3>
          <div className='flex items-center gap-1.5 md:gap-2 mt-0.5 text-[9px] md:text-xs text-white/90'>
            <span className='truncate max-w-20 md:max-w-40'>{event.venue}</span>
            <span className='text-[#E4DD3B]/70'>•</span>
            <span>{formatDate(event.startTime)}</span>
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
