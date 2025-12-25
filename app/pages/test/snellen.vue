<template>
  <v-container class="test-page" fluid>
    <CalibrationGate v-if="!isCalibrationReady" />
    <div v-else class="test-content">
      <div class="test-header">
        <v-btn
          ref="backButtonRef"
          color="secondary"
          variant="tonal"
          @click="goBack"
          @keydown="handleBackKeyDown"
        >
          ← Voltar
        </v-btn>
        <v-btn
          ref="assistedToggleRef"
          :color="assistedMode ? 'primary' : 'secondary'"
          :variant="assistedMode ? 'elevated' : 'tonal'"
          @click="toggleAssistedMode"
          @keydown="handleToggleKeyDown"
        >
          {{ assistedMode ? 'Modo Assistido ON' : 'Modo Assistido OFF' }}
        </v-btn>
      </div>

      <v-alert v-if="assistedMode" type="info" variant="tonal" class="assisted-hint">
        <strong>Modo Assistido:</strong> Use o controle remoto para navegar.
        O acompanhante deve observar as respostas do paciente.
      </v-alert>

      <v-sheet class="chart-container" elevation="0">
        <OptotypeChart
          :key="randomizeKey"
          :current-line-index="currentLineIndex"
          :show-all-lines="false"
        />
      </v-sheet>

      <v-row v-if="assistedMode" class="assisted-controls" dense>
        <v-col cols="12" md="6">
          <v-btn
            ref="upButtonRef"
            color="secondary"
            variant="tonal"
            size="x-large"
            block
            @click="moveLineUp"
            @keydown="handleControlKeyDown($event, 'up')"
          >
            ↑ Linha Anterior
          </v-btn>
        </v-col>
        <v-col cols="12" md="6">
          <v-btn
            ref="randomizeButtonRef"
            color="secondary"
            variant="tonal"
            size="x-large"
            block
            @click="randomizeCurrentLine"
            @keydown="handleControlKeyDown($event, 'randomize')"
          >
            ↻ Randomizar
          </v-btn>
        </v-col>
        <v-col cols="12" md="6">
          <v-btn
            ref="confirmButtonRef"
            color="primary"
            variant="elevated"
            size="x-large"
            block
            @click="confirmSeen"
            @keydown="handleControlKeyDown($event, 'confirm')"
          >
            ✓ Vi essa linha
          </v-btn>
        </v-col>
        <v-col cols="12" md="6">
          <v-btn
            ref="downButtonRef"
            color="secondary"
            variant="tonal"
            size="x-large"
            block
            @click="moveLineDown"
            @keydown="handleControlKeyDown($event, 'down')"
          >
            ↓ Próxima Linha
          </v-btn>
        </v-col>
      </v-row>

      <v-alert v-else type="info" variant="tonal" class="instructions">
        Use ↑↓ para mudar de linha, ←→ para randomizar, Enter para confirmar "vista"
      </v-alert>

      <v-card v-if="testComplete" class="test-result" variant="tonal">
        <v-card-title>Teste Concluído</v-card-title>
        <v-card-text>
          Última linha vista: {{ lastSeenLine?.snellenRatio || 'N/A' }}
        </v-card-text>
        <v-card-actions class="justify-center">
          <v-btn
            ref="finishButtonRef"
            color="primary"
            variant="elevated"
            @click="finishTest"
            @keydown="handleFinishKeyDown"
          >
            Finalizar
          </v-btn>
        </v-card-actions>
      </v-card>
    </div>
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

const backButtonRef = ref<any>();
const assistedToggleRef = ref<any>();
const upButtonRef = ref<any>();
const randomizeButtonRef = ref<any>();
const confirmButtonRef = ref<any>();
const downButtonRef = ref<any>();
const finishButtonRef = ref<any>();

const { normalizeRemoteKey } = useRemoteNavigation({
  restoreFocus: true
});

const resolveElement = (el: any): HTMLElement | null => {
  return (el?.$el ?? el) as HTMLElement | null;
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
  const finishEl = resolveElement(finishButtonRef.value);
  if (finishEl) {
    finishEl.tabIndex = testComplete.value && currentControlIndex.value === controlRefs.value.length ? 0 : -1;
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
  gap: 1rem;
}

.assisted-hint {
  text-align: center;
}

.chart-container {
  display: flex;
  justify-content: center;
  min-height: 400px;
}

.assisted-controls {
  gap: 1.5rem;
}

.instructions {
  text-align: center;
}

.test-result {
  text-align: center;
}
</style>
