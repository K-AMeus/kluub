'use client';

import { useState, useEffect } from 'react';
import { TIMEZONE } from '@/lib/date-utils';

interface CityHeaderProps {
  city: string;
}

function formatTime(): string {
  return new Date().toLocaleTimeString('et-EE', {
    timeZone: TIMEZONE,
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function CityHeader({ city }: CityHeaderProps) {
  const [currentTime, setCurrentTime] = useState<string>(() => formatTime());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const updateTime = () => {
      setCurrentTime(formatTime());
    };

    const intervalId = setInterval(updateTime, 30000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className='flex items-baseline gap-2 md:gap-4'>
      <h1 className='text-white font-display text-3xl md:text-5xl lg:text-6xl tracking-tight'>
        {city}
      </h1>
      <span
        className={`text-white/40 font-sans text-sm md:text-lg transition-opacity duration-500 ${
          mounted ? 'opacity-100' : 'opacity-0'
        }`}
        aria-label={`Current time in ${city}`}
      >
        {currentTime}
      </span>
    </div>
  );
}
