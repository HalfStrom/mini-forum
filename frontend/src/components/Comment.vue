<template>
    <div class="comments">
        <h3>Comentários</h3>
        <LoadingSpinner v-if="isLoading" :loading="true" message="Carregando comentários..." />
        <div v-else-if="error" class="error">{{ error }}</div>
        <div v-else-if="comments.length === 0" class="no-comments">
            <p>Nenhum comentário ainda. Seja o primeiro a comentar!</p>
        </div>
        <div v-else v-for="comment in comments" :key="comment.id" class="comment-card">
            <p>{{ comment.content }}</p>
            <small>Por: {{ comment.username }} em {{ new Date(comment.createdAt).toLocaleString() }}</small>
            <button v-if="isLoggedIn && comment.userId === userId" @click="deleteComment(comment.id)"
                class="delete-btn" :disabled="deletingComment === comment.id">
                <LoadingSpinner v-if="deletingComment === comment.id" :loading="true" message="" class="button-spinner" />
                <svg v-else class="icon" viewBox="0 0 24 24" fill="none" stroke="#ff4d4d" stroke-width="2">
                    <path d="M3 6h18M6 6v12a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
                Excluir
            </button>
        </div>
        <form v-if="isLoggedIn" @submit.prevent="handleSubmit" class="comment-form">
            <textarea v-model="content" placeholder="Escreva um comentário..." required :disabled="isSubmitting"></textarea>
            <button type="submit" :disabled="isSubmitting">
                <LoadingSpinner v-if="isSubmitting" :loading="true" message="" class="button-spinner" />
                Comentar
            </button>
        </form>
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
                isSubmitting: false,
                deletingComment: null,
            };
        },
        setup() {
            const { isLoading, showError, showSuccess, withFeedback, withLoading } = useFeedback();
            const { isLoggedIn, userId } = useAuthStore();
            return { isLoading, showError, showSuccess, withFeedback, withLoading, isLoggedIn, userId };
        },
        mounted() {
            this.loadComments();
        },
        methods: {
            async loadComments() {
                try {
                    await this.withLoading(
                        async () => {
                            const response = await api.get(`/api/comments?postId=${this.postId}`);
                            this.comments = response.data;
                            this.error = null;
                        },
                        'Carregando comentários...'
                    );
                } catch (error) {
                    console.error('Erro ao carregar comentários:', error.response);
                    this.error = error.response?.data?.error || 'Erro ao carregar comentários';
                    this.showError(this.error);
                }
            },
            async handleSubmit() {
                if (this.content.length < 1) {
                    this.showError('O comentário não pode estar vazio');
                    return;
                }

                this.isSubmitting = true;
                try {
                    const response = await this.withFeedback(
                        () => api.post('/api/comments', {
                            content: this.content,
                            postId: this.postId,
                        }),
                        'Comentário criado com sucesso!',
                        'Criando comentário...'
                    );
                    this.comments.unshift(response.data);
                    this.content = '';
                    this.error = null;
                } catch (error) {
                    console.error('Erro ao criar comentário:', error.response);
                    this.showError(error.response?.data?.error || 'Erro ao criar comentário');
                } finally {
                    this.isSubmitting = false;
                }
            },
            async deleteComment(id) {
                if (!confirm('Tem certeza que deseja excluir este comentário?')) return;
                
                this.deletingComment = id;
                try {
                    await this.withFeedback(
                        () => api.delete(`/api/comments/${id}`),
                        'Comentário excluído com sucesso!',
                        'Excluindo comentário...'
                    );
                    this.comments = this.comments.filter((comment) => comment.id !== id);
                    this.error = null;
                } catch (error) {
                    console.error('Erro ao excluir comentário:', error.response);
                    this.showError(error.response?.data?.error || 'Erro ao excluir comentário');
                } finally {
                    this.deletingComment = null;
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

    .delete-btn:hover:not(:disabled) {
        background-color: #ff4d4d;
        color: #fff;
        border-color: #ff4d4d;
    }

    .delete-btn:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }

    .icon {
        width: 16px;
        height: 16px;
    }

    .no-comments {
        text-align: center;
        padding: 1rem;
        color: #666;
        font-style: italic;
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

    textarea:disabled,
    button:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }

    @media (prefers-color-scheme: light) {
        .comment-card {
            background-color: #f0f0f0;
        }
    }
</style>