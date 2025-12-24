<template>
  <div class="distance-selector">
    <h2 class="selector-title">Selecione a distância</h2>
    <div class="distance-options">
      <button
        v-for="(option, index) in distanceOptions"
        :key="index"
        :ref="(el) => setItemRef(el, index)"
        class="distance-option"
        :class="{ active: selectedDistance === option.value }"
        @click="selectDistance(option.value)"
        @keydown="handleKeyDown($event, index)"
      >
        {{ option.label }}
      </button>
    </div>
    <div v-if="customDistance" class="custom-distance">
      <label class="custom-label">Distância customizada (metros):</label>
      <input
        ref="customInputRef"
        type="number"
        v-model.number="customValue"
        min="1"
        max="15"
        step="0.1"
        class="custom-input"
        @keydown="handleInputKeyDown"
        @blur="confirmCustomDistance"
      />
    </div>
    <div v-if="warning" class="warning-box">
      {{ warning }}
    </div>
    <div class="actions">
      <button
        ref="confirmRef"
        class="confirm-button"
        @click="confirm"
        @keydown="handleConfirmKeyDown"
      >
        Confirmar
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface DistanceOption {
  label: string;
  value: number;
}

const props = defineProps<{
  modelValue: number | null;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: number | null];
  'confirm': [value: number];
}>();

const distanceOptions: DistanceOption[] = [
  { label: '3 metros', value: 3 },
  { label: '4 metros', value: 4 },
  { label: '5 metros', value: 5 },
  { label: '6 metros', value: 6 },
  { label: 'Custom', value: -1 }
];

const selectedDistance = ref<number | null>(props.modelValue);
const customDistance = ref(false);
const customValue = ref(3.0);
const warning = ref<string | null>(null);
const itemRefs = ref<HTMLElement[]>([]);
const customInputRef = ref<HTMLInputElement>();
const confirmRef = ref<HTMLButtonElement>();

const { normalizeRemoteKey, saveFocus, restoreFocus } = useRemoteNavigation({
  restoreFocus: true
});

const currentIndex = ref(0);

const setItemRef = (el: HTMLElement | null, index: number) => {
  if (el) {
    itemRefs.value[index] = el;
  }
};

const updateTabindex = () => {
  itemRefs.value.forEach((item, index) => {
    if (item) {
      item.tabIndex = index === currentIndex.value ? 0 : -1;
    }
  });
  if (confirmRef.value) {
    confirmRef.value.tabIndex = currentIndex.value === distanceOptions.length ? 0 : -1;
  }
};

const selectDistance = (value: number) => {
  if (value === -1) {
    customDistance.value = true;
    selectedDistance.value = null;
    nextTick(() => {
      customInputRef.value?.focus();
    });
  } else {
    customDistance.value = false;
    selectedDistance.value = value;
    const { warning: warn } = useCalibration().setDistance(value);
    warning.value = warn || null;
  }
};

const confirmCustomDistance = () => {
  if (customValue.value >= 1 && customValue.value <= 15) {
    selectedDistance.value = customValue.value;
    const { warning: warn } = useCalibration().setDistance(customValue.value);
    warning.value = warn || null;
  }
};

const confirm = () => {
  if (selectedDistance.value !== null && selectedDistance.value > 0) {
    emit('update:modelValue', selectedDistance.value);
    emit('confirm', selectedDistance.value);
  }
};

const moveFocus = (direction: 'UP' | 'DOWN') => {
  const total = distanceOptions.length + 1;
  let newIndex = currentIndex.value;

  switch (direction) {
    case 'UP':
      newIndex = currentIndex.value > 0 ? currentIndex.value - 1 : total - 1;
      break;
    case 'DOWN':
      newIndex = currentIndex.value < total - 1 ? currentIndex.value + 1 : 0;
      break;
  }

  currentIndex.value = newIndex;
  updateTabindex();

  if (newIndex < distanceOptions.length) {
    itemRefs.value[newIndex]?.focus();
  } else {
    confirmRef.value?.focus();
  }
  saveFocus(newIndex);
};

const handleKeyDown = (event: KeyboardEvent, index: number) => {
  const action = normalizeRemoteKey(event);
  
  if (action === 'UP' || action === 'DOWN') {
    event.preventDefault();
    currentIndex.value = index;
    moveFocus(action);
  } else if (action === 'OK') {
    event.preventDefault();
    if (index < distanceOptions.length) {
      selectDistance(distanceOptions[index].value);
    }
  }
};

const handleInputKeyDown = (event: KeyboardEvent) => {
  const action = normalizeRemoteKey(event);
  if (action === 'BACK') {
    event.preventDefault();
    customDistance.value = false;
    selectedDistance.value = null;
    itemRefs.value[currentIndex.value]?.focus();
  } else if (action === 'OK' || action === 'DOWN') {
    event.preventDefault();
    confirmCustomDistance();
    confirmRef.value?.focus();
    currentIndex.value = distanceOptions.length;
    updateTabindex();
  }
};

const handleConfirmKeyDown = (event: KeyboardEvent) => {
  const action = normalizeRemoteKey(event);
  if (action === 'UP') {
    event.preventDefault();
    currentIndex.value = distanceOptions.length - 1;
    updateTabindex();
    itemRefs.value[currentIndex.value]?.focus();
  } else if (action === 'OK') {
    event.preventDefault();
    confirm();
  }
};

onMounted(() => {
  updateTabindex();
  if (!restoreFocus([...itemRefs.value, confirmRef.value].filter(Boolean) as HTMLElement[])) {
    if (itemRefs.value[0]) {
      itemRefs.value[0].focus();
    }
  } else {
    const savedIndex = [...itemRefs.value, confirmRef.value].findIndex(item => item && item.tabIndex === 0);
    if (savedIndex >= 0) {
      currentIndex.value = savedIndex;
    }
  }
});

onBeforeUnmount(() => {
  const activeIndex = [...itemRefs.value, confirmRef.value].findIndex(item => item && item.tabIndex === 0);
  if (activeIndex >= 0) {
    saveFocus(activeIndex);
  }
});
</script>

<style scoped>
.distance-selector {
  width: 100%;
  max-width: 600px;
  padding: 2rem;
}

.selector-title {
  font-size: 1.5rem;
  margin-bottom: 2rem;
  text-align: center;
  color: var(--text-primary);
}

.distance-options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.distance-option {
  padding: 1.5rem;
  background-color: var(--button-bg);
  border: 3px solid transparent;
  border-radius: 0.75rem;
  color: var(--text-primary);
  font-size: 1.125rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  outline: none;
  text-align: center;
}

.distance-option.active {
  background-color: var(--button-active-bg);
  border-color: var(--accent);
}

.distance-option:focus-visible {
  outline: 4px solid var(--accent);
  outline-offset: 2px;
  border-color: var(--accent);
  transform: scale(1.05);
  background-color: var(--button-active-bg);
  box-shadow: 0 0 20px var(--accent);
}

.custom-distance {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background-color: var(--button-bg);
  border-radius: 0.5rem;
  border: 1px solid var(--border-color);
}

.custom-label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
  opacity: 0.8;
}

.custom-input {
  width: 100%;
  padding: 0.75rem;
  background-color: var(--bg-secondary);
  border: 2px solid var(--border-color);
  border-radius: 0.5rem;
  color: var(--text-primary);
  font-size: 1rem;
  outline: none;
}

.custom-input:focus-visible {
  outline: 4px solid var(--accent);
  outline-offset: 2px;
  border-color: var(--accent);
  transform: scale(1.02);
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

