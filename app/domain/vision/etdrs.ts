/**
 * ETDRS (Early Treatment Diabetic Retinopathy Study) Vision Lines
 * 
 * ETDRS uses:
 * - Sloan letters: C, D, H, K, N, O, R, S, V, Z (10 letters)
 * - Exactly 5 letters per line
 * - Logarithmic progression of 0.1 logMAR per line
 * - Standard distance: 4 meters
 */

export interface ETDRSLine {
  lineNumber: number; // ETDRS line number (1-14)
  logMAR: number;
  snellenRatio: string; // Approximate Snellen equivalent
  optotypes: string[]; // Always 5 letters
}

// ETDRS standard lines with 5 letters each
// Letters are randomly selected from Sloan set: C, D, H, K, N, O, R, S, V, Z
export const ETDRS_LINES: ETDRSLine[] = [
  { lineNumber: 1, logMAR: 1.0, snellenRatio: '20/200', optotypes: ['C', 'D', 'H', 'K', 'N'] },
  { lineNumber: 2, logMAR: 0.9, snellenRatio: '20/160', optotypes: ['O', 'R', 'S', 'V', 'Z'] },
  { lineNumber: 3, logMAR: 0.8, snellenRatio: '20/125', optotypes: ['C', 'D', 'H', 'K', 'N'] },
  { lineNumber: 4, logMAR: 0.7, snellenRatio: '20/100', optotypes: ['O', 'R', 'S', 'V', 'Z'] },
  { lineNumber: 5, logMAR: 0.6, snellenRatio: '20/80', optotypes: ['C', 'D', 'H', 'K', 'N'] },
  { lineNumber: 6, logMAR: 0.5, snellenRatio: '20/63', optotypes: ['O', 'R', 'S', 'V', 'Z'] },
  { lineNumber: 7, logMAR: 0.4, snellenRatio: '20/50', optotypes: ['C', 'D', 'H', 'K', 'N'] },
  { lineNumber: 8, logMAR: 0.3, snellenRatio: '20/40', optotypes: ['O', 'R', 'S', 'V', 'Z'] },
  { lineNumber: 9, logMAR: 0.2, snellenRatio: '20/32', optotypes: ['C', 'D', 'H', 'K', 'N'] },
  { lineNumber: 10, logMAR: 0.1, snellenRatio: '20/25', optotypes: ['O', 'R', 'S', 'V', 'Z'] },
  { lineNumber: 11, logMAR: 0.0, snellenRatio: '20/20', optotypes: ['C', 'D', 'H', 'K', 'N'] },
  { lineNumber: 12, logMAR: -0.1, snellenRatio: '20/16', optotypes: ['O', 'R', 'S', 'V', 'Z'] },
  { lineNumber: 13, logMAR: -0.2, snellenRatio: '20/12.5', optotypes: ['C', 'D', 'H', 'K', 'N'] },
  { lineNumber: 14, logMAR: -0.3, snellenRatio: '20/10', optotypes: ['O', 'R', 'S', 'V', 'Z'] }
];

// Sloan letters used in ETDRS
export const SLOAN_LETTERS = ['C', 'D', 'H', 'K', 'N', 'O', 'R', 'S', 'V', 'Z'];

/**
 * Generate randomized ETDRS line with 5 letters from Sloan set
 */
export function generateETDRSLine(lineIndex: number): string[] {
  const pool = [...SLOAN_LETTERS];
  const result: string[] = [];
  
  // Always return exactly 5 letters, randomly selected
  for (let i = 0; i < 5; i++) {
    const randomIndex = Math.floor(Math.random() * pool.length);
    result.push(pool[randomIndex]!);
  }
  
  return result;
}

/**
 * Get ETDRS line by index
 */
export function getETDRSLineByIndex(index: number): ETDRSLine | null {
  if (index >= 0 && index < ETDRS_LINES.length) {
    return ETDRS_LINES[index];
  }
  return null;
}

