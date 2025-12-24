<template>
  <div class="pro-page">
    <h2 class="pro-title">Modo Pro</h2>

    <div v-if="!isUnlocked" class="pin-entry">
      <h3 class="pin-title">Digite o PIN</h3>
      <div class="pin-display">
        <span
          v-for="(digit, index) in pinDisplay"
          :key="index"
          class="pin-digit"
          :class="{ filled: digit !== '' }"
        >
          {{ digit || '○' }}
        </span>
      </div>
      <div class="pin-keypad">
        <button
          v-for="num in 9"
          :key="num"
          :ref="(el) => setKeypadRef(el, num - 1)"
          class="pin-key"
          @click="enterDigit(num)"
          @keydown="handleKeypadKeyDown($event, num - 1)"
        >
          {{ num }}
        </button>
        <button
          ref="zeroKeyRef"
          class="pin-key"
          @click="enterDigit(0)"
          @keydown="handleZeroKeyDown"
        >
          0
        </button>
        <button
          ref="clearKeyRef"
          class="pin-key clear"
          @click="clearPin"
          @keydown="handleClearKeyDown"
        >
          C
        </button>
      </div>
      <div v-if="pinError" class="pin-error">
        PIN incorreto
      </div>
    </div>

    <div v-else class="pro-content">
      <div class="pro-section">
        <h3 class="section-title">Travar Calibração</h3>
        <button
          ref="lockToggleRef"
          class="toggle-button"
          :class="{ active: calibrationLocked }"
          @click="toggleCalibrationLock"
          @keydown="handleLockKeyDown"
        >
          {{ calibrationLocked ? 'TRAVADA' : 'DESTRAVADA' }}
        </button>
        <p class="section-hint">Quando travada, a calibração não pode ser alterada</p>
      </div>

      <div class="pro-section">
        <h3 class="section-title">Contador de Sessões</h3>
        <div class="session-counter">{{ sessionCount }}</div>
        <p class="section-hint">Número de sessões de teste realizadas</p>
      </div>

      <div class="pro-section">
        <h3 class="section-title">Alterar PIN</h3>
        <button
          ref="changePinRef"
          class="action-button"
          @click="changePin"
          @keydown="handleChangePinKeyDown"
        >
          Alterar PIN
        </button>
      </div>

      <div class="pro-section">
        <button
          ref="backRef"
          class="action-button"
          @click="goBack"
          @keydown="handleBackKeyDown"
        >
          Voltar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { setCalibrationLocked } = useCalibration();
const { sessionCount, setProPin, verifyProPin } = useSettings();

const isUnlocked = ref(false);
const pinInput = ref('');
const pinError = ref(false);
const calibrationLocked = ref(false);

const keypadRefs = ref<(HTMLButtonElement | null)[]>([]);
const zeroKeyRef = ref<HTMLButtonElement>();
const clearKeyRef = ref<HTMLButtonElement>();
const lockToggleRef = ref<HTMLButtonElement>();
const changePinRef = ref<HTMLButtonElement>();
const backRef = ref<HTMLButtonElement>();

const { normalizeRemoteKey } = useRemoteNavigation({
  restoreFocus: true
});

const pinDisplay = computed(() => {
  return pinInput.value.padEnd(4, '').split('').slice(0, 4);
});

const setKeypadRef = (el: HTMLButtonElement | null, index: number) => {
  if (el) {
    keypadRefs.value[index] = el;
  }
};

const updateKeypadTabindex = () => {
  const allKeys = [...keypadRefs.value, zeroKeyRef.value, clearKeyRef.value].filter(Boolean) as HTMLElement[];
  allKeys.forEach((key, index) => {
    if (key) {
      key.tabIndex = index === currentKeypadIndex.value ? 0 : -1;
    }
  });
};

const currentKeypadIndex = ref(0);

const enterDigit = (digit: number) => {
  if (pinInput.value.length < 4) {
    pinInput.value += digit.toString();
    pinError.value = false;
    
    if (pinInput.value.length === 4) {
      if (verifyProPin(pinInput.value)) {
        isUnlocked.value = true;
        pinInput.value = '';
      } else {
        pinError.value = true;
        setTimeout(() => {
          pinInput.value = '';
          pinError.value = false;
        }, 1000);
      }
    }
  }
};

