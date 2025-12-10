import { ReactNode } from 'react';

interface HoneycombClusterProps {
  x: number;
  y: number;
  size: number;
  opacity: number;
  rotation?: number;
  pattern: number[][];
}

export default function HoneycombCluster({
  x,
  y,
  size,
  opacity,
  rotation = 0,
  pattern,
}: HoneycombClusterProps) {
  const hexagons: ReactNode[] = [];
  const h = size * Math.sqrt(3);
  const w = size * 2;

  pattern.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      if (cell === 1) {
        const offsetX = colIndex * w * 0.75;
        const offsetY = rowIndex * h + (colIndex % 2 === 1 ? h / 2 : 0);

        const points: string[] = [];
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i;
          const px = offsetX + size * Math.cos(angle);
          const py = offsetY + size * Math.sin(angle);
          points.push(`${px},${py}`);
        }

        hexagons.push(
          <polygon
            key={`${rowIndex}-${colIndex}`}
            points={points.join(' ')}
            fill='none'
            stroke='#E4DD3B'
            strokeWidth='1'
            opacity={opacity}
          />
        );
      }
    });
  });

  return (
    <g transform={`translate(${x}, ${y}) rotate(${rotation})`}>{hexagons}</g>
  );
}
