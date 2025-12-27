<template>
  <v-container class="test-page" fluid>
    <CalibrationGate v-if="!isCalibrationReady" />
    <v-card v-else class="test-content" variant="outlined">
      <v-card-text>
        <v-row class="test-header" align="center" justify="space-between">
          <v-btn
            ref="backButtonRef"
            class="back-button"
            variant="tonal"
            color="secondary"
            @click="goBack"
            @keydown="handleBackKeyDown"
          >
            ← Voltar
          </v-btn>
          <v-btn
            ref="assistedToggleRef"
            class="assisted-toggle"
            :color="assistedMode ? 'primary' : 'secondary'"
            :variant="assistedMode ? 'elevated' : 'tonal'"
            @click="toggleAssistedMode"
            @keydown="handleToggleKeyDown"
          >
            {{ assistedMode ? 'Modo Assistido ON' : 'Modo Assistido OFF' }}
          </v-btn>
        </v-row>

        <v-alert v-if="assistedMode" class="assisted-hint" type="info" variant="tonal">
          <p class="hint-text">
            <strong>Modo Assistido:</strong> Use o controle remoto para navegar.
            O acompanhante deve observar as respostas do paciente.
          </p>
        </v-alert>

        <div class="chart-container">
          <OptotypeChart
            :key="randomizeKey"
            :current-line-index="currentLineIndex"
            :show-all-lines="false"
          />
        </div>

        <v-row v-if="assistedMode" class="assisted-controls" dense>
          <v-col cols="12" md="6">
            <v-btn
              ref="upButtonRef"
              class="assisted-button"
              block
              size="x-large"
              variant="tonal"
              color="secondary"
              @click="moveLineUp"
              @keydown="handleControlKeyDown($event, 'up')"
            >
              ↑ Linha Anterior
            </v-btn>
          </v-col>
          <v-col cols="12" md="6">
            <v-btn
              ref="randomizeButtonRef"
              class="assisted-button"
              block
              size="x-large"
              variant="tonal"
              color="secondary"
              @click="randomizeCurrentLine"
              @keydown="handleControlKeyDown($event, 'randomize')"
            >
              ↻ Randomizar
            </v-btn>
          </v-col>
          <v-col cols="12" md="6">
            <v-btn
              ref="confirmButtonRef"
              class="assisted-button confirm"
              block
              size="x-large"
              variant="elevated"
              color="primary"
              @click="confirmSeen"
              @keydown="handleControlKeyDown($event, 'confirm')"
            >
              ✓ Vi essa linha
            </v-btn>
          </v-col>
          <v-col cols="12" md="6">
            <v-btn
              ref="downButtonRef"
              class="assisted-button"
              block
              size="x-large"
              variant="tonal"
              color="secondary"
              @click="moveLineDown"
              @keydown="handleControlKeyDown($event, 'down')"
            >
              ↓ Próxima Linha
            </v-btn>
          </v-col>
        </v-row>

        <v-alert v-else class="instructions" type="info" variant="tonal">
          <p>Use ↑↓ para mudar de linha, ←→ para randomizar, Enter para confirmar "vista"</p>
        </v-alert>

        <v-card v-if="testComplete" class="test-result" variant="tonal">
          <v-card-title>Teste Concluído</v-card-title>
          <v-card-text>
            <p>Última linha vista: {{ lastSeenLine?.snellenRatio || 'N/A' }}</p>
            <v-btn
              ref="finishButtonRef"
              class="finish-button"
              color="primary"
              size="large"
              @click="finishTest"
              @keydown="handleFinishKeyDown"
            >
              Finalizar
            </v-btn>
          </v-card-text>
        </v-card>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'test'
});

import { VISION_LINES } from '~/domain/vision/lines';

const { isCalibrationReady } = useCalibration();

const currentLineIndex = ref(0);
const assistedMode = ref(false);
const testComplete = ref(false);
const lastSeenLine = ref<{ snellenRatio: string; logMAR: number } | null>(null);
const randomizeKey = ref(0);

const backButtonRef = ref<unknown>(null);
const assistedToggleRef = ref<unknown>(null);
const upButtonRef = ref<unknown>(null);
const randomizeButtonRef = ref<unknown>(null);
const confirmButtonRef = ref<unknown>(null);
const downButtonRef = ref<unknown>(null);
const finishButtonRef = ref<unknown>(null);

const { normalizeRemoteKey } = useRemoteNavigation({
  restoreFocus: true
});

const resolveElement = (target: unknown): HTMLElement | null => {
  if (!target) return null;
  if (target instanceof HTMLElement) return target;
  return (target as { $el?: HTMLElement }).$el ?? null;
};

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
  resolveElement(backButtonRef.value),
  resolveElement(assistedToggleRef.value),
  resolveElement(upButtonRef.value),
  resolveElement(randomizeButtonRef.value),
  resolveElement(confirmButtonRef.value),
  resolveElement(downButtonRef.value)
].filter(Boolean) as HTMLElement[]);

const updateControlTabindex = () => {
  controlRefs.value.forEach((item, index) => {
    if (item) {
      item.tabIndex = index === currentControlIndex.value ? 0 : -1;
    }
  });
  const finishElement = resolveElement(finishButtonRef.value);
  if (finishElement) {
    finishElement.tabIndex = testComplete.value && currentControlIndex.value === controlRefs.value.length ? 0 : -1;
  }
};

const toggleAssistedMode = () => {
  assistedMode.value = !assistedMode.value;
  nextTick(() => {
    updateControlTabindex();
    if (assistedMode.value && resolveElement(upButtonRef.value)) {
      currentControlIndex.value = 1;
      resolveElement(upButtonRef.value)?.focus();
    } else if (!assistedMode.value && resolveElement(assistedToggleRef.value)) {
      currentControlIndex.value = 0;
      resolveElement(assistedToggleRef.value)?.focus();
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
  if (currentLineIndex.value < VISION_LINES.length - 1) {
    currentLineIndex.value++;
    randomizeCurrentLine();
  }
};

const randomizeCurrentLine = () => {
  randomizeKey.value++;
};

const confirmSeen = () => {
  const line = VISION_LINES[currentLineIndex.value];
  if (line) {
    lastSeenLine.value = {
      snellenRatio: line.snellenRatio,
      logMAR: line.logMAR
    };
    if (currentLineIndex.value < VISION_LINES.length - 1) {
      moveLineDown();
    } else {
      testComplete.value = true;
      nextTick(() => {
        updateControlTabindex();
        resolveElement(finishButtonRef.value)?.focus();
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
    resolveElement(backButtonRef.value)?.focus();
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
  resolveElement(backButtonRef.value)?.focus();
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
  padding: 0.5rem 0;
}

.assisted-hint {
  text-align: center;
}

.hint-text {
  margin: 0;
  font-size: 1.125rem;
  line-height: 1.6;
}

.chart-container {
  display: flex;
  justify-content: center;
  min-height: 400px;
}

.assisted-controls {
  gap: 1.5rem;
  padding: 2rem 0;
}

.assisted-button {
  min-height: 120px;
  font-size: 1.25rem;
  font-weight: 600;
}

.instructions {
  text-align: center;
  font-size: 0.875rem;
  opacity: 0.7;
}

.test-result {
  text-align: center;
}

.finish-button {
  margin-top: 1.5rem;
}
</style>
