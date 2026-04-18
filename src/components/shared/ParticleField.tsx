'use client';

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

interface VariantConfig {
  count: number;
  seedOffset: number;
  colors: readonly string[];
  minSize: number;
  sizeRange: number;
  minDuration: number;
  durationRange: number;
  delayRange: number;
  glowMultiplier: number;
}

const VARIANTS: Record<'landing' | 'events', VariantConfig> = {
  landing: {
    count: 30,
    seedOffset: 1,
    colors: [
      'rgba(228, 221, 59, 0.6)',
      'rgba(255, 180, 50, 0.4)',
      'rgba(255, 255, 255, 0.3)',
    ],
    minSize: 2,
    sizeRange: 4,
    minDuration: 15,
    durationRange: 10,
    delayRange: 5,
    glowMultiplier: 2,
  },
  events: {
    count: 20,
    seedOffset: 100,
    colors: [
      'rgba(228, 221, 59, 0.4)',
      'rgba(255, 180, 50, 0.3)',
      'rgba(255, 255, 255, 0.2)',
      'rgba(228, 221, 59, 0.25)',
    ],
    minSize: 1.5,
    sizeRange: 3,
    minDuration: 20,
    durationRange: 15,
    delayRange: 8,
    glowMultiplier: 1.5,
  },
};

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
}

function generateParticles(v: VariantConfig): ParticleConfig[] {
  return Array.from({ length: v.count }, (_, i) => {
    const seed = i + v.seedOffset;
    return {
      id: i,
      x: seededRandom(seed * 1) * 100,
      y: seededRandom(seed * 2) * 100,
      size: seededRandom(seed * 3) * v.sizeRange + v.minSize,
      delay: seededRandom(seed * 4) * v.delayRange,
      duration: seededRandom(seed * 5) * v.durationRange + v.minDuration,
      color: v.colors[i % v.colors.length],
    };
  });
}

interface ParticleFieldProps {
  variant: keyof typeof VARIANTS;
}

export default function ParticleField({ variant }: ParticleFieldProps) {
  const config = VARIANTS[variant];
  const particles = useMemo(() => generateParticles(config), [config]);

  return (
    <div className='absolute inset-0 overflow-hidden'>
      {particles.map((p) => (
        <div
          key={p.id}
          className='absolute rounded-full animate-float-particle'
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
            background: p.color,
            boxShadow: `0 0 ${p.size * config.glowMultiplier}px ${p.color}`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
