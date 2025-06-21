<template>
    <div>
        <h2>Posts</h2>
        <div v-for="post in posts" :key="post.id" class="post">
            <h3>{{ post.title }}</h3>
            <p>{{ post.content }}</p>
            <small>Por: {{ post.username }}</small>
            <div v-if="isLoggedIn && post.userId === userId">
                <router-link :to="`/edit-post/${post.id}`">Editar</router-link> |
                <button @click="deletePost(post.id)">Excluir</button>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import jwtDecode from 'jwt-decode';

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
    .post { border: 1px solid #ccc; padding: 10px; margin-bottom: 10px; }
</style>