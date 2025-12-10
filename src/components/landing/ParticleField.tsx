'use client';

import { particles, ParticleConfig } from '@/lib/particles';

const LightParticle = ({ config }: { config: ParticleConfig }) => {
  return (
    <div
      className='absolute rounded-full animate-float-particle'
      style={{
        width: config.size,
        height: config.size,
        left: `${config.x}%`,
        top: `${config.y}%`,
        background: config.color,
        boxShadow: `0 0 ${config.size * 2}px ${config.color}`,
        animationDelay: `${config.delay}s`,
        animationDuration: `${config.duration}s`,
      }}
    />
  );
};

export default function ParticleField() {
  return (
    <div className='absolute inset-0 overflow-hidden'>
      {particles.map((p) => (
        <LightParticle key={p.id} config={p} />
      ))}
    </div>
  );
}
