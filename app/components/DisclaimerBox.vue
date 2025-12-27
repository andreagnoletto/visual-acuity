<template>
  <v-alert
    class="disclaimer-box"
    type="warning"
    variant="tonal"
    border="start"
    density="comfortable"
  >
    <p class="disclaimer-text">
      ⚠️ ATENÇÃO: Este app é APENAS para triagem básica/treino. NÃO substitui exame oftalmológico.
      Não use para decisões críticas (ex.: dirigir). Resultados variam com iluminação e configuração da TV.
    </p>
  </v-alert>
</template>

<script setup lang="ts">
</script>

<style scoped>
.disclaimer-box {
  margin: 1rem 0;
}

.disclaimer-text {
  font-size: 0.875rem;
  line-height: 1.5;
  margin: 0;
  text-align: center;
  font-weight: 500;
}
</style>
