export type City = 'TARTU' | 'TALLINN' | 'PÄRNU';

export interface Host {
  id: string;
  name: string;
}

export interface Venue {
  id: string;
  name: string;
  city: City;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  price: string;
  hostId: string;
  venueId: string;
  venue: string;
  city: City;
  topPick: boolean;
  imageUrl: string | null;
  facebookUrl: string | null;
  startTime: string;
  endTime: string;
}

export const EVENTS_PAGE_SIZE = 10;

export interface EventFilterParams {
  topPicks: boolean;
  freeOnly: boolean;
  venueId: string | null;
  startDate: string | null;
  endDate: string | null;
}

export const DEFAULT_EVENT_FILTERS: EventFilterParams = {
  topPicks: false,
  freeOnly: false,
  venueId: null,
  startDate: null,
  endDate: null,
};

export interface EventsResult {
  events: Event[];
  hasMore: boolean;
}

export interface VenueOption {
  id: string;
  name: string;
}
