'use client';

import { useEffect } from 'react';
import posthog from 'posthog-js';

interface EventDetailTrackerProps {
  eventId: string;
  eventTitle: string;
  city: string;
  priceTier: number;
  venueId: string;
}

export default function EventDetailTracker({
  eventId,
  eventTitle,
  city,
  priceTier,
  venueId,
}: EventDetailTrackerProps) {
  useEffect(() => {
    posthog.capture('event_detail_viewed', {
      event_id: eventId,
      event_title: eventTitle,
      city: city,
      price_tier: priceTier,
      venue_id: venueId,
    });
  }, [eventId, eventTitle, city, priceTier, venueId]);

  return null;
}
