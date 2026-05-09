import posthog from 'posthog-js';

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
  api_host: '/pxy',
  ui_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  defaults: '2026-01-30',
  capture_exceptions: true,
  capture_dead_clicks: false,
  debug: process.env.NODE_ENV === 'development',
});
