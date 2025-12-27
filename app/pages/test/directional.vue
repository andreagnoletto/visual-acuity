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

        <div class="optotype-chart">
          <v-row
            v-for="(line, index) in visibleLines"
            :key="line.lineIndex"
            class="optotype-line"
            align="center"
            no-gutters
            :class="{ 'current-line': line.lineIndex === currentLineIndex }"
            :style="{ fontSize: line.fontSizePx + 'px' }"
          >
            <v-col cols="auto" class="line-label">
              <span class="snellen-ratio">{{ line.snellenRatio }}</span>
              <span class="logmar">logMAR {{ line.logMAR.toFixed(1) }}</span>
            </v-col>
            <v-col>
              <v-sheet class="directions-container" color="transparent">
                <div
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
                </div>
              </v-sheet>
            </v-col>
          </v-row>
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
              @click="randomizeDirections"
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
            >
              ✓ Vi essas direções
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
  justify-content: center;
  opacity: 0.3;
  transition: opacity 0.3s, color 0.3s;
  color: var(--text-secondary);
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
  min-height: 400px;
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
