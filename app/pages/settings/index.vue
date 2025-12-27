<template>
  <v-container class="settings-page" fluid>
    <v-card variant="outlined">
      <v-card-title class="settings-title">Configurações</v-card-title>

      <v-card-text class="settings-content">
        <v-card class="setting-group" variant="tonal">
          <v-card-title class="setting-label">Fator de Correção</v-card-title>
          <v-card-text>
            <div class="slider-container">
              <v-btn
                ref="decreaseFactorRef"
                class="slider-button"
                variant="tonal"
                color="secondary"
                @click="decreaseFactor"
                @keydown="handleSliderKeyDown($event, 'decrease')"
              >
                ←
              </v-btn>
              <div class="slider-value">{{ correctionFactor.toFixed(2) }}</div>
              <v-btn
                ref="increaseFactorRef"
                class="slider-button"
                variant="tonal"
                color="secondary"
                @click="increaseFactor"
                @keydown="handleSliderKeyDown($event, 'increase')"
              >
                →
              </v-btn>
            </div>
            <v-slider
              v-model="sliderValue"
              class="correction-slider"
              min="0.9"
              max="1.1"
              step="0.01"
              hide-details
              thumb-label
            />
            <p class="setting-hint">Ajuste fino do tamanho dos optótipos (0.90 - 1.10)</p>
          </v-card-text>
        </v-card>

        <v-card class="setting-group" variant="tonal">
          <v-card-title class="setting-label">Modo Diurno</v-card-title>
          <v-card-text>
            <v-btn
              ref="dayModeToggleRef"
              class="toggle-button"
              :color="dayMode ? 'primary' : 'secondary'"
              :variant="dayMode ? 'elevated' : 'tonal'"
              @click="toggleDayMode"
              @keydown="handleDayModeKeyDown"
            >
              {{ dayMode ? 'DIURNO' : 'NOTURNO' }}
            </v-btn>
            <p class="setting-hint">Alterna entre tema claro (diurno) e escuro (noturno)</p>
          </v-card-text>
        </v-card>

        <v-card class="setting-group" variant="tonal">
          <v-card-title class="setting-label">Alto Contraste</v-card-title>
          <v-card-text>
            <v-btn
              ref="contrastToggleRef"
              class="toggle-button"
              :color="highContrast ? 'primary' : 'secondary'"
              :variant="highContrast ? 'elevated' : 'tonal'"
              @click="toggleContrast"
              @keydown="handleToggleKeyDown"
            >
              {{ highContrast ? 'ON' : 'OFF' }}
            </v-btn>
            <p class="setting-hint">Aumenta o contraste para melhor visibilidade</p>
          </v-card-text>
        </v-card>

        <v-card class="setting-group" variant="tonal">
          <v-card-text>
            <v-btn
              ref="recalibrateRef"
              class="action-button"
              color="primary"
              variant="tonal"
              @click="recalibrate"
              @keydown="handleActionKeyDown"
            >
              Refazer Calibração
            </v-btn>
            <p class="setting-hint">Redefine distância e calibração da tela</p>
          </v-card-text>
        </v-card>

        <v-card class="setting-group" variant="tonal">
          <v-card-text>
            <v-btn
              ref="proModeRef"
              class="action-button pro"
              color="warning"
              variant="tonal"
              @click="goToPro"
              @keydown="handleProKeyDown"
            >
              Modo Pro
            </v-btn>
          </v-card-text>
        </v-card>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
const { correctionFactor, setCorrectionFactor, resetCalibration } = useCalibration();
const { highContrast, dayMode, setHighContrast, setDayMode } = useSettings();

const decreaseFactorRef = ref<unknown>(null);
const increaseFactorRef = ref<unknown>(null);
const dayModeToggleRef = ref<unknown>(null);
const contrastToggleRef = ref<unknown>(null);
const recalibrateRef = ref<unknown>(null);
const proModeRef = ref<unknown>(null);

const { normalizeRemoteKey } = useRemoteNavigation({
  restoreFocus: true
});

const currentIndex = ref(0);
const resolveElement = (target: unknown): HTMLElement | null => {
  if (!target) return null;
  if (target instanceof HTMLElement) return target;
  return (target as { $el?: HTMLElement }).$el ?? null;
};

const controlRefs = computed(() => [
  resolveElement(decreaseFactorRef.value),
  resolveElement(increaseFactorRef.value),
  resolveElement(dayModeToggleRef.value),
  resolveElement(contrastToggleRef.value),
  resolveElement(recalibrateRef.value),
  resolveElement(proModeRef.value)
].filter(Boolean) as HTMLElement[]);

const sliderValue = computed({
  get: () => correctionFactor.value,
  set: (value: number) => setCorrectionFactor(value)
});

const updateTabindex = () => {
  controlRefs.value.forEach((item, index) => {
    if (item) {
      item.tabIndex = index === currentIndex.value ? 0 : -1;
    }
  });
};

const decreaseFactor = () => {
  const newValue = Math.max(0.90, correctionFactor.value - 0.01);
  setCorrectionFactor(newValue);
};

const increaseFactor = () => {
  const newValue = Math.min(1.10, correctionFactor.value + 0.01);
  setCorrectionFactor(newValue);
};

