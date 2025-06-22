<template>
  <div class="container">
    <nav>
      <router-link to="/" class="nav-link">
        <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
        Home
      </router-link>
      <router-link to="/posts" class="nav-link">
        <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        Posts
      </router-link>
      <router-link v-if="isLoggedIn" to="/create-post" class="nav-link">
        <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
        </svg>
        Criar Post
      </router-link>
      <router-link v-if="isLoggedIn" to="/chat" class="nav-link">
        <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          <path d="M8 10h.01" />
          <path d="M12 10h.01" />
          <path d="M16 10h.01" />
        </svg>
        Chat
      </router-link>
      <router-link v-if="!isLoggedIn" to="/login" class="nav-link">
        <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
          <polyline points="10 17 15 12 10 7" />
          <line x1="15" y1="12" x2="3" y2="12" />
        </svg>
        Login
      </router-link>
      <button v-if="isLoggedIn" @click="logout" class="nav-link">
        <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        Logout
      </button>
    </nav>
    <router-view @auto-changed="handleAuthChange"></router-view>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

export default {
  setup() {
    const isLoggedIn = ref(!!localStorage.getItem('token'));
    const router = useRouter();

    const updateAuthStatus = () => {
      console.log('Atualizando estado de autenticação:', !!localStorage.getItem('token'));
      isLoggedIn.value = !!localStorage.getItem('token');
    };

    const handleStorageChange = (event) => {
      if (event.key === 'token') {
        updateAuthStatus();
      }
    };

    onMounted(() => {
      window.addEventListener('storage', handleStorageChange);
      updateAuthStatus();
    });

    onUnmounted(() => {
      window.removeEventListener('storage', handleStorageChange);
    });

    const logout = () => {
      console.log('Logout iniciado');
      localStorage.removeItem('token');
      updateAuthStatus();
      router.push('/login');
    };

    return {
      isLoggedIn,
      logout,
    };
  },
};
</script>

<style scoped>
.container {
  width: 100%;
}
</style>