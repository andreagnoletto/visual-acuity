<template>
  <div class="calibration-gate">
    <div class="gate-content">
      <h2 class="gate-title">Calibração Necessária</h2>
      <p class="gate-message">
        Para realizar os testes, é necessário configurar a distância e calibrar a tela primeiro.
      </p>
      <button
        ref="setupButtonRef"
        class="setup-button"
        @click="goToSetup"
        @keydown="handleKeyDown"
      >
        Ir para Configuração
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const setupButtonRef = ref<HTMLButtonElement>();

const { normalizeRemoteKey } = useRemoteNavigation();

const goToSetup = () => {
  navigateTo('/setup/distance');
};

const handleKeyDown = (event: KeyboardEvent) => {
  const action = normalizeRemoteKey(event);
  if (action === 'OK' || action === 'BACK') {
    event.preventDefault();
    if (action === 'OK') {
      goToSetup();
    } else {
      navigateTo('/');
    }
  }
};

onMounted(() => {
  if (setupButtonRef.value) {
    setupButtonRef.value.focus();
  }
});
</script>

<style scoped>
.calibration-gate {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.gate-content {
  max-width: 600px;
  padding: 3rem;
  background-color: rgba(255, 193, 7, 0.1);
  border: 3px solid #ffc107;
  border-radius: 1rem;
  text-align: center;
}

.gate-title {
  font-size: 2rem;
  margin-bottom: 1.5rem;
  color: #ffc107;
}

.gate-message {
  font-size: 1.125rem;
  line-height: 1.6;
  margin-bottom: 2rem;
  color: var(--text-primary);
  opacity: 0.9;
}

.setup-button {
  padding: 1.25rem 3rem;
  background-color: var(--button-active-bg);
  border: 3px solid var(--accent);
  border-radius: 0.75rem;
  color: var(--text-primary);
  font-size: 1.25rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  outline: none;
}

.setup-button:focus-visible {
  outline: 4px solid var(--accent);
  outline-offset: 2px;
  transform: scale(1.05);
  background-color: var(--button-active-bg);
  box-shadow: 0 0 20px var(--accent);
}
</style>

