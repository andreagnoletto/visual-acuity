<template>
  <v-container class="pro-page" fluid>
    <v-row justify="center">
      <v-col cols="12" md="10" lg="8">
        <v-card elevation="8">
          <v-card-title class="text-h4 text-center">Modo Pro</v-card-title>
          <v-card-text>
            <div v-if="!isUnlocked" class="pin-entry">
              <div class="pin-title">Digite o PIN</div>
              <div class="pin-display">
                <v-chip
                  v-for="(digit, index) in pinDisplay"
                  :key="index"
                  class="pin-digit"
                  :color="digit !== '' ? 'primary' : 'secondary'"
                  variant="tonal"
                >
                  {{ digit || '○' }}
                </v-chip>
              </div>
              <v-row class="pin-keypad" dense>
                <v-col cols="4" v-for="num in 9" :key="num">
                  <v-btn
                    :ref="(el) => setKeypadRef(el, num - 1)"
                    color="secondary"
                    variant="tonal"
                    block
                    size="x-large"
                    @click="enterDigit(num)"
                    @keydown="handleKeypadKeyDown($event, num - 1)"
                  >
                    {{ num }}
                  </v-btn>
                </v-col>
                <v-col cols="4">
                  <v-btn
                    ref="zeroKeyRef"
                    color="secondary"
                    variant="tonal"
                    block
                    size="x-large"
                    @click="enterDigit(0)"
                    @keydown="handleZeroKeyDown"
                  >
                    0
                  </v-btn>
                </v-col>
                <v-col cols="4">
                  <v-btn
                    ref="clearKeyRef"
                    color="warning"
                    variant="tonal"
                    block
                    size="x-large"
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
            </div>

            <div v-else class="pro-content">
              <v-card class="pro-section" variant="tonal">
                <v-card-title class="section-title">Travar Calibração</v-card-title>
                <v-card-text>
                  <v-btn
                    ref="lockToggleRef"
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
                    color="secondary"
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
                    color="secondary"
                    variant="tonal"
                    @click="goBack"
                    @keydown="handleBackKeyDown"
                  >
                    Voltar
                  </v-btn>
                </v-card-text>
              </v-card>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
const { setCalibrationLocked } = useCalibration();
const { sessionCount, setProPin, verifyProPin } = useSettings();

const isUnlocked = ref(false);
const pinInput = ref('');
const pinError = ref(false);
const calibrationLocked = ref(false);

const keypadRefs = ref<(HTMLElement | null)[]>([]);
const zeroKeyRef = ref<any>();
const clearKeyRef = ref<any>();
const lockToggleRef = ref<any>();
const changePinRef = ref<any>();
const backRef = ref<any>();

const { normalizeRemoteKey } = useRemoteNavigation({
  restoreFocus: true
});

const pinDisplay = computed(() => {
  return pinInput.value.padEnd(4, '').split('').slice(0, 4);
});

const resolveElement = (el: any): HTMLElement | null => {
  return (el?.$el ?? el) as HTMLElement | null;
};

const setKeypadRef = (el: any, index: number) => {
  const element = resolveElement(el);
  if (element) {
    keypadRefs.value[index] = element;
  }
};

const updateKeypadTabindex = () => {
  const allKeys = [...keypadRefs.value, resolveElement(zeroKeyRef.value), resolveElement(clearKeyRef.value)].filter(Boolean) as HTMLElement[];
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
  const allKeys = [...keypadRefs.value, resolveElement(zeroKeyRef.value), resolveElement(clearKeyRef.value)].filter(Boolean) as HTMLElement[];

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
    const controls = [resolveElement(lockToggleRef.value), resolveElement(changePinRef.value), resolveElement(backRef.value)].filter(Boolean) as HTMLElement[];
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
    const controls = [resolveElement(lockToggleRef.value), resolveElement(changePinRef.value), resolveElement(backRef.value)].filter(Boolean) as HTMLElement[];
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
  padding: 2rem;
}

.pin-entry {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.pin-title {
  font-size: 1.25rem;
  font-weight: 600;
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
  max-width: 360px;
  margin: 0 auto;
}

.pin-error {
  margin-top: 1rem;
}

.pro-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.pro-section {
  padding: 1rem;
}

.section-title {
  font-weight: 600;
}

.section-hint {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-top: 0.5rem;
}

.session-counter {
  font-size: 3rem;
  font-weight: 700;
  color: var(--accent);
  text-align: center;
}
</style>
