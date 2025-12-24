<template>
  <div class="test-page">
    <CalibrationGate v-if="!isCalibrationReady" />
    <div v-else class="test-content">
      <div class="test-header">
        <button
          ref="backButtonRef"
          class="back-button"
          @click="goBack"
          @keydown="handleBackKeyDown"
        >
          ← Voltar
        </button>
        <button
          ref="assistedToggleRef"
          class="assisted-toggle"
          :class="{ active: assistedMode }"
          @click="toggleAssistedMode"
          @keydown="handleToggleKeyDown"
        >
          {{ assistedMode ? 'Modo Assistido ON' : 'Modo Assistido OFF' }}
        </button>
      </div>

      <div v-if="assistedMode" class="assisted-hint">
        <p class="hint-text">
          <strong>Modo Assistido:</strong> Use o controle remoto para navegar. 
          O acompanhante deve observar as respostas do paciente.
        </p>
      </div>

      <div class="chart-container">
        <ETDRSChart
          :key="randomizeKey"
          :current-line-index="currentLineIndex"
          :show-all-lines="false"
        />
      </div>

      <div v-if="assistedMode" class="assisted-controls">
        <button
          ref="upButtonRef"
          class="assisted-button"
          @click="moveLineUp"
          @keydown="handleControlKeyDown($event, 'up')"
        >
          ↑ Linha Anterior
        </button>
        <button
          ref="randomizeButtonRef"
          class="assisted-button"
          @click="randomizeCurrentLine"
          @keydown="handleControlKeyDown($event, 'randomize')"
        >
          ↻ Randomizar
        </button>
        <button
          ref="confirmButtonRef"
          class="assisted-button confirm"
          @click="confirmSeen"
          @keydown="handleControlKeyDown($event, 'confirm')"
        >
          ✓ Vi essa linha
        </button>
        <button
          ref="downButtonRef"
          class="assisted-button"
          @click="moveLineDown"
          @keydown="handleControlKeyDown($event, 'down')"
        >
          ↓ Próxima Linha
        </button>
      </div>

      <div v-else class="instructions">
        <p>Use ↑↓ para mudar de linha, ←→ para randomizar, Enter para confirmar "vista"</p>
      </div>

      <div v-if="testComplete" class="test-result">
        <h3>Teste Concluído</h3>
        <p>Última linha vista: Linha {{ lastSeenLine?.lineNumber || 'N/A' }} ({{ lastSeenLine?.snellenRatio || 'N/A' }})</p>
        <p>logMAR: {{ lastSeenLine?.logMAR.toFixed(2) || 'N/A' }}</p>
        <button
          ref="finishButtonRef"
          class="finish-button"
          @click="finishTest"
          @keydown="handleFinishKeyDown"
        >
          Finalizar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'test'
});

import { ETDRS_LINES } from '~/domain/vision/etdrs';

const { isCalibrationReady } = useCalibration();

const currentLineIndex = ref(0);
const assistedMode = ref(false);
const testComplete = ref(false);
const lastSeenLine = ref<{ lineNumber: number; snellenRatio: string; logMAR: number } | null>(null);
const randomizeKey = ref(0);

const backButtonRef = ref<HTMLButtonElement>();
const assistedToggleRef = ref<HTMLButtonElement>();
const upButtonRef = ref<HTMLButtonElement>();
const randomizeButtonRef = ref<HTMLButtonElement>();
const confirmButtonRef = ref<HTMLButtonElement>();
const downButtonRef = ref<HTMLButtonElement>();
const finishButtonRef = ref<HTMLButtonElement>();

const { normalizeRemoteKey } = useRemoteNavigation({
  restoreFocus: true
});

const goBack = () => {
  navigateTo('/');
};

const handleBackKeyDown = (event: KeyboardEvent) => {
  const action = normalizeRemoteKey(event);
  if (action === 'OK') {
    event.preventDefault();
    goBack();
  }
};

