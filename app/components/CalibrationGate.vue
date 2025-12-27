<template>
  <v-container class="calibration-gate" fluid>
    <v-card class="gate-content" variant="tonal" color="warning">
      <v-card-title class="gate-title">Calibração Necessária</v-card-title>
      <v-card-text class="gate-message">
        Para realizar os testes, é necessário configurar a distância e calibrar a tela primeiro.
      </v-card-text>
      <v-card-actions class="gate-actions">
        <v-btn
          ref="setupButtonRef"
          color="primary"
          size="large"
          @click="goToSetup"
          @keydown="handleKeyDown"
        >
          Ir para Configuração
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
const setupButtonRef = ref<unknown>(null);

const { normalizeRemoteKey } = useRemoteNavigation();

const resolveElement = (target: unknown): HTMLElement | null => {
  if (!target) return null;
  if (target instanceof HTMLElement) return target;
  return (target as { $el?: HTMLElement }).$el ?? null;
};

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
  resolveElement(setupButtonRef.value)?.focus();
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
  padding: 2rem;
  text-align: center;
}

.gate-title {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.gate-message {
  font-size: 1.125rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;
  opacity: 0.9;
}

.gate-actions {
  justify-content: center;
}
</style>
