<template>
  <div class="remote-hint">
    <p class="hint-text">
      Use as setas ↑↓←→ para navegar, Enter para confirmar, Esc para voltar
    </p>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.remote-hint {
  padding: 0.75rem;
  background-color: var(--button-bg);
  border-radius: 0.5rem;
  margin: 0.5rem 0;
  border: 1px solid var(--border-color);
}

.hint-text {
  color: var(--text-secondary);
  font-size: 0.75rem;
  text-align: center;
  margin: 0;
  opacity: 0.8;
}
</style>

