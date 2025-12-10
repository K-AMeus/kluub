import HoneycombCluster from './HoneycombCluster';
import SingleHexagon from './SingleHexagon';
import { clusters, singles } from '@/lib/honeycomb-data';

// Scattered honeycomb pattern with clusters and individual hexagons
export default function HoneycombPattern() {
  return (
    <svg
      className='absolute inset-0 w-full h-full'
      xmlns='http://www.w3.org/2000/svg'
      preserveAspectRatio='xMidYMid slice'
    >
      {/* clusters */}
      {clusters.map((cluster, i) => (
        <HoneycombCluster
          key={`cluster-${i}`}
          x={cluster.x}
          y={cluster.y}
          size={cluster.size}
          opacity={cluster.opacity}
          rotation={cluster.rotation}
          pattern={cluster.pattern}
        />
      ))}

      {/* individual hexagons */}
      {singles.map((hex, i) => (
        <SingleHexagon
          key={`single-${i}`}
          x={hex.x}
          y={hex.y}
          size={hex.size}
          opacity={hex.opacity}
          rotation={hex.rotation}
        />
      ))}
    </svg>
  );
}
