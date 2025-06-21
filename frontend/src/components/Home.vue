<template>
  <div class="landing">
    <img src="/android-chrome-192x192.png" alt="Logo Micro Fórum" class="landing-logo" />
    
    <h1>Bem-vindo ao Micro Fórum</h1>
    <p>Compartilhe ideias, crie posts e conecte-se com a comunidade de forma simples e elegante.</p>

    <section class="about">
      <h2>Sobre o Projeto</h2>
      <p>
        O Micro Fórum é um espaço moderno e leve para discussão de ideias, colaboração em tópicos variados e troca de conhecimento entre membros da comunidade.
        Ideal para quem busca uma experiência limpa, rápida e funcional.
      </p>
    </section>

    <section class="features">
      <h2>Recursos</h2>
      <ul>
        <li>✅ Interface leve e responsiva</li>
        <li>✅ Login seguro com autenticação JWT</li>
        <li>✅ Criação e visualização de posts em tempo real</li>
        <li>✅ Painel de usuário com métricas e histórico</li>
      </ul>
    </section>

    <div class="landing-actions">
      <router-link to="/posts" class="btn">Ver Posts</router-link>
      <router-link v-if="!isLoggedIn" to="/login" class="btn secondary">Registrar</router-link>
    </div>

    <footer class="footer">
      <p>&copy; 2025 Micro Fórum. Todos os direitos reservados.</p>
    </footer>
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
  max-width: 900px;
  margin: 0 auto;
  color: #fff;
}
.landing-logo {
  width: 96px;
  height: 96px;
  margin-bottom: 1rem;
}
.landing h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}
p {
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
  color: rgba(255, 255, 255, 0.8);
}
.about,
.features {
  margin-top: 2rem;
}
.about h2,
.features h2 {
  font-size: 1.6rem;
  margin-bottom: 0.5rem;
}
.features ul {
  list-style: none;
  padding: 0;
}
.features li {
  margin: 0.5rem 0;
  font-size: 1rem;
}
.landing-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
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
  background-color: #ccc;
}
.btn.secondary {
  background-color: #646cff;
}
.btn.secondary:hover {
  background-color: #ccc;
  color: #213547;
}
.footer {
  margin-top: 3rem;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.5);
}
@media (prefers-color-scheme: light) {
  .landing {
    color: #213547;
  }
  p {
    color: #213547;
  }
  .footer {
    color: #555;
  }
}
</style>
