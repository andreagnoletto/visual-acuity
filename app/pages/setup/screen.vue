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
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
