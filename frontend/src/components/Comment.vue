<template>
    <div class="comments">
        <h3>Comentários</h3>
        <div v-if="error" class="error">{{ error }}</div>
        <div v-for="comment in comments" :key="comment.id" class="comment-card">
            <p>{{ comment.content }}</p>
            <small>Por: {{ comment.username }} em {{ new Date(comment.createdAt).toLocaleString() }}</small>
            <button v-if="isLoggedIn && comment.userId === userId" @click="deleteComment(comment.id)"
                class="delete-btn">
                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="#ff4d4d" stroke-width="2">
                    <path d="M3 6h18M6 6v12a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
                Excluir
            </button>
        </div>
        <form v-if="isLoggedIn" @submit.prevent="handleSubmit" class="comment-form">
            <textarea v-model="content" placeholder="Escreva um comentário..." required></textarea>
            <button type="submit">Comentar</button>
        </form>
    </div>
</template>

<script>
    import axios from 'axios';
    import { jwtDecode } from 'jwt-decode';

    export default {
        props: {
            postId: {
                type: Number,
                required: true,
            },
        },
        data() {
            return {
                comments: [],
                content: '',
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
        mounted() {
            this.loadComments();
        },
        methods: {
            async loadComments() {
                try {
                    const response = await axios.get(`http://localhost:3000/api/comments?postId=${this.postId}`);
                    this.comments = response.data;
                    this.error = null;
                } catch (error) {
                    console.error('Erro ao carregar comentários:', error.response);
                    this.error = error.response?.data?.error || 'Erro ao carregar comentários';
                }
            },
            async handleSubmit() {
                if (this.content.length < 1) {
                    alert('O comentário não pode estar vazio');
                    return;
                }
                try {
                    const response = await axios.post(
                        'http://localhost:3000/api/comments',
                        {
                            content: this.content,
                            postId: this.postId,
                        },
                        {
                            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                        }
                    );
                    this.comments.unshift(response.data);
                    this.content = '';
                    this.error = null;
                } catch (error) {
                    console.error('Erro ao criar comentário:', error.response);
                    alert(error.response?.data?.error || 'Erro ao criar comentário');
                }
            },
            async deleteComment(id) {
                if (!confirm('Tem certeza que deseja excluir este comentário?')) return;
                try {
                    await axios.delete(`http://localhost:3000/api/comments/${id}`, {
                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                    });
                    this.comments = this.comments.filter((comment) => comment.id !== id);
                    this.error = null;
                } catch (error) {
                    console.error('Erro ao excluir comentário:', error.response);
                    alert(error.response?.data?.error || 'Erro ao excluir comentário');
                }
            },
        },
    };
</script>

<style scoped>
    .comments {
        margin-top: 1.5rem;
    }

    .comment-card {
        background-color: #333;
        border-radius: 6px;
        padding: 1rem;
        margin-bottom: 1rem;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .comment-card p {
        margin-bottom: 0.5rem;
    }

    .comment-form {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .delete-btn {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        background-color: transparent;
        border: 1px solid #ff4d4d;
        color: #ff4d4d;
        padding: 0.25rem 0.5rem;
        font-size: 0.9rem;
        margin-top: 0.5rem;
    }

    .delete-btn:hover {
        background-color: #ff4d4d;
        color: #fff;
        border-color: #ff4d4d;
    }

    .icon {
        width: 16px;
        height: 16px;
    }

    @media (prefers-color-scheme: light) {
        .comment-card {
            background-color: #f0f0f0;
        }
    }
</style>