import { useMemo } from 'react';

interface ParticleConfig {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  color: string;
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
}

function generateEventsParticles(count: number): ParticleConfig[] {
  return Array.from({ length: count }, (_, i) => {
    const seed = i + 100;
    const colorIndex = i % 4;

    return {
      id: i,
      x: seededRandom(seed * 1) * 100,
      y: seededRandom(seed * 2) * 100,
      size: seededRandom(seed * 3) * 3 + 1.5,
      delay: seededRandom(seed * 4) * 8,
      duration: seededRandom(seed * 5) * 15 + 20,
      color:
        colorIndex === 0
          ? 'rgba(228, 221, 59, 0.4)'
          : colorIndex === 1
          ? 'rgba(255, 180, 50, 0.3)'
          : colorIndex === 2
          ? 'rgba(255, 255, 255, 0.2)'
          : 'rgba(228, 221, 59, 0.25)',
    };
  });
}

interface LightParticleProps {
  config: ParticleConfig;
}

function LightParticle({ config }: LightParticleProps) {
  return (
    <div
      className='absolute rounded-full animate-float-particle'
      style={{
        width: config.size,
        height: config.size,
        left: `${config.x}%`,
        top: `${config.y}%`,
        background: config.color,
        boxShadow: `0 0 ${config.size * 1.5}px ${config.color}`,
        animationDelay: `${config.delay}s`,
        animationDuration: `${config.duration}s`,
      }}
    />
  );
}

export default function EventsParticleField() {
  // Generate 20 particles
  const particles = useMemo(() => generateEventsParticles(20), []);

  return (
    <div className='absolute inset-0 overflow-hidden'>
      {particles.map((p) => (
        <LightParticle key={p.id} config={p} />
      ))}
    </div>
  );
}
