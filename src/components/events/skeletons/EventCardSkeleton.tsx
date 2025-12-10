export default function EventCardSkeleton() {
  return (
    <>
      {/* Desktop Skeleton */}
      <div className='hidden md:block relative'>
        <div className='absolute inset-0 bg-[#E4DD3B] translate-x-2 translate-y-2' />
        <div className='relative bg-black border border-white/30 flex h-52 lg:h-56'>
          {/* Image skeleton */}
          <div className='w-1/4 min-w-48 -ml-1 -mt-1 bg-white/10 animate-pulse border-2 border-[#E4DD3B]' />

          {/* Main Content skeleton */}
          <div className='flex-1 flex flex-col justify-between p-5 lg:p-6'>
            <div>
              <div className='h-6 w-3/4 bg-white/10 animate-pulse rounded' />
              <div className='mt-4 space-y-2'>
                <div className='h-4 w-full bg-white/10 animate-pulse rounded' />
                <div className='h-4 w-5/6 bg-white/10 animate-pulse rounded' />
                <div className='h-4 w-4/6 bg-white/10 animate-pulse rounded' />
              </div>
            </div>
            <div className='h-4 w-24 bg-[#E4DD3B]/20 animate-pulse rounded' />
          </div>

          {/* Side Info skeleton */}
          <div className='w-56 lg:w-64 flex flex-col justify-center gap-4 p-5 lg:p-6 border-l border-white/10'>
            <div className='flex items-center gap-2.5'>
              <div className='w-5 h-5 bg-[#E4DD3B]/20 animate-pulse rounded' />
              <div className='h-4 w-32 bg-white/10 animate-pulse rounded' />
            </div>
            <div className='flex items-center gap-2.5'>
              <div className='w-5 h-5 bg-[#E4DD3B]/20 animate-pulse rounded' />
              <div className='h-4 w-28 bg-white/10 animate-pulse rounded' />
            </div>
            <div className='flex items-center gap-2.5'>
              <div className='w-5 h-5 bg-[#E4DD3B]/20 animate-pulse rounded' />
              <div className='h-4 w-16 bg-white/10 animate-pulse rounded' />
            </div>
            <div className='flex items-center gap-2.5 mt-2 pt-3 border-t border-white/10'>
              <div className='w-4 h-4 bg-white/10 animate-pulse rounded' />
              <div className='h-4 w-24 bg-white/10 animate-pulse rounded' />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Skeleton */}
      <div className='md:hidden'>
        <div className='flex gap-4 py-4'>
          <div className='w-28 h-28 shrink-0 rounded-lg bg-white/10 animate-pulse' />
          <div className='flex-1 flex flex-col justify-between'>
            <div>
              <div className='h-5 w-3/4 bg-white/10 animate-pulse rounded' />
              <div className='mt-3 space-y-2'>
                <div className='h-3 w-full bg-white/10 animate-pulse rounded' />
                <div className='h-3 w-2/3 bg-white/10 animate-pulse rounded' />
              </div>
            </div>
            <div className='flex items-center justify-between mt-2'>
              <div className='h-3 w-16 bg-white/10 animate-pulse rounded' />
              <div className='w-4 h-4 bg-white/10 animate-pulse rounded' />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
