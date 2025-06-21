<template>
  <div class="landing">
    <svg class="landing-icon" viewBox="0 0 24 24" fill="none" stroke="#646cff" stroke-width="2">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
    </svg>
    <h1>Bem-vindo ao Micro Fórum</h1>
    <p>Compartilhe ideias, crie posts e conecte-se com a comunidade de forma simples e elegante.</p>
    <div class="landing-actions">
      <router-link to="/posts" class="btn">Ver Posts</router-link>
      <router-link v-if="!isLoggedIn" to="/login" class="btn secondary">Registrar</router-link>
    </div>
  </div>
</template>

<script>
export default {
  computed: {
    isLoggedIn() {
      return !!localStorage.getItem('token');
    },
  },
};
</script>

<style scoped>
.landing {
  text-align: center;
  padding: 3rem 1rem;
  max-width: 800px;
  margin: 0 auto;
}
.landing-icon {
  width: 80px;
  height: 80px;
  margin-bottom: 1.5rem;
}
p {
  font-size: 1.1rem;
  margin-bottom: 2rem;
  color: rgba(255, 255, 255, 0.7);
}
.landing-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}
.btn {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  background-color: #646cff;
  color: #fff;
  text-decoration: none;
  font-weight: 500;
  transition: background-color 0.2s ease;
}
.btn:hover {
  background-color: #535bf2;
}
.btn.secondary {
  background-color: #646cff;
  border: 1px solid #646cff;
}
.btn.secondary:hover {
  background-color: #ccc;
  border-color: #535bf2;
}
@media (prefers-color-scheme: light) {
  p {
    color: #213547;
  }
}
</style>