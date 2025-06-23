<template>
  <div class="user-profile-container">
    <div v-if="loading" class="loading">
      <LoadingSpinner />
    </div>

    <div v-else-if="error" class="error">
      <h2>Erro</h2>
      <p>{{ error }}</p>
      <button @click="$router.push('/')" class="back-button">
        Voltar ao início
      </button>
    </div>

    <div v-else-if="user" class="user-profile">
      <div class="profile-header">
        <div class="profile-avatar">
          <img 
            v-if="user.profilePicture" 
            :src="user.profilePicture" 
            :alt="user.username"
          />
          <div v-else class="default-avatar">
            {{ user.username.charAt(0).toUpperCase() }}
          </div>
        </div>
        <div class="profile-info">
          <h1>{{ user.username }}</h1>
          <p v-if="user.email" class="user-email">{{ user.email }}</p>
        </div>
      </div>

      <div class="profile-content">
        <div class="posts-section">
          <h2>Posts de {{ user.username }}</h2>
          <div v-if="postsLoading" class="loading">
            <LoadingSpinner />
          </div>
          <div v-else-if="userPosts.length === 0" class="no-posts">
            <p>Este usuário ainda não fez nenhum post.</p>
          </div>
          <div v-else class="posts-list">
            <div 
              v-for="post in userPosts" 
              :key="post.id" 
              class="post-item"
              @click="viewPost(post.id)"
            >
              <div class="post-header">
                <span class="post-date">{{ formatDate(post.createdAt) }}</span>
              </div>
              <h3 class="post-title">{{ post.title }}</h3>
              <p class="post-content">{{ truncateContent(post.content) }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="profile-actions">
        <button @click="$router.push('/')" class="back-button">
          Voltar ao início
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from '../utils/axios'
import LoadingSpinner from './LoadingSpinner.vue'

export default {
  name: 'UserProfile',
  components: {
    LoadingSpinner
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const user = ref(null)
    const userPosts = ref([])
    const loading = ref(true)
    const postsLoading = ref(false)
    const error = ref('')

    const fetchUserProfile = async () => {
      try {
        const response = await axios.get(`/api/auth/users/${route.params.id}`)
        user.value = response.data
      } catch (err) {
        console.error('Erro ao buscar perfil do usuário:', err)
        error.value = 'Usuário não encontrado'
      } finally {
        loading.value = false
      }
    }

    const fetchUserPosts = async () => {
      if (!user.value) return
      
      postsLoading.value = true
      try {
        const response = await axios.get(`/api/posts`)
        // Filtrar posts do usuário específico
        userPosts.value = response.data.filter(post => post.userId === user.value.id)
      } catch (err) {
        console.error('Erro ao buscar posts do usuário:', err)
        userPosts.value = []
      } finally {
        postsLoading.value = false
      }
    }

    const viewPost = (postId) => {
      router.push(`/post/${postId}`)
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

    const truncateContent = (content) => {
      return content.length > 200 ? content.substring(0, 200) + '...' : content
    }

    onMounted(async () => {
      await fetchUserProfile()
      if (user.value) {
        await fetchUserPosts()
      }
    })

    return {
      user,
      userPosts,
      loading,
      postsLoading,
      error,
      viewPost,
      formatDate,
      truncateContent
    }
  }
}
</script>

<style scoped>
.user-profile-container {
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

.user-profile {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.profile-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 40px;
  text-align: center;
}

.profile-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  margin: 0 auto 20px;
  border: 4px solid white;
  overflow: hidden;
}

.profile-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.default-avatar {
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  font-weight: bold;
}

.profile-info h1 {
  margin: 0 0 10px 0;
  font-size: 28px;
  font-weight: 600;
}

.user-email {
  margin: 0;
  opacity: 0.9;
  font-size: 16px;
}

.profile-content {
  padding: 30px;
}

.posts-section h2 {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 24px;
}

.no-posts {
  text-align: center;
  padding: 40px;
  color: #666;
  font-style: italic;
}

.posts-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.post-item {
  padding: 20px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.post-item:hover {
  border-color: #007bff;
  box-shadow: 0 2px 8px rgba(0, 123, 255, 0.1);
}

.post-header {
  margin-bottom: 10px;
}

.post-date {
  color: #666;
  font-size: 14px;
}

.post-title {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 18px;
  font-weight: 600;
}

.post-content {
  margin: 0;
  color: #666;
  line-height: 1.6;
}

.profile-actions {
  padding: 20px 30px;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
  display: flex;
  gap: 15px;
  justify-content: center;
}

.back-button {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.back-button {
  background: #6c757d;
  color: white;
}

.back-button:hover {
  background: #5a6268;
}
</style> 