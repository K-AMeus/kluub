import { Event } from './types';
import { getEventDateKey } from './date-utils';

export function groupEventsByDate(events: Event[]): Record<string, Event[]> {
  const grouped: Record<string, Event[]> = {};

  for (const event of events) {
    const dateKey = getEventDateKey(event.startTime);

    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    grouped[dateKey].push(event);
  }

  // Sort days + sort events inside each day by start time
  const sorted: Record<string, Event[]> = {};
  Object.keys(grouped)
    .sort()
    .forEach((key) => {
      sorted[key] = grouped[key]
        .slice()
        .sort((a, b) => a.startTime.localeCompare(b.startTime));
    });

  return sorted;
}

/**
 * Format ISO date string for display (dd/mm hh:mm)
 */
export function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}/${month} ${hours}:${minutes}`;
}

/**
 * Format ISO date string for display with year (dd/mm/yyyy hh:mm)
 */
export function formatDateTimeWithYear(isoString: string): string {
  const date = new Date(isoString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

/**
 * Format ISO date string for datetime-local input (yyyy-mm-ddThh:mm)
 */
export function formatDateTimeForInput(isoString: string): string {
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}
