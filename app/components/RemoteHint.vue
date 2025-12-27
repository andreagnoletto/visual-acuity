<template>
  <v-alert
    class="remote-hint"
    density="comfortable"
    variant="tonal"
    color="secondary"
    border="start"
  >
    <p class="hint-text">
      Use as setas ↑↓←→ para navegar, Enter para confirmar, Esc para voltar
    </p>
  </v-alert>
</template>

<script setup lang="ts">
</script>

<style scoped>
.remote-hint {
  margin: 0.5rem 0;
}

.hint-text {
  font-size: 0.75rem;
  text-align: center;
  margin: 0;
  opacity: 0.8;
}
</style>
