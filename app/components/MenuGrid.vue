<template>
  <v-container class="menu-grid" ref="gridRef" fluid>
    <v-row dense>
      <v-col
        v-for="(item, index) in items"
        :key="index"
        :cols="columnSpan"
      >
        <v-btn
          :ref="(el) => setItemRef(el, index)"
          class="menu-item"
          block
          size="x-large"
          variant="tonal"
          color="primary"
          @click="handleItemClick(item)"
          @keydown="handleKeyDown($event, index)"
        >
          {{ item.label }}
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
interface MenuItem {
  label: string;
  action: () => void;
}

interface Props {
  items: MenuItem[];
  columns?: number;
}

const props = withDefaults(defineProps<Props>(), {
  columns: 2
});

const gridRef = ref<unknown>(null);
const itemRefs = ref<HTMLElement[]>([]);
const currentIndex = ref(0);

const resolveElement = (target: unknown): HTMLElement | null => {
  if (!target) return null;
  if (target instanceof HTMLElement) return target;
  return (target as { $el?: HTMLElement }).$el ?? null;
};

const setItemRef = (el: unknown, index: number) => {
  const element = resolveElement(el);
  if (element) {
    itemRefs.value[index] = element;
  }
};

const columnSpan = computed(() => Math.max(1, Math.floor(12 / props.columns)));

const { normalizeRemoteKey, saveFocus, restoreFocus } = useRemoteNavigation({
  restoreFocus: true
});

const updateTabindex = () => {
  itemRefs.value.forEach((item, index) => {
    if (item) {
      item.tabIndex = index === currentIndex.value ? 0 : -1;
    }
  });
};

const moveFocus = (direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
  const total = props.items.length;
  if (total === 0) return;

  const cols = props.columns;
  const rows = Math.ceil(total / cols);
  const currentRow = Math.floor(currentIndex.value / cols);
  const currentCol = currentIndex.value % cols;
  let newRow = currentRow;
  let newCol = currentCol;

  switch (direction) {
    case 'UP':
      newRow = currentRow > 0 ? currentRow - 1 : rows - 1;
      break;
    case 'DOWN':
      newRow = currentRow < rows - 1 ? currentRow + 1 : 0;
      break;
    case 'LEFT':
      newCol = currentCol > 0 ? currentCol - 1 : cols - 1;
      break;
    case 'RIGHT':
      newCol = currentCol < cols - 1 ? currentCol + 1 : 0;
      break;
  }

  const newIndex = newRow * cols + newCol;
  if (newIndex < total) {
    currentIndex.value = newIndex;
    updateTabindex();
    itemRefs.value[newIndex]?.focus();
    saveFocus(newIndex);
  }
};

const handleKeyDown = (event: KeyboardEvent, index: number) => {
  const action = normalizeRemoteKey(event);
  
  if (action === 'UP' || action === 'DOWN' || action === 'LEFT' || action === 'RIGHT') {
    event.preventDefault();
    currentIndex.value = index;
    moveFocus(action);
  } else if (action === 'OK') {
    event.preventDefault();
    props.items[index].action();
  }
};

const handleItemClick = (item: MenuItem) => {
  item.action();
};

onMounted(() => {
  updateTabindex();
  if (!restoreFocus(itemRefs.value)) {
    if (itemRefs.value[0]) {
      itemRefs.value[0].focus();
    }
  } else {
    const savedIndex = itemRefs.value.findIndex(item => item.tabIndex === 0);
    if (savedIndex >= 0) {
      currentIndex.value = savedIndex;
    }
  }
});

onBeforeUnmount(() => {
  const activeIndex = itemRefs.value.findIndex(item => item.tabIndex === 0);
  if (activeIndex >= 0) {
    saveFocus(activeIndex);
  }
});
</script>

<style scoped>
.menu-grid {
  width: 100%;
  max-width: 800px;
  padding: 2rem;
}

.menu-item {
  min-height: 120px;
  font-size: 1.25rem;
  font-weight: 500;
}

.menu-item:focus-visible {
  transform: scale(1.02);
}
</style>
