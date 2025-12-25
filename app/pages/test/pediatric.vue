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
          O acompanhante deve observar as respostas da criança.
        </p>
      </div>

      <div class="optotype-chart">
        <div
          v-for="(line, index) in visibleLines"
          :key="line.lineIndex"
          class="optotype-line"
          :class="{ 'current-line': line.lineIndex === currentLineIndex }"
          :style="{ fontSize: line.fontSizePx + 'px' }"
        >
          <div class="line-label">
            <span class="snellen-ratio">{{ line.snellenRatio }}</span>
            <span class="logmar">logMAR {{ line.logMAR.toFixed(1) }}</span>
          </div>
          <div class="symbols-container">
            <div
              v-for="(symbol, symbolIndex) in line.symbols"
              :key="symbolIndex"
              class="symbol"
        >
          {{ symbol }}
            </div>
          </div>
        </div>
      </div>

      <div v-if="assistedMode" class="assisted-controls">
        <button
          ref="upButtonRef"
          class="assisted-button"
          @click="moveLineUp"
        >
          ↑ Linha Anterior
        </button>
        <button
          ref="randomizeButtonRef"
          class="assisted-button"
          @click="randomizeSymbols"
        >
          ↻ Randomizar
        </button>
        <button
          ref="confirmButtonRef"
          class="assisted-button confirm"
          @click="confirmSeen"
        >
          ✓ Vi esses símbolos
        </button>
        <button
          ref="downButtonRef"
          class="assisted-button"
          @click="moveLineDown"
        >
          ↓ Próxima Linha
        </button>
      </div>

      <div v-else class="instructions">
        <p>Use ↑↓ para mudar de linha, ←→ para randomizar, Enter para confirmar "vista"</p>
      </div>

      <div v-if="testComplete" class="test-result">
        <h3>Teste Concluído</h3>
        <p>Última linha vista: {{ lastSeenLine?.snellenRatio || 'N/A' }}</p>
        <button
          ref="finishButtonRef"
          class="finish-button"
          @click="finishTest"
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

import { VISION_LINES, parseSnellenRatio } from '~/domain/vision/lines';
import { useOptotypeGenerator } from '~/composables/useOptotypeGenerator';

const PEDIATRIC_SYMBOLS = ['⭐', '❤️', '🎈', '🐱', '🚗', '🍎', '🏠', '🌙'];

const { isCalibrationReady } = useCalibration();
const { getLine, calculateOptotypesPerLine, generateLines, calculateVisibleLinesCount } = useOptotypeGenerator();

const currentLineIndex = ref(0);
const assistedMode = ref(false);
const testComplete = ref(false);
const lastSeenLine = ref<{ snellenRatio: string; logMAR: number } | null>(null);
const currentSymbols = ref<string[]>([]);

interface VisibleLine {
  lineIndex: number;
  snellenRatio: string;
  logMAR: number;
  fontSizePx: number;
  symbols: string[];
}

const visibleLines = computed<VisibleLine[]>(() => {
  const _ = windowWidth.value; // Forçar recálculo quando windowWidth mudar
  const _h = windowHeight.value; // Forçar recálculo quando windowHeight mudar
  
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
      const count = calculateSymbolsCount(line.fontSizePx, line.snellenRatio);
      const pool = [...PEDIATRIC_SYMBOLS];
      const symbols: string[] = [];
      
      for (let j = 0; j < count; j++) {
        const randomIndex = Math.floor(Math.random() * pool.length);
        symbols.push(pool[randomIndex]);
      }
      
      result.push({
        lineIndex: i,
        snellenRatio: line.snellenRatio,
        logMAR: line.logMAR,
        fontSizePx: line.fontSizePx,
        symbols
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

const calculateSymbolsCount = (fontSizePx: number, snellenRatio: string): number => {
  return calculateOptotypesPerLine(fontSizePx, snellenRatio, windowWidth.value);
};

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


const randomizeSymbols = () => {
  // Forçar recálculo do computed visibleLines
  const _ = windowWidth.value;
  const _h = windowHeight.value;
};

const moveLineUp = () => {
  if (currentLineIndex.value > 0) {
    currentLineIndex.value--;
    randomizeSymbols();
  }
};

const moveLineDown = () => {
  if (currentLineIndex.value < VISION_LINES.length - 1) {
    currentLineIndex.value++;
    randomizeSymbols();
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
        finishButtonRef.value?.focus();
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
      randomizeSymbols();
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
  randomizeSymbols();
});

onMounted(() => {
  randomizeSymbols();
  if (backButtonRef.value) {
    backButtonRef.value.focus();
  }
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
  outline: 4px solid #00ff00;
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
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 2rem;
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

.symbols-container {
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

.symbol {
  display: inline-block;
  text-align: center;
  flex-shrink: 0;
  color: inherit;
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
  outline: 4px solid #00ff00;
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
  opacity: 0.7;
  font-size: 0.875rem;
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
}

.finish-button {
  margin-top: 1.5rem;
  padding: 1rem 3rem;
  background-color: rgba(0, 255, 0, 0.2);
  border: 3px solid #00ff00;
  border-radius: 0.75rem;
  color: #fff;
  font-size: 1.25rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  outline: none;
}

.finish-button:focus-visible {
  outline: 4px solid #00ff00;
  outline-offset: 2px;
  transform: scale(1.05);
  background-color: rgba(0, 255, 0, 0.3);
  box-shadow: 0 0 20px var(--accent);
}
</style>