const currentControlIndex = ref(0);
const controlRefs = computed(() => [
  backButtonRef.value,
  assistedToggleRef.value,
  upButtonRef.value,
  randomizeButtonRef.value,
  confirmButtonRef.value,
  downButtonRef.value
].filter(Boolean) as HTMLElement[]);

const updateControlTabindex = () => {
  controlRefs.value.forEach((item, index) => {
    if (item) {
      item.tabIndex = index === currentControlIndex.value ? 0 : -1;
    }
  });
  if (finishButtonRef.value) {
    finishButtonRef.value.tabIndex = testComplete.value && currentControlIndex.value === controlRefs.value.length ? 0 : -1;
  }
};

const toggleAssistedMode = () => {
  assistedMode.value = !assistedMode.value;
  nextTick(() => {
    updateControlTabindex();
    if (assistedMode.value && upButtonRef.value) {
      currentControlIndex.value = 1;
      upButtonRef.value.focus();
    } else if (!assistedMode.value && assistedToggleRef.value) {
      currentControlIndex.value = 0;
      assistedToggleRef.value.focus();
    }
  });
};

const moveLineUp = () => {
  if (currentLineIndex.value > 0) {
    currentLineIndex.value--;
    randomizeCurrentLine();
  }
};

const moveLineDown = () => {
  if (currentLineIndex.value < ETDRS_LINES.length - 1) {
    currentLineIndex.value++;
    randomizeCurrentLine();
  }
};

const randomizeCurrentLine = () => {
  randomizeKey.value++;
};

const confirmSeen = () => {
  const line = ETDRS_LINES[currentLineIndex.value];
  if (line) {
    lastSeenLine.value = {
      lineNumber: line.lineNumber,
      snellenRatio: line.snellenRatio,
      logMAR: line.logMAR
    };
    if (currentLineIndex.value < ETDRS_LINES.length - 1) {
      moveLineDown();
    } else {
      testComplete.value = true;
      nextTick(() => {
        updateControlTabindex();
        finishButtonRef.value?.focus();
      });
    }
  }
};

const finishTest = () => {
  navigateTo('/');
};

const handleToggleKeyDown = (event: KeyboardEvent) => {
  const action = normalizeRemoteKey(event);
  if (action === 'OK') {
    event.preventDefault();
    toggleAssistedMode();
  } else if (action === 'UP' || action === 'DOWN') {
    event.preventDefault();
    if (action === 'UP') {
      currentControlIndex.value = Math.max(0, currentControlIndex.value - 1);
    } else {
      currentControlIndex.value = Math.min(controlRefs.value.length - 1, currentControlIndex.value + 1);
    }
    updateControlTabindex();
    controlRefs.value[currentControlIndex.value]?.focus();
  } else if (action === 'LEFT') {
    event.preventDefault();
    currentControlIndex.value = 0;
    updateControlTabindex();
    backButtonRef.value?.focus();
  }
};

const handleControlKeyDown = (event: KeyboardEvent, control: string) => {
  const action = normalizeRemoteKey(event);
  
  if (action === 'UP' || action === 'DOWN') {
    event.preventDefault();
    const controlIndex = ['up', 'randomize', 'confirm', 'down'].indexOf(control);
    if (controlIndex >= 0) {
      let newIndex = controlIndex;
      if (action === 'UP') {
        newIndex = Math.max(1, controlIndex - 1);
      } else {
        newIndex = Math.min(controlRefs.value.length - 1, controlIndex + 1);
      }
      currentControlIndex.value = newIndex;
      updateControlTabindex();
      controlRefs.value[newIndex]?.focus();
    }
  } else if (action === 'OK') {
    event.preventDefault();
    if (control === 'up') moveLineUp();
    else if (control === 'down') moveLineDown();
    else if (control === 'randomize') randomizeCurrentLine();
    else if (control === 'confirm') confirmSeen();
  } else if (action === 'LEFT' || action === 'RIGHT') {
    event.preventDefault();
    if (control === 'randomize') {
      randomizeCurrentLine();
    }
  }
};

