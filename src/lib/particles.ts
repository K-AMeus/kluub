export interface ParticleConfig {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  color: string;
}

// seeded random number generator for consistent results
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
}

// generate particles with deterministic positions
function generateParticles(count: number): ParticleConfig[] {
  return Array.from({ length: count }, (_, i) => {
    const seed = i + 1;
    const colorIndex = i % 3;

    return {
      id: i,
      x: seededRandom(seed * 1) * 100,
      y: seededRandom(seed * 2) * 100,
      size: seededRandom(seed * 3) * 4 + 2,
      delay: seededRandom(seed * 4) * 5,
      duration: seededRandom(seed * 5) * 10 + 15,
      color:
        colorIndex === 0
          ? 'rgba(228, 221, 59, 0.6)'
          : colorIndex === 1
          ? 'rgba(255, 180, 50, 0.4)'
          : 'rgba(255, 255, 255, 0.3)',
    };
  });
}

export const particles: ParticleConfig[] = generateParticles(30);
