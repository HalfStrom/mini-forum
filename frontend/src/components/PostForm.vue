<template>
  <div class="card">
    <h2>{{ isEdit ? 'Editar Post' : 'Criar Post' }}</h2>
    <form @submit.prevent="handleSubmit">
      <input v-model="title" type="text" placeholder="Título" required />
      <textarea v-model="content" placeholder="Conteúdo" required></textarea>
      <button type="submit">{{ isEdit ? 'Salvar' : 'Criar' }}</button>
    </form>
  </div>
</template>

<script>
import axios from 'axios';

export default {
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
  mounted() {
    if (this.isEdit) {
      this.loadPost();
    }
  },
  methods: {
    async loadPost() {
      try {
        console.log(`Carregando post ID: ${this.id}`);
        const response = await axios.get(`http://localhost:3000/api/posts/${this.id}`);
        this.title = response.data.title;
        this.content = response.data.content;
      } catch (error) {
        console.error('Erro ao carregar post:', error.response?.data);
        alert(error.response?.data?.error || 'Erro ao carregar post');
      }
    },
    async handleSubmit() {
      if (this.title.length < 3) {
        alert('O título deve ter pelo menos 3 caracteres');
        return;
      }
      if (this.content.length < 10) {
        alert('O conteúdo deve ter pelo menos 10 caracteres');
        return;
      }
      const token = localStorage.getItem('token');
      console.log('Token enviado:', token);
      if (!token) {
        alert('Você precisa estar logado para criar um post');
        this.$router.push('/login');
        return;
      }
      try {
        console.log('Enviando post:', { title: this.title, content: this.content });
        if (this.isEdit) {
          await axios.put(
            `http://localhost:3000/api/posts/${this.id}`,
            { title: this.title, content: this.content },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          console.log('Post atualizado com sucesso');
        } else {
          const response = await axios.post(
            'http://localhost:3000/api/posts',
            { title: this.title, content: this.content },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          console.log('Post criado:', response.data);
        }
        this.$router.push('/posts');
      } catch (error) {
        console.error('Erro ao salvar post:', error.response?.data);
        alert(error.response?.data?.error || 'Erro ao salvar post');
      }
    },
  },
};
</script>

<style scoped>
form {
  max-width: 600px;
}
</style>