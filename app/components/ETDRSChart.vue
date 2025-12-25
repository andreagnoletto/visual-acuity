<template>
  <v-container class="etdrs-chart" fluid>
    <v-row
      v-for="line in visibleLines"
      :key="line.lineIndex"
      class="etdrs-line"
      :class="{ 'current-line': line.lineIndex === currentLineIndex }"
      :style="{ fontSize: line.fontSizePx + 'px' }"
      align="center"
      justify="center"
      no-gutters
    >
      <v-col cols="auto" class="line-label">
        <span class="line-number">Linha {{ line.lineNumber }}</span>
        <span class="snellen-ratio">{{ line.snellenRatio }}</span>
        <span class="logmar">logMAR {{ line.logMAR.toFixed(1) }}</span>
      </v-col>
      <v-col class="optotypes-container">
        <span
          v-for="(optotype, optIndex) in line.displayOptotypes"
          :key="optIndex"
          class="optotype"
        >
          {{ optotype }}
        </span>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
interface Props {
  currentLineIndex?: number;
  showAllLines?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  currentLineIndex: 0,
  showAllLines: false
});

import { ETDRS_LINES, generateETDRSLine } from '~/domain/vision/etdrs';
const { generateETDRSLines, calculateVisibleLinesCount } = useETDRSGenerator();

interface ETDRSLineDisplay {
  lineIndex: number;
  lineNumber: number;
  snellenRatio: string;
  logMAR: number;
  fontSizePx: number;
  displayOptotypes: string[];
}

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

const visibleLines = computed<ETDRSLineDisplay[]>(() => {
  const _ = windowWidth.value;
  const _h = windowHeight.value;

  const lines = generateETDRSLines();
  if (lines.length === 0) return [];

  const currentLine = lines[props.currentLineIndex];
  if (!currentLine) return [];

  const visibleCount = calculateVisibleLinesCount(currentLine.fontSizePx, windowHeight.value);
  const halfCount = Math.floor(visibleCount / 2);
  const startIndex = Math.max(0, props.currentLineIndex - halfCount);
  const endIndex = Math.min(lines.length - 1, props.currentLineIndex + (visibleCount - halfCount - 1));

  const visibleLinesResult: ETDRSLineDisplay[] = [];
  for (let i = startIndex; i <= endIndex; i++) {
    const line = lines[i];
    const etdrsLine = ETDRS_LINES[i];
    if (line && etdrsLine) {
      // ETDRS always has exactly 5 letters per line
      const displayOptotypes = generateETDRSLine(i);
      visibleLinesResult.push({
        lineIndex: i,
        lineNumber: etdrsLine.lineNumber,
        snellenRatio: etdrsLine.snellenRatio,
        logMAR: etdrsLine.logMAR,
        fontSizePx: line.fontSizePx,
        displayOptotypes
      });
    }
  }

  return visibleLinesResult;
});
</script>

<style scoped>
.etdrs-chart {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  padding: 2rem;
  min-height: 60vh;
}

.etdrs-line {
  width: 100%;
  opacity: 0.3;
  transition: opacity 0.3s, color 0.3s;
  color: var(--text-secondary);
  gap: 2rem;
}

.etdrs-line.current-line {
  opacity: 1;
  color: var(--text-primary);
}

.line-label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  align-items: flex-start;
  font-size: 0.875rem;
  min-width: 150px;
}

.etdrs-line.current-line .line-label {
  color: var(--text-primary);
  opacity: 0.9;
}

.etdrs-line:not(.current-line) .line-label {
  color: var(--text-secondary);
  opacity: 0.3;
}

.line-number {
  font-weight: 700;
  font-size: 1rem;
}

.snellen-ratio {
  font-weight: 600;
}

.logmar {
  opacity: 0.7;
}

.optotypes-container {
  display: flex;
  gap: 1rem;
  justify-content: center;
  align-items: center;
  flex-wrap: nowrap;
  white-space: nowrap;
  overflow-x: auto;
  width: 100%;
  max-width: calc(100vw - 200px);
}

.optotype {
  display: inline-block;
  flex-shrink: 0;
  color: inherit;
}
</style>
