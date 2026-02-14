'use client';

import { useState, useEffect, useRef, ReactNode } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { City } from '@/lib/types';
import { TIMEZONE, getTodayInTallinn } from '@/lib/date-utils';
import { ChevronDownIcon, CloseIcon } from '@/components/shared/icons';
import { VenueOption } from '@/lib/types';
import { getVenuesByCity } from '@/lib/db';

export type { VenueOption };

export interface EventFilters {
  topPicks: boolean;
  freeOnly: boolean;
  venueId: string | null;
  startDate: string | null;
  endDate: string | null;
}

interface EventFiltersProps {
  city: City;
  onFiltersChange: (filters: EventFilters) => void;
}

const initialFilters: EventFilters = {
  topPicks: false,
  freeOnly: false,
  venueId: null,
  startDate: null,
  endDate: null,
};

function formatDay(dateStr: string, locale: string): string {
  const dateLocale = locale === 'et' ? 'et-EE' : 'en-US';
  const date = new Date(dateStr + 'T12:00:00');
  return date.toLocaleDateString(dateLocale, {
    month: 'short',
    day: 'numeric',
    timeZone: TIMEZONE,
  });
}

function formatDateDisplay(
  start: string | null,
  end: string | null,
  locale: string,
  translations?: { from: string; until: string }
): string {
  if (!start && !end) return '';

  if (start && end) {
    return `${formatDay(start, locale)} – ${formatDay(end, locale)}`;
  }
  if (start) {
    const fromText = translations?.from || 'From';
    return `${fromText} ${formatDay(start, locale)}`;
  }
  const untilText = translations?.until || 'Until';
  return `${untilText} ${formatDay(end!, locale)}`;
}

function formatDateShort(
  start: string | null,
  end: string | null,
  locale: string
): string {
  if (!start && !end) return '';

  if (start && end) {
    return `${formatDay(start, locale)} – ${formatDay(end, locale)}`;
  }
  return formatDay(start || end!, locale);
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

function BottomSheet({
  isOpen,
  onClose,
  title,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  const t = useTranslations('eventsPage');
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef<number | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (isOpen) {
      hasAnimated.current = false;
    }
  }, [isOpen]);

  const handleTouchStart = (e: React.TouchEvent) => {
    hasAnimated.current = true;
    dragStartY.current = e.touches[0].clientY;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (dragStartY.current === null) return;
    const delta = e.touches[0].clientY - dragStartY.current;
    setDragOffset(Math.max(0, delta));
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (dragOffset > 100) {
      onClose();
    }
    setDragOffset(0);
    dragStartY.current = null;
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 md:hidden'>
      <div
        className='absolute inset-0 bg-black/70 backdrop-blur-sm'
        style={{ opacity: Math.max(0, 1 - dragOffset / 300) }}
        onClick={onClose}
      />
      <div
        ref={sheetRef}
        className={`absolute bottom-0 left-0 right-0 bg-[#111] rounded-t-2xl max-h-[92vh] overflow-hidden ${
          !hasAnimated.current ? 'animate-slide-up' : ''
        }`}
        style={{
          transform: `translateY(${dragOffset}px)`,
          transition: isDragging ? 'none' : 'transform 0.3s ease-out',
        }}
      >
        <div
          className='flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing touch-none'
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className='w-10 h-1 bg-white/20 rounded-full' />
        </div>
        <div className='flex items-center justify-between px-4 pb-3 border-b border-white/10'>
          <h3 className='text-white font-sans font-medium'>{title}</h3>
          <button
            onClick={onClose}
            className='text-white/60 hover:text-white text-sm font-sans cursor-pointer'
          >
            {t('done')}
          </button>
        </div>
        <div className='p-4 overflow-y-auto max-h-[75vh]'>{children}</div>
      </div>
    </div>
  );
}

