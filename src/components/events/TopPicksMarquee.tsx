'use client';

import Marquee from 'react-fast-marquee';
import { Link } from '@/i18n/navigation';
import { Event } from '@/lib/types';
import { TIMEZONE } from '@/lib/date-utils';
import { LocationIcon, CalendarIcon } from '@/components/shared/icons';

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

  return (
    <Link
      href={`/events/${citySlug}/${event.id}`}
      className='group mx-3 md:mx-4 cursor-pointer inline-block'
    >
      <div className='border-l-2 border-[#E4DD3B]/70 px-4 py-2.5 md:px-5 md:py-3 transition-colors group-hover:border-[#E4DD3B]'>
        <div className='flex items-center gap-1.5'>
          <span className='text-[#E4DD3B] text-[10px] md:text-xs'>★</span>
          <span className='text-white font-sans font-bold uppercase text-xs md:text-sm truncate group-hover:text-[#E4DD3B] transition-colors'>
            {event.title}
          </span>
        </div>
        <div className='flex items-center gap-3 md:gap-4 mt-1.5 text-[10px] md:text-sm text-white/95'>
          <div className='flex items-center gap-1.5'>
            <LocationIcon size={11} className='text-[#E4DD3B]' />
            <span className='truncate max-w-20 md:max-w-28'>{event.venue}</span>
          </div>
          <div className='flex items-center gap-1.5'>
            <CalendarIcon size={11} className='text-[#E4DD3B]' />
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
    <div className='w-full py-3 md:py-4 bg-[#060606]'>
      <Marquee autoFill pauseOnHover speed={40} direction='left'>
        {events.map((event) => (
          <TopPickCard key={event.id} event={event} />
        ))}
      </Marquee>
    </div>
  );
}
