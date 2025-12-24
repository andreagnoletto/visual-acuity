<template>
  <div class="disclaimer-box">
    <p class="disclaimer-text">
      ⚠️ ATENÇÃO: Este app é APENAS para triagem básica/treino. NÃO substitui exame oftalmológico.
      Não use para decisões críticas (ex.: dirigir). Resultados variam com iluminação e configuração da TV.
    </p>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.disclaimer-box {
  padding: 1rem;
  background-color: rgba(255, 193, 7, 0.15);
  border: 2px solid #ffc107;
  border-radius: 0.5rem;
  margin: 1rem 0;
}

.disclaimer-text {
  color: #ffc107;
  font-size: 0.875rem;
  line-height: 1.5;
  margin: 0;
  text-align: center;
  font-weight: 500;
}
</style>

