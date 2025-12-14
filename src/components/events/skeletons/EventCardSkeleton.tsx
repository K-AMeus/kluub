export default function EventCardSkeleton() {
  return (
    <article className='relative'>
      <div className='hidden md:block absolute inset-0 bg-[#E4DD3B] translate-x-2 translate-y-2' />

      <div className='relative bg-[#060606] border border-white/20 md:border-white/30 flex md:h-52 lg:h-56'>
        <div className='w-28 h-28 m-4 md:m-0 md:w-1/4 md:min-w-48 md:h-auto shrink-0 rounded-lg md:rounded-none bg-white/10 animate-pulse' />

        <div className='flex-1 flex flex-col justify-between min-w-0 py-4 pr-4 md:p-5 lg:p-8'>
          <div>
            <div className='h-5 md:h-6 w-3/4 bg-white/10 animate-pulse rounded' />

            <div className='hidden md:block mt-3 space-y-2'>
              <div className='h-4 w-full bg-white/10 animate-pulse rounded' />
              <div className='h-4 w-5/6 bg-white/10 animate-pulse rounded' />
            </div>

            <div className='md:hidden mt-2 space-y-1.5'>
              <div className='flex items-center gap-2'>
                <div className='w-3.5 h-3.5 bg-[#E4DD3B]/20 animate-pulse rounded' />
                <div className='h-3 w-24 bg-white/10 animate-pulse rounded' />
              </div>
              <div className='flex items-center gap-2'>
                <div className='w-3.5 h-3.5 bg-[#E4DD3B]/20 animate-pulse rounded' />
                <div className='h-3 w-28 bg-white/10 animate-pulse rounded' />
              </div>
            </div>
          </div>

          <div className='md:hidden flex items-center justify-between mt-2'>
            <div className='flex items-center gap-2'>
              <div className='w-3.5 h-3.5 bg-[#E4DD3B]/20 animate-pulse rounded' />
              <div className='h-3 w-12 bg-white/10 animate-pulse rounded' />
            </div>
          </div>

          <div className='hidden md:block h-4 w-24 bg-[#E4DD3B]/20 animate-pulse rounded' />
        </div>

        <div className='hidden md:flex w-56 lg:w-64 flex-col justify-center gap-3 p-5 lg:p-6 border-l border-white/10'>
          <div className='flex items-center gap-2.5'>
            <div className='w-[18px] h-[18px] bg-[#E4DD3B]/20 animate-pulse rounded' />
            <div className='h-4 w-32 bg-white/10 animate-pulse rounded' />
          </div>
          <div className='flex items-center gap-2.5'>
            <div className='w-[18px] h-[18px] bg-[#E4DD3B]/20 animate-pulse rounded' />
            <div className='h-4 w-28 bg-white/10 animate-pulse rounded' />
          </div>
          <div className='flex items-center gap-2.5'>
            <div className='w-[18px] h-[18px] bg-[#E4DD3B]/20 animate-pulse rounded' />
            <div className='h-4 w-16 bg-white/10 animate-pulse rounded' />
          </div>
          <div className='flex items-center gap-2.5 mt-2 pt-3 border-t border-white/10'>
            <div className='w-4 h-4 bg-[#E4DD3B]/20 animate-pulse rounded' />
            <div className='h-4 w-24 bg-white/10 animate-pulse rounded' />
          </div>
        </div>
      </div>
    </article>
  );
}
