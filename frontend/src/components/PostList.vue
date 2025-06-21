<template>
    <div>
        <h2>Posts</h2>
        <div v-if="error" class="error">{{ error }}</div>
        <div v-for="post in posts" :key="post.id" class="card">
            <h3>{{ post.title }}</h3>
            <p>{{ post.content }}</p>
            <small>Por: {{ post.username }} em {{ new Date(post.createdAt).toLocaleString() }}</small>
            <div v-if="isLoggedIn && post.userId === userId" class="actions">
                <router-link :to="`/edit-post/${post.id}`">Editar</router-link> |
                <button @click="deletePost(post.id)">Excluir</button>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

export default {
    data() {
        return {
            posts: [],
        };
    },
   computed: {
        isLoggedIn() {
            return !!localStorage.getItem('token');
        },
        userId() {
            const token = localStorage.getItem('token');
            return token ? jwtDecode(token).userId : null;
        },
   }, 
   async created() {
        try {
            const response = await axios.get('http://localhost:3000/api/posts');
            this.posts = response.data;
        } catch (error) {
            alert('Erro ao carregar posts');
        }
   },
   methods: {
        async deletePost(id) {
            try {
                await axios.delete(`http://localhost:3000/api/posts/${id}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}`
                    },
                });
                this.posts = this.posts.filter((post) => post.id !== id);
            } catch (error) {
                alert(error.response?.data?.error || 'Erro ao excluir post');
            }
        },
   },
};
</script>

<style scoped>
    .actions {
        margin-top: 1rem;
        display: flex;
        gap: 0.5rem;
    }
</style>