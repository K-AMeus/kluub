export default function BackgroundEffects() {
  return (
    <>
      <div className='absolute inset-0 bg-linear-to-b from-[#0a0a0a] via-[#0d0d08] to-[#141410]' />

      <div className='absolute inset-0'>
        <div className='absolute bottom-0 left-0 right-0 h-1/2 bg-linear-to-t from-[#E4DD3B]/3 via-[#ff9500]/1.5 to-transparent' />

        {/* Center focus glow */}
        <div
          className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] rounded-full'
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(228, 221, 59, 0.06) 0%, rgba(228, 221, 59, 0.02) 40%, transparent 70%)',
          }}
        />

        {/* Scattered glows */}
        <div className='absolute top-[15%] left-[8%] w-[350px] h-[350px] bg-[#E4DD3B]/[0.035] rounded-full blur-[120px] animate-pulse-slow' />
        <div className='absolute top-[50%] right-[8%] w-[300px] h-[300px] bg-[#ff9500]/2.5 rounded-full blur-[100px] animate-pulse-slower' />
        <div className='absolute bottom-[25%] left-[25%] w-[200px] h-[200px] bg-[#E4DD3B]/2 rounded-full blur-[80px]' />
        <div className='absolute top-[20%] right-[15%] w-[250px] h-[250px] bg-[#E4DD3B]/2.5 rounded-full blur-[100px]' />
      </div>

      <div className='absolute inset-0 opacity-[0.02] bg-grain' />

      <div
        className='absolute inset-0 pointer-events-none'
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.3) 100%)',
        }}
      />
    </>
  );
}
