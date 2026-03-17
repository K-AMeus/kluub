'use client';

import { useState, useRef, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { TIMEZONE } from '@/lib/date-utils';

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

interface DateTimePickerProps {
  value: string; // YYYY-MM-DDTHH:mm
  onChange: (value: string) => void;
  disabled?: boolean;
  id?: string;
  required?: boolean;
  defaultHour?: string;
}

export default function DateTimePicker({
  value,
  onChange,
  disabled,
  id,
  required,
  defaultHour = '20',
}: DateTimePickerProps) {
  const locale = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse current value
  const parsedDate = value ? new Date(value) : null;
  const selectedDateStr = parsedDate
    ? `${parsedDate.getFullYear()}-${String(parsedDate.getMonth() + 1).padStart(2, '0')}-${String(parsedDate.getDate()).padStart(2, '0')}`
    : null;
  const selectedHour = parsedDate ? String(parsedDate.getHours()).padStart(2, '0') : defaultHour;
  const selectedMinute = parsedDate ? String(parsedDate.getMinutes()).padStart(2, '0') : '00';

  const [viewDate, setViewDate] = useState(() => {
    if (parsedDate) return new Date(parsedDate.getFullYear(), parsedDate.getMonth(), 1);
    return new Date();
  });
  const [tempDate, setTempDate] = useState<string | null>(selectedDateStr);
  const [tempHour, setTempHour] = useState(selectedHour);
  const [tempMinute, setTempMinute] = useState(selectedMinute);

  // Sync when value changes externally
  useEffect(() => {
    if (value) {
      const d = new Date(value);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      setTempDate(dateStr);
      setTempHour(String(d.getHours()).padStart(2, '0'));
      setTempMinute(String(d.getMinutes()).padStart(2, '0'));
      setViewDate(new Date(d.getFullYear(), d.getMonth(), 1));
    }
  }, [value]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const dateLocale = locale === 'et' ? 'et-EE' : 'en-US';
  const monthName = viewDate.toLocaleDateString(dateLocale, {
    month: 'long',
    year: 'numeric',
    timeZone: TIMEZONE,
  });
  const weekdays = getLocalizedWeekdays(locale);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const days: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const formatDayToString = (day: number): string => {
    const m = String(month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${year}-${m}-${d}`;
  };

  const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: TIMEZONE });

  const handleDayClick = (day: number) => {
    const dateStr = formatDayToString(day);
    setTempDate(dateStr);
    // Emit value immediately
    onChange(`${dateStr}T${tempHour}:${tempMinute}`);
  };


  // Display value for the button
  const displayValue = parsedDate
    ? parsedDate.toLocaleDateString(dateLocale, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        timeZone: TIMEZONE,
      }) + `  ${selectedHour}:${selectedMinute}`
    : '';

  return (
    <div ref={containerRef} className='relative'>
      {/* Trigger button */}
      <button
        type='button'
        id={id}
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] text-sm text-left transition-all duration-200 disabled:opacity-40 cursor-pointer flex items-center justify-between gap-2 ${
          isOpen ? 'border-[#E4DD3B]/40 ring-1 ring-[#E4DD3B]/20' : ''
        } ${value ? 'text-white' : 'text-white/25'}`}
      >
        <span>{displayValue || '\u00A0'}</span>
        <svg className='w-4 h-4 text-[#E4DD3B]/60 shrink-0' fill='none' stroke='currentColor' viewBox='0 0 24 24' strokeWidth={1.5}>
          <path strokeLinecap='round' strokeLinejoin='round' d='M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5' />
        </svg>
      </button>

      {/* Hidden native input for form validation */}
      {required && (
        <input
          type='text'
          value={value}
          required
          readOnly
          tabIndex={-1}
          className='sr-only'
          aria-hidden='true'
        />
      )}

      {/* Dropdown calendar */}
      {isOpen && (
        <div className='absolute z-50 mt-2 w-72 bg-[#111] border border-white/10 shadow-2xl shadow-black/50 p-4'>
          {/* Month navigation */}
          <div className='flex items-center justify-between mb-4'>
            <button
              type='button'
              onClick={() => setViewDate(new Date(year, month - 1, 1))}
              className='p-1.5 text-white/50 hover:text-[#E4DD3B] transition-colors cursor-pointer'
            >
              <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24' strokeWidth={2}>
                <path strokeLinecap='round' strokeLinejoin='round' d='M15.75 19.5L8.25 12l7.5-7.5' />
              </svg>
            </button>
            <span className='text-white font-medium text-sm capitalize'>
              {monthName}
            </span>
            <button
              type='button'
              onClick={() => setViewDate(new Date(year, month + 1, 1))}
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
              const isSelected = dateStr === tempDate;

              return (
                <button
                  key={i}
                  type='button'
                  onClick={() => handleDayClick(day)}
                  className={`
                    w-9 h-9 text-sm transition-all cursor-pointer rounded
                    ${isSelected ? 'bg-[#E4DD3B] text-black font-bold' : ''}
                    ${isToday && !isSelected ? 'ring-1 ring-[#E4DD3B] ring-offset-1 ring-offset-[#111]' : ''}
                    ${!isSelected ? 'text-white/70 hover:text-white hover:bg-[#E4DD3B]/15' : ''}
                  `}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Time picker + Save button */}
          <div className='mt-4 pt-3 border-t border-white/10 flex items-center justify-between gap-2'>
            <div className='flex items-center gap-2'>
              <span className='text-white/40 text-xs font-semibold uppercase tracking-wider'>{locale === 'et' ? 'Kell' : 'Time'}</span>
              <input
                type='text'
                value={tempHour}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, '').slice(0, 2);
                  const num = parseInt(raw, 10);
                  const h = isNaN(num) ? '' : num > 23 ? '23' : raw;
                  setTempHour(h);
                }}
                onBlur={() => {
                  const padded = tempHour.padStart(2, '0');
                  setTempHour(padded);
                  if (tempDate) onChange(`${tempDate}T${padded}:${tempMinute}`);
                }}
                maxLength={2}
                placeholder='HH'
                className='bg-white/[0.05] border border-white/10 text-white text-sm px-2 py-1.5 focus:outline-none focus:border-[#E4DD3B]/40 text-center w-12'
              />
              <span className='text-[#E4DD3B] font-bold text-lg'>:</span>
              <input
                type='text'
                value={tempMinute}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, '').slice(0, 2);
                  const num = parseInt(raw, 10);
                  const m = isNaN(num) ? '' : num > 59 ? '59' : raw;
                  setTempMinute(m);
                }}
                onBlur={() => {
                  const padded = tempMinute.padStart(2, '0');
                  setTempMinute(padded);
                  if (tempDate) onChange(`${tempDate}T${tempHour.padStart(2, '0')}:${padded}`);
                }}
                maxLength={2}
                placeholder='MM'
                className='bg-white/[0.05] border border-white/10 text-white text-sm px-2 py-1.5 focus:outline-none focus:border-[#E4DD3B]/40 text-center w-12'
              />
            </div>
            <button
              type='button'
              onClick={() => setIsOpen(false)}
              className='px-4 py-1.5 bg-[#E4DD3B] hover:bg-[#E4DD3B]/90 text-black text-sm font-semibold transition-colors duration-75 cursor-pointer'
            >
              {locale === 'et' ? 'Valmis' : 'Done'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
