export const TIMEZONE = 'Europe/Tallinn';

// Convert a JS Date into a YYYY-MM-DD string in Tallinn time
export function getTallinnDateString(date: Date): string {
  return date.toLocaleDateString('en-CA', { timeZone: TIMEZONE });
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
