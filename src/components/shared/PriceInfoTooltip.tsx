'use client';

import { useState } from 'react';

interface PriceInfoTooltipProps {
  size?: number;
}

export default function PriceInfoTooltip({ size = 14 }: PriceInfoTooltipProps) {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className='relative inline-flex'>
      <button
        type='button'
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setShowInfo(!showInfo);
        }}
        className='relative z-20 inline-flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer'
        style={{ width: size + 4, height: size + 4 }}
        aria-label='Price tier information'
      >
        <svg
          className='text-white/70'
          style={{ width: size - 2, height: size - 2 }}
          fill='currentColor'
          viewBox='0 0 20 20'
        >
          <path
            fillRule='evenodd'
            d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z'
            clipRule='evenodd'
          />
        </svg>
      </button>

      {showInfo && (
        <>
          {/* Backdrop */}
          <div
            className='fixed inset-0 z-30'
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowInfo(false);
            }}
          />
          {/* Tooltip */}
          <div className='absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-40 bg-black/95 border border-[#E4DD3B]/30 rounded-lg p-3 min-w-[160px] shadow-xl'>
            <div className='text-xs text-white/90 space-y-1'>
              <div><strong>Free:</strong> 0 EUR</div>
              <div><strong>€:</strong> 0-10 EUR</div>
              <div><strong>€€:</strong> 10-20 EUR</div>
              <div><strong>€€€:</strong> 20+ EUR</div>
            </div>
            {/* Arrow */}
            <div className='absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-[#E4DD3B]/30' />
          </div>
        </>
      )}
    </div>
  );
}
