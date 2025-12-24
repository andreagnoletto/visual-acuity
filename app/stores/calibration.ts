import { defineStore } from 'pinia';

export interface CalibrationState {
  distance: number | null;
  pxPerCm: number | null;
  correctionFactor: number;
  proModeEnabled: boolean;
  calibrationLocked: boolean;
}

const STORAGE_KEY = 'calibration-store';

function loadFromStorage(): Partial<CalibrationState> {
  if (typeof window === 'undefined') return {};
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function saveToStorage(state: CalibrationState) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      distance: state.distance,
      pxPerCm: state.pxPerCm,
      correctionFactor: state.correctionFactor,
      proModeEnabled: state.proModeEnabled,
      calibrationLocked: state.calibrationLocked
    }));
  } catch {
    // Ignore storage errors
  }
}

export const useCalibrationStore = defineStore('calibration', {
  state: (): CalibrationState => {
    const stored = loadFromStorage();
    return {
      // Valores padrão para funcionar sem calibração inicial
      // distance: 3m (padrão), pxPerCm: ~37.8 (TV 55" a ~3m)
      distance: stored.distance ?? 3,
      pxPerCm: stored.pxPerCm ?? 37.8,
      correctionFactor: stored.correctionFactor ?? 1.0,
      proModeEnabled: stored.proModeEnabled ?? false,
      calibrationLocked: stored.calibrationLocked ?? false
    };
  },

  getters: {
    isCalibrationReady(): boolean {
      // Sempre pronto com valores padrão
      return this.distance > 0 && this.pxPerCm > 0;
    }
  },

  actions: {
    setDistance(distance: number) {
      this.distance = distance;
      saveToStorage(this.$state);
    },

    setPxPerCm(pxPerCm: number) {
      this.pxPerCm = pxPerCm;
      saveToStorage(this.$state);
    },

    setCorrectionFactor(factor: number) {
      if (factor >= 0.90 && factor <= 1.10) {
        this.correctionFactor = factor;
        saveToStorage(this.$state);
      }
    },

    setProMode(enabled: boolean) {
      this.proModeEnabled = enabled;
      saveToStorage(this.$state);
    },

    setCalibrationLocked(locked: boolean) {
      this.calibrationLocked = locked;
      saveToStorage(this.$state);
    },

    resetCalibration() {
      this.distance = null;
      this.pxPerCm = null;
      this.correctionFactor = 1.0;
      saveToStorage(this.$state);
    }
  }
});

