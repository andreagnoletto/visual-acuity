export interface SizeCalculationParams {
  distanceMeters: number;
  pxPerCm: number;
  correctionFactor: number;
}

export interface SizeResult {
  heightMm: number;
  heightPx: number;
  fontSizePx: number;
}

const ARCMIN_TO_RAD = (5 / 60) * (Math.PI / 180);

export function calculateOptotypeSize(params: SizeCalculationParams): SizeResult {
  const { distanceMeters, pxPerCm, correctionFactor } = params;

  const heightMm = distanceMeters * Math.tan(ARCMIN_TO_RAD) * 1000;
  const heightPx = heightMm * pxPerCm;
  const fontSizePx = (heightPx * 1.75 * correctionFactor) / 8;

  return {
    heightMm,
    heightPx,
    fontSizePx
  };
}

export function calculateSizeForSnellenRatio(
  snellenValue: number,
  params: SizeCalculationParams
): SizeResult {
  // snellenValue é o resultado de parseSnellenRatio (ex: 20/200 = 0.1)
  // Para 20/200, queremos que o optótipo seja maior (200/20 = 10x)
  // Para 20/20, queremos que seja 1x (20/20 = 1)
  const ratio = 1 / snellenValue;
  
  const baseSize = calculateOptotypeSize(params);
  
  return {
    heightMm: baseSize.heightMm * ratio,
    heightPx: baseSize.heightPx * ratio,
    fontSizePx: baseSize.fontSizePx * ratio
  };
}

export function mmToPx(mm: number, pxPerCm: number): number {
  return mm * pxPerCm;
}

export function pxToMm(px: number, pxPerCm: number): number {
  return px / pxPerCm;
}

