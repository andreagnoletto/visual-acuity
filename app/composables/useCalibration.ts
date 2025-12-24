import { useCalibrationStore } from '~/stores/calibration';
import { validateDistance, validatePxPerCm } from '~/domain/vision/validation';

export function useCalibration() {
  const store = useCalibrationStore();

  const setDistance = (distance: number) => {
    const validation = validateDistance(distance);
    if (validation.valid) {
      store.setDistance(distance);
      return { success: true };
    }
    return { success: false, warning: validation.warning };
  };

  const setPxPerCm = (pxPerCm: number) => {
    const validation = validatePxPerCm(pxPerCm);
    if (validation.valid) {
      store.setPxPerCm(pxPerCm);
      return { success: true };
    }
    return { success: false, warning: validation.warning };
  };

  const setCorrectionFactor = (factor: number) => {
    if (factor >= 0.90 && factor <= 1.10) {
      store.setCorrectionFactor(factor);
      return { success: true };
    }
    return { success: false, warning: 'Fator deve estar entre 0.90 e 1.10' };
  };

  const isCalibrationReady = computed(() => store.isCalibrationReady);

  const resetCalibration = () => {
    store.resetCalibration();
  };

  return {
    distance: computed(() => store.distance),
    pxPerCm: computed(() => store.pxPerCm),
    correctionFactor: computed(() => store.correctionFactor),
    isCalibrationReady,
    setDistance,
    setPxPerCm,
    setCorrectionFactor,
    resetCalibration
  };
}

