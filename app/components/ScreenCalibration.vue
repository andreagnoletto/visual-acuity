<template>
  <div class="screen-calibration">
    <h2 class="calibration-title">Calibração da Tela</h2>
    <p class="calibration-instruction">
      Coloque um cartão de referência de 85,6mm na tela e ajuste o retângulo com as setas ←→ para corresponder ao tamanho do cartão.
    </p>
    
    <div class="calibration-area">
      <div
        ref="cardRef"
        class="reference-card"
        :style="{ width: cardWidthPx + 'px', height: cardHeightPx + 'px' }"
      >
        <div class="card-label">85,6mm</div>
      </div>
    </div>

    <div class="controls">
      <div class="control-group">
        <label class="control-label">Largura:</label>
        <div class="control-buttons">
          <button
            ref="decreaseRef"
            class="control-button"
            @click="decreaseWidth"
            @keydown="handleControlKeyDown($event, 'decrease')"
          >
            ← Diminuir
          </button>
          <span class="control-value">{{ cardWidthPx.toFixed(1) }}px</span>
          <button
            ref="increaseRef"
            class="control-button"
            @click="increaseWidth"
            @keydown="handleControlKeyDown($event, 'increase')"
          >
            Aumentar →
          </button>
        </div>
      </div>
    </div>

    <div v-if="warning" class="warning-box">
      {{ warning }}
    </div>

    <div class="info-box">
      <p>px/cm calculado: <strong>{{ calculatedPxPerCm.toFixed(2) }}</strong></p>
    </div>

    <div class="actions">
      <button
        ref="confirmRef"
        class="confirm-button"
        @click="confirm"
        @keydown="handleConfirmKeyDown"
      >
        Confirmar Calibração
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  'confirm': [pxPerCm: number];
}>();

const CARD_WIDTH_MM = 85.6;
const CARD_HEIGHT_MM = 85.6;

const cardWidthPx = ref(200);
const cardHeightPx = ref(200);
const warning = ref<string | null>(null);

const cardRef = ref<HTMLElement>();
const decreaseRef = ref<HTMLButtonElement>();
const increaseRef = ref<HTMLButtonElement>();
const confirmRef = ref<HTMLButtonElement>();

const { normalizeRemoteKey, saveFocus, restoreFocus } = useRemoteNavigation({
  restoreFocus: true
});

const currentIndex = ref(0);

const calculatedPxPerCm = computed(() => {
  return cardWidthPx.value / (CARD_WIDTH_MM / 10);
});

const updateTabindex = () => {
  const items = [decreaseRef.value, increaseRef.value, confirmRef.value].filter(Boolean) as HTMLElement[];
  items.forEach((item, index) => {
    if (item) {
      item.tabIndex = index === currentIndex.value ? 0 : -1;
    }
  });
};

const decreaseWidth = () => {
  if (cardWidthPx.value > 50) {
    cardWidthPx.value -= 5;
    cardHeightPx.value = cardWidthPx.value;
    validateCalibration();
  }
};

const increaseWidth = () => {
  if (cardWidthPx.value < 1000) {
    cardWidthPx.value += 5;
    cardHeightPx.value = cardWidthPx.value;
    validateCalibration();
  }
};

const validateCalibration = () => {
  const pxPerCm = calculatedPxPerCm.value;
  const { warning: warn } = useCalibration().setPxPerCm(pxPerCm);
  warning.value = warn || null;
};

const confirm = () => {
  const pxPerCm = calculatedPxPerCm.value;
  const { warning: warn } = useCalibration().setPxPerCm(pxPerCm);
  if (!warn) {
    emit('confirm', pxPerCm);
  } else {
    warning.value = warn;
  }
};

const handleControlKeyDown = (event: KeyboardEvent, action: 'decrease' | 'increase') => {
  const actionKey = normalizeRemoteKey(event);
  
  if (actionKey === 'LEFT' || actionKey === 'RIGHT') {
    event.preventDefault();
    if (actionKey === 'LEFT') {
      decreaseWidth();
    } else {
      increaseWidth();
    }
  } else if (actionKey === 'UP' || actionKey === 'DOWN') {
    event.preventDefault();
    const items = [decreaseRef.value, increaseRef.value, confirmRef.value].filter(Boolean) as HTMLElement[];
    const currentItemIndex = action === 'decrease' ? 0 : 1;
    let newIndex = currentItemIndex;
    
    if (actionKey === 'DOWN') {
      newIndex = 2;
    } else if (actionKey === 'UP') {
      newIndex = currentItemIndex;
    }
    
    currentIndex.value = newIndex;
    updateTabindex();
    items[newIndex]?.focus();
    saveFocus(newIndex);
  } else if (actionKey === 'OK') {
    event.preventDefault();
    if (action === 'decrease') {
      decreaseWidth();
    } else {
      increaseWidth();
    }
  }
};

