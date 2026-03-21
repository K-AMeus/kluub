'use client';

import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';

export default function PostHogProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PHProvider client={posthog}>{children}</PHProvider>;
}


//id
// name
// slug
// description
// logo_url
// website_url
// contact_email (admin field)
// contact_phone (admin field)
// audit fields


// id
// host_users
// host_id
// user_id
// role (maybe)


// events (venue_id -> host_id)