<template>
  <v-app>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </v-app>
</template>

<script setup lang="ts">
import { useTheme } from 'vuetify';
import '~/assets/css/base.css';
import '~/assets/css/typography.css';

const { highContrast, dayMode } = useSettings();
const theme = useTheme();

const applyDocumentClasses = () => {
  if (typeof document !== 'undefined') {
    const isDayMode = dayMode.value ?? true;
    document.documentElement.classList.toggle('day-mode', isDayMode);
    document.documentElement.classList.toggle('night-mode', !isDayMode);
    document.documentElement.classList.toggle('high-contrast', highContrast.value);
  }
};

const updateTheme = () => {
  const themeName = highContrast.value
    ? (dayMode.value ? 'highContrastDay' : 'highContrastNight')
    : (dayMode.value ? 'day' : 'night');
  theme.global.name.value = themeName;
};

watch([highContrast, dayMode], () => {
  applyDocumentClasses();
  updateTheme();
}, { immediate: true });
</script>