const toggleDayMode = () => {
  setDayMode(!dayMode.value);
};

const toggleContrast = () => {
  setHighContrast(!highContrast.value);
};

const recalibrate = () => {
  if (confirm('Tem certeza que deseja refazer a calibração? Isso irá resetar distância e calibração da tela.')) {
    resetCalibration();
    navigateTo('/setup/distance');
  }
};

const goToPro = () => {
  navigateTo('/settings/pro');
};

const handleSliderKeyDown = (event: KeyboardEvent, direction: 'decrease' | 'increase') => {
  const action = normalizeRemoteKey(event);
  
  if (action === 'LEFT' || action === 'RIGHT') {
    event.preventDefault();
    if (action === 'LEFT') {
      decreaseFactor();
    } else {
      increaseFactor();
    }
  } else if (action === 'UP' || action === 'DOWN') {
    event.preventDefault();
    const sliderIndex = direction === 'decrease' ? 0 : 1;
    let newIndex = sliderIndex;
    if (action === 'DOWN') {
      newIndex = Math.min(controlRefs.value.length - 1, sliderIndex + 1);
    } else if (action === 'UP') {
      newIndex = Math.max(0, sliderIndex - 1);
    }
    currentIndex.value = newIndex;
    updateTabindex();
    controlRefs.value[newIndex]?.focus();
  } else if (action === 'OK') {
    event.preventDefault();
    if (direction === 'decrease') {
      decreaseFactor();
    } else {
      increaseFactor();
    }
  }
};

const handleDayModeKeyDown = (event: KeyboardEvent) => {
  const action = normalizeRemoteKey(event);
  if (action === 'OK') {
    event.preventDefault();
    toggleDayMode();
  } else if (action === 'UP' || action === 'DOWN') {
    event.preventDefault();
    const toggleIndex = 2;
    let newIndex = toggleIndex;
    if (action === 'DOWN') {
      newIndex = Math.min(controlRefs.value.length - 1, toggleIndex + 1);
    } else {
      newIndex = Math.max(0, toggleIndex - 1);
    }
    currentIndex.value = newIndex;
    updateTabindex();
    controlRefs.value[newIndex]?.focus();
  }
};

const handleToggleKeyDown = (event: KeyboardEvent) => {
  const action = normalizeRemoteKey(event);
  if (action === 'OK') {
    event.preventDefault();
    toggleContrast();
  } else if (action === 'UP' || action === 'DOWN') {
    event.preventDefault();
    const toggleIndex = 3;
    let newIndex = toggleIndex;
    if (action === 'DOWN') {
      newIndex = Math.min(controlRefs.value.length - 1, toggleIndex + 1);
    } else {
      newIndex = Math.max(0, toggleIndex - 1);
    }
    currentIndex.value = newIndex;
    updateTabindex();
    controlRefs.value[newIndex]?.focus();
  }
};

const handleActionKeyDown = (event: KeyboardEvent) => {
  const action = normalizeRemoteKey(event);
  if (action === 'OK') {
    event.preventDefault();
    recalibrate();
  } else if (action === 'UP' || action === 'DOWN') {
    event.preventDefault();
    const actionIndex = 4;
    let newIndex = actionIndex;
    if (action === 'DOWN') {
      newIndex = Math.min(controlRefs.value.length - 1, actionIndex + 1);
    } else {
      newIndex = Math.max(0, actionIndex - 1);
    }
    currentIndex.value = newIndex;
    updateTabindex();
    controlRefs.value[newIndex]?.focus();
  }
};

const handleProKeyDown = (event: KeyboardEvent) => {
  const action = normalizeRemoteKey(event);
  if (action === 'OK') {
    event.preventDefault();
    goToPro();
  } else if (action === 'UP') {
    event.preventDefault();
    currentIndex.value = 3;
    updateTabindex();
    recalibrateRef.value?.focus();
  }
};

useRemoteNavigation({
  onAction: (action) => {
    if (action === 'BACK') {
      navigateTo('/');
      return false;
    }
  }
});

onMounted(() => {
  updateTabindex();
  resolveElement(decreaseFactorRef.value)?.focus();
});

onBeforeUnmount(() => {
  updateTabindex();
});
</script>

<style scoped>
.settings-page {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.settings-title {
  font-size: 2rem;
  margin-bottom: 2rem;
  text-align: center;
  color: var(--text-primary);
}

.settings-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.setting-group {
  padding: 1.5rem;
}

.setting-label {
  font-size: 1.125rem;
  font-weight: 600;
}

.setting-hint {
  font-size: 0.875rem;
  margin: 0;
  opacity: 0.7;
}

.slider-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
}

.slider-button {
  font-size: 1.5rem;
  font-weight: 600;
  min-width: 80px;
}

.slider-value {
  min-width: 80px;
  text-align: center;
  font-size: 1.5rem;
  font-weight: 600;
  color: rgb(var(--v-theme-primary));
}

.toggle-button {
  font-size: 1.25rem;
  font-weight: 600;
  align-self: flex-start;
}

.action-button {
  font-size: 1.125rem;
  font-weight: 600;
  align-self: flex-start;
}

.correction-slider {
  margin: 1rem 0;
}
</style>
