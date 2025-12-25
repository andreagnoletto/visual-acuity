<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
import '~/assets/css/base.css';
import '~/assets/css/typography.css';
import { useTheme } from 'vuetify';

const { highContrast, dayMode } = useSettings();
const theme = useTheme();

onMounted(() => {
  if (typeof document !== 'undefined') {
    watch(
      dayMode,
      (isDayMode) => {
        const resolvedDayMode = isDayMode ?? true;
        if (resolvedDayMode) {
          document.documentElement.classList.add('day-mode');
          document.documentElement.classList.remove('night-mode');
          theme.global.name.value = 'day';
        } else {
          document.documentElement.classList.add('night-mode');
          document.documentElement.classList.remove('day-mode');
          theme.global.name.value = 'night';
        }
      },
      { immediate: true }
    );

    watch(
      highContrast,
      (isHighContrast) => {
        if (isHighContrast) {
          document.documentElement.classList.add('high-contrast');
        } else {
          document.documentElement.classList.remove('high-contrast');
        }
      },
      { immediate: true }
    );
  }
});
</script>