const handleConfirmKeyDown = (event: KeyboardEvent) => {
  const action = normalizeRemoteKey(event);
  if (action === 'UP') {
    event.preventDefault();
    currentIndex.value = 1;
    updateTabindex();
    increaseRef.value?.focus();
  } else if (action === 'OK') {
    event.preventDefault();
    confirm();
  }
};

onMounted(() => {
  updateTabindex();
  const items = [decreaseRef.value, increaseRef.value, confirmRef.value].filter(Boolean) as HTMLElement[];
  if (!restoreFocus(items)) {
    if (decreaseRef.value) {
      decreaseRef.value.focus();
    }
  } else {
    const savedIndex = items.findIndex(item => item.tabIndex === 0);
    if (savedIndex >= 0) {
      currentIndex.value = savedIndex;
    }
  }
});

onBeforeUnmount(() => {
  const items = [decreaseRef.value, increaseRef.value, confirmRef.value].filter(Boolean) as HTMLElement[];
  const activeIndex = items.findIndex(item => item.tabIndex === 0);
  if (activeIndex >= 0) {
    saveFocus(activeIndex);
  }
});
</script>

<style scoped>
.screen-calibration {
  width: 100%;
  max-width: 800px;
  padding: 2rem;
}

.calibration-title {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  text-align: center;
  color: var(--text-primary);
}

.calibration-instruction {
  font-size: 1rem;
  margin-bottom: 2rem;
  text-align: center;
  color: var(--text-primary);
  opacity: 0.9;
  line-height: 1.5;
}

.calibration-area {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  margin-bottom: 2rem;
  background-color: var(--button-bg);
  border-radius: 1rem;
  padding: 2rem;
  border: 1px solid var(--border-color);
}

.reference-card {
  background-color: var(--bg-primary);
  border: 3px solid var(--accent);
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 20px var(--accent);
}

.card-label {
  color: var(--text-primary);
  font-size: 1.25rem;
  font-weight: bold;
}

.controls {
  margin-bottom: 1.5rem;
}

.control-group {
  margin-bottom: 1rem;
}

.control-label {
  display: block;
  margin-bottom: 0.75rem;
  font-size: 1rem;
  text-align: center;
  color: var(--text-primary);
}

.control-buttons {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.control-button {
  padding: 1rem 1.5rem;
  background-color: var(--button-bg);
  border: 3px solid transparent;
  border-radius: 0.75rem;
  color: var(--text-primary);
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  outline: none;
}

.control-button:focus-visible {
  outline: 4px solid var(--accent);
  outline-offset: 2px;
  border-color: var(--accent);
  transform: scale(1.05);
  background-color: var(--button-active-bg);
  box-shadow: 0 0 20px var(--accent);
}

.control-value {
  min-width: 100px;
  text-align: center;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--accent);
}

.warning-box {
  padding: 1rem;
  background-color: rgba(255, 193, 7, 0.15);
  border: 2px solid #ffc107;
  border-radius: 0.5rem;
  color: #ffc107;
  font-size: 0.875rem;
  margin-bottom: 1.5rem;
  text-align: center;
}

.info-box {
  padding: 1rem;
  background-color: var(--button-active-bg);
  border: 2px solid var(--accent);
  border-radius: 0.5rem;
  margin-bottom: 1.5rem;
  text-align: center;
}

.info-box p {
  margin: 0;
  font-size: 1rem;
  color: var(--text-primary);
}

.info-box strong {
  color: var(--accent);
  font-size: 1.25rem;
}

.actions {
  display: flex;
  justify-content: center;
}

.confirm-button {
  padding: 1rem 3rem;
  background-color: var(--button-active-bg);
  border: 3px solid var(--accent);
  border-radius: 0.75rem;
  color: var(--text-primary);
  font-size: 1.125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  outline: none;
}

.confirm-button:focus-visible {
  outline: 4px solid var(--accent);
  outline-offset: 2px;
  transform: scale(1.05);
  background-color: var(--button-active-bg);
  box-shadow: 0 0 20px var(--accent);
}
</style>

