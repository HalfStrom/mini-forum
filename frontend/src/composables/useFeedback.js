import { ref } from 'vue';
import { useToast } from 'vue-toastification';

export function useFeedback() {
  const toast = useToast();
  const isLoading = ref(false);
  const loadingMessage = ref('Carregando...');

  // Funções para mostrar toasts
  const showSuccess = (message) => {
    toast.success(message);
  };

  const showError = (message) => {
    toast.error(message);
  };

  const showWarning = (message) => {
    toast.warning(message);
  };

  const showInfo = (message) => {
    toast.info(message);
  };

  // Funções para gerenciar loading
  const startLoading = (message = 'Carregando...') => {
    isLoading.value = true;
    loadingMessage.value = message;
  };

  const stopLoading = () => {
    isLoading.value = false;
    loadingMessage.value = 'Carregando...';
  };

  // Função para executar operações com loading automático
  const withLoading = async (operation, loadingMsg = 'Carregando...') => {
    try {
      startLoading(loadingMsg);
      const result = await operation();
      return result;
    } catch (error) {
      showError(error.message || 'Ocorreu um erro inesperado');
      throw error;
    } finally {
      stopLoading();
    }
  };

  // Função para executar operações com feedback automático
  const withFeedback = async (operation, successMessage, loadingMessage = 'Carregando...') => {
    try {
      startLoading(loadingMessage);
      const result = await operation();
      showSuccess(successMessage);
      return result;
    } catch (error) {
      showError(error.message || 'Ocorreu um erro inesperado');
      throw error;
    } finally {
      stopLoading();
    }
  };

  return {
    // Estados
    isLoading,
    loadingMessage,
    
    // Funções de toast
    showSuccess,
    showError,
    showWarning,
    showInfo,
    
    // Funções de loading
    startLoading,
    stopLoading,
    
    // Funções combinadas
    withLoading,
    withFeedback
  };
} 