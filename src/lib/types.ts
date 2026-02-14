export type City = 'TARTU' | 'TALLINN' | 'PÄRNU';
export type PriceTier = 0 | 1 | 2 | 3;

export interface Venue {
  id: string;
  name: string;
  city: City;
  openingTimes: Record<string, { open: string; close: string }>;
  address: string;
  lat: number;
  lng: number;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  priceTier: PriceTier;
  venueId: string;
  venue: string;
  city: City;
  topPick: boolean;
  imageUrl: string | null;
  facebookUrl: string | null;
  startTime: string;
  endTime: string;
}

export const PRICE_TIER_LABELS = ['Free', '€', '€€', '€€€'] as const;

export function formatPriceTier(tier: PriceTier): string {
  return PRICE_TIER_LABELS[tier];
}

export const EVENTS_PAGE_SIZE = 10;

export interface EventFilterParams {
  topPicks: boolean;
  freeOnly: boolean;
  venueId: string | null;
  startDate: string | null;
  endDate: string | null;
}

export interface EventsResult {
  events: Event[];
  hasMore: boolean;
}

export interface VenueOption {
  id: string;
  name: string;
}
