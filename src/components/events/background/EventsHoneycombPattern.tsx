import { ReactNode, useMemo } from 'react';
import {
  eventsClusters,
  eventsSingles,
  EventsClusterConfig,
  EventsSingleHexConfig,
} from '@/lib/events-honeycomb-data';

interface HexagonClusterProps {
  config: EventsClusterConfig;
  index: number;
}

function HexagonCluster({ config, index }: HexagonClusterProps) {
  const hexagons = useMemo(() => {
    const result: ReactNode[] = [];
    const h = config.size * Math.sqrt(3);
    const w = config.size * 2;

    config.pattern.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell === 1) {
          const offsetX = colIndex * w * 0.75;
          const offsetY = rowIndex * h + (colIndex % 2 === 1 ? h / 2 : 0);

          const points: string[] = [];
          for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i;
            const px = offsetX + config.size * Math.cos(angle);
            const py = offsetY + config.size * Math.sin(angle);
            points.push(`${px},${py}`);
          }

          result.push(
            <polygon
              key={`${rowIndex}-${colIndex}`}
              points={points.join(' ')}
              fill='none'
              stroke='#E4DD3B'
              strokeWidth='0.8'
              opacity={config.opacity}
            />
          );
        }
      });
    });

    return result;
  }, [config]);

  return (
    <svg
      className='absolute'
      style={{
        left: config.x,
        top: config.y,
        width: 200,
        height: 200,
        overflow: 'visible',
      }}
    >
      <g transform={`rotate(${config.rotation})`}>{hexagons}</g>
    </svg>
  );
}

interface SingleHexagonProps {
  config: EventsSingleHexConfig;
  index: number;
}

function SingleHexagon({ config, index }: SingleHexagonProps) {
  const points = useMemo(() => {
    const result: string[] = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      const px = config.size * Math.cos(angle);
      const py = config.size * Math.sin(angle);
      result.push(`${px},${py}`);
    }
    return result.join(' ');
  }, [config.size]);

  return (
    <svg
      className='absolute'
      style={{
        left: config.x,
        top: config.y,
        width: config.size * 2.5,
        height: config.size * 2.5,
        overflow: 'visible',
      }}
    >
      <polygon
        points={points}
        fill='none'
        stroke='#E4DD3B'
        strokeWidth='0.6'
        opacity={config.opacity}
        transform={`rotate(${config.rotation})`}
      />
    </svg>
  );
}

export default function EventsHoneycombPattern() {
  return (
    <div className='absolute inset-0 w-full h-full'>
      {eventsClusters.map((cluster, i) => (
        <HexagonCluster key={`cluster-${i}`} config={cluster} index={i} />
      ))}
      {eventsSingles.map((hex, i) => (
        <SingleHexagon key={`single-${i}`} config={hex} index={i} />
      ))}
    </div>
  );
}
