'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { TIMEZONE } from '@/lib/date-utils';

interface CalendarEvent {
  id: string;
  title: string;
  startTime: string;
}

interface EventCalendarProps {
  events: CalendarEvent[];
}

function getLocalizedWeekdays(locale: string): string[] {
  const dateLocale = locale === 'et' ? 'et-EE' : 'en-US';
  const weekdays: string[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(2025, 0, 6 + i);
    weekdays.push(
      date.toLocaleDateString(dateLocale, { weekday: 'narrow' }).toUpperCase()
    );
  }
  return weekdays;
}

export default function EventCalendar({ events }: EventCalendarProps) {
  const locale = useLocale();
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [popover, setPopover] = useState<{ day: number; events: CalendarEvent[] } | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const dateLocale = locale === 'et' ? 'et-EE' : 'en-US';
  const monthLabel = currentDate.toLocaleDateString(dateLocale, {
    month: 'long',
    year: 'numeric',
    timeZone: TIMEZONE,
  });

  const weekdays = getLocalizedWeekdays(locale);

  // Map day-of-month → events for this month
  const eventsByDay = useMemo(() => {
    const map = new Map<number, CalendarEvent[]>();
    for (const event of events) {
      const d = new Date(event.startTime);
      const eventYear = parseInt(d.toLocaleDateString('en-CA', { timeZone: TIMEZONE, year: 'numeric' }));
      const eventMonth = parseInt(d.toLocaleDateString('en-CA', { timeZone: TIMEZONE, month: 'numeric' })) - 1;
      const eventDay = parseInt(d.toLocaleDateString('en-CA', { timeZone: TIMEZONE, day: 'numeric' }));
      if (eventYear === year && eventMonth === month) {
        const existing = map.get(eventDay) || [];
        existing.push(event);
        map.set(eventDay, existing);
      }
    }
    return map;
  }, [events, year, month]);

  // Calendar grid
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);
  // Pad to 6 rows (42 cells) so the calendar height never changes
  while (days.length < 42) days.push(null);

  const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: TIMEZONE });
  const formatDayToString = (day: number): string => {
    const m = String(month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${year}-${m}-${d}`;
  };

  const prevMonth = () => {
    setPopover(null);
    setCurrentDate(new Date(year, month - 1, 1));
  };
  const nextMonth = () => {
    setPopover(null);
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleDayClick = (day: number) => {
    const dayEvents = eventsByDay.get(day);
    if (!dayEvents || dayEvents.length === 0) return;
    if (popover?.day === day) {
      setPopover(null);
    } else {
      setPopover({ day, events: dayEvents });
    }
  };

  const handleEventClick = (eventId: string) => {
    router.push(`/${locale}/backstage/events?edit=${eventId}`);
  };

  // Close popover on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setPopover(null);
      }
    };
    if (popover) {
      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
    }
  }, [popover]);

  return (
    <div className='flex gap-2 items-start'>
      {/* Calendar */}
      <div className='w-72 shrink-0 bg-[#111] border border-white/10 p-4'>
        {/* Month navigation */}
        <div className='flex items-center justify-between mb-4'>
          <button
            onClick={prevMonth}
            className='p-1.5 text-white/50 hover:text-[#E4DD3B] transition-colors cursor-pointer'
          >
            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24' strokeWidth={2}>
              <path strokeLinecap='round' strokeLinejoin='round' d='M15.75 19.5L8.25 12l7.5-7.5' />
            </svg>
          </button>
          <span className='text-white font-medium text-sm capitalize'>{monthLabel}</span>
          <button
            onClick={nextMonth}
            className='p-1.5 text-white/50 hover:text-[#E4DD3B] transition-colors cursor-pointer'
          >
            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24' strokeWidth={2}>
              <path strokeLinecap='round' strokeLinejoin='round' d='M8.25 4.5l7.5 7.5-7.5 7.5' />
            </svg>
          </button>
        </div>

        {/* Weekday headers */}
        <div className='grid grid-cols-7 gap-1 mb-2'>
          {weekdays.map((day, i) => (
            <div key={i} className='text-center text-[10px] text-white/40 font-semibold py-1'>
              {day}
            </div>
          ))}
        </div>

        {/* Day grid */}
        <div className='grid grid-cols-7 gap-1'>
          {days.map((day, i) => {
            if (day === null) {
              return <div key={i} className='w-9 h-9' />;
            }

            const dateStr = formatDayToString(day);
            const isToday = dateStr === todayStr;
            const dayEvents = eventsByDay.get(day);
            const hasEvents = dayEvents && dayEvents.length > 0;
            const isSelected = popover?.day === day;

            return (
              <button
                key={i}
                onClick={() => handleDayClick(day)}
                className={`w-9 h-9 text-sm relative transition-all flex flex-col items-center justify-center
                  ${hasEvents ? 'cursor-pointer hover:bg-[#E4DD3B]/15' : 'cursor-default'}
                  ${isSelected ? 'bg-[#E4DD3B] text-black font-bold' : ''}
                  ${isToday && !isSelected ? 'ring-1 ring-[#E4DD3B] ring-offset-1 ring-offset-[#111]' : ''}
                  ${!isSelected ? (hasEvents ? 'text-white' : 'text-white/70 hover:text-white') : ''}
                  ${!hasEvents && !isSelected ? 'text-white/30' : ''}
                `}
              >
                {day}
                {hasEvents && !isSelected && (
                  <div className='absolute bottom-0.5 flex gap-0.5'>
                    {dayEvents.slice(0, 3).map((_, j) => (
                      <div key={j} className='w-1 h-1 rounded-full bg-[#E4DD3B]' />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Popover panel — reserved space to the right */}
      <div ref={popoverRef} className='w-48 shrink-0'>
        {popover && (
          <div className='bg-[#111] border border-white/10 overflow-hidden'>
            <div className='px-3 py-2 border-b border-white/8'>
              <p className='text-white/40 text-[10px] font-semibold uppercase tracking-wider'>
                {formatDayToString(popover.day).split('-').reverse().join('.')}
              </p>
            </div>
            {popover.events.map((event) => (
              <button
                key={event.id}
                onClick={() => handleEventClick(event.id)}
                className='w-full text-left px-3 py-2.5 hover:bg-white/5 transition-colors duration-75 cursor-pointer border-b border-white/5 last:border-b-0'
              >
                <p className='text-white text-sm font-medium truncate'>{event.title}</p>
                <p className='text-white/40 text-xs mt-0.5'>
                  {new Date(event.startTime).toLocaleTimeString(dateLocale, {
                    timeZone: TIMEZONE,
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false,
                  })}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
