export default function BackstageBackground() {
  return (
    <>
      <div className='absolute inset-0 bg-linear-to-b from-[#0a0a0a] via-[#0d0d08] to-[#141410]' />

      <div className='absolute inset-0'>
        <div
          className='absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full'
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(228, 221, 59, 0.04) 0%, rgba(228, 221, 59, 0.01) 50%, transparent 70%)',
          }}
        />

        <div className='absolute top-[20%] left-[10%] w-[250px] h-[250px] bg-[#E4DD3B]/2.5 rounded-full blur-[100px] animate-pulse-slow' />
        <div className='absolute bottom-[30%] right-[10%] w-[200px] h-[200px] bg-[#ff9500]/2.5 rounded-full blur-[80px] animate-pulse-slower' />
      </div>

      <div className='absolute inset-0 opacity-[0.015] bg-grain' />

      <div
        className='absolute inset-0 pointer-events-none'
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.4) 100%)',
        }}
      />
    </>
  );
}
