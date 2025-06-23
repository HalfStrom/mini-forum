<template>
  <div class="card">
    <h2>{{ isRegister ? 'Registrar' : 'Login' }}</h2>
    <form @submit.prevent="handleSubmit">
      <input v-model="username" type="text" placeholder="Usuário" required :disabled="isLoading" />
      <input v-if="isRegister" v-model="email" type="email" placeholder="E-mail" :disabled="isLoading" />
      <input v-model="password" type="password" placeholder="Senha" required :disabled="isLoading" />
      <button type="submit" :disabled="isLoading">
        <LoadingSpinner v-if="isLoading" :loading="true" message="" class="button-spinner" />
        {{ isRegister ? 'Registrar' : 'Entrar' }}
      </button>
    </form>
    <p>
      <a href="#" @click="isRegister = !isRegister" :class="{ disabled: isLoading }">
        {{ isRegister ? 'Já tem conta? Faça login' : 'Não tem conta? Registre-se' }}
      </a>
    </p>
  </div>
</template>

<script>
import LoadingSpinner from './LoadingSpinner.vue';
import { useFeedback } from '../composables/useFeedback';
import { useAuthStore } from '../stores/authStore';
import api from '../utils/axios';

export default {
  components: {
    LoadingSpinner
  },
  data() {
    return {
      username: '',
      email: '',
      password: '',
      isRegister: false,
    };
  },
  setup() {
    const { isLoading, showError, showSuccess, withFeedback } = useFeedback();
    const { setToken } = useAuthStore();
    return { isLoading, showError, showSuccess, withFeedback, setToken };
  },
  methods: {
    async handleSubmit() {
      if (this.username.length < 3) {
        this.showError('O usuário deve ter pelo menos 3 caracteres');
        return;
      }
      if (this.password.length < 6) {
        this.showError('A senha deve ter pelo menos 6 caracteres');
        return;
      }

      try {
        const endpoint = this.isRegister ? '/api/auth/register' : '/api/auth/login';
        const payload = this.isRegister
          ? { username: this.username, password: this.password, email: this.email || undefined }
          : { username: this.username, password: this.password };

        const response = await this.withFeedback(
          () => api.post(endpoint, payload),
          this.isRegister ? 'Registrado com sucesso! Faça login.' : 'Login realizado com sucesso!',
          this.isRegister ? 'Registrando...' : 'Fazendo login...'
        );

        if (this.isRegister) {
          this.isRegister = false;
          this.username = '';
          this.email = '';
          this.password = '';
        } else {
          const { token, user } = response.data;
          this.setToken(token);
          this.$router.push('/posts');
        }
      } catch (error) {
        console.error('Erro ao processar autenticação:', error.response?.data);
        const message = error.response?.data?.error || 
                       error.response?.data?.errors?.map(e => e.msg).join(', ') || 
                       'Erro ao processar autenticação';
        this.showError(message);
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

button {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.button-spinner {
  padding: 0;
}

.button-spinner .spinner {
  width: 16px;
  height: 16px;
  border-width: 2px;
  margin: 0;
}

.disabled {
  pointer-events: none;
  opacity: 0.6;
}

input:disabled,
button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>