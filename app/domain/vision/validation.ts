export interface ValidationResult {
  valid: boolean;
  warning?: string;
}

export function validateDistance(distance: number): ValidationResult {
  if (distance < 2) {
    return {
      valid: true,
      warning: 'Distância muito próxima (<2m). Recomendado: 3-6m.'
    };
  }
  if (distance > 10) {
    return {
      valid: true,
      warning: 'Distância muito longa (>10m). Recomendado: 3-6m.'
    };
  }
  return { valid: true };
}

export function validatePxPerCm(pxPerCm: number): ValidationResult {
  if (pxPerCm < 10) {
    return {
      valid: true,
      warning: 'Calibração pode estar incorreta (px/cm muito baixo). Verifique a configuração.'
    };
  }
  if (pxPerCm > 200) {
    return {
      valid: true,
      warning: 'Calibração pode estar incorreta (px/cm muito alto). Verifique a configuração.'
    };
  }
  return { valid: true };
}

