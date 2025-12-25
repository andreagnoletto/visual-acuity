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

      <v-container class="optotype-chart" fluid>
        <v-row
          v-for="line in visibleLines"
          :key="line.lineIndex"
          class="optotype-line"
          :class="{ 'current-line': line.lineIndex === currentLineIndex }"
          :style="{ fontSize: line.fontSizePx + 'px' }"
          align="center"
          justify="center"
          no-gutters
        >
          <v-col cols="auto" class="line-label">
            <span class="snellen-ratio">{{ line.snellenRatio }}</span>
            <span class="logmar">logMAR {{ line.logMAR.toFixed(1) }}</span>
          </v-col>
          <v-col class="directions-container">
            <span
              v-for="(optotype, optIndex) in line.directions"
              :key="optIndex"
              class="direction"
            >
              <svg
                class="optotype-e"
                viewBox="0 0 100 100"
                xmlns="http://www.w3.org/2000/svg"
                :style="{ transform: `rotate(${optotype.rotation}deg)` }"
              >
                <rect x="10" y="12" width="80" height="14" fill="currentColor" />
                <rect x="10" y="43" width="80" height="14" fill="currentColor" />
                <rect x="10" y="74" width="80" height="14" fill="currentColor" />
                <rect x="10" y="12" width="14" height="76" fill="currentColor" />
              </svg>
            </span>
          </v-col>
        </v-row>
      </v-container>

      <v-row v-if="assistedMode" class="assisted-controls" dense>
        <v-col cols="12" md="6">
          <v-btn
            ref="upButtonRef"
            color="secondary"
            variant="tonal"
            size="x-large"
            block
            @click="moveLineUp"
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
            @click="randomizeDirections"
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
          >
            ✓ Vi essas direções
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
import { useOptotypeGenerator } from '~/composables/useOptotypeGenerator';

interface DirectionalOptotype {
  type: 'E';
  rotation: number;
  label: string;
}

const DIRECTIONAL_OPTOTYPES: DirectionalOptotype[] = [
  { type: 'E', rotation: 0, label: 'E normal' },
  { type: 'E', rotation: 90, label: 'E direita' },
  { type: 'E', rotation: 180, label: 'E invertido' },
  { type: 'E', rotation: 270, label: 'E esquerda' }
];

const { isCalibrationReady } = useCalibration();
const { calculateOptotypesPerLine, generateLines, calculateVisibleLinesCount } = useOptotypeGenerator();

const currentLineIndex = ref(0);
const assistedMode = ref(false);
const testComplete = ref(false);
const lastSeenLine = ref<{ snellenRatio: string; logMAR: number } | null>(null);

interface VisibleLine {
  lineIndex: number;
  snellenRatio: string;
  logMAR: number;
  fontSizePx: number;
  directions: DirectionalOptotype[];
}

const visibleLines = computed<VisibleLine[]>(() => {
  const _ = windowWidth.value;
  const _h = windowHeight.value;

  const lines = generateLines();
  if (lines.length === 0) return [];

  const currentLine = lines[currentLineIndex.value];
  if (!currentLine) return [];

  const visibleCount = calculateVisibleLinesCount(currentLine.fontSizePx, windowHeight.value);
  const halfCount = Math.floor(visibleCount / 2);
  const startIndex = Math.max(0, currentLineIndex.value - halfCount);
  const endIndex = Math.min(lines.length - 1, currentLineIndex.value + (visibleCount - halfCount - 1));

  const result: VisibleLine[] = [];
  for (let i = startIndex; i <= endIndex; i++) {
    const line = lines[i];
    const visionLine = VISION_LINES[i];
    if (line && visionLine) {
      const count = calculateDirectionsCount(line.fontSizePx, line.snellenRatio);
      const pool = [...DIRECTIONAL_OPTOTYPES];
      const directions: DirectionalOptotype[] = [];

      for (let j = 0; j < count; j++) {
        const randomIndex = Math.floor(Math.random() * pool.length);
        directions.push(pool[randomIndex]);
      }

      result.push({
        lineIndex: i,
        snellenRatio: line.snellenRatio,
        logMAR: line.logMAR,
        fontSizePx: line.fontSizePx,
        directions
      });
    }
  }

  return result;
});

const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1920);
const windowHeight = ref(typeof window !== 'undefined' ? window.innerHeight : 1080);

if (typeof window !== 'undefined') {
  const updateSize = () => {
    windowWidth.value = window.innerWidth;
    windowHeight.value = window.innerHeight;
  };
  onMounted(() => {
    window.addEventListener('resize', updateSize);
    updateSize();
  });
  onBeforeUnmount(() => {
    window.removeEventListener('resize', updateSize);
  });
}

const calculateDirectionsCount = (fontSizePx: number, snellenRatio: string): number => {
  return calculateOptotypesPerLine(fontSizePx, snellenRatio, windowWidth.value);
};

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

const randomizeDirections = () => {
  const _ = windowWidth.value;
  const _h = windowHeight.value;
};

const moveLineUp = () => {
  if (currentLineIndex.value > 0) {
    currentLineIndex.value--;
    randomizeDirections();
  }
};

const moveLineDown = () => {
  if (currentLineIndex.value < VISION_LINES.length - 1) {
    currentLineIndex.value++;
    randomizeDirections();
  }
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
        resolveElement(finishButtonRef.value)?.focus();
      });
    }
  }
};

const toggleAssistedMode = () => {
  assistedMode.value = !assistedMode.value;
};

const finishTest = () => {
  navigateTo('/');
};

const handleToggleKeyDown = (event: KeyboardEvent) => {
  const action = normalizeRemoteKey(event);
  if (action === 'OK') {
    event.preventDefault();
    toggleAssistedMode();
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
      randomizeDirections();
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

watch([windowWidth, windowHeight, currentLineIndex], () => {
  randomizeDirections();
});

onMounted(() => {
  randomizeDirections();
  resolveElement(backButtonRef.value)?.focus();
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

.optotype-chart {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  padding: 2rem;
  min-height: 60vh;
}

.optotype-line {
  width: 100%;
  opacity: 0.3;
  transition: opacity 0.3s, color 0.3s;
  color: var(--text-secondary);
  gap: 2rem;
}

.optotype-line.current-line {
  opacity: 1;
  color: var(--text-primary);
}

.line-label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  align-items: flex-start;
  font-size: 0.875rem;
  min-width: 120px;
}

.optotype-line.current-line .line-label {
  color: var(--text-primary);
  opacity: 0.9;
}

.optotype-line:not(.current-line) .line-label {
  color: var(--text-secondary);
  opacity: 0.3;
}

.snellen-ratio {
  font-weight: 600;
}

.logmar {
  opacity: 0.7;
}

.directions-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  flex-wrap: nowrap;
  white-space: nowrap;
  overflow-x: auto;
  width: 100%;
  max-width: calc(100vw - 200px);
}

.direction {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-weight: bold;
  width: 1em;
  height: 1em;
  flex-shrink: 0;
  color: inherit;
}

.optotype-e {
  width: 1em;
  height: 1em;
  display: inline-block;
  transform-origin: center;
  color: currentColor;
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
