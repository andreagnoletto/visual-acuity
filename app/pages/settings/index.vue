<template>
  <v-container class="settings-page" fluid>
    <v-row justify="center">
      <v-col cols="12" md="10" lg="8">
        <v-card elevation="8">
          <v-card-title class="text-h4 text-center">Configurações</v-card-title>
          <v-card-text class="settings-content">
            <v-card class="setting-group" variant="tonal">
              <v-card-title class="setting-label">Fator de Correção</v-card-title>
              <v-card-text>
                <div class="slider-container">
                  <v-btn
                    ref="decreaseFactorRef"
                    color="secondary"
                    variant="tonal"
                    @click="decreaseFactor"
                    @keydown="handleSliderKeyDown($event, 'decrease')"
                  >
                    <v-icon start>mdi-chevron-left</v-icon>
                    Diminuir
                  </v-btn>
                  <div class="slider-value">{{ correctionFactor.toFixed(2) }}</div>
                  <v-btn
                    ref="increaseFactorRef"
                    color="secondary"
                    variant="tonal"
                    @click="increaseFactor"
                    @keydown="handleSliderKeyDown($event, 'increase')"
                  >
                    Aumentar
                    <v-icon end>mdi-chevron-right</v-icon>
                  </v-btn>
                </div>
                <p class="setting-hint">Ajuste fino do tamanho dos optótipos (0.90 - 1.10)</p>
              </v-card-text>
            </v-card>

            <v-card class="setting-group" variant="tonal">
              <v-card-title class="setting-label">Modo Diurno</v-card-title>
              <v-card-text>
                <v-btn
                  ref="dayModeToggleRef"
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
              <v-card-title class="setting-label">Calibração</v-card-title>
              <v-card-text>
                <v-btn
                  ref="recalibrateRef"
                  color="warning"
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
                  color="warning"
                  variant="elevated"
                  @click="goToPro"
                  @keydown="handleProKeyDown"
                >
                  Modo Pro
                </v-btn>
              </v-card-text>
            </v-card>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
const { correctionFactor, setCorrectionFactor, resetCalibration } = useCalibration();
const { highContrast, dayMode, setHighContrast, setDayMode } = useSettings();

const decreaseFactorRef = ref<any>();
const increaseFactorRef = ref<any>();
const dayModeToggleRef = ref<any>();
const contrastToggleRef = ref<any>();
const recalibrateRef = ref<any>();
const proModeRef = ref<any>();

const { normalizeRemoteKey } = useRemoteNavigation({
  restoreFocus: true
});

const resolveElement = (el: any): HTMLElement | null => {
  return (el?.$el ?? el) as HTMLElement | null;
};

const currentIndex = ref(0);
const controlRefs = computed(() => [
  resolveElement(decreaseFactorRef.value),
  resolveElement(increaseFactorRef.value),
  resolveElement(dayModeToggleRef.value),
  resolveElement(contrastToggleRef.value),
  resolveElement(recalibrateRef.value),
  resolveElement(proModeRef.value)
].filter(Boolean) as HTMLElement[]);

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
    resolveElement(recalibrateRef.value)?.focus();
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
  padding: 2rem;
}

.settings-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.setting-group {
  padding: 1rem;
}

.setting-label {
  font-weight: 600;
}

.setting-hint {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0.5rem 0 0;
}

.slider-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.slider-value {
  min-width: 80px;
  text-align: center;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--accent);
}
</style>
