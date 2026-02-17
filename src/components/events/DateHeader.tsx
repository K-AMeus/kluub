'use client';

import { useTranslations } from 'next-intl';
import {
  TIMEZONE,
  getTodayInTallinn,
  getTomorrowInTallinn,
} from '@/lib/date-utils';
import { CalendarIcon } from '@/components/shared/icons';

interface DateHeaderProps {
  dateKey: string;
  isSticky?: boolean;
}

export default function DateHeader({
  dateKey,
  isSticky = false,
}: DateHeaderProps) {
  const t = useTranslations('eventsPage');

  const todayStr = getTodayInTallinn();
  const tomorrowStr = getTomorrowInTallinn();

  let displayText: string;
  const isToday = dateKey === todayStr;
  const isTomorrow = dateKey === tomorrowStr;

  if (isToday) {
    displayText = t('today');
  } else if (isTomorrow) {
    displayText = t('tomorrow');
  } else {
    // Format the date for display
    const date = new Date(dateKey + 'T12:00:00'); // Add time to avoid timezone issues
    displayText = date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      timeZone: TIMEZONE,
    });
  }

  return (
    <div
      className={`
        py-4 md:py-4
        ${isSticky ? 'sticky top-14 md:top-16 z-40' : ''}
      `}
    >
      <div className='flex items-center gap-2'>
        <div className='flex items-center gap-1.5 md:gap-2.5 bg-[#E4DD3B] px-2.5 py-1.5 md:px-5 md:py-2.5'>
          <CalendarIcon
            size={14}
            className='text-black md:w-[18px] md:h-[18px]'
          />
          <h3 className='text-black font-display text-sm md:text-lg tracking-wide uppercase font-bold'>
            {displayText}
          </h3>
        </div>
      </div>
    </div>
  );
}
