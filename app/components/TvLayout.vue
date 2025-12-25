<template>
  <v-app class="tv-layout">
    <v-app-bar v-if="showHeader" flat density="comfortable" class="tv-header">
      <v-toolbar-title>TV Visual Check</v-toolbar-title>
    </v-app-bar>
    <v-main class="tv-main">
      <v-container class="tv-container" fluid>
        <slot />
      </v-container>
    </v-main>
    <v-footer app class="tv-footer">
      <RemoteHint />
    </v-footer>
  </v-app>
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
  background-color: var(--bg-primary);
  color: var(--text-primary);
  transition: background-color 0.3s, color 0.3s;
}

.tv-header {
  border-bottom: 1px solid var(--border-color);
  background-color: var(--bg-primary);
}

.tv-main {
  padding-bottom: 96px;
}

.tv-container {
  min-height: calc(100vh - 96px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: max(2rem, env(safe-area-inset-top))
    max(2rem, env(safe-area-inset-right))
    max(2rem, env(safe-area-inset-bottom))
    max(2rem, env(safe-area-inset-left));
  box-sizing: border-box;
}

.tv-footer {
  background-color: var(--bg-primary);
  border-top: 1px solid var(--border-color);
  padding: 1rem max(2rem, env(safe-area-inset-right))
    max(1rem, env(safe-area-inset-bottom))
    max(2rem, env(safe-area-inset-left));
}
</style>
