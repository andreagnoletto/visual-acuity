<template>
  <v-container class="setup-page" fluid>
    <ScreenCalibration @confirm="handleConfirm" />
  </v-container>
</template>

<script setup lang="ts">
const { setPxPerCm } = useCalibration();

const handleConfirm = (pxPerCm: number) => {
  setPxPerCm(pxPerCm);
  navigateTo('/');
};

useRemoteNavigation({
  onAction: (action) => {
    if (action === 'BACK') {
      navigateTo('/setup/distance');
      return false;
    }
  }
});
</script>

<style scoped>
.setup-page {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
}
</style>
