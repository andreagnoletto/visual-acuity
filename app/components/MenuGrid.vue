<template>
  <div class="menu-grid" ref="gridRef">
    <button
      v-for="(item, index) in items"
      :key="index"
      :ref="(el) => setItemRef(el, index)"
      class="menu-item"
      @click="handleItemClick(item)"
      @keydown="handleKeyDown($event, index)"
    >
      {{ item.label }}
    </button>
  </div>
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

const gridRef = ref<HTMLElement>();
const itemRefs = ref<HTMLElement[]>([]);
const currentIndex = ref(0);

const setItemRef = (el: HTMLElement | null, index: number) => {
  if (el) {
    itemRefs.value[index] = el;
  }
};

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
  display: grid;
  grid-template-columns: repeat(v-bind('props.columns'), 1fr);
  gap: 1.5rem;
  width: 100%;
  max-width: 800px;
  padding: 2rem;
}

.menu-item {
  padding: 2rem;
  background-color: var(--button-bg);
  border: 3px solid transparent;
  border-radius: 0.75rem;
  color: var(--text-primary);
  font-size: 1.25rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  outline: none;
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.menu-item:hover {
  background-color: var(--button-bg-hover);
}

.menu-item:focus-visible {
  outline: 4px solid var(--accent);
  outline-offset: 2px;
  border-color: var(--accent);
  transform: scale(1.05);
  background-color: var(--button-active-bg);
  box-shadow: 0 0 20px var(--accent);
}
</style>

