<template>
  <div class="card">
    <h2>{{ isEdit ? 'Editar Post' : 'Criar Post' }}</h2>
    <form @submit.prevent="handleSubmit">
      <input v-model="title" type="text" placeholder="Título" required :disabled="isLoading" />
      <textarea v-model="content" placeholder="Conteúdo" required :disabled="isLoading"></textarea>
      <button type="submit" :disabled="isLoading">
        <LoadingSpinner v-if="isLoading" :loading="true" message="" class="button-spinner" />
        {{ isEdit ? 'Salvar' : 'Criar' }}
      </button>
    </form>
  </div>
</template>

<script>
import LoadingSpinner from './LoadingSpinner.vue';
import { useFeedback } from '../composables/useFeedback';
import api from '../utils/axios';

export default {
  components: {
    LoadingSpinner
  },
  props: {
    id: {
      type: String,
      default: null,
    },
  },
  data() {
    return {
      title: '',
      content: '',
      isEdit: !!this.id,
    };
  },
  setup() {
    const { isLoading, showError, showSuccess, withFeedback } = useFeedback();
    return { isLoading, showError, showSuccess, withFeedback };
  },
  mounted() {
    if (this.isEdit) {
      this.loadPost();
    }
  },
  methods: {
    async loadPost() {
      try {
        await this.withFeedback(
          async () => {
            const response = await api.get(`/api/posts/${this.id}`);
            this.title = response.data.title;
            this.content = response.data.content;
          },
          'Post carregado com sucesso',
          'Carregando post...'
        );
      } catch (error) {
        console.error('Erro ao carregar post:', error.response?.data);
        this.showError(error.response?.data?.error || 'Erro ao carregar post');
      }
    },
    async handleSubmit() {
      if (this.title.length < 3) {
        this.showError('O título deve ter pelo menos 3 caracteres');
        return;
      }
      if (this.content.length < 10) {
        this.showError('O conteúdo deve ter pelo menos 10 caracteres');
        return;
      }

      try {
        if (this.isEdit) {
          await this.withFeedback(
            () => api.put(`/api/posts/${this.id}`, {
              title: this.title,
              content: this.content,
            }),
            'Post atualizado com sucesso!',
            'Salvando alterações...'
          );
        } else {
          await this.withFeedback(
            () => api.post('/api/posts', {
              title: this.title,
              content: this.content,
            }),
            'Post criado com sucesso!',
            'Criando post...'
          );
        }
        this.$router.push('/posts');
      } catch (error) {
        console.error('Erro ao salvar post:', error.response?.data);
        this.showError(error.response?.data?.error || 'Erro ao salvar post');
      }
    },
  },
};
</script>

<style scoped>
form {
  max-width: 600px;
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

input:disabled,
textarea:disabled,
button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>