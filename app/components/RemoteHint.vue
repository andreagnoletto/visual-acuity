<template>
  <v-alert
    density="compact"
    variant="tonal"
    color="secondary"
    class="remote-hint"
  >
    Use as setas ↑↓←→ para navegar, Enter para confirmar, Esc para voltar
  </v-alert>
</template>

<script setup lang="ts"></script>

<style scoped>
.remote-hint {
  text-align: center;
  font-size: 0.75rem;
}
</style>
