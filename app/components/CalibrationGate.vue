<template>
  <v-container class="calibration-gate" fluid>
    <v-card class="gate-content" elevation="8">
      <v-card-title class="text-h5 text-center">Calibração Necessária</v-card-title>
      <v-card-text class="text-body-1 text-center">
        Para realizar os testes, é necessário configurar a distância e calibrar a tela primeiro.
      </v-card-text>
      <v-card-actions class="justify-center">
        <v-btn
          ref="setupButtonRef"
          color="warning"
          variant="elevated"
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
const setupButtonRef = ref<any>();

const { normalizeRemoteKey } = useRemoteNavigation();

const resolveElement = (el: any): HTMLElement | null => {
  return (el?.$el ?? el) as HTMLElement | null;
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
</style>
