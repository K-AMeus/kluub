'use client';

import { ReactNode } from 'react';
import posthog from 'posthog-js';

interface FacebookEventLinkProps {
  href: string;
  eventId: string;
  eventTitle: string;
  venueId: string;
  children: ReactNode;
  className?: string;
}

export default function FacebookEventLink({
  href,
  eventId,
  eventTitle,
  venueId,
  children,
  className,
}: FacebookEventLinkProps) {
  const handleClick = () => {
    posthog.capture('facebook_event_clicked', {
      event_id: eventId,
      event_title: eventTitle,
      facebook_url: href,
      venue_id: venueId,
    });
  };

  return (
    <a
      href={href}
      target='_blank'
      rel='noopener noreferrer'
      className={className}
      onClick={handleClick}
    >
      {children}
    </a>
  );
}
