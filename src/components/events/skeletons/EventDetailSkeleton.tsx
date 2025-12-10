export default function EventDetailSkeleton() {
  return (
    <div className='min-h-screen bg-black'>
      {/* Back button skeleton */}
      <div className='px-4 md:px-8 lg:px-12 max-w-5xl mx-auto py-4 md:py-6'>
        <div className='h-5 w-32 bg-white/10 animate-pulse rounded' />
      </div>

      {/* Main Card Skeleton */}
      <div className='px-4 md:px-8 lg:px-12 max-w-5xl mx-auto'>
        <div className='relative'>
          {/* Yellow offset background */}
          <div className='absolute inset-0 bg-[#E4DD3B] translate-x-2 translate-y-2' />

          <div className='relative bg-black border border-white/30'>
            {/* Desktop Layout */}
            <div className='hidden md:flex'>
              {/* Image Section */}
              <div className='relative w-1/3 min-h-[320px] lg:min-h-[360px] bg-white/10 animate-pulse border-r-2 border-[#E4DD3B]'>
                {/* Date Badge */}
                <div className='absolute top-4 left-4 bg-[#E4DD3B] px-3 py-2 w-14 h-14' />
              </div>

              {/* Content Section */}
              <div className='flex-1 flex flex-col p-6 lg:p-8'>
                {/* Title */}
                <div className='h-8 w-3/4 bg-white/10 animate-pulse rounded mb-6' />

                {/* Info Grid */}
                <div className='grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-white/10'>
                  <div className='flex items-center gap-3'>
                    <div className='w-5 h-5 bg-[#E4DD3B]/30 animate-pulse rounded' />
                    <div className='h-4 w-28 bg-white/10 animate-pulse rounded' />
                  </div>
                  <div className='flex items-center gap-3'>
                    <div className='w-5 h-5 bg-[#E4DD3B]/30 animate-pulse rounded' />
                    <div className='h-4 w-32 bg-white/10 animate-pulse rounded' />
                  </div>
                  <div className='flex items-center gap-3'>
                    <div className='w-5 h-5 bg-[#E4DD3B]/30 animate-pulse rounded' />
                    <div className='h-4 w-16 bg-white/10 animate-pulse rounded' />
                  </div>
                </div>

                {/* Description */}
                <div className='flex-1 space-y-3'>
                  <div className='h-4 w-full bg-white/10 animate-pulse rounded' />
                  <div className='h-4 w-5/6 bg-white/10 animate-pulse rounded' />
                  <div className='h-4 w-full bg-white/10 animate-pulse rounded' />
                  <div className='h-4 w-4/6 bg-white/10 animate-pulse rounded' />
                  <div className='h-4 w-3/4 bg-white/10 animate-pulse rounded' />
                  <div className='h-4 w-5/6 bg-white/10 animate-pulse rounded' />
                </div>

                {/* Facebook Link */}
                <div className='mt-6 pt-6 border-t border-white/10'>
                  <div className='h-5 w-40 bg-[#E4DD3B]/20 animate-pulse rounded' />
                </div>
              </div>
            </div>

            {/* Mobile Layout */}
            <div className='md:hidden'>
              {/* Image */}
              <div className='relative w-full h-56 bg-white/10 animate-pulse'>
                {/* Date Badge */}
                <div className='absolute top-3 left-3 bg-[#E4DD3B] px-2.5 py-1.5 w-12 h-12' />
              </div>

              {/* Content */}
              <div className='p-4'>
                {/* Title */}
                <div className='h-6 w-3/4 bg-white/10 animate-pulse rounded mb-4' />

                {/* Info */}
                <div className='space-y-2.5 mb-4 pb-4 border-b border-white/10'>
                  <div className='flex items-center gap-2.5'>
                    <div className='w-4 h-4 bg-[#E4DD3B]/30 animate-pulse rounded' />
                    <div className='h-4 w-28 bg-white/10 animate-pulse rounded' />
                  </div>
                  <div className='flex items-center gap-2.5'>
                    <div className='w-4 h-4 bg-[#E4DD3B]/30 animate-pulse rounded' />
                    <div className='h-4 w-32 bg-white/10 animate-pulse rounded' />
                  </div>
                  <div className='flex items-center gap-2.5'>
                    <div className='w-4 h-4 bg-[#E4DD3B]/30 animate-pulse rounded' />
                    <div className='h-4 w-16 bg-white/10 animate-pulse rounded' />
                  </div>
                </div>

                {/* Description */}
                <div className='space-y-2.5'>
                  <div className='h-4 w-full bg-white/10 animate-pulse rounded' />
                  <div className='h-4 w-5/6 bg-white/10 animate-pulse rounded' />
                  <div className='h-4 w-full bg-white/10 animate-pulse rounded' />
                  <div className='h-4 w-4/6 bg-white/10 animate-pulse rounded' />
                </div>

                {/* Facebook Link */}
                <div className='mt-4 pt-4 border-t border-white/10'>
                  <div className='h-4 w-36 bg-[#E4DD3B]/20 animate-pulse rounded' />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
