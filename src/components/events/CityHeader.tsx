'use client';

import { useState, useEffect } from 'react';
import { formatTime } from '@/lib/date-utils';

interface CityHeaderProps {
  city: string;
}

export default function CityHeader({ city }: CityHeaderProps) {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setCurrentTime(formatTime());
    setMounted(true);

    let timeoutId: ReturnType<typeof setTimeout>;

    const tick = () => {
      setCurrentTime(formatTime());
      const now = new Date();
      const msUntilNextMinute =
        60_000 - (now.getSeconds() * 1000 + now.getMilliseconds());
      timeoutId = setTimeout(tick, msUntilNextMinute);
    };

    const now = new Date();
    const msUntilNextMinute =
      60_000 - (now.getSeconds() * 1000 + now.getMilliseconds());
    timeoutId = setTimeout(tick, msUntilNextMinute);

    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div className='flex items-baseline gap-3 md:gap-5'>
      <h1 className='text-white font-display text-3xl md:text-5xl lg:text-6xl tracking-tight'>
        {city}
      </h1>
      <span
        className={`text-white/40 font-sans text-sm md:text-lg tabular-nums tracking-wide transition-opacity duration-500 ${
          mounted ? 'opacity-100' : 'opacity-0'
        }`}
        aria-label={`Current time in ${city}`}
      >
        {currentTime}
      </span>
    </div>
  );
}