const handleFinishKeyDown = (event: KeyboardEvent) => {
  const action = normalizeRemoteKey(event);
  if (action === 'OK') {
    event.preventDefault();
    finishTest();
  }
};

useRemoteNavigation({
  onAction: (action) => {
    if (assistedMode.value) {
      return;
    }

    if (action === 'UP') {
      moveLineUp();
      return false;
    } else if (action === 'DOWN') {
      moveLineDown();
      return false;
    } else if (action === 'LEFT' || action === 'RIGHT') {
      randomizeCurrentLine();
      return false;
    } else if (action === 'OK') {
      confirmSeen();
      return false;
    } else if (action === 'BACK') {
      navigateTo('/');
      return false;
    }
  }
});

onMounted(() => {
  randomizeCurrentLine();
  updateControlTabindex();
  if (backButtonRef.value) {
    backButtonRef.value.focus();
  }
});

onBeforeUnmount(() => {
  updateControlTabindex();
});
</script>

<style scoped>
.test-page {
  width: 100%;
  min-height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}

.test-content {
  width: 100%;
  max-width: 1200px;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.test-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
}

.back-button {
  padding: 0.5rem 1.5rem;
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

.back-button:focus-visible {
  outline: 4px solid var(--accent);
  outline-offset: 2px;
  transform: scale(1.05);
  border-color: var(--accent);
  background-color: var(--button-active-bg);
}

.assisted-toggle {
  padding: 0.75rem 1.5rem;
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

.assisted-toggle.active {
  background-color: var(--button-active-bg);
  border-color: var(--accent);
}

.assisted-toggle:focus-visible {
  outline: 4px solid var(--accent);
  outline-offset: 2px;
  transform: scale(1.05);
  border-color: var(--accent);
}

.assisted-hint {
  padding: 1.5rem;
  background-color: var(--button-active-bg);
  border: 2px solid var(--accent);
  border-radius: 0.75rem;
  text-align: center;
}

.hint-text {
  margin: 0;
  font-size: 1.125rem;
  line-height: 1.6;
  color: var(--text-primary);
}

.chart-container {
  display: flex;
  justify-content: center;
  min-height: 400px;
}

.assisted-controls {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  padding: 2rem;
}

.assisted-button {
  padding: 2rem;
  background-color: var(--button-bg);
  border: 3px solid transparent;
  border-radius: 0.75rem;
  color: var(--text-primary);
  font-size: 1.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  outline: none;
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.assisted-button.confirm {
  background-color: var(--button-active-bg);
  border-color: var(--accent);
}

.assisted-button:focus-visible {
  outline: 4px solid var(--accent);
  outline-offset: 2px;
  transform: scale(1.05);
  background-color: var(--button-active-bg);
  border-color: var(--accent);
  box-shadow: 0 0 20px var(--accent);
}

.instructions {
  text-align: center;
  padding: 1rem;
  color: var(--text-secondary);
  font-size: 0.875rem;
  opacity: 0.7;
}

.test-result {
  padding: 2rem;
  background-color: var(--button-active-bg);
  border: 2px solid var(--accent);
  border-radius: 0.75rem;
  text-align: center;
}

.test-result h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: var(--text-primary);
}

.finish-button {
  margin-top: 1.5rem;
  padding: 1rem 3rem;
  background-color: var(--button-active-bg);
  border: 3px solid var(--accent);
  border-radius: 0.75rem;
  color: var(--text-primary);
  font-size: 1.25rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  outline: none;
}

.finish-button:focus-visible {
  outline: 4px solid var(--accent);
  outline-offset: 2px;
  transform: scale(1.05);
  background-color: var(--button-active-bg);
  box-shadow: 0 0 20px var(--accent);
}
</style>

