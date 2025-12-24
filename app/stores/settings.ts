import { defineStore } from 'pinia';

export interface SettingsState {
  highContrast: boolean;
  dayMode: boolean; // true = diurno (claro), false = noturno (escuro)
  sessionCount: number;
  proPin: string;
}

const SETTINGS_STORAGE_KEY = 'settings-store';
const PRO_PIN_STORAGE_KEY = 'pro-pin';

function loadFromStorage(): Partial<SettingsState> {
  if (typeof window === 'undefined') return {};
  try {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
    const pinStored = localStorage.getItem(PRO_PIN_STORAGE_KEY);
    const settings = stored ? JSON.parse(stored) : {};
    const pin = pinStored ? atob(pinStored) : '1234';
    return {
      ...settings,
      proPin: pin
    };
  } catch {
    return { proPin: '1234' };
  }
}

function saveToStorage(state: SettingsState) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify({
      highContrast: state.highContrast,
      dayMode: state.dayMode,
      sessionCount: state.sessionCount
    }));
    localStorage.setItem(PRO_PIN_STORAGE_KEY, btoa(state.proPin));
  } catch {
    // Ignore storage errors
  }
}

export const useSettingsStore = defineStore('settings', {
  state: (): SettingsState => {
    const stored = loadFromStorage();
    return {
      highContrast: stored.highContrast ?? false,
      dayMode: stored.dayMode ?? true, // Padrão: diurno (claro)
      sessionCount: stored.sessionCount ?? 0,
      proPin: stored.proPin ?? '1234'
    };
  },

  actions: {
    setHighContrast(enabled: boolean) {
      this.highContrast = enabled;
      saveToStorage(this.$state);
      if (typeof document !== 'undefined') {
        document.documentElement.classList.toggle('high-contrast', enabled);
      }
    },

    setDayMode(enabled: boolean) {
      this.dayMode = enabled;
      saveToStorage(this.$state);
      if (typeof document !== 'undefined') {
        document.documentElement.classList.toggle('day-mode', enabled);
        document.documentElement.classList.toggle('night-mode', !enabled);
      }
    },

    incrementSessionCount() {
      this.sessionCount++;
      saveToStorage(this.$state);
    },

    setProPin(pin: string) {
      if (pin.length === 4 && /^\d{4}$/.test(pin)) {
        this.proPin = pin;
        saveToStorage(this.$state);
      }
    },

    verifyProPin(pin: string): boolean {
      return pin === this.proPin;
    }
  }
});

