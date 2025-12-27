<template>
  <v-container class="pro-page" fluid>
    <v-card variant="outlined">
      <v-card-title class="pro-title">Modo Pro</v-card-title>

      <v-card-text v-if="!isUnlocked" class="pin-entry">
        <h3 class="pin-title">Digite o PIN</h3>
        <div class="pin-display">
          <v-chip
            v-for="(digit, index) in pinDisplay"
            :key="index"
            class="pin-digit"
            :color="digit !== '' ? 'primary' : 'secondary'"
            variant="tonal"
            label
          >
            {{ digit || '○' }}
          </v-chip>
        </div>
        <v-row class="pin-keypad" dense>
          <v-col
            v-for="num in 9"
            :key="num"
            cols="4"
          >
            <v-btn
              :ref="(el) => setKeypadRef(el, num - 1)"
              class="pin-key"
              block
              size="x-large"
              variant="tonal"
              color="secondary"
              @click="enterDigit(num)"
              @keydown="handleKeypadKeyDown($event, num - 1)"
            >
              {{ num }}
            </v-btn>
          </v-col>
          <v-col cols="4">
            <v-btn
              ref="zeroKeyRef"
              class="pin-key"
              block
              size="x-large"
              variant="tonal"
              color="secondary"
              @click="enterDigit(0)"
              @keydown="handleZeroKeyDown"
            >
              0
            </v-btn>
          </v-col>
          <v-col cols="4">
            <v-btn
              ref="clearKeyRef"
              class="pin-key clear"
              block
              size="x-large"
              variant="tonal"
              color="warning"
              @click="clearPin"
              @keydown="handleClearKeyDown"
            >
              C
            </v-btn>
          </v-col>
        </v-row>
        <v-alert v-if="pinError" type="error" variant="tonal" class="pin-error">
          PIN incorreto
        </v-alert>
      </v-card-text>

      <v-card-text v-else class="pro-content">
        <v-card class="pro-section" variant="tonal">
          <v-card-title class="section-title">Travar Calibração</v-card-title>
          <v-card-text>
            <v-btn
              ref="lockToggleRef"
              class="toggle-button"
              :color="calibrationLocked ? 'warning' : 'secondary'"
              :variant="calibrationLocked ? 'elevated' : 'tonal'"
              @click="toggleCalibrationLock"
              @keydown="handleLockKeyDown"
            >
              {{ calibrationLocked ? 'TRAVADA' : 'DESTRAVADA' }}
            </v-btn>
            <p class="section-hint">Quando travada, a calibração não pode ser alterada</p>
          </v-card-text>
        </v-card>

        <v-card class="pro-section" variant="tonal">
          <v-card-title class="section-title">Contador de Sessões</v-card-title>
          <v-card-text>
            <div class="session-counter">{{ sessionCount }}</div>
            <p class="section-hint">Número de sessões de teste realizadas</p>
          </v-card-text>
        </v-card>

        <v-card class="pro-section" variant="tonal">
          <v-card-title class="section-title">Alterar PIN</v-card-title>
          <v-card-text>
            <v-btn
              ref="changePinRef"
              class="action-button"
              color="primary"
              variant="tonal"
              @click="changePin"
              @keydown="handleChangePinKeyDown"
            >
              Alterar PIN
            </v-btn>
          </v-card-text>
        </v-card>

        <v-card class="pro-section" variant="tonal">
          <v-card-text>
            <v-btn
              ref="backRef"
              class="action-button"
              color="secondary"
              variant="tonal"
              @click="goBack"
              @keydown="handleBackKeyDown"
            >
              Voltar
            </v-btn>
          </v-card-text>
        </v-card>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
const { setCalibrationLocked } = useCalibration();
const { sessionCount, setProPin, verifyProPin } = useSettings();

const isUnlocked = ref(false);
const pinInput = ref('');
const pinError = ref(false);
const calibrationLocked = ref(false);

const keypadRefs = ref<HTMLElement[]>([]);
const zeroKeyRef = ref<unknown>(null);
const clearKeyRef = ref<unknown>(null);
const lockToggleRef = ref<unknown>(null);
const changePinRef = ref<unknown>(null);
const backRef = ref<unknown>(null);

const { normalizeRemoteKey } = useRemoteNavigation({
  restoreFocus: true
});

const pinDisplay = computed(() => {
  return pinInput.value.padEnd(4, '').split('').slice(0, 4);
});

const resolveElement = (target: unknown): HTMLElement | null => {
  if (!target) return null;
  if (target instanceof HTMLElement) return target;
  return (target as { $el?: HTMLElement }).$el ?? null;
};

const setKeypadRef = (el: unknown, index: number) => {
  const element = resolveElement(el);
  if (element) {
    keypadRefs.value[index] = element;
  }
};

const updateKeypadTabindex = () => {
  const allKeys = [
    ...keypadRefs.value,
    resolveElement(zeroKeyRef.value),
    resolveElement(clearKeyRef.value)
  ].filter(Boolean) as HTMLElement[];
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
  const allKeys = [
    ...keypadRefs.value,
    resolveElement(zeroKeyRef.value),
    resolveElement(clearKeyRef.value)
  ].filter(Boolean) as HTMLElement[];

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
    const controls = [
      resolveElement(lockToggleRef.value),
      resolveElement(changePinRef.value),
      resolveElement(backRef.value)
    ].filter(Boolean) as HTMLElement[];
    const currentIndex = controls.findIndex(c => c === resolveElement(lockToggleRef.value));
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
    const controls = [
      resolveElement(lockToggleRef.value),
      resolveElement(changePinRef.value),
      resolveElement(backRef.value)
    ].filter(Boolean) as HTMLElement[];
    const currentIndex = controls.findIndex(c => c === resolveElement(changePinRef.value));
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
    resolveElement(changePinRef.value)?.focus();
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
    resolveElement(lockToggleRef.value)?.focus();
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
  font-size: 1.5rem;
  font-weight: 600;
}

.pin-keypad {
  gap: 1rem;
  max-width: 300px;
  width: 100%;
}

.pin-key {
  font-size: 1.5rem;
  font-weight: 600;
  min-height: 80px;
}

.pin-error {
  font-weight: 600;
}

.pro-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.pro-section {
  padding: 1.5rem;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
}

.section-hint {
  font-size: 0.875rem;
  margin: 0;
  opacity: 0.7;
}

.toggle-button {
  font-size: 1.25rem;
  font-weight: 600;
  align-self: flex-start;
}

.session-counter {
  font-size: 3rem;
  font-weight: 700;
  color: rgb(var(--v-theme-primary));
  text-align: center;
}

.action-button {
  font-size: 1.125rem;
  font-weight: 600;
  align-self: flex-start;
}
</style>
