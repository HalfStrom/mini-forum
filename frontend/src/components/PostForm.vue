<template>
    <div>
        <h2>{{ isEdit ? 'Editar Post' : 'Criar Post' }}</h2>
        <form @submit.prevent="handleSubmit">
            <input v-model="title" type="text" placeholder="Título" required />
            <textarea v-model="content" placeholder="Conteúdo" required></textarea>
            <button type="submit">{{ isEdit ? 'Atualizar' : 'Criar' }}</button>
        </form>
    </div>
</template>

<script>
import axios from 'axios';

export default {
    data() {
        return {
            title: '',
            content: '',
            isEdit: false,
        };
    },
    async created() {
        if (this.$route.params.id) {
            this.isEdit = true;
            try {
                const response = await axios.get(`http://localhost:3000/api/posts/${this.$route.params.id}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });
                this.title = response.data.title;
                this.content = response.data.content;
            } catch (error) {
                alert('Erro ao carregar post');
            }
        }
    },
    methods: {
        async handleSubmit() {
            try {
                const payload = { title: this.title, content: this.content };
                const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };

                if (this.isEdit) {
                    await axios.put(`http://localhost:3000/api/posts/${this.$route.params.id}`, payload, { headers });
                    alert('Post atualizado!');
                } else {
                    await axios.post('http://localhost:3000/api/posts', payload, {
                       headers });
                       alert('Post criado!');
                }
                this.$router.push('/');
            } catch (error) {
                alert(error.response?.data?.error || 'Erro ao salvar post');
            }
        },
    },
};
</script>

<style scoped>
    form { display: flex; flex-direction: column; gap: 10px; max-width: 500px; }
    input, textarea { padding: 8px; }
    textarea { height: 100px; }
</style>