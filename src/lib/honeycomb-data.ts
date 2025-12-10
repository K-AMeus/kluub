export interface ClusterConfig {
  x: number;
  y: number;
  size: number;
  opacity: number;
  rotation: number;
  pattern: number[][];
}

export interface SingleHexConfig {
  x: number;
  y: number;
  size: number;
  opacity: number;
  rotation: number;
}

export const clusters: ClusterConfig[] = [
  // Top-left: Large organic cluster
  {
    x: 30,
    y: 40,
    size: 22,
    opacity: 0.055,
    rotation: -5,
    pattern: [
      [0, 1, 1, 0],
      [1, 1, 1, 1],
      [0, 1, 1, 0],
      [0, 0, 1, 0],
    ],
  },
  // Top-right: Medium cluster
  {
    x: 1050,
    y: 60,
    size: 20,
    opacity: 0.05,
    rotation: 8,
    pattern: [
      [1, 1, 0],
      [1, 1, 1],
      [0, 1, 1],
    ],
  },
  // Middle-left: Small tight cluster
  {
    x: 50,
    y: 320,
    size: 18,
    opacity: 0.05,
    rotation: -8,
    pattern: [
      [1, 1],
      [1, 1],
      [0, 1],
    ],
  },
  // Right side: Large cluster
  {
    x: 1180,
    y: 200,
    size: 20,
    opacity: 0.045,
    rotation: -5,
    pattern: [
      [0, 1, 1],
      [1, 1, 1],
      [1, 1, 0],
      [0, 1, 0],
    ],
  },
  // Far right: Medium cluster
  {
    x: 1300,
    y: 350,
    size: 18,
    opacity: 0.04,
    rotation: 12,
    pattern: [
      [1, 1, 0],
      [1, 1, 1],
      [0, 1, 0],
    ],
  },
  // Bottom-left: Large sprawling cluster
  {
    x: 80,
    y: 520,
    size: 24,
    opacity: 0.05,
    rotation: 5,
    pattern: [
      [0, 1, 1, 1],
      [1, 1, 1, 0],
      [1, 1, 0, 0],
    ],
  },
  // Bottom-right: Organic cluster
  {
    x: 1100,
    y: 500,
    size: 22,
    opacity: 0.05,
    rotation: -10,
    pattern: [
      [0, 1, 1],
      [1, 1, 1],
      [1, 1, 0],
    ],
  },
  // Right edge: Small cluster
  {
    x: 1350,
    y: 150,
    size: 16,
    opacity: 0.04,
    rotation: 5,
    pattern: [
      [1, 1],
      [1, 1],
    ],
  },
  // Bottom-middle: Medium cluster
  {
    x: 550,
    y: 550,
    size: 20,
    opacity: 0.045,
    rotation: 6,
    pattern: [
      [1, 1, 0],
      [1, 1, 1],
      [0, 1, 0],
    ],
  },
  // Right middle area
  {
    x: 1250,
    y: 550,
    size: 18,
    opacity: 0.04,
    rotation: -8,
    pattern: [
      [1, 1],
      [0, 1],
      [1, 1],
    ],
  },
];

// individual scattered hexagons
export const singles: SingleHexConfig[] = [
  { x: 280, y: 100, size: 18, opacity: 0.04, rotation: 15 },
  { x: 380, y: 180, size: 14, opacity: 0.035, rotation: -10 },
  { x: 700, y: 120, size: 20, opacity: 0.04, rotation: 5 },
  { x: 850, y: 200, size: 16, opacity: 0.035, rotation: -8 },
  { x: 250, y: 420, size: 18, opacity: 0.04, rotation: 12 },
  { x: 350, y: 350, size: 14, opacity: 0.03, rotation: -5 },
  { x: 780, y: 400, size: 20, opacity: 0.04, rotation: 8 },
  { x: 950, y: 320, size: 16, opacity: 0.035, rotation: -15 },
  { x: 1380, y: 280, size: 18, opacity: 0.04, rotation: 10 },
  { x: 1320, y: 450, size: 16, opacity: 0.035, rotation: -6 },
  { x: 400, y: 580, size: 20, opacity: 0.04, rotation: 3 },
  { x: 850, y: 550, size: 16, opacity: 0.035, rotation: -12 },
  { x: 1400, y: 500, size: 14, opacity: 0.03, rotation: 8 },
  { x: 950, y: 150, size: 18, opacity: 0.04, rotation: -5 },
];
