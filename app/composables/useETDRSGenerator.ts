import { ETDRS_LINES, getETDRSLineByIndex, type ETDRSLine } from '~/domain/vision/etdrs';
import { calculateSizeForSnellenRatio, type SizeCalculationParams } from '~/domain/vision/sizing';
import { parseSnellenRatio } from '~/domain/vision/lines';

export interface ETDRSOptotypeLine {
  lineIndex: number;
  lineNumber: number;
  snellenRatio: string;
  logMAR: number;
  fontSizePx: number;
}

export function useETDRSGenerator() {
  const { distance, pxPerCm, correctionFactor } = useCalibration();

  const generateETDRSLines = (): ETDRSOptotypeLine[] => {
    if (!distance.value || !pxPerCm.value) {
      return [];
    }

    const params: SizeCalculationParams = {
      distanceMeters: distance.value,
      pxPerCm: pxPerCm.value,
      correctionFactor: correctionFactor.value
    };

    return ETDRS_LINES.map((etdrsLine, index) => {
      const snellenValue = parseSnellenRatio(etdrsLine.snellenRatio);
      const sizeResult = calculateSizeForSnellenRatio(snellenValue, params);

      return {
        lineIndex: index,
        lineNumber: etdrsLine.lineNumber,
        snellenRatio: etdrsLine.snellenRatio,
        logMAR: etdrsLine.logMAR,
        fontSizePx: sizeResult.fontSizePx
      };
    });
  };

  const getLine = (index: number): ETDRSOptotypeLine | null => {
    const lines = generateETDRSLines();
    return lines[index] || null;
  };

  /**
   * ETDRS always uses exactly 5 optotypes per line
   */
  const calculateOptotypesPerLine = (): number => {
    return 5;
  };

  /**
   * Calcula quantas linhas mostrar simultaneamente baseado no tamanho dos caracteres.
   * Quando os caracteres são pequenos, mostra mais linhas (até 5).
   */
  const calculateVisibleLinesCount = (
    fontSizePx: number,
    windowHeight: number
  ): number => {
    const availableHeight = windowHeight - 300;
    const lineHeight = fontSizePx * 1.5;
    
    if (fontSizePx > 100) {
      return 1;
    }
    
    if (fontSizePx > 50) {
      const maxLines = Math.floor(availableHeight / lineHeight);
      return Math.max(1, Math.min(maxLines, 3));
    }
    
    const maxLines = Math.floor(availableHeight / lineHeight);
    return Math.max(1, Math.min(maxLines, 5));
  };

  return {
    generateETDRSLines,
    getLine,
    calculateOptotypesPerLine,
    calculateVisibleLinesCount
  };
}

