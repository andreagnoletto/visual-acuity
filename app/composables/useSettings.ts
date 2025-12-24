import { useSettingsStore } from '~/stores/settings';

export function useSettings() {
  const store = useSettingsStore();

  return {
    highContrast: computed(() => store.highContrast),
    dayMode: computed(() => store.dayMode),
    sessionCount: computed(() => store.sessionCount),
    proPin: computed(() => store.proPin),
    setHighContrast: store.setHighContrast.bind(store),
    setDayMode: store.setDayMode.bind(store),
    incrementSessionCount: store.incrementSessionCount.bind(store),
    setProPin: store.setProPin.bind(store),
    verifyProPin: store.verifyProPin.bind(store)
  };
}

