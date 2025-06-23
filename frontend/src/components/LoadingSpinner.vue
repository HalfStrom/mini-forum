<template>
  <div class="loading-container" v-if="loading">
    <div class="spinner">
      <div class="spinner-inner"></div>
    </div>
    <p v-if="message" class="loading-message">{{ message }}</p>
  </div>
</template>

<script>
export default {
  name: 'LoadingSpinner',
  props: {
    loading: {
      type: Boolean,
      default: false
    },
    message: {
      type: String,
      default: 'Carregando...'
    }
  }
}
</script>

<style scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

.spinner-inner {
  width: 100%;
  height: 100%;
  border-radius: 50%;
}

.loading-message {
  color: #666;
  font-size: 0.9rem;
  margin: 0;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Variantes de tamanho */
.spinner.small {
  width: 20px;
  height: 20px;
  border-width: 2px;
}

.spinner.large {
  width: 60px;
  height: 60px;
  border-width: 6px;
}
</style> 