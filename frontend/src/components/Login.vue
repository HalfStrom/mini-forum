<template>
  <div class="card">
    <h2>{{ isRegister ? 'Registrar' : 'Login' }}</h2>
    <form @submit.prevent="handleSubmit">
      <input v-model="username" type="text" placeholder="Usuário" required />
      <input v-model="password" type="password" placeholder="Senha" required />
      <button type="submit">{{ isRegister ? 'Registrar' : 'Entrar' }}</button>
    </form>
    <p>
      <a href="#" @click="isRegister = !isRegister">
        {{ isRegister ? 'Já tem conta? Faça login' : 'Não tem conta? Registre-se' }}
      </a>
    </p>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      username: '',
      password: '',
      isRegister: false,
    };
  },
  methods: {
    async handleSubmit() {
      if (this.username.length < 3) {
        alert('O usuário deve ter pelo menos 3 caracteres');
        return;
      }
      if (this.password.length < 6) {
        alert('A senha deve ter pelo menos 6 caracteres');
        return;
      }
      try {
        const endpoint = this.isRegister ? '/api/auth/register' : '/api/auth/login';
        console.log(`Enviando requisição para ${endpoint}:`, { username: this.username });
        const response = await axios.post(`http://localhost:3000${endpoint}`, {
          username: this.username,
          password: this.password,
        });
        if (this.isRegister) {
          alert('Registrado com sucesso! Faça login.');
          this.isRegister = false;
        } else {
          const token = response.data.token;
          console.log('Token recebido:', token);
          localStorage.setItem('token', token);
          console.log('Token salvo no localStorage');
          this.$router.push('/posts');
        }
      } catch (error) {
        console.error('Erro ao processar autenticação:', error.response?.data);
        const message = error.response?.data?.error || error.response?.data?.errors?.map(e => e.msg).join(', ') || 'Erro ao processar';
        alert(message);
      }
    },
  },
};
</script>

<style scoped>
p {
  margin-top: 1rem;
  text-align: center;
}
</style>