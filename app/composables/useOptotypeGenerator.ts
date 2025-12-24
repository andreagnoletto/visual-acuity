import { VISION_LINES, getLineByIndex, parseSnellenRatio, type VisionLine } from '~/domain/vision/lines';
import { calculateSizeForSnellenRatio, type SizeCalculationParams } from '~/domain/vision/sizing';

export interface OptotypeLine {
  lineIndex: number;
  snellenRatio: string;
  logMAR: number;
  fontSizePx: number;
  optotypes: string[];
}

export function useOptotypeGenerator() {
  const { distance, pxPerCm, correctionFactor } = useCalibration();

  const generateLines = (): OptotypeLine[] => {
    if (!distance.value || !pxPerCm.value) {
      return [];
    }

    const params: SizeCalculationParams = {
      distanceMeters: distance.value,
      pxPerCm: pxPerCm.value,
      correctionFactor: correctionFactor.value
    };

    return VISION_LINES.map((line, index) => {
      const snellenValue = parseSnellenRatio(line.snellenRatio);
      const sizeResult = calculateSizeForSnellenRatio(snellenValue, params);

      return {
        lineIndex: index,
        snellenRatio: line.snellenRatio,
        logMAR: line.logMAR,
        fontSizePx: sizeResult.fontSizePx,
        optotypes: line.optotypes
      };
    });
  };

  const generateRandomizedOptotypes = (line: VisionLine, count: number = 5): string[] => {
    const pool = [...line.optotypes];
    const result: string[] = [];
    let lastSequence: string[] = [];

    for (let i = 0; i < count; i++) {
      let attempts = 0;
      let optotype: string;
      
      do {
        const randomIndex = Math.floor(Math.random() * pool.length);
        optotype = pool[randomIndex]!;
        attempts++;
      } while (
        attempts < 50 &&
        result.length > 0 &&
        result[result.length - 1] === optotype
      );

      result.push(optotype);
    }

    return result;
  };

  const getLine = (index: number): OptotypeLine | null => {
    const lines = generateLines();
    return lines[index] || null;
  };

  /**
   * Calcula quantas linhas mostrar simultaneamente baseado no tamanho dos caracteres.
   * Quando os caracteres são pequenos, mostra mais linhas (até 5).
   * 
   * @param fontSizePx - Tamanho da fonte em pixels da linha atual
   * @param windowHeight - Altura da janela em pixels
   * @returns Número de linhas a mostrar (1 para grandes, até 5 para pequenas)
   */
  const calculateVisibleLinesCount = (
    fontSizePx: number,
    windowHeight: number
  ): number => {
    // Altura disponível (considerando header, footer, padding)
    const availableHeight = windowHeight - 300; // ~300px para header, footer, padding
    const lineHeight = fontSizePx * 1.5; // Altura aproximada de cada linha (fonte + espaçamento)
    
    // Se os caracteres são muito grandes (mais de 100px), mostrar apenas 1 linha
    if (fontSizePx > 100) {
      return 1;
    }
    
    // Se os caracteres são médios (50-100px), mostrar 2-3 linhas
    if (fontSizePx > 50) {
      const maxLines = Math.floor(availableHeight / lineHeight);
      return Math.max(1, Math.min(maxLines, 3));
    }
    
    // Se os caracteres são pequenos (menos de 50px), mostrar até 5 linhas
    const maxLines = Math.floor(availableHeight / lineHeight);
    return Math.max(1, Math.min(maxLines, 5));
  };

  /**
   * Calcula quantos optótipos cabem em uma linha baseado no tamanho da fonte e largura da tela.
   * Usa a mesma lógica para todos os testes (Snellen, Pediátrico, E, C).
   * 
   * @param fontSizePx - Tamanho da fonte em pixels
   * @param snellenRatio - Ratio Snellen (ex: "20/200")
   * @param windowWidth - Largura da janela em pixels
   * @returns Número de optótipos que cabem na linha
   */
  const calculateOptotypesPerLine = (
    fontSizePx: number,
    snellenRatio: string,
    windowWidth: number
  ): number => {
    // Largura disponível (considerando label à esquerda ~150px, padding ~80px, gap entre optótipos)
    const availableWidth = windowWidth - 150 - 80;
    const gapBetweenOptotypes = 16; // 1rem = 16px
    const optotypeWidth = fontSizePx * 0.8; // Aproximação: optótipos são ~80% da altura em largura
    const minOptotypeWidth = optotypeWidth + gapBetweenOptotypes;

    // Calcular quantos cabem
    const maxFit = Math.max(1, Math.floor(availableWidth / minOptotypeWidth));

    // Regras baseadas na linha
    const ratio = parseSnellenRatio(snellenRatio);
    const isLargeLine = ratio <= 0.2; // 20/200 até 20/100 (0.1 até 0.2)
    
    if (isLargeLine) {
      // Para linhas grandes (20/200 até 20/100): mínimo 2, máximo o que couber (até 5 em telas grandes)
      return Math.max(2, Math.min(maxFit, 5));
    } else {
      // Para linhas menores: preferência 5, mas ajustar se não couber (mínimo 2)
      return Math.max(2, Math.min(maxFit, 5));
    }
  };

  return {
    generateLines,
    generateRandomizedOptotypes,
    getLine,
    calculateOptotypesPerLine,
    calculateVisibleLinesCount
  };
}