const clearPin = () => {
  pinInput.value = '';
  pinError.value = false;
};

const toggleCalibrationLock = () => {
  calibrationLocked.value = !calibrationLocked.value;
  setCalibrationLocked(calibrationLocked.value);
};

const changePin = () => {
  const newPin = prompt('Digite o novo PIN (4 dígitos):');
  if (newPin && /^\d{4}$/.test(newPin)) {
    setProPin(newPin);
    alert('PIN alterado com sucesso!');
  } else if (newPin) {
    alert('PIN deve ter exatamente 4 dígitos numéricos.');
  }
};

const goBack = () => {
  navigateTo('/settings');
};

const handleKeypadKeyDown = (event: KeyboardEvent, index: number) => {
  const action = normalizeRemoteKey(event);
  const allKeys = [...keypadRefs.value, zeroKeyRef.value, clearKeyRef.value].filter(Boolean) as HTMLElement[];
  
  if (action === 'OK') {
    event.preventDefault();
    enterDigit(index + 1);
  } else if (action === 'UP' || action === 'DOWN' || action === 'LEFT' || action === 'RIGHT') {
    event.preventDefault();
    let newIndex = index;
    const cols = 3;
    const row = Math.floor(index / cols);
    const col = index % cols;
    
    switch (action) {
      case 'UP':
        newIndex = row > 0 ? index - cols : index;
        break;
      case 'DOWN':
        newIndex = row < 2 ? index + cols : (index === 8 ? 9 : index);
        break;
      case 'LEFT':
        newIndex = col > 0 ? index - 1 : index;
        break;
      case 'RIGHT':
        newIndex = col < 2 ? index + 1 : index;
        break;
    }
    
    if (newIndex < allKeys.length) {
      currentKeypadIndex.value = newIndex;
      updateKeypadTabindex();
      allKeys[newIndex]?.focus();
    }
  }
};

const handleZeroKeyDown = (event: KeyboardEvent) => {
  const action = normalizeRemoteKey(event);
  if (action === 'OK') {
    event.preventDefault();
    enterDigit(0);
  } else if (action === 'UP') {
    event.preventDefault();
    currentKeypadIndex.value = 6;
    updateKeypadTabindex();
    keypadRefs.value[6]?.focus();
  }
};

const handleClearKeyDown = (event: KeyboardEvent) => {
  const action = normalizeRemoteKey(event);
  if (action === 'OK') {
    event.preventDefault();
    clearPin();
  } else if (action === 'UP') {
    event.preventDefault();
    currentKeypadIndex.value = 7;
    updateKeypadTabindex();
    keypadRefs.value[7]?.focus();
  }
};

const handleLockKeyDown = (event: KeyboardEvent) => {
  const action = normalizeRemoteKey(event);
  if (action === 'OK') {
    event.preventDefault();
    toggleCalibrationLock();
  } else if (action === 'UP' || action === 'DOWN') {
    event.preventDefault();
    const controls = [lockToggleRef.value, changePinRef.value, backRef.value].filter(Boolean) as HTMLElement[];
    const currentIndex = controls.findIndex(c => c === lockToggleRef.value);
    let newIndex = currentIndex;
    if (action === 'DOWN') {
      newIndex = Math.min(controls.length - 1, currentIndex + 1);
    } else {
      newIndex = Math.max(0, currentIndex - 1);
    }
    controls[newIndex]?.focus();
  }
};

const handleChangePinKeyDown = (event: KeyboardEvent) => {
  const action = normalizeRemoteKey(event);
  if (action === 'OK') {
    event.preventDefault();
    changePin();
  } else if (action === 'UP' || action === 'DOWN') {
    event.preventDefault();
    const controls = [lockToggleRef.value, changePinRef.value, backRef.value].filter(Boolean) as HTMLElement[];
    const currentIndex = controls.findIndex(c => c === changePinRef.value);
    let newIndex = currentIndex;
    if (action === 'DOWN') {
      newIndex = Math.min(controls.length - 1, currentIndex + 1);
    } else {
      newIndex = Math.max(0, currentIndex - 1);
    }
    controls[newIndex]?.focus();
  }
};

