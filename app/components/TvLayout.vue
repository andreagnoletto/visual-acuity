<template>
  <v-layout class="tv-layout">
    <v-app-bar
      v-if="showHeader"
      class="tv-header"
      density="comfortable"
      flat
    >
      <v-app-bar-title>TV Visual Check</v-app-bar-title>
    </v-app-bar>
    <v-main class="tv-main">
      <slot />
    </v-main>
    <v-footer class="tv-footer" app>
      <RemoteHint />
    </v-footer>
  </v-layout>
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
  padding: max(2rem, env(safe-area-inset-top)) max(2rem, env(safe-area-inset-right)) max(2rem, env(safe-area-inset-bottom)) max(2rem, env(safe-area-inset-left));
  box-sizing: border-box;
  position: relative;
  padding-bottom: 120px;
}

.tv-header {
  border-bottom: 1px solid rgba(var(--v-border-color, 0, 0, 0), 0.2);
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
  padding: 1rem max(2rem, env(safe-area-inset-right)) max(1rem, env(safe-area-inset-bottom)) max(2rem, env(safe-area-inset-left));
  border-top: 1px solid rgba(var(--v-border-color, 0, 0, 0), 0.2);
}
</style>
