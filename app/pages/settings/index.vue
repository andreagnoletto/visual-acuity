<template>
  <div class="settings-page">
    <h2 class="settings-title">Configurações</h2>

    <div class="settings-content">
      <div class="setting-group">
        <label class="setting-label">Fator de Correção</label>
        <div class="slider-container">
          <button
            ref="decreaseFactorRef"
            class="slider-button"
            @click="decreaseFactor"
            @keydown="handleSliderKeyDown($event, 'decrease')"
          >
            ←
          </button>
          <div class="slider-value">{{ correctionFactor.toFixed(2) }}</div>
          <button
            ref="increaseFactorRef"
            class="slider-button"
            @click="increaseFactor"
            @keydown="handleSliderKeyDown($event, 'increase')"
          >
            →
          </button>
        </div>
        <p class="setting-hint">Ajuste fino do tamanho dos optótipos (0.90 - 1.10)</p>
      </div>

      <div class="setting-group">
        <label class="setting-label">Modo Diurno</label>
        <button
          ref="dayModeToggleRef"
          class="toggle-button"
          :class="{ active: dayMode }"
          @click="toggleDayMode"
          @keydown="handleDayModeKeyDown"
        >
          {{ dayMode ? 'DIURNO' : 'NOTURNO' }}
        </button>
        <p class="setting-hint">Alterna entre tema claro (diurno) e escuro (noturno)</p>
      </div>

      <div class="setting-group">
        <label class="setting-label">Alto Contraste</label>
        <button
          ref="contrastToggleRef"
          class="toggle-button"
          :class="{ active: highContrast }"
          @click="toggleContrast"
          @keydown="handleToggleKeyDown"
        >
          {{ highContrast ? 'ON' : 'OFF' }}
        </button>
        <p class="setting-hint">Aumenta o contraste para melhor visibilidade</p>
      </div>

      <div class="setting-group">
        <button
          ref="recalibrateRef"
          class="action-button"
          @click="recalibrate"
          @keydown="handleActionKeyDown"
        >
          Refazer Calibração
        </button>
        <p class="setting-hint">Redefine distância e calibração da tela</p>
      </div>

      <div class="setting-group">
        <button
          ref="proModeRef"
          class="action-button pro"
          @click="goToPro"
          @keydown="handleProKeyDown"
        >
          Modo Pro
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { correctionFactor, setCorrectionFactor, resetCalibration } = useCalibration();
const { highContrast, dayMode, setHighContrast, setDayMode } = useSettings();

const decreaseFactorRef = ref<HTMLButtonElement>();
const increaseFactorRef = ref<HTMLButtonElement>();
const dayModeToggleRef = ref<HTMLButtonElement>();
const contrastToggleRef = ref<HTMLButtonElement>();
const recalibrateRef = ref<HTMLButtonElement>();
const proModeRef = ref<HTMLButtonElement>();

const { normalizeRemoteKey } = useRemoteNavigation({
  restoreFocus: true
});

const currentIndex = ref(0);
const controlRefs = computed(() => [
  decreaseFactorRef.value,
  increaseFactorRef.value,
  dayModeToggleRef.value,
  contrastToggleRef.value,
  recalibrateRef.value,
  proModeRef.value
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
  if (decreaseFactorRef.value) {
    decreaseFactorRef.value.focus();
  }
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
  background-color: var(--button-bg);
  border-radius: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  border: 1px solid var(--border-color);
}

.setting-label {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
}

.setting-hint {
  font-size: 0.875rem;
  color: var(--text-secondary);
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
  padding: 1rem 1.5rem;
  background-color: var(--button-bg);
  border: 3px solid transparent;
  border-radius: 0.75rem;
  color: var(--text-primary);
  font-size: 1.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  outline: none;
  min-width: 80px;
}

.slider-button:focus-visible {
  outline: 4px solid var(--accent);
  outline-offset: 2px;
  transform: scale(1.05);
  background-color: var(--button-active-bg);
  border-color: var(--accent);
  box-shadow: 0 0 20px var(--accent);
}

.slider-value {
  min-width: 80px;
  text-align: center;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--accent);
}

.toggle-button {
  padding: 1rem 2rem;
  background-color: var(--button-bg);
  border: 3px solid transparent;
  border-radius: 0.75rem;
  color: var(--text-primary);
  font-size: 1.25rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  outline: none;
  align-self: flex-start;
}

.toggle-button.active {
  background-color: var(--button-active-bg);
  border-color: var(--accent);
}

.toggle-button:focus-visible {
  outline: 4px solid var(--accent);
  outline-offset: 2px;
  transform: scale(1.05);
  background-color: var(--button-active-bg);
  border-color: var(--accent);
  box-shadow: 0 0 20px var(--accent);
}

.action-button {
  padding: 1.25rem 2rem;
  background-color: var(--button-bg);
  border: 3px solid transparent;
  border-radius: 0.75rem;
  color: var(--text-primary);
  font-size: 1.125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  outline: none;
  align-self: flex-start;
}

.action-button.pro {
  background-color: rgba(255, 193, 7, 0.2);
  border-color: #ffc107;
}

.action-button:focus-visible {
  outline: 4px solid var(--accent);
  outline-offset: 2px;
  transform: scale(1.05);
  background-color: var(--button-active-bg);
  border-color: var(--accent);
  box-shadow: 0 0 20px var(--accent);
}
</style>