function DateRangeCalendar({
  startDate,
  endDate,
  onRangeChange,
  onClose,
  variant = 'dropdown',
  locale,
}: {
  startDate: string | null;
  endDate: string | null;
  onRangeChange: (start: string | null, end: string | null) => void;
  onClose: () => void;
  variant?: 'full' | 'dropdown';
  locale: string;
}) {
  const t = useTranslations('eventsPage');
  const [viewDate, setViewDate] = useState(() => {
    if (startDate) return new Date(startDate + 'T12:00:00');
    return new Date();
  });
  const [selectingEnd, setSelectingEnd] = useState(false);
  const [tempStart, setTempStart] = useState<string | null>(startDate);
  const [tempEnd, setTempEnd] = useState<string | null>(endDate);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const dateLocale = locale === 'et' ? 'et-EE' : 'en-US';
  const monthName = viewDate.toLocaleDateString(dateLocale, {
    month: 'long',
    year: 'numeric',
    timeZone: TIMEZONE,
  });

  const weekdays = getLocalizedWeekdays(locale);

  const days: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const formatDayToString = (day: number): string => {
    const m = String(month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${year}-${m}-${d}`;
  };

  const isInRange = (day: number): boolean => {
    if (!tempStart || !tempEnd) return false;
    const dateStr = formatDayToString(day);
    return dateStr >= tempStart && dateStr <= tempEnd;
  };

  const isStart = (day: number): boolean => {
    return tempStart === formatDayToString(day);
  };

  const isEnd = (day: number): boolean => {
    return tempEnd === formatDayToString(day);
  };

  const today = getTodayInTallinn();

  const handleDayClick = (day: number) => {
    const dateStr = formatDayToString(day);

    if (!selectingEnd) {
      setTempStart(dateStr);
      setTempEnd(null);
      setSelectingEnd(true);
    } else {
      if (tempStart && dateStr < tempStart) {
        setTempEnd(tempStart);
        setTempStart(dateStr);
      } else {
        setTempEnd(dateStr);
      }
      setSelectingEnd(false);
    }
  };

  const applyRange = () => {
    onRangeChange(tempStart, tempEnd);
    onClose();
  };

  const clearRange = () => {
    setTempStart(null);
    setTempEnd(null);
    setSelectingEnd(false);
    onRangeChange(null, null);
    onClose();
  };

  const prevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  return (
    <div className={variant === 'full' ? 'w-full' : 'w-72 p-4'}>
      <div className='flex items-center justify-between mb-4'>
        <button
          onClick={prevMonth}
          className='p-1.5 text-white/50 hover:text-white transition-colors cursor-pointer'
        >
          <ChevronDownIcon size={16} className='rotate-90' />
        </button>
        <span className='text-white font-sans text-sm font-medium'>
          {monthName}
        </span>
        <button
          onClick={nextMonth}
          className='p-1.5 text-white/50 hover:text-white transition-colors cursor-pointer'
        >
          <ChevronDownIcon size={16} className='-rotate-90' />
        </button>
      </div>

      <div className='grid grid-cols-7 gap-1 mb-2'>
        {weekdays.map((day, i) => (
          <div
            key={i}
            className='text-center text-xs text-white/40 font-sans py-1'
          >
            {day}
          </div>
        ))}
      </div>

      <div className='grid grid-cols-7 gap-1'>
        {days.map((day, i) => {
          if (day === null) {
            return <div key={i} className='w-8 h-8 md:w-9 md:h-9' />;
          }

          const dateStr = formatDayToString(day);
          const isPast = dateStr < today;
          const inRange = isInRange(day);
          const isStartDay = isStart(day);
          const isEndDay = isEnd(day);
          const isSelected = isStartDay || isEndDay;

          return (
            <button
              key={i}
              onClick={() => !isPast && handleDayClick(day)}
              disabled={isPast}
              className={`
                w-8 h-8 md:w-9 md:h-9 text-sm font-sans transition-all cursor-pointer rounded
                ${isPast ? 'text-white/20 cursor-not-allowed' : ''}
                ${inRange && !isSelected ? 'bg-[#E4DD3B]/20 text-white' : ''}
                ${isSelected ? 'bg-[#E4DD3B] text-black font-medium' : ''}
                ${
                  !isPast && !inRange && !isSelected
                    ? 'text-white/70 hover:text-white hover:bg-white/10'
                    : ''
                }
              `}
            >
              {day}
            </button>
          );
        })}
      </div>

      <div className='mt-4 pt-3 border-t border-white/10'>
        <div className='text-xs text-white/50 font-sans mb-3'>
          {selectingEnd
            ? t('selectEndDate')
            : tempStart
            ? formatDateDisplay(tempStart, tempEnd, locale, {
                from: t('from'),
                until: t('until'),
              })
            : t('selectStartDate')}
        </div>

        <div className='flex gap-2'>
          <button
            onClick={clearRange}
            className='flex-1 px-3 py-2.5 text-sm font-sans text-white/70 border border-white/20 rounded-lg hover:border-white/40 transition-colors cursor-pointer'
          >
            {t('clearFilters')}
          </button>
          <button
            onClick={applyRange}
            disabled={!tempStart}
            className={`
              flex-1 px-3 py-2.5 text-sm font-sans rounded-lg transition-colors cursor-pointer
              ${
                tempStart
                  ? 'bg-[#E4DD3B] text-black hover:bg-[#E4DD3B]/90'
                  : 'border border-white/20 text-white/30 cursor-not-allowed'
              }
            `}
          >
            {t('apply')}
          </button>
        </div>
      </div>
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        px-2.5 py-[5px] text-xs font-sans font-medium uppercase tracking-normal whitespace-nowrap transition-all cursor-pointer
        ${
          active
            ? 'bg-[#E4DD3B] text-black'
            : 'text-white/60 hover:text-white rounded'
        }
      `}
    >
      {label}
    </button>
  );
}

