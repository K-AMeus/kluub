import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { Event, formatPriceTier } from '@/lib/types';
import {
  LocationIcon,
  CalendarIcon,
  TicketIcon,
  FacebookIcon,
  ChevronRightIcon,
} from '@/components/shared/icons';

export interface EventCardTranslations {
  readMore: string;
  free: string;
  facebookEvent: string;
}

interface EventCardProps {
  event: Event;
  translations: EventCardTranslations;
}

function formatTime(dateString: string): string {
  return new Date(dateString).toLocaleTimeString('et-EE', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800';

export default function EventCard({ event, translations }: EventCardProps) {
  const imageUrl = event.imageUrl || DEFAULT_IMAGE;
  const priceDisplay =
    event.priceTier === 0
      ? translations.free
      : formatPriceTier(event.priceTier);

  return (
    <article className='relative group'>
      {/* Desktop Layout */}
      <div className='hidden md:block relative'>
        <div className='absolute inset-0 bg-[#E4DD3B] translate-x-2 translate-y-2 transition-transform duration-200 group-hover:translate-x-0 group-hover:translate-y-0' />

        <div className='relative bg-[#060606] border border-white/30 group-hover:border-[#E4DD3B] transition-colors duration-200 flex h-52 lg:h-56'>
          {/* Stretched Link */}
          <Link
            href={`/events/${event.id}`}
            className='absolute inset-0 z-10'
            aria-label={event.title}
          />

          {/* Image */}
          <div className='relative w-1/4 min-w-48 shrink-0'>
            <Image
              src={imageUrl}
              alt={event.title}
              fill
              className='object-cover border-2 border-[#E4DD3B]'
              sizes='(max-width: 768px) 100vw, 25vw'
            />
          </div>

          {/* Main Content */}
          <div className='flex-1 flex flex-col justify-between p-5 lg:p-6'>
            <div>
              <h3 className='text-white font-display text-lg lg:text-xl uppercase tracking-wide line-clamp-2 group-hover:text-[#E4DD3B] transition-colors'>
                {event.title}
              </h3>
              <p className='text-white/90 font-sans text-sm lg:text-base mt-3 line-clamp-2 leading-relaxed'>
                {event.description}
              </p>
            </div>
            <span className='text-[#E4DD3B] font-sans text-sm flex items-center gap-1 group-hover:gap-2 transition-all'>
              {translations.readMore}
              <ChevronRightIcon size={16} />
            </span>
          </div>

          {/* Side Info */}
          <div className='w-56 lg:w-64 flex flex-col justify-center gap-3 p-5 lg:p-6 border-l border-white/10'>
            {/* Location */}
            <div className='flex items-center gap-2.5 text-sm'>
              <LocationIcon size={18} className='text-[#E4DD3B] shrink-0' />
              <span className='text-white/95 truncate'>{event.venue}</span>
            </div>

            {/* Time */}
            <div className='flex items-center gap-2.5 text-sm'>
              <CalendarIcon size={18} className='text-[#E4DD3B] shrink-0' />
              <span className='text-white/95'>
                {formatTime(event.startTime)} – {formatTime(event.endTime)}
              </span>
            </div>

            {/* Price */}
            <div className='flex items-center gap-2.5 text-sm'>
              <TicketIcon size={18} className='text-[#E4DD3B] shrink-0' />
              <span className='text-white/95'>{priceDisplay}</span>
            </div>

            {/* Facebook Link */}
            {event.facebookUrl && (
              <a
                href={event.facebookUrl}
                target='_blank'
                rel='noopener noreferrer'
                className='relative z-20 flex items-center gap-2.5 text-sm text-white/95 hover:text-[#E4DD3B] transition-colors mt-2 pt-3 border-t border-white/10'
              >
                <FacebookIcon size={16} className='text-[#E4DD3B] shrink-0' />
                <span>{translations.facebookEvent}</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className='md:hidden relative'>
        {/* Stretched Link */}
        <Link
          href={`/events/${event.id}`}
          className='absolute inset-0 z-10'
          aria-label={event.title}
        />

        <div className='flex gap-4 p-4 border border-white/20 bg-[#060606]'>
          {/* Image */}
          <div className='relative w-28 h-28 shrink-0 rounded-lg overflow-hidden'>
            <Image
              src={imageUrl}
              alt={event.title}
              fill
              className='object-cover'
              sizes='112px'
            />
          </div>

          {/* Content */}
          <div className='flex-1 flex flex-col justify-between min-w-0'>
            <div>
              <h3 className='text-white font-display text-base uppercase tracking-wide line-clamp-2'>
                {event.title}
              </h3>

              {/* Info */}
              <div className='mt-2 space-y-1.5'>
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
              </div>
            </div>

            {/* Bottom row */}
            <div className='flex items-center justify-between mt-2'>
              <div className='flex items-center gap-2 text-xs'>
                <TicketIcon size={14} className='text-[#E4DD3B]' />
                <span className='text-white/95'>{priceDisplay}</span>
              </div>
              {/* Facebook Link */}
              {event.facebookUrl && (
                <a
                  href={event.facebookUrl}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='relative z-20 text-[#E4DD3B] hover:text-[#E4DD3B]/80 transition-colors'
                >
                  <FacebookIcon size={16} />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
