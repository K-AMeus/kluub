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
