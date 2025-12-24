<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
import '~/assets/css/base.css';
import '~/assets/css/typography.css';

onMounted(() => {
  const { highContrast, dayMode } = useSettings();
  if (typeof document !== 'undefined') {
    // Aplicar modo diurno/noturno (padrão: diurno)
    const isDayMode = dayMode.value ?? true; // Padrão: true (diurno)
    if (isDayMode) {
      document.documentElement.classList.add('day-mode');
      document.documentElement.classList.remove('night-mode');
    } else {
      document.documentElement.classList.add('night-mode');
      document.documentElement.classList.remove('day-mode');
    }
    
    // Aplicar alto contraste
    if (highContrast.value) {
      document.documentElement.classList.add('high-contrast');
    }
  }
});
</script>
