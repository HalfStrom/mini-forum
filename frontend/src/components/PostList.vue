<template>
    <div>
        <h2>Posts</h2>
        <div v-if="error" class="error">{{ error }}</div>
        <div v-for="post in posts" :key="post.id" class="card">
            <svg class="post-icon" viewBox="0 0 24 24" fill="none" stroke="#646cff" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
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
            error: null,
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
   watch: {
    isLoggedIn(newValue, oldValue) {
        this.loadPosts();
    },
   },
   mounted() {
      this.loadPosts();
   },
   methods: {
        async loadPosts() {
            try {
                const response = await axios.get('http://localhost:3000/api/posts');
                this.posts = response.data;
                this.error = null;
            } catch (error) {
                console.error('Erro ao carregar posts:', error.response);
                this.error = error.response?.data?.error || 'Erro ao carregar posts';
            }
        },
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
    .post-icon {
        width: 24px;
        height: 24px;
        margin-bottom: 0.5rem;
    }
</style>