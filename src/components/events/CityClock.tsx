'use client';

import { useState, useEffect } from 'react';
import { formatTime } from '@/lib/date-utils';

interface CityClockProps {
  city: string;
}

export default function CityClock({ city }: CityClockProps) {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const updateTime = () => {
      setCurrentTime(formatTime());
    };

    updateTime();
    const intervalId = setInterval(updateTime, 1000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className='pt-8 pb-4 md:pt-12 md:pb-4'>
      <div className='flex flex-col items-center justify-center'>
        <span className='text-white/95 font-sans text-sm md:text-lg tracking-wide'>
          {city}, Estonia
        </span>
        <h2
          className={`text-white font-display text-3xl md:text-4xl tracking-wider mt-1 transition-opacity duration-500 ${
            mounted ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {currentTime || '00:00'}
        </h2>
        <div className='mt-4 md:mt-4 w-56 md:w-80 border-t-2 border-[#E4DD3B]' />
      </div>
    </div>
  );
}
