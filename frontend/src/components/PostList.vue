<template>
    <div class="post-list-container">
        <h2>Últimos Posts</h2>
        <div v-if="loading" class="loading">
            <LoadingSpinner />
        </div>
        <div v-else-if="error" class="error">{{ error }}</div>
        <div v-else-if="posts.length === 0" class="no-posts">
            <p>Nenhum post encontrado.</p>
        </div>
        <div v-else v-for="post in posts" :key="post.id" class="card">
            <svg class="post-icon" viewBox="0 0 24 24" fill="none" stroke="#646cff" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <h3>{{ post.title }}</h3>
            <p>{{ post.content }}</p>
            <small>Por: <span class="username-link" @click="viewUserProfile(post.userId)">{{ post.username }}</span> em {{ new Date(post.createdAt).toLocaleString() }}</small>
            <div v-if="isLoggedIn && post.userId === userId" class="actions">
                <router-link :to="`/edit-post/${post.id}`">Editar</router-link> |
                <button @click="deletePost(post.id)" :disabled="deletingPost === post.id">
                    <LoadingSpinner v-if="deletingPost === post.id" :loading="true" message="" class="button-spinner" />
                    Excluir
                </button>
            </div>
            <comment :post-id="post.id" />
        </div>
    </div>
</template>

<script>
    import Comment from './Comment.vue';
    import LoadingSpinner from './LoadingSpinner.vue';
    import { useFeedback } from '../composables/useFeedback';
    import { useAuthStore } from '../stores/authStore';
    import api from '../utils/axios';

    export default {
        components: {
            Comment,
            LoadingSpinner
        },
        data() {
            return {
                posts: [],
                error: null,
                deletingPost: null,
            };
        },
        setup() {
            const { isLoading, showError, showSuccess, withFeedback } = useFeedback();
            const { isLoggedIn, userId } = useAuthStore();
            return { isLoading, showError, showSuccess, withFeedback, isLoggedIn, userId };
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
                    await this.withFeedback(
                        async () => {
                            const response = await api.get('/api/posts');
                            this.posts = response.data;
                            this.error = null;
                        },
                        'Posts carregados com sucesso',
                        'Carregando posts...'
                    );
                } catch (error) {
                    console.error('Erro ao carregar posts:', error.response);
                    this.error = error.response?.data?.error || 'Erro ao carregar posts';
                    this.showError(this.error);
                }
            },
            async deletePost(id) {
                if (!confirm('Tem certeza que deseja excluir este post?')) {
                    return;
                }

                this.deletingPost = id;
                try {
                    await this.withFeedback(
                        () => api.delete(`/api/posts/${id}`),
                        'Post excluído com sucesso!',
                        'Excluindo post...'
                    );
                    this.posts = this.posts.filter((post) => post.id !== id);
                } catch (error) {
                    this.showError(error.response?.data?.error || 'Erro ao excluir post');
                } finally {
                    this.deletingPost = null;
                }
            },
            viewUserProfile(userId) {
                this.$router.push(`/user/${userId}`);
            },
        },
    };
</script>

<style scoped>
    .post-list-container {
        margin-bottom: 2rem;
    }

    .loading {
        text-align: center;
        padding: 2rem;
    }

    .username-link {
        color: #646cff;
        cursor: pointer;
        text-decoration: underline;
        transition: color 0.2s ease;
    }

    .username-link:hover {
        color: #535bf2;
    }

    .actions {
        margin-top: 1rem;
        display: flex;
        gap: 0.5rem;
        align-items: center;
    }

    .post-icon {
        width: 24px;
        height: 24px;
        margin-bottom: 0.5rem;
    }

    .no-posts {
        text-align: center;
        padding: 2rem;
        color: #666;
    }

    .error {
        background-color: #fee;
        color: #c33;
        padding: 1rem;
        border-radius: 4px;
        margin-bottom: 1rem;
        border: 1px solid #fcc;
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

    button:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }
</style>