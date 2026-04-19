import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { Event } from '@/lib/types';
import {
  LocationIcon,
  CalendarIcon,
  TicketIcon,
  FacebookIcon,
  ChevronRightIcon,
} from '@/components/shared/icons';
import { DEFAULT_EVENT_IMAGE } from '@/lib/constants';
import { formatTime } from '@/lib/date-utils';
import FacebookEventLink from '@/components/events/FacebookEventLink';

export interface EventCardTranslations {
  readMore: string;
  free: string;
  facebookEvent: string;
  topPicks: string;
}

interface EventCardProps {
  event: Event;
  translations: EventCardTranslations;
}

export default function EventCard({ event, translations }: EventCardProps) {
  const imageUrl = event.imageUrl || DEFAULT_EVENT_IMAGE;
  const priceDisplay = event.price === '0' ? translations.free : event.price;

  const citySlug = event.city.toLowerCase();

  return (
    <article className='relative group'>
      {/* Desktop only */}
      <div className='hidden md:block absolute inset-0 bg-[#E4DD3B] translate-x-2 translate-y-2 transition-transform duration-200 group-hover:translate-x-0 group-hover:translate-y-0' />

      {event.topPick && (
        <div className='absolute -top-1.5 md:-top-2 right-3 md:right-4 z-30 bg-[#E4DD3B] text-black px-1.5 py-0.5 md:px-2.5 md:py-1 text-[9px] md:text-[11px] font-sans font-bold uppercase tracking-wider flex items-center gap-1 shadow-[0_2px_8px_rgba(228,221,59,0.3)]'>
          <svg
            viewBox='0 0 24 24'
            fill='currentColor'
            className='shrink-0 w-2.5 h-2.5 md:w-3 md:h-3'
          >
            <path d='M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' />
          </svg>
          {translations.topPicks}
        </div>
      )}

      <div className='relative bg-[#060606] border border-white/20 md:border-white/30 md:group-hover:border-[#E4DD3B] transition-colors duration-200 flex md:h-52 lg:h-56'>
        {/* Stretched Link */}
        <Link
          href={`/events/${citySlug}/${event.id}`}
          className='absolute inset-0 z-10'
          aria-label={event.title}
        />

        {/* Image */}
        <div className='relative w-28 h-28 m-4 md:m-0 md:w-1/4 md:min-w-48 md:h-auto shrink-0 rounded-lg md:rounded-none overflow-hidden'>
          <Image
            src={imageUrl}
            alt={event.title}
            fill
            className='object-cover'
            sizes='(max-width: 768px) 256px, 320px'
            loading='lazy'
          />
        </div>

        {/* Main Content */}
        <div className='flex-1 flex flex-col md:justify-between min-w-0 py-4 pr-4 md:p-5 lg:p-8'>
          <div>
            <h3 className='text-white font-display text-base md:text-lg lg:text-xl uppercase tracking-wide line-clamp-2 md:group-hover:text-[#E4DD3B] transition-colors'>
              {event.title}
            </h3>
            {/* Description - desktop only */}
            <div className='hidden md:block'>
              <p className='text-white/90 font-sans text-sm lg:text-base mt-3 line-clamp-2 leading-relaxed'>
                {event.description}
              </p>
            </div>

            {/* Info - mobile only (inline) */}
            <div className='md:hidden mt-2 space-y-1.5'>
              <div className='flex items-center gap-2 text-xs text-white/95'>
                <LocationIcon size={14} className='text-[#E4DD3B] shrink-0' />
                <span className='truncate'>{event.venue}</span>
              </div>
              <div className='flex items-center gap-2 text-xs text-white/95'>
                <CalendarIcon size={14} className='text-[#E4DD3B] shrink-0' />
                <span>
                  {formatTime(event.startTime)} – {formatTime(event.endTime)}
                </span>
              </div>
              <div className='flex items-center gap-2 text-xs text-white/95'>
                <TicketIcon size={14} className='text-[#E4DD3B] shrink-0' />
                <span>{priceDisplay}</span>
              </div>
            </div>
          </div>

          {/* Read more - desktop only */}
          <span className='hidden md:flex text-[#E4DD3B] font-sans text-sm items-center gap-1 group-hover:gap-2 transition-all'>
            {translations.readMore}
            <ChevronRightIcon size={16} />
          </span>
        </div>

        {/* Facebook button - mobile only (absolute, doesn't affect row heights) */}
        {event.facebookUrl && (
          <FacebookEventLink
            href={event.facebookUrl}
            eventId={event.id}
            eventTitle={event.title}
            venueId={event.venueId}
            className='md:hidden absolute bottom-3 right-3 z-20 inline-flex items-center gap-1 px-1.5 py-1 border border-[#E4DD3B]/40 hover:border-[#E4DD3B] hover:bg-[#E4DD3B]/10 text-[#E4DD3B] font-sans text-[9px] font-semibold uppercase tracking-wider transition-colors'
          >
            <FacebookIcon size={11} />
            <span>{translations.facebookEvent}</span>
          </FacebookEventLink>
        )}

        {/* Side Info - desktop only */}
        <div className='hidden md:flex w-56 lg:w-64 flex-col justify-center gap-3 p-5 lg:p-6 border-l border-white/10'>
          <div className='flex items-center gap-2.5 text-sm'>
            <LocationIcon size={18} className='text-[#E4DD3B] shrink-0' />
            <span className='text-white/95 truncate'>{event.venue}</span>
          </div>
          <div className='flex items-center gap-2.5 text-sm'>
            <CalendarIcon size={18} className='text-[#E4DD3B] shrink-0' />
            <span className='text-white/95'>
              {formatTime(event.startTime)} – {formatTime(event.endTime)}
            </span>
          </div>
          <div className='flex items-center gap-2.5 text-sm'>
            <TicketIcon size={18} className='text-[#E4DD3B] shrink-0' />
            <span className='text-white/95'>{priceDisplay}</span>
          </div>
          {event.facebookUrl && (
            <FacebookEventLink
              href={event.facebookUrl}
              eventId={event.id}
              eventTitle={event.title}
              venueId={event.venueId}
              className='relative z-20 mt-2 self-start inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 border border-[#E4DD3B]/40 hover:border-[#E4DD3B] hover:bg-[#E4DD3B]/10 text-[#E4DD3B] font-sans text-[10px] font-semibold uppercase tracking-wider transition-colors'
            >
              <FacebookIcon size={13} />
              <span>{translations.facebookEvent}</span>
            </FacebookEventLink>
          )}
        </div>
      </div>
    </article>
  );
}
