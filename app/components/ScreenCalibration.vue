<template>
  <v-card class="screen-calibration" variant="outlined">
    <v-card-title class="calibration-title">Calibração da Tela</v-card-title>
    <v-card-text>
      <p class="calibration-instruction">
        Coloque uma régua de 10cm x 10cm (ou um cartão de referência de 85,6mm) na tela e ajuste o retângulo com as setas ←→ para corresponder ao tamanho da régua ou cartão.
      </p>
      <v-sheet class="calibration-area" rounded="lg">
        <div
          ref="cardRef"
          class="reference-card"
          :style="{ width: cardWidthPx + 'px', height: cardHeightPx + 'px' }"
        >
          <div class="card-label">10cm × 10cm<br/>85,6mm</div>
        </div>
      </v-sheet>

      <div class="controls">
        <div class="control-group">
          <label class="control-label">Largura:</label>
          <div class="control-buttons">
            <v-btn
              ref="decreaseRef"
              class="control-button"
              variant="tonal"
              color="secondary"
              @click="decreaseWidth"
              @keydown="handleControlKeyDown($event, 'decrease')"
            >
              ← Diminuir
            </v-btn>
            <span class="control-value">{{ cardWidthPx.toFixed(1) }}px</span>
            <v-btn
              ref="increaseRef"
              class="control-button"
              variant="tonal"
              color="secondary"
              @click="increaseWidth"
              @keydown="handleControlKeyDown($event, 'increase')"
            >
              Aumentar →
            </v-btn>
          </div>
        </div>
      </div>

      <v-alert v-if="warning" type="warning" variant="tonal" class="warning-box">
        {{ warning }}
      </v-alert>

      <v-alert class="info-box" type="info" variant="tonal">
        <p>px/cm calculado: <strong>{{ calculatedPxPerCm.toFixed(2) }}</strong></p>
      </v-alert>
    </v-card-text>

    <v-card-actions class="actions">
      <v-btn
        ref="confirmRef"
        color="primary"
        size="large"
        @click="confirm"
        @keydown="handleConfirmKeyDown"
      >
        Confirmar Calibração
      </v-btn>
    </v-card-actions>
  </v-card>
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

const cardRef = ref<unknown>(null);
const decreaseRef = ref<unknown>(null);
const increaseRef = ref<unknown>(null);
const confirmRef = ref<unknown>(null);

const { normalizeRemoteKey, saveFocus, restoreFocus, savedFocusIndex } = useRemoteNavigation({
  restoreFocus: true
});

const currentIndex = ref(0);

const calculatedPxPerCm = computed(() => {
  return cardWidthPx.value / (CARD_WIDTH_MM / 10);
});

const resolveElement = (target: unknown): HTMLElement | null => {
  if (!target) return null;
  if (target instanceof HTMLElement) return target;
  return (target as { $el?: HTMLElement }).$el ?? null;
};

const updateTabindex = () => {
  const items = [
    resolveElement(decreaseRef.value),
    resolveElement(increaseRef.value),
    resolveElement(confirmRef.value)
  ].filter(Boolean) as HTMLElement[];
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
    const items = [
      resolveElement(decreaseRef.value),
      resolveElement(increaseRef.value),
      resolveElement(confirmRef.value)
    ].filter(Boolean) as HTMLElement[];
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
    resolveElement(increaseRef.value)?.focus();
  } else if (action === 'OK') {
    event.preventDefault();
    confirm();
  }
};

onMounted(() => {
  restoreFocus();
  updateTabindex();
  const items = [
    resolveElement(decreaseRef.value),
    resolveElement(increaseRef.value),
    resolveElement(confirmRef.value)
  ].filter(Boolean) as HTMLElement[];
  if (savedFocusIndex.value !== null && savedFocusIndex.value >= 0 && savedFocusIndex.value < items.length) {
    currentIndex.value = savedFocusIndex.value;
    updateTabindex();
    items[savedFocusIndex.value]?.focus();
  } else {
    resolveElement(decreaseRef.value)?.focus();
  }
});

onBeforeUnmount(() => {
  const items = [
    resolveElement(decreaseRef.value),
    resolveElement(increaseRef.value),
    resolveElement(confirmRef.value)
  ].filter(Boolean) as HTMLElement[];
  const activeIndex = items.findIndex(item => item.tabIndex === 0);
  if (activeIndex >= 0) {
    saveFocus(activeIndex);
  }
});
</script>

<style scoped>
.screen-calibration {
  width: 100%;
  max-width: 500px;
}

.calibration-title {
  font-size: 1.25rem;
  margin-bottom: 0.75rem;
  text-align: center;
  color: var(--text-primary);
}

.calibration-instruction {
  font-size: 0.875rem;
  margin-bottom: 1rem;
  text-align: center;
  color: var(--text-primary);
  opacity: 0.9;
  line-height: 1.4;
}

.calibration-area {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  margin-bottom: 1rem;
  padding: 1rem;
}

.reference-card {
  background-color: rgb(var(--v-theme-background));
  border: 3px solid rgb(var(--v-theme-primary));
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 20px rgba(var(--v-theme-primary), 0.5);
}

.card-label {
  font-size: 1rem;
  font-weight: bold;
}

.controls {
  margin-bottom: 1rem;
}

.control-group {
  margin-bottom: 0.75rem;
}

.control-label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  text-align: center;
}

.control-buttons {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.control-button {
  font-size: 0.875rem;
  font-weight: 500;
}

.control-value {
  min-width: 80px;
  text-align: center;
  font-size: 0.875rem;
  font-weight: 600;
  color: rgb(var(--v-theme-primary));
}

.warning-box {
  font-size: 0.75rem;
  margin-bottom: 1rem;
}

.info-box {
  margin-bottom: 1rem;
}

.info-box p {
  margin: 0;
  font-size: 0.875rem;
}

.info-box strong {
  color: rgb(var(--v-theme-primary));
  font-size: 1rem;
}

.actions {
  display: flex;
  justify-content: center;
}
</style>
