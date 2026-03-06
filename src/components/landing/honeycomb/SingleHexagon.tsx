interface SingleHexagonProps {
  x: number;
  y: number;
  size: number;
  opacity: number;
  rotation?: number;
}

export default function SingleHexagon({
  x,
  y,
  size,
  opacity,
  rotation = 0,
}: SingleHexagonProps) {
  const points: string[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    const px = Math.round(size * Math.cos(angle) * 100) / 100;
    const py = Math.round(size * Math.sin(angle) * 100) / 100;
    points.push(`${px},${py}`);
  }

  return (
    <polygon
      points={points.join(' ')}
      fill='none'
      stroke='#E4DD3B'
      strokeWidth='1'
      opacity={opacity}
      transform={`translate(${x}, ${y}) rotate(${rotation})`}
    />
  );
}
