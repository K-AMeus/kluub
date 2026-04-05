'use client';

import { useEffect } from 'react';
import { usePostHog } from 'posthog-js/react';

interface EventDetailTrackerProps {
  eventId: string;
  eventTitle: string;
  city: string;
  venueId: string;
  price: string;
}

export default function EventDetailTracker({
  eventId,
  eventTitle,
  city,
  venueId,
  price,
}: EventDetailTrackerProps) {
  const posthog = usePostHog();

  useEffect(() => {
    posthog.capture('event_detail_viewed', {
      event_id: eventId,
      event_title: eventTitle,
      city: city,
      venue_id: venueId,
      price: price,
    });
  }, [eventId, eventTitle, city, venueId, price]);

  return null;
}
