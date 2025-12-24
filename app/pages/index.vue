<template>
  <div class="home-page">
    <MenuGrid :items="menuItems" :columns="2" />
  </div>
</template>

<script setup lang="ts">
const menuItems = [
  {
    label: 'Configuração',
    action: () => {
      navigateTo('/setup/distance');
    }
  },
  {
    label: 'Teste Snellen',
    action: () => {
      navigateTo('/test/snellen');
    }
  },
  {
    label: 'Teste Pediátrico',
    action: () => {
      navigateTo('/test/pediatric');
    }
  },
  {
    label: 'Teste E Rotacionado',
    action: () => {
      navigateTo('/test/directional');
    }
  },
  {
    label: 'Teste C Landolt',
    action: () => {
      navigateTo('/test/landolt');
    }
  },
  {
    label: 'Teste ETDRS',
    action: () => {
      navigateTo('/test/etdrs');
    }
  },
  {
    label: 'Configurações',
    action: () => {
      navigateTo('/settings');
    }
  }
];

useRemoteNavigation({
  onAction: (action) => {
    if (action === 'BACK') {
      return false;
    }
  }
});
</script>

<style scoped>
.home-page {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}
</style>

