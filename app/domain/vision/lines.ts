export interface VisionLine {
  snellenRatio: string;
  logMAR: number;
  optotypes: string[];
}

export const VISION_LINES: VisionLine[] = [
  {
    snellenRatio: '20/200',
    logMAR: 1.0,
    optotypes: ['C', 'D', 'E', 'F', 'L', 'O', 'P', 'T', 'Z']
  },
  {
    snellenRatio: '20/160',
    logMAR: 0.9,
    optotypes: ['C', 'D', 'E', 'F', 'L', 'O', 'P', 'T', 'Z']
  },
  {
    snellenRatio: '20/125',
    logMAR: 0.8,
    optotypes: ['C', 'D', 'E', 'F', 'L', 'O', 'P', 'T', 'Z']
  },
  {
    snellenRatio: '20/100',
    logMAR: 0.7,
    optotypes: ['C', 'D', 'E', 'F', 'L', 'O', 'P', 'T', 'Z']
  },
  {
    snellenRatio: '20/80',
    logMAR: 0.6,
    optotypes: ['C', 'D', 'E', 'F', 'L', 'O', 'P', 'T', 'Z']
  },
  {
    snellenRatio: '20/63',
    logMAR: 0.5,
    optotypes: ['C', 'D', 'E', 'F', 'L', 'O', 'P', 'T', 'Z']
  },
  {
    snellenRatio: '20/50',
    logMAR: 0.4,
    optotypes: ['C', 'D', 'E', 'F', 'L', 'O', 'P', 'T', 'Z']
  },
  {
    snellenRatio: '20/40',
    logMAR: 0.3,
    optotypes: ['C', 'D', 'E', 'F', 'L', 'O', 'P', 'T', 'Z']
  },
  {
    snellenRatio: '20/30',
    logMAR: 0.18,
    optotypes: ['C', 'D', 'E', 'F', 'L', 'O', 'P', 'T', 'Z']
  },
  {
    snellenRatio: '20/25',
    logMAR: 0.1,
    optotypes: ['C', 'D', 'E', 'F', 'L', 'O', 'P', 'T', 'Z']
  },
  {
    snellenRatio: '20/20',
    logMAR: 0.0,
    optotypes: ['C', 'D', 'E', 'F', 'L', 'O', 'P', 'T', 'Z']
  },
  {
    snellenRatio: '20/15',
    logMAR: -0.125,
    optotypes: ['C', 'D', 'E', 'F', 'L', 'O', 'P', 'T', 'Z']
  }
];

export function getLineByIndex(index: number): VisionLine | null {
  if (index >= 0 && index < VISION_LINES.length) {
    return VISION_LINES[index];
  }
  return null;
}

export function parseSnellenRatio(ratio: string): number {
  const parts = ratio.split('/');
  if (parts.length === 2) {
    const numerator = parseFloat(parts[0]);
    const denominator = parseFloat(parts[1]);
    if (!isNaN(numerator) && !isNaN(denominator) && denominator > 0) {
      return numerator / denominator;
    }
  }
  return 0;
}

