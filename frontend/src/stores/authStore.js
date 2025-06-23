import { ref, computed } from 'vue';
import { jwtDecode } from 'jwt-decode';

// Estado global reativo
const token = ref(localStorage.getItem('token') || null);
const user = ref(null);

// Computed properties
const isLoggedIn = computed(() => !!token.value);
const userId = computed(() => {
  if (!token.value) return null;
  try {
    return jwtDecode(token.value).userId;
  } catch {
    return null;
  }
});

// Funções para gerenciar autenticação
const setToken = (newToken) => {
  token.value = newToken;
  if (newToken) {
    localStorage.setItem('token', newToken);
    try {
      user.value = jwtDecode(newToken);
    } catch (error) {
      console.error('Erro ao decodificar token:', error);
      user.value = null;
    }
  } else {
    localStorage.removeItem('token');
    user.value = null;
  }
};

const logout = () => {
  setToken(null);
};

const initializeAuth = () => {
  const storedToken = localStorage.getItem('token');
  if (storedToken) {
    setToken(storedToken);
  }
};

// Store export
export const useAuthStore = () => {
  return {
    // Estado
    token,
    user,
    
    // Computed
    isLoggedIn,
    userId,
    
    // Funções
    setToken,
    logout,
    initializeAuth
  };
}; 