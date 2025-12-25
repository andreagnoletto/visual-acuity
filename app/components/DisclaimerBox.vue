<template>
  <v-alert
    type="warning"
    variant="tonal"
    class="disclaimer-box"
  >
    ⚠️ ATENÇÃO: Este app é APENAS para triagem básica/treino. NÃO substitui exame
    oftalmológico. Não use para decisões críticas (ex.: dirigir). Resultados
    variam com iluminação e configuração da TV.
  </v-alert>
</template>

<script setup lang="ts"></script>

<style scoped>
.disclaimer-box {
  font-size: 0.875rem;
  line-height: 1.5;
}
</style>