const handleBackKeyDown = (event: KeyboardEvent) => {
  const action = normalizeRemoteKey(event);
  if (action === 'OK') {
    event.preventDefault();
    goBack();
  } else if (action === 'UP') {
    event.preventDefault();
    changePinRef.value?.focus();
  }
};

useRemoteNavigation({
  onAction: (action) => {
    if (action === 'BACK') {
      if (isUnlocked.value) {
        goBack();
      } else {
        navigateTo('/settings');
      }
      return false;
    }
  }
});

onMounted(() => {
  if (!isUnlocked.value) {
    updateKeypadTabindex();
    if (keypadRefs.value[0]) {
      keypadRefs.value[0].focus();
    }
  } else {
    if (lockToggleRef.value) {
      lockToggleRef.value.focus();
    }
  }
});
</script>

<style scoped>
.pro-page {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.pro-title {
  font-size: 2rem;
  margin-bottom: 2rem;
  text-align: center;
  color: var(--text-primary);
}

.pin-entry {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}

.pin-title {
  font-size: 1.5rem;
  margin: 0;
  color: var(--text-primary);
}

.pin-display {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.pin-digit {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--button-bg);
  border: 3px solid var(--border-color);
  border-radius: 0.5rem;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.pin-digit.filled {
  color: var(--accent);
  border-color: var(--accent);
}

.pin-keypad {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  max-width: 300px;
}

.pin-key {
  padding: 1.5rem;
  background-color: var(--button-bg);
  border: 3px solid transparent;
  border-radius: 0.75rem;
  color: var(--text-primary);
  font-size: 1.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  outline: none;
  min-height: 80px;
}

.pin-key.clear {
  background-color: rgba(255, 193, 7, 0.2);
  border-color: #ffc107;
}

.pin-key:focus-visible {
  outline: 4px solid var(--accent);
  outline-offset: 2px;
  transform: scale(1.05);
  background-color: var(--button-active-bg);
  border-color: var(--accent);
  box-shadow: 0 0 20px var(--accent);
}

.pin-error {
  padding: 1rem;
  background-color: rgba(255, 0, 0, 0.2);
  border: 2px solid #ff0000;
  border-radius: 0.5rem;
  color: #ff0000;
  font-weight: 600;
}

.pro-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.pro-section {
  padding: 1.5rem;
  background-color: var(--button-bg);
  border-radius: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  border: 1px solid var(--border-color);
}

.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.section-hint {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
  opacity: 0.7;
}

.toggle-button {
  padding: 1rem 2rem;
  background-color: var(--button-bg);
  border: 3px solid transparent;
  border-radius: 0.75rem;
  color: var(--text-primary);
  font-size: 1.25rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  outline: none;
  align-self: flex-start;
}

.toggle-button.active {
  background-color: rgba(255, 193, 7, 0.2);
  border-color: #ffc107;
}

.toggle-button:focus-visible {
  outline: 4px solid var(--accent);
  outline-offset: 2px;
  transform: scale(1.05);
  background-color: var(--button-active-bg);
  border-color: var(--accent);
  box-shadow: 0 0 20px var(--accent);
}

.session-counter {
  font-size: 3rem;
  font-weight: 700;
  color: var(--accent);
  text-align: center;
}

.action-button {
  padding: 1.25rem 2rem;
  background-color: var(--button-bg);
  border: 3px solid transparent;
  border-radius: 0.75rem;
  color: var(--text-primary);
  font-size: 1.125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  outline: none;
  align-self: flex-start;
}

.action-button:focus-visible {
  outline: 4px solid var(--accent);
  outline-offset: 2px;
  transform: scale(1.05);
  background-color: var(--button-active-bg);
  border-color: var(--accent);
  box-shadow: 0 0 20px var(--accent);
}
</style>

