<template>
  <div class="post-detail-container">
    <div v-if="loading" class="loading">
      <LoadingSpinner />
    </div>

    <div v-else-if="error" class="error">
      <h2>Erro</h2>
      <p>{{ error }}</p>
      <button @click="$router.push('/posts')" class="back-button">
        Voltar aos Posts
      </button>
    </div>

    <div v-else-if="post" class="post-detail">
      <div class="post-header">
        <h1>{{ post.title }}</h1>
        <div class="post-meta">
          <span class="post-author" @click="viewUserProfile(post.userId)">
            {{ post.username }}
          </span>
          <span class="post-date">{{ formatDate(post.createdAt) }}</span>
        </div>
      </div>

      <div class="post-content">
        <p>{{ post.content }}</p>
      </div>

      <div v-if="isLoggedIn && post.userId === userId" class="post-actions">
        <router-link :to="`/edit-post/${post.id}`" class="edit-button">
          Editar Post
        </router-link>
        <button @click="deletePost" class="delete-button">
          Excluir Post
        </button>
      </div>

      <div class="comments-section">
        <h3>Comentários</h3>
        <comment :post-id="post.id" />
      </div>

      <div class="navigation-actions">
        <button @click="$router.push('/posts')" class="back-button">
          Voltar aos Posts
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import axios from '../utils/axios'
import LoadingSpinner from './LoadingSpinner.vue'
import Comment from './Comment.vue'

export default {
  name: 'PostDetail',
  components: {
    LoadingSpinner,
    Comment
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const { isLoggedIn, userId } = useAuthStore()
    const post = ref(null)
    const loading = ref(true)
    const error = ref('')

    const fetchPost = async () => {
      try {
        const response = await axios.get(`/api/posts/${route.params.id}`)
        post.value = response.data
      } catch (err) {
        console.error('Erro ao buscar post:', err)
        error.value = 'Post não encontrado'
      } finally {
        loading.value = false
      }
    }

    const viewUserProfile = (userId) => {
      router.push(`/user/${userId}`)
    }

    const deletePost = async () => {
      if (!confirm('Tem certeza que deseja excluir este post?')) {
        return
      }

      try {
        await axios.delete(`/api/posts/${post.value.id}`)
        router.push('/posts')
      } catch (err) {
        console.error('Erro ao excluir post:', err)
        alert('Erro ao excluir post')
      }
    }

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    onMounted(() => {
      fetchPost()
    })

    return {
      post,
      loading,
      error,
      isLoggedIn,
      userId,
      viewUserProfile,
      deletePost,
      formatDate
    }
  }
}
</script>

<style scoped>
.post-detail-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.loading {
  display: flex;
  justify-content: center;
  padding: 40px;
}

.error {
  text-align: center;
  padding: 40px;
}

.error h2 {
  color: #dc3545;
  margin-bottom: 10px;
}

.error p {
  color: #666;
  margin-bottom: 20px;
}

.post-detail {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.post-header {
  padding: 30px;
  border-bottom: 1px solid #e9ecef;
}

.post-header h1 {
  margin: 0 0 15px 0;
  color: #333;
  font-size: 28px;
  line-height: 1.3;
}

.post-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.post-author {
  color: #007bff;
  cursor: pointer;
  text-decoration: underline;
  font-weight: 500;
}

.post-author:hover {
  color: #0056b3;
}

.post-date {
  color: #666;
}
</style> 