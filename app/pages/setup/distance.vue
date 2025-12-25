<template>
  <div class="setup-page">
    <DistanceSelector
      v-model="distance"
      @confirm="handleConfirm"
    />
  </div>
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
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
}
</style>