function DesktopFilterButton({
  label,
  active,
  onClick,
  children,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  children?: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-1.5 px-3 py-1.5 text-xs font-sans font-semibold uppercase tracking-wide
        transition-all cursor-pointer
        ${
          active
            ? 'bg-[#E4DD3B] text-black'
            : 'text-white/70 hover:text-white rounded'
        }
      `}
    >
      <span className='max-w-28 truncate'>{label}</span>
      {children}
    </button>
  );
}

export default function EventFiltersComponent({
  city,
  onFiltersChange,
}: EventFiltersProps) {
  const t = useTranslations('eventsPage');
  const locale = useLocale();
  const [filters, setFilters] = useState<EventFilters>(initialFilters);
  const [venues, setVenues] = useState<VenueOption[]>([]);
  const [venuesLoading, setVenuesLoading] = useState(false);
  const [venueDropdownOpen, setVenueDropdownOpen] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [mobileDateSheetOpen, setMobileDateSheetOpen] = useState(false);
  const [mobileVenueSheetOpen, setMobileVenueSheetOpen] = useState(false);

  const datePickerRef = useRef<HTMLDivElement>(null);
  const venueDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (
      (venueDropdownOpen || mobileVenueSheetOpen) &&
      venues.length === 0 &&
      !venuesLoading
    ) {
      setVenuesLoading(true);
      getVenuesByCity(city)
        .then((data) => {
          setVenues(data);
        })
        .catch((error) => {
          console.error('Failed to fetch venues:', error);
        })
        .finally(() => {
          setVenuesLoading(false);
        });
    }
  }, [venueDropdownOpen, mobileVenueSheetOpen, venues.length, venuesLoading, city]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(e.target as Node)
      ) {
        setDatePickerOpen(false);
      }
      if (
        venueDropdownRef.current &&
        !venueDropdownRef.current.contains(e.target as Node)
      ) {
        setVenueDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (mobileDateSheetOpen || mobileVenueSheetOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileDateSheetOpen, mobileVenueSheetOpen]);

  const toggleTopPicks = () => {
    const newFilters = { ...filters, topPicks: !filters.topPicks };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const toggleFreeOnly = () => {
    const newFilters = { ...filters, freeOnly: !filters.freeOnly };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const updateFilters = (updates: Partial<EventFilters>) => {
    const newFilters = { ...filters, ...updates };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleMobileFiltersChange = (newFilters: EventFilters) => {
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const selectedVenue = venues.find((v) => v.id === filters.venueId);
  const dateDisplay = formatDateDisplay(
    filters.startDate,
    filters.endDate,
    locale,
    {
      from: t('from'),
      until: t('until'),
    }
  );
  const dateDisplayShort = formatDateShort(
    filters.startDate,
    filters.endDate,
    locale
  );
  const hasDateFilter = filters.startDate || filters.endDate;

  const noFiltersActive =
    !filters.topPicks &&
    !filters.freeOnly &&
    !filters.venueId &&
    !filters.startDate &&
    !filters.endDate;

  const clearAllFilters = () => {
    setFilters(initialFilters);
    onFiltersChange(initialFilters);
  };

  return (
    <>
      <div className='md:hidden'>
        <div className='flex items-center gap-1 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide'>
          <FilterChip
            label={t('all')}
            active={noFiltersActive}
            onClick={clearAllFilters}
          />
          <FilterChip
            label={t('topPicks')}
            active={filters.topPicks}
            onClick={toggleTopPicks}
          />
          <FilterChip
            label={t('free')}
            active={filters.freeOnly}
            onClick={toggleFreeOnly}
          />
          <FilterChip
            label={t('date')}
            active={!!hasDateFilter}
            onClick={() => setMobileDateSheetOpen(true)}
          />
          <FilterChip
            label={t('venue')}
            active={!!filters.venueId}
            onClick={() => setMobileVenueSheetOpen(true)}
          />
        </div>

        {(hasDateFilter || (filters.venueId && selectedVenue)) && (
          <div className='flex items-center gap-2 mt-2 -mx-4 px-4 overflow-x-auto scrollbar-hide'>
            {hasDateFilter && (
              <button
                onClick={() => updateFilters({ startDate: null, endDate: null })}
                className='flex items-center gap-1 px-2 py-1 bg-[#E4DD3B]/20 text-[#E4DD3B] text-[11px] font-sans whitespace-nowrap cursor-pointer rounded'
              >
                <span>{dateDisplayShort}</span>
                <CloseIcon size={10} />
              </button>
            )}
            {filters.venueId && selectedVenue && (
              <button
                onClick={() => updateFilters({ venueId: null })}
                className='flex items-center gap-1 px-2 py-1 bg-[#E4DD3B]/20 text-[#E4DD3B] text-[11px] font-sans whitespace-nowrap cursor-pointer rounded'
              >
                <span className='max-w-32 truncate'>{selectedVenue.name}</span>
                <CloseIcon size={10} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Desktop Filters */}
      <div className='hidden md:flex items-center gap-2'>
        <DesktopFilterButton
          label={t('all')}
          active={noFiltersActive}
          onClick={clearAllFilters}
        />
        <DesktopFilterButton
          label={t('topPicks')}
          active={filters.topPicks}
          onClick={toggleTopPicks}
        />
        <DesktopFilterButton
          label={t('free')}
          active={filters.freeOnly}
          onClick={toggleFreeOnly}
        />

        {/* Date Dropdown */}
        <div className='relative' ref={datePickerRef}>
          <DesktopFilterButton
            label={dateDisplay || t('date')}
            active={!!hasDateFilter}
            onClick={() => setDatePickerOpen(!datePickerOpen)}
          >
            <ChevronDownIcon
              size={12}
              className={`transition-transform duration-200 ${
                datePickerOpen ? 'rotate-180' : ''
              }`}
            />
          </DesktopFilterButton>

          {datePickerOpen && (
            <div className='absolute top-full right-0 mt-2 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-2xl z-100'>
              <DateRangeCalendar
                startDate={filters.startDate}
                endDate={filters.endDate}
                onRangeChange={(start, end) => {
                  updateFilters({ startDate: start, endDate: end });
                }}
                onClose={() => setDatePickerOpen(false)}
                locale={locale}
              />
            </div>
          )}
        </div>

        {/* Venue Dropdown */}
        <div className='relative' ref={venueDropdownRef}>
          <DesktopFilterButton
            label={selectedVenue?.name || t('venue')}
            active={!!filters.venueId}
            onClick={() => setVenueDropdownOpen(!venueDropdownOpen)}
          >
            <ChevronDownIcon
              size={12}
              className={`transition-transform duration-200 ${
                venueDropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </DesktopFilterButton>

          {venueDropdownOpen && (
            <div className='absolute top-full right-0 mt-2 w-56 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-2xl z-100 max-h-72 overflow-y-auto'>
              <button
                onClick={() => {
                  updateFilters({ venueId: null });
                  setVenueDropdownOpen(false);
                }}
                className={`
                  w-full px-4 py-3 text-sm text-left font-sans transition-colors cursor-pointer
                  ${
                    filters.venueId === null
                      ? 'bg-[#E4DD3B] text-black'
                      : 'text-white/80 hover:bg-white/5'
                  }
                `}
              >
                {t('allVenues')}
              </button>
              {venuesLoading ? (
                <div className='px-4 py-4 text-sm text-white/40 font-sans'>
                  {t('loading')}
                </div>
              ) : (
                venues.map((venue) => (
                  <button
                    key={venue.id}
                    onClick={() => {
                      updateFilters({ venueId: venue.id });
                      setVenueDropdownOpen(false);
                    }}
                    className={`
                      w-full px-4 py-3 text-sm text-left font-sans transition-colors cursor-pointer
                      ${
                        filters.venueId === venue.id
                          ? 'bg-[#E4DD3B] text-black'
                          : 'text-white/80 hover:bg-white/5'
                      }
                    `}
                  >
                    {venue.name}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      <BottomSheet
        isOpen={mobileDateSheetOpen}
        onClose={() => setMobileDateSheetOpen(false)}
        title={t('pickDate')}
      >
        <DateRangeCalendar
          startDate={filters.startDate}
          endDate={filters.endDate}
          onRangeChange={(start, end) => {
            handleMobileFiltersChange({ ...filters, startDate: start, endDate: end });
          }}
          onClose={() => setMobileDateSheetOpen(false)}
          variant='full'
          locale={locale}
        />
      </BottomSheet>

      <BottomSheet
        isOpen={mobileVenueSheetOpen}
        onClose={() => setMobileVenueSheetOpen(false)}
        title={t('pickVenue')}
      >
        <div className='space-y-1'>
          <button
            onClick={() => {
              handleMobileFiltersChange({ ...filters, venueId: null });
            }}
            className={`w-full px-4 py-3 text-left font-sans rounded-lg transition-colors cursor-pointer ${
              filters.venueId === null
                ? 'bg-[#E4DD3B] text-black'
                : 'text-white/80 hover:bg-white/5'
            }`}
          >
            {t('allVenues')}
          </button>
          {venuesLoading ? (
            <div className='px-4 py-4 text-sm text-white/40 font-sans'>
              {t('loading')}
            </div>
          ) : (
            venues.map((venue) => (
              <button
                key={venue.id}
                onClick={() => {
                  handleMobileFiltersChange({ ...filters, venueId: venue.id });
                }}
                className={`w-full px-4 py-3 text-left font-sans rounded-lg transition-colors cursor-pointer ${
                  filters.venueId === venue.id
                    ? 'bg-[#E4DD3B] text-black'
                    : 'text-white/80 hover:bg-white/5'
                }`}
              >
                {venue.name}
              </button>
            ))
          )}
        </div>
      </BottomSheet>
    </>
  );
}
