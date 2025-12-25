<template>
  <v-container class="setup-page" fluid>
    <DistanceSelector v-model="distance" @confirm="handleConfirm" />
  </v-container>
</template>

<script setup lang="ts">
const distance = ref<number | null>(null);
const { setDistance } = useCalibration();

const handleConfirm = (value: number) => {
  setDistance(value);
  navigateTo('/setup/screen');
};

useRemoteNavigation({
  onAction: (action) => {
    if (action === 'BACK') {
      navigateTo('/');
      return false;
    }
  }
});
</script>

<style scoped>
.setup-page {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
