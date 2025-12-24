<template>
  <div class="tv-layout">
    <header v-if="showHeader" class="tv-header">
      TV Visual Check
    </header>
    <main class="tv-main">
      <slot />
    </main>
    <footer class="tv-footer">
      <RemoteHint />
    </footer>
  </div>
</template>

<script setup lang="ts">
interface Props {
  showHeader?: boolean;
}

withDefaults(defineProps<Props>(), {
  showHeader: true
});
</script>

<style scoped>
.tv-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  padding: max(2rem, env(safe-area-inset-top)) max(2rem, env(safe-area-inset-right)) max(2rem, env(safe-area-inset-bottom)) max(2rem, env(safe-area-inset-left));
  box-sizing: border-box;
  position: relative;
  padding-bottom: 120px;
  transition: background-color 0.3s, color 0.3s;
}

.tv-header {
  padding: 0.5rem 0;
  text-align: center;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 1rem;
}

.tv-title {
  font-size: 1.25rem;
  font-weight: bold;
  margin: 0;
  color: var(--text-primary);
}

.tv-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  padding-bottom: 120px;
}

.tv-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1rem max(2rem, env(safe-area-inset-right)) max(1rem, env(safe-area-inset-bottom)) max(2rem, env(safe-area-inset-left));
  background-color: var(--bg-primary);
  z-index: 1000;
  border-top: 1px solid var(--border-color);
  transition: background-color 0.3s, border-color 0.3s;
}
</style>

