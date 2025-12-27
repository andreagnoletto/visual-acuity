<template>
  <v-container class="optotype-chart" fluid>
    <v-row
      v-for="(line, index) in optotypeLines"
      :key="index"
      class="optotype-line"
      align="center"
      no-gutters
      :class="{ 'current-line': line.lineIndex === props.currentLineIndex }"
      :style="{ fontSize: line.fontSizePx + 'px' }"
    >
      <v-col cols="auto" class="line-label">
        <span class="snellen-ratio">{{ line.snellenRatio }}</span>
        <span class="logmar">logMAR {{ line.logMAR.toFixed(1) }}</span>
      </v-col>
      <v-col>
        <v-sheet class="optotypes-container" color="transparent">
          <span
            v-for="(optotype, optIndex) in line.displayOptotypes"
            :key="optIndex"
            class="optotype"
          >
            {{ optotype }}
          </span>
        </v-sheet>
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

import { VISION_LINES, parseSnellenRatio } from '~/domain/vision/lines';
const { generateLines, generateRandomizedOptotypes, calculateOptotypesPerLine } = useOptotypeGenerator();

interface OptotypeLineDisplay {
  lineIndex: number;
  snellenRatio: string;
  logMAR: number;
  fontSizePx: number;
  displayOptotypes: string[];
}

const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1920);

if (typeof window !== 'undefined') {
  const updateWidth = () => {
    windowWidth.value = window.innerWidth;
  };
  onMounted(() => {
    window.addEventListener('resize', updateWidth);
  });
  onBeforeUnmount(() => {
    window.removeEventListener('resize', updateWidth);
  });
}

const calculateOptotypesCount = (fontSizePx: number, snellenRatio: string): number => {
  return calculateOptotypesPerLine(fontSizePx, snellenRatio, windowWidth.value);
};

const optotypeLines = computed<OptotypeLineDisplay[]>(() => {
  // Usar windowWidth para forçar recálculo quando a tela redimensionar
  const _ = windowWidth.value;
  
  const lines = generateLines();
  
  if (props.showAllLines) {
    return lines.map((line, idx) => {
      const visionLine = VISION_LINES[idx];
      if (!visionLine) return line;
      
      const count = calculateOptotypesCount(line.fontSizePx, line.snellenRatio);
      return {
        ...line,
        displayOptotypes: generateRandomizedOptotypes(visionLine, count)
      };
    });
  }

  const visibleLines: OptotypeLineDisplay[] = [];
  const startIndex = Math.max(0, props.currentLineIndex - 1);
  const endIndex = Math.min(lines.length - 1, props.currentLineIndex + 1);

  for (let i = startIndex; i <= endIndex; i++) {
    const line = lines[i];
    const visionLine = VISION_LINES[i];
    if (line && visionLine) {
      const count = calculateOptotypesCount(line.fontSizePx, line.snellenRatio);
      visibleLines.push({
        ...line,
        displayOptotypes: generateRandomizedOptotypes(visionLine, count)
      });
    }
  }

  return visibleLines;
});
</script>

<style scoped>
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
