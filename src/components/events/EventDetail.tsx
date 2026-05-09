import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { Event } from '@/lib/types';
import {
  LocationIcon,
  CalendarIcon,
  TicketIcon,
  FacebookIcon,
  ArrowLeftIcon,
  UserIcon,
} from '@/components/shared/icons';
import { DEFAULT_EVENT_IMAGE } from '@/lib/constants';
import {
  TIMEZONE,
  formatTime,
  getDateFormatter,
  getDateLocale,
} from '@/lib/date-utils';
import EventDetailTracker from '@/components/events/EventDetailTracker';
import FacebookEventLink from '@/components/events/FacebookEventLink';

interface EventDetailTranslations {
  free: string;
  facebookEvent: string;
  backToEvents: string;
  venueLabel: string;
  timeLabel: string;
  priceLabel: string;
  hostedBy: string;
}

interface EventDetailProps {
  event: Event;
  translations: EventDetailTranslations;
  locale: string;
}

function MetaField({
  icon,
  label,
  value,
  href,
  className = '',
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
  className?: string;
}) {
  return (
    <div className={`min-w-0 ${className}`}>
      <div className='flex items-center gap-2'>
        <span className='text-[#E4DD3B] shrink-0'>{icon}</span>
        <p className='text-white/40 font-sans text-[10px] font-semibold uppercase tracking-[0.2em]'>
          {label}
        </p>
      </div>
      {href ? (
        <a
          href={href}
          target='_blank'
          rel='noopener noreferrer'
          className='text-white font-sans text-sm md:text-base mt-1.5 wrap-break-word hover:text-[#E4DD3B] transition-colors underline underline-offset-2 decoration-white/30 hover:decoration-[#E4DD3B] inline-block'
        >
          {value}
        </a>
      ) : (
        <p className='text-white font-sans text-sm md:text-base mt-1.5 wrap-break-word'>
          {value}
        </p>
      )}
    </div>
  );
}

function formatDateBubble(
  dateString: string,
  locale: string,
): { day: string; month: string } {
  const date = new Date(dateString);
  const dateLocale = getDateLocale(locale);
  return {
    day: getDateFormatter(dateLocale, {
      timeZone: TIMEZONE,
      day: 'numeric',
    }).format(date),
    month: getDateFormatter(dateLocale, {
      timeZone: TIMEZONE,
      month: 'short',
    }).format(date),
  };
}

export default function EventDetail({
  event,
  translations,
  locale,
}: EventDetailProps) {
  const { day, month } = formatDateBubble(event.startTime, locale);
  const imageUrl = event.imageUrl || DEFAULT_EVENT_IMAGE;
  const priceDisplay = event.price === '0' ? translations.free : event.price;

  const citySlug = event.city.toLowerCase();
  const backHref = `/events/${citySlug}`;

  return (
    <div className='text-white pb-8 md:pb-12'>
      {/* Analytics Tracker */}
      <EventDetailTracker
        eventId={event.id}
        eventTitle={event.title}
        city={event.city}
        venueId={event.venueId}
        price={event.price}
      />

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
              <h1 className='text-white font-display text-xl md:text-2xl lg:text-3xl uppercase tracking-wide'>
                {event.title}
              </h1>

              {(() => {
                const hasHost =
                  Boolean(event.host) && event.host !== event.venue;
                return (
                  <div
                    className={`grid grid-cols-2 gap-x-5 gap-y-4 md:gap-0 mt-4 md:mt-6 mb-4 md:mb-6 pb-4 md:pb-6 border-b border-white/10 ${hasHost ? 'md:grid-cols-4' : 'md:grid-cols-3'}`}
                  >
                    <MetaField
                      icon={<LocationIcon size={18} />}
                      label={translations.venueLabel}
                      value={event.venue}
                      className='md:pr-6'
                    />
                    <MetaField
                      icon={<CalendarIcon size={18} />}
                      label={translations.timeLabel}
                      value={`${formatTime(event.startTime)} – ${formatTime(event.endTime)}`}
                      className='md:px-6 md:border-l md:border-white/10'
                    />
                    <MetaField
                      icon={<TicketIcon size={18} />}
                      label={translations.priceLabel}
                      value={priceDisplay}
                      className={`md:border-l md:border-white/10 ${hasHost ? 'md:px-6' : 'md:pl-6'}`}
                    />
                    {hasHost && (
                      <MetaField
                        icon={<UserIcon size={18} />}
                        label={translations.hostedBy}
                        value={event.host as string}
                        href={event.hostWebsiteUrl ?? undefined}
                        className='md:pl-6 md:border-l md:border-white/10'
                      />
                    )}
                  </div>
                );
              })()}

              <p className='text-white/95 font-sans text-sm md:text-base leading-relaxed whitespace-pre-line'>
                {event.description}
              </p>

              {event.facebookUrl && (
                <div className='mt-4 md:mt-6 pt-4 md:pt-6 border-t border-white/10'>
                  <FacebookEventLink
                    href={event.facebookUrl}
                    eventId={event.id}
                    eventTitle={event.title}
                    venueId={event.venueId}
                    className='inline-flex items-center justify-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 md:py-2.5 border border-[#E4DD3B]/40 hover:border-[#E4DD3B] hover:bg-[#E4DD3B]/10 text-[#E4DD3B] font-sans text-[11px] md:text-xs font-semibold uppercase tracking-wider transition-colors'
                  >
                    <FacebookIcon size={12} className='md:w-3.5 md:h-3.5' />
                    <span>{translations.facebookEvent}</span>
                  </FacebookEventLink>
                </div>
              )}
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
