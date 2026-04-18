'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang='en'>
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0a0a0a',
          color: '#ffffff',
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          padding: '1rem',
        }}
      >
        <div
          style={{
            maxWidth: '32rem',
            width: '100%',
            border: '1px solid rgba(228, 221, 59, 0.3)',
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            padding: '2rem',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              color: '#E4DD3B',
              fontSize: '3rem',
              fontWeight: 700,
              margin: '0 0 1rem',
              letterSpacing: '0.05em',
            }}
          >
            500
          </p>
          <h1
            style={{
              color: '#ffffff',
              fontSize: '1.25rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              margin: '0 0 0.75rem',
            }}
          >
            Something went wrong
          </h1>
          <p
            style={{
              color: 'rgba(255, 255, 255, 0.5)',
              fontSize: '0.875rem',
              margin: '0 0 2rem',
            }}
          >
            An unexpected error occurred. Please try again.
          </p>
          <button
            onClick={reset}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#E4DD3B',
              color: '#000000',
              border: 'none',
              fontWeight: 600,
              fontSize: '0.875rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
