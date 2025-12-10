export interface EventsClusterConfig {
  x: string;
  y: string;
  size: number;
  opacity: number;
  rotation: number;
  pattern: number[][];
}

export interface EventsSingleHexConfig {
  x: string;
  y: string;
  size: number;
  opacity: number;
  rotation: number;
}

export const eventsClusters: EventsClusterConfig[] = [
  // Top-left area
  {
    x: '3%',
    y: '5%',
    size: 20,
    opacity: 0.04,
    rotation: -8,
    pattern: [
      [0, 1, 1],
      [1, 1, 1],
      [0, 1, 0],
    ],
  },
  // Top-right area
  {
    x: '85%',
    y: '8%',
    size: 18,
    opacity: 0.035,
    rotation: 12,
    pattern: [
      [1, 1],
      [1, 1],
      [0, 1],
    ],
  },
  // Left side mid-upper
  {
    x: '2%',
    y: '25%',
    size: 22,
    opacity: 0.04,
    rotation: 5,
    pattern: [
      [0, 1, 1, 0],
      [1, 1, 1, 1],
      [0, 1, 1, 0],
    ],
  },
  // Right side mid
  {
    x: '90%',
    y: '35%',
    size: 16,
    opacity: 0.03,
    rotation: -10,
    pattern: [
      [1, 1, 0],
      [0, 1, 1],
      [1, 1, 0],
    ],
  },
  // Left side lower
  {
    x: '5%',
    y: '55%',
    size: 18,
    opacity: 0.035,
    rotation: -5,
    pattern: [
      [1, 1],
      [1, 1],
    ],
  },
  // Right side lower
  {
    x: '88%',
    y: '60%',
    size: 20,
    opacity: 0.04,
    rotation: 8,
    pattern: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 1, 1],
    ],
  },
  // Bottom-left
  {
    x: '3%',
    y: '80%',
    size: 16,
    opacity: 0.03,
    rotation: 15,
    pattern: [
      [1, 1, 0],
      [1, 1, 1],
      [0, 1, 0],
    ],
  },
  // Bottom-right
  {
    x: '92%',
    y: '85%',
    size: 18,
    opacity: 0.035,
    rotation: -12,
    pattern: [
      [0, 1],
      [1, 1],
      [1, 0],
    ],
  },
];

// Individual hexagons
export const eventsSingles: EventsSingleHexConfig[] = [
  // Left edge scattered
  { x: '1%', y: '15%', size: 14, opacity: 0.03, rotation: 10 },
  { x: '4%', y: '40%', size: 16, opacity: 0.025, rotation: -15 },
  { x: '2%', y: '70%', size: 12, opacity: 0.03, rotation: 8 },

  // Right edge scattered
  { x: '95%', y: '20%', size: 14, opacity: 0.03, rotation: -8 },
  { x: '93%', y: '48%', size: 18, opacity: 0.025, rotation: 12 },
  { x: '96%', y: '75%', size: 14, opacity: 0.03, rotation: -5 },

  // Sparse center-area hexagons (very subtle)
  { x: '15%', y: '12%', size: 12, opacity: 0.02, rotation: 5 },
  { x: '80%', y: '30%', size: 10, opacity: 0.02, rotation: -10 },
  { x: '12%', y: '65%', size: 14, opacity: 0.02, rotation: 15 },
  { x: '85%', y: '70%', size: 12, opacity: 0.02, rotation: -8 },
];
