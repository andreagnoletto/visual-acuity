import { describe, it, expect } from 'vitest';
import {
  calculateOptotypeSize,
  calculateSizeForSnellenRatio,
  mmToPx,
  pxToMm,
  type SizeCalculationParams
} from '~/domain/vision/sizing';
import { validateDistance, validatePxPerCm } from '~/domain/vision/validation';
import { VISION_LINES, parseSnellenRatio, getLineByIndex } from '~/domain/vision/lines';

describe('Vision Sizing', () => {
  const baseParams: SizeCalculationParams = {
    distanceMeters: 3,
    pxPerCm: 37.8,
    correctionFactor: 1.0
  };

  describe('calculateOptotypeSize', () => {
    it('should calculate correct size for base parameters', () => {
      const result = calculateOptotypeSize(baseParams);
      
      expect(result.heightMm).toBeGreaterThan(0);
      expect(result.heightPx).toBeGreaterThan(0);
      expect(result.fontSizePx).toBeGreaterThan(0);
      expect(result.fontSizePx).toBeGreaterThan(result.heightPx);
    });

    it('should increase size with distance', () => {
      const close = calculateOptotypeSize({ ...baseParams, distanceMeters: 3 });
      const far = calculateOptotypeSize({ ...baseParams, distanceMeters: 6 });
      
      expect(far.heightMm).toBeGreaterThan(close.heightMm);
      expect(far.fontSizePx).toBeGreaterThan(close.fontSizePx);
    });

    it('should apply correction factor', () => {
      const normal = calculateOptotypeSize({ ...baseParams, correctionFactor: 1.0 });
      const increased = calculateOptotypeSize({ ...baseParams, correctionFactor: 1.1 });
      
      expect(increased.fontSizePx).toBeGreaterThan(normal.fontSizePx);
    });

    it('should scale with pxPerCm', () => {
      const low = calculateOptotypeSize({ ...baseParams, pxPerCm: 20 });
      const high = calculateOptotypeSize({ ...baseParams, pxPerCm: 50 });
      
      expect(high.heightPx).toBeGreaterThan(low.heightPx);
      expect(high.fontSizePx).toBeGreaterThan(low.fontSizePx);
    });
  });

  describe('calculateSizeForSnellenRatio', () => {
    it('should calculate smaller size for worse vision', () => {
      const base = calculateOptotypeSize(baseParams);
      const worse = calculateSizeForSnellenRatio(20 / 200, baseParams);
      
      expect(worse.fontSizePx).toBeGreaterThan(base.fontSizePx);
    });

    it('should calculate correct size for 20/20', () => {
      const base = calculateOptotypeSize(baseParams);
      const normal = calculateSizeForSnellenRatio(20 / 20, baseParams);
      
      expect(normal.fontSizePx).toBeCloseTo(base.fontSizePx, 1);
    });
  });

  describe('mmToPx and pxToMm', () => {
    it('should convert mm to px correctly', () => {
      const px = mmToPx(10, 37.8);
      expect(px).toBe(378);
    });

    it('should convert px to mm correctly', () => {
      const mm = pxToMm(378, 37.8);
      expect(mm).toBe(10);
    });

    it('should be inverse operations', () => {
      const originalMm = 85.6;
      const pxPerCm = 37.8;
      const px = mmToPx(originalMm, pxPerCm);
      const backToMm = pxToMm(px, pxPerCm);
      
      expect(backToMm).toBeCloseTo(originalMm, 2);
    });
  });
});

describe('Vision Validation', () => {
  describe('validateDistance', () => {
    it('should warn for distance too close', () => {
      const result = validateDistance(1.5);
      expect(result.valid).toBe(true);
      expect(result.warning).toBeDefined();
      expect(result.warning).toContain('muito próxima');
    });

    it('should warn for distance too far', () => {
      const result = validateDistance(12);
      expect(result.valid).toBe(true);
      expect(result.warning).toBeDefined();
      expect(result.warning).toContain('muito longa');
    });

    it('should not warn for recommended distance', () => {
      const result = validateDistance(4);
      expect(result.valid).toBe(true);
      expect(result.warning).toBeUndefined();
    });
  });

  describe('validatePxPerCm', () => {
    it('should warn for pxPerCm too low', () => {
      const result = validatePxPerCm(5);
      expect(result.valid).toBe(true);
      expect(result.warning).toBeDefined();
      expect(result.warning).toContain('muito baixo');
    });

    it('should warn for pxPerCm too high', () => {
      const result = validatePxPerCm(250);
      expect(result.valid).toBe(true);
      expect(result.warning).toBeDefined();
      expect(result.warning).toContain('muito alto');
    });

    it('should not warn for reasonable pxPerCm', () => {
      const result = validatePxPerCm(37.8);
      expect(result.valid).toBe(true);
      expect(result.warning).toBeUndefined();
    });
  });
});

describe('Vision Lines', () => {
  describe('VISION_LINES', () => {
    it('should have 8 lines', () => {
      expect(VISION_LINES.length).toBe(8);
    });

    it('should have correct structure for each line', () => {
      VISION_LINES.forEach(line => {
        expect(line.snellenRatio).toBeDefined();
        expect(line.logMAR).toBeDefined();
        expect(line.optotypes).toBeDefined();
        expect(Array.isArray(line.optotypes)).toBe(true);
        expect(line.optotypes.length).toBeGreaterThan(0);
      });
    });

    it('should have decreasing logMAR values', () => {
      for (let i = 1; i < VISION_LINES.length; i++) {
        expect(VISION_LINES[i].logMAR).toBeLessThanOrEqual(VISION_LINES[i - 1].logMAR);
      }
    });
  });

  describe('parseSnellenRatio', () => {
    it('should parse valid ratio correctly', () => {
      expect(parseSnellenRatio('20/200')).toBe(0.1);
      expect(parseSnellenRatio('20/20')).toBe(1.0);
    });

    it('should return 0 for invalid ratio', () => {
      expect(parseSnellenRatio('invalid')).toBe(0);
      expect(parseSnellenRatio('20/')).toBe(0);
      expect(parseSnellenRatio('/20')).toBe(0);
    });
  });

  describe('getLineByIndex', () => {
    it('should return correct line for valid index', () => {
      const line = getLineByIndex(0);
      expect(line).toBeDefined();
      expect(line?.snellenRatio).toBe('20/200');
    });

    it('should return null for invalid index', () => {
      expect(getLineByIndex(-1)).toBeNull();
      expect(getLineByIndex(100)).toBeNull();
    });
  });
});

