<template>
  <v-card class="distance-selector" elevation="6">
    <v-card-title class="text-center">Selecione a distância</v-card-title>
    <v-card-text>
      <v-row class="distance-options" dense>
        <v-col cols="12" v-for="(option, index) in distanceOptions" :key="index">
          <v-btn
            :ref="(el) => setItemRef(el, index)"
            :color="selectedDistance === option.value ? 'primary' : 'secondary'"
            :variant="selectedDistance === option.value ? 'elevated' : 'tonal'"
            block
            size="large"
            @click="selectDistance(option.value)"
            @keydown="handleKeyDown($event, index)"
          >
            {{ option.label }}
          </v-btn>
        </v-col>
      </v-row>

      <v-expand-transition>
        <div v-if="customDistance" class="custom-distance">
          <v-text-field
            ref="customInputRef"
            v-model.number="customValue"
            label="Distância customizada (metros)"
            type="number"
            min="1"
            max="15"
            step="0.1"
            density="comfortable"
            variant="outlined"
            @keydown="handleInputKeyDown"
            @blur="confirmCustomDistance"
          />
        </div>
      </v-expand-transition>

      <v-alert
        v-if="warning"
        type="warning"
        variant="tonal"
        class="warning-box"
      >
        {{ warning }}
      </v-alert>
    </v-card-text>
    <v-card-actions class="justify-center">
      <v-btn
        ref="confirmRef"
        color="primary"
        variant="elevated"
        size="large"
        @click="confirm"
        @keydown="handleConfirmKeyDown"
      >
        Confirmar
      </v-btn>
    </v-card-actions>
  </v-card>
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
const customInputRef = ref<any>();
const confirmRef = ref<any>();

const { normalizeRemoteKey, saveFocus, restoreFocus } = useRemoteNavigation({
  restoreFocus: true
});

const currentIndex = ref(0);

const resolveElement = (el: any): HTMLElement | null => {
  return (el?.$el ?? el) as HTMLElement | null;
};

const setItemRef = (el: any, index: number) => {
  const element = resolveElement(el);
  if (element) {
    itemRefs.value[index] = element;
  }
};

const updateTabindex = () => {
  itemRefs.value.forEach((item, index) => {
    if (item) {
      item.tabIndex = index === currentIndex.value ? 0 : -1;
    }
  });
  const confirmEl = resolveElement(confirmRef.value);
  if (confirmEl) {
    confirmEl.tabIndex = currentIndex.value === distanceOptions.length ? 0 : -1;
  }
};

const selectDistance = (value: number) => {
  if (value === -1) {
    customDistance.value = true;
    selectedDistance.value = null;
    nextTick(() => {
      customInputRef.value?.focus?.();
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
    resolveElement(confirmRef.value)?.focus();
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
    resolveElement(confirmRef.value)?.focus();
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
  const confirmEl = resolveElement(confirmRef.value);
  if (!restoreFocus([...itemRefs.value, confirmEl].filter(Boolean) as HTMLElement[])) {
    if (itemRefs.value[0]) {
      itemRefs.value[0].focus();
    }
  } else {
    const savedIndex = [...itemRefs.value, confirmEl].findIndex(item => item && item.tabIndex === 0);
    if (savedIndex >= 0) {
      currentIndex.value = savedIndex;
    }
  }
});

onBeforeUnmount(() => {
  const confirmEl = resolveElement(confirmRef.value);
  const activeIndex = [...itemRefs.value, confirmEl].findIndex(item => item && item.tabIndex === 0);
  if (activeIndex >= 0) {
    saveFocus(activeIndex);
  }
});
</script>

<style scoped>
.distance-selector {
  width: 100%;
  max-width: 420px;
}

.distance-options {
  margin-bottom: 1rem;
}

.custom-distance {
  margin-top: 1rem;
}

.warning-box {
  margin-top: 1rem;
}
</style>
