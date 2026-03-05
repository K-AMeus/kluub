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
import { DEFAULT_EVENT_IMAGE } from '@/lib/constants';
import { formatTime } from '@/lib/date-utils';
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

function formatDateBubble(dateString: string): { day: string; month: string } {
  const date = new Date(dateString);
  return {
    day: date.getDate().toString(),
    month: date.toLocaleString('en-US', { month: 'short' }),
  };
}

export default function EventDetail({ event, translations }: EventDetailProps) {
  const { day, month } = formatDateBubble(event.startTime);
  const imageUrl = event.imageUrl || DEFAULT_EVENT_IMAGE;
  const priceDisplay =
    event.priceTier === 0
      ? translations.free
      : formatPriceTier(event.priceTier);

  const citySlug = event.city.toLowerCase();
  const backHref = `/events/${citySlug}`;

  return (
    <div className='text-white pb-8 md:pb-12'>
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
            <div className='relative w-full aspect-video overflow-hidden'>
              <Image
                src={imageUrl}
                alt=''
                fill
                className='object-cover scale-110 blur-2xl opacity-80'
                sizes='1px'
                aria-hidden='true'
              />
              <div className='absolute inset-0 bg-black/40' />
              <Image
                src={imageUrl}
                alt={event.title}
                fill
                className='object-contain relative'
                priority
                sizes='(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 960px'
              />
              <div className='absolute top-3 left-3 md:top-4 md:left-4 bg-[#E4DD3B] px-2.5 py-1.5 md:px-3 md:py-2 flex flex-col items-center z-10'>
                <span className='text-black font-display text-xl md:text-2xl leading-none font-bold'>
                  {day}
                </span>
                <span className='text-black font-sans text-[10px] md:text-xs uppercase tracking-wider'>
                  {month}
                </span>
              </div>
            </div>

            <div className='p-4 md:p-6 lg:p-8'>
              <h1 className='text-white font-display text-xl md:text-2xl lg:text-3xl uppercase tracking-wide mb-4 md:mb-6'>
                {event.title}
              </h1>

              <div className='space-y-2.5 md:grid md:grid-cols-3 md:gap-4 md:space-y-0 mb-4 md:mb-6 pb-4 md:pb-6 border-b border-white/10'>
                <div className='flex items-center gap-2.5 md:gap-3'>
                  <LocationIcon
                    size={18}
                    className='text-[#E4DD3B] shrink-0'
                  />
                  <span className='text-white/95 font-sans text-sm'>
                    {event.venue}
                  </span>
                </div>
                <div className='flex items-center gap-2.5 md:gap-3'>
                  <CalendarIcon
                    size={18}
                    className='text-[#E4DD3B] shrink-0'
                  />
                  <span className='text-white/95 font-sans text-sm'>
                    {formatTime(event.startTime)} –{' '}
                    {formatTime(event.endTime)}
                  </span>
                </div>
                <div className='flex items-center gap-2.5 md:gap-3'>
                  <TicketIcon size={18} className='text-[#E4DD3B] shrink-0' />
                  <span className='text-white/95 font-sans text-sm'>
                    {priceDisplay}
                  </span>
                  <PriceInfoTooltip size={13} />
                </div>
              </div>

              <p className='text-white/95 font-sans text-sm md:text-base leading-relaxed whitespace-pre-line'>
                {event.description}
              </p>

              {event.facebookUrl && (
                <div className='mt-4 md:mt-6 pt-4 md:pt-6 border-t border-white/10'>
                  <a
                    href={event.facebookUrl}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='group inline-flex items-center gap-2 md:gap-2.5 text-[#E4DD3B] hover:text-[#E4DD3B]/80 transition-colors font-sans text-sm'
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
        </article>
      </div>
    </div>
  );
}
