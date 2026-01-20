import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { Event, formatPriceTier } from '@/lib/types';
import {
  LocationIcon,
  CalendarIcon,
  TicketIcon,
  FacebookIcon,
  ArrowLeftIcon,
  ChevronRightIcon,
} from '@/components/shared/icons';
import PriceInfoTooltip from '@/components/shared/PriceInfoTooltip';

interface EventDetailTranslations {
  free: string;
  facebookEvent: string;
  backToEvents: string;
}

interface EventDetailProps {
  event: Event;
  translations: EventDetailTranslations;
}

function formatTime(dateString: string): string {
  return new Date(dateString).toLocaleTimeString('et-EE', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function formatDateBubble(dateString: string): { day: string; month: string } {
  const date = new Date(dateString);
  return {
    day: date.getDate().toString(),
    month: date.toLocaleString('en-US', { month: 'short' }),
  };
}

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800';

export default function EventDetail({ event, translations }: EventDetailProps) {
  const { day, month } = formatDateBubble(event.startTime);
  const imageUrl = event.imageUrl || DEFAULT_IMAGE;
  const priceDisplay =
    event.priceTier === 0
      ? translations.free
      : formatPriceTier(event.priceTier);

  const citySlug = event.city.toLowerCase();
  const backHref = `/events/${citySlug}`;

  return (
    <div className='bg-black text-white pb-8 md:pb-12'>
      {/* Back Button */}
      <div className='px-4 md:px-8 lg:px-12 max-w-5xl mx-auto py-4 md:py-6'>
        <Link
          href={backHref}
          className='group inline-flex items-center gap-2 text-white/70 hover:text-[#E4DD3B] transition-colors font-sans text-sm'
        >
          <ArrowLeftIcon
            size={18}
            className='transition-transform group-hover:-translate-x-1'
          />
          <span>{translations.backToEvents}</span>
        </Link>
      </div>

      {/* Main Card */}
      <div className='px-4 md:px-8 lg:px-12 max-w-5xl mx-auto'>
        <article className='relative'>
          {/* Yellow offset background */}
          <div className='absolute inset-0 bg-[#E4DD3B] translate-x-2 translate-y-2' />

          <div className='relative bg-black border border-white/30'>
            {/* Desktop Layout */}
            <div className='hidden md:flex'>
              {/* Image Section */}
              <div className='relative w-1/3 min-h-[320px] lg:min-h-[360px]'>
                <Image
                  src={imageUrl}
                  alt={event.title}
                  fill
                  className='object-cover border-r-2 border-[#E4DD3B]'
                  priority
                  sizes='(max-width: 1200px) 33vw, 400px'
                />
                {/* Date Badge */}
                <div className='absolute top-4 left-4 bg-[#E4DD3B] px-3 py-2 flex flex-col items-center'>
                  <span className='text-black font-display text-2xl leading-none font-bold'>
                    {day}
                  </span>
                  <span className='text-black font-sans text-xs uppercase tracking-wider'>
                    {month}
                  </span>
                </div>
              </div>

              {/* Content Section */}
              <div className='flex-1 flex flex-col p-6 lg:p-8'>
                {/* Title */}
                <h1 className='text-white font-display text-2xl lg:text-3xl uppercase tracking-wide mb-6'>
                  {event.title}
                </h1>

                {/* Info Grid */}
                <div className='grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-white/10'>
                  {/* Location */}
                  <div className='flex items-center gap-3'>
                    <LocationIcon
                      size={20}
                      className='text-[#E4DD3B] shrink-0'
                    />
                    <span className='text-white/95 font-sans text-sm'>
                      {event.venue}
                    </span>
                  </div>

                  {/* Time */}
                  <div className='flex items-center gap-3'>
                    <CalendarIcon
                      size={20}
                      className='text-[#E4DD3B] shrink-0'
                    />
                    <span className='text-white/95 font-sans text-sm'>
                      {formatTime(event.startTime)} –{' '}
                      {formatTime(event.endTime)}
                    </span>
                  </div>

                  {/* Price */}
                  <div className='flex items-center gap-3'>
                    <TicketIcon size={20} className='text-[#E4DD3B] shrink-0' />
                    <span className='text-white/95 font-sans text-sm'>
                      {priceDisplay}
                    </span>
                    <PriceInfoTooltip size={14} />
                  </div>
                </div>

                {/* Description */}
                <div className='flex-1'>
                  <p className='text-white/95 font-sans text-sm lg:text-base leading-relaxed whitespace-pre-line'>
                    {event.description}
                  </p>
                </div>

                {/* Facebook Link */}
                {event.facebookUrl && (
                  <div className='mt-6 pt-6 border-t border-white/10'>
                    <a
                      href={event.facebookUrl}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='group inline-flex items-center gap-2.5 text-[#E4DD3B] hover:text-[#E4DD3B]/80 transition-colors font-sans text-sm'
                    >
                      <FacebookIcon size={18} />
                      <span>{translations.facebookEvent}</span>
                      <ChevronRightIcon
                        size={16}
                        className='transition-transform group-hover:translate-x-1'
                      />
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Layout */}
            <div className='md:hidden'>
              {/* Image */}
              <div className='relative w-full h-56'>
                <Image
                  src={imageUrl}
                  alt={event.title}
                  fill
                  className='object-cover'
                  priority
                  sizes='100vw'
                />
                {/* Date Badge */}
                <div className='absolute top-3 left-3 bg-[#E4DD3B] px-2.5 py-1.5 flex flex-col items-center'>
                  <span className='text-black font-display text-xl leading-none font-bold'>
                    {day}
                  </span>
                  <span className='text-black font-sans text-[10px] uppercase tracking-wider'>
                    {month}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className='p-4'>
                {/* Title */}
                <h1 className='text-white font-display text-xl uppercase tracking-wide mb-4'>
                  {event.title}
                </h1>

                {/* Info */}
                <div className='space-y-2.5 mb-4 pb-4 border-b border-white/10'>
                  <div className='flex items-center gap-2.5'>
                    <LocationIcon
                      size={16}
                      className='text-[#E4DD3B] shrink-0'
                    />
                    <span className='text-white/95 font-sans text-sm'>
                      {event.venue}
                    </span>
                  </div>
                  <div className='flex items-center gap-2.5'>
                    <CalendarIcon
                      size={16}
                      className='text-[#E4DD3B] shrink-0'
                    />
                    <span className='text-white/95 font-sans text-sm'>
                      {formatTime(event.startTime)} –{' '}
                      {formatTime(event.endTime)}
                    </span>
                  </div>
                  <div className='flex items-center gap-2.5'>
                    <TicketIcon size={16} className='text-[#E4DD3B] shrink-0' />
                    <span className='text-white/95 font-sans text-sm'>
                      {priceDisplay}
                    </span>
                    <PriceInfoTooltip size={12} />
                  </div>
                </div>

                {/* Description */}
                <p className='text-white/95 font-sans text-sm leading-relaxed whitespace-pre-line'>
                  {event.description}
                </p>

                {/* Facebook Link */}
                {event.facebookUrl && (
                  <div className='mt-4 pt-4 border-t border-white/10'>
                    <a
                      href={event.facebookUrl}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='group inline-flex items-center gap-2 text-[#E4DD3B] hover:text-[#E4DD3B]/80 transition-colors font-sans text-sm'
                    >
                      <FacebookIcon size={16} />
                      <span>{translations.facebookEvent}</span>
                      <ChevronRightIcon
                        size={14}
                        className='transition-transform group-hover:translate-x-1'
                      />
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
