export const TIMEZONE = 'Europe/Tallinn';

const formatterCache = new Map<string, Intl.DateTimeFormat>();

export function getDateFormatter(
  locale: string,
  options: Intl.DateTimeFormatOptions,
): Intl.DateTimeFormat {
  const key = `${locale}|${JSON.stringify(options)}`;
  let formatter = formatterCache.get(key);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, options);
    formatterCache.set(key, formatter);
  }
  return formatter;
}

const TALLINN_YMD = { timeZone: TIMEZONE } as const;

// Convert a JS Date into a YYYY-MM-DD string in Tallinn time
export function getTallinnDateString(date: Date): string {
  return getDateFormatter('en-CA', TALLINN_YMD).format(date);
}

// Get today's date in Tallinn timezone (YYYY-MM-DD format)
export function getTodayInTallinn(): string {
  return getTallinnDateString(new Date());
}

// Get tomorrow's date in Tallinn timezone (YYYY-MM-DD format)
export function getTomorrowInTallinn(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return getTallinnDateString(tomorrow);
}

// Get the date key for an event (in Tallinn)
export function getEventDateKey(startTime: string): string {
  const date = new Date(startTime);
  return getTallinnDateString(date);
}

const TALLINN_HM = {
  timeZone: TIMEZONE,
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
} as const;

export function formatTime(dateString?: string): string {
  const date = dateString ? new Date(dateString) : new Date();
  return getDateFormatter('et-EE', TALLINN_HM).format(date);
}

export function getDateLocale(locale: string): string {
  return locale === 'et' ? 'et-EE' : 'en-US';
}

export function getLocalizedWeekdays(locale: string): string[] {
  const fmt = getDateFormatter(getDateLocale(locale), { weekday: 'narrow' });
  const weekdays: string[] = [];
  for (let i = 0; i < 7; i++) {
    weekdays.push(fmt.format(new Date(2025, 0, 6 + i)).toUpperCase());
  }
  return weekdays;
}
