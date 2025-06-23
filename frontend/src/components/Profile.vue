<template>
  <div class="profile-container">
    <div class="profile-header">
      <h2>Perfil do Usuário</h2>
    </div>
    <LoadingSpinner v-if="isLoading" :loading="true" message="Carregando perfil..." />
    <div v-else class="profile-content">
      <div class="profile-picture">
        <img
          v-if="profile.profilePicture"
          :src="profilePictureUrl"
          alt="Foto de perfil"
          class="profile-img"
        />
        <div v-else class="placeholder">Sem foto</div>
        <form @submit.prevent="uploadPicture" class="upload-form">
          <label for="file-upload" class="custom-file-upload">
            <i class="fas fa-cloud-upload-alt"></i> Escolher foto
          </label>
          <input id="file-upload" type="file" accept="image/jpeg,image/png" @change="onFileChange" ref="fileInput" :disabled="isUploading" />
          <button type="submit" :disabled="!selectedFile || isUploading">
            <LoadingSpinner v-if="isUploading" :loading="true" message="" class="button-spinner" />
            Enviar Foto
          </button>
        </form>
        <div v-if="selectedFile" class="file-name">{{ selectedFile.name }}</div>
      </div>
      <form @submit.prevent="updateProfile" class="profile-form">
        <div class="form-group">
          <label>Nome de usuário</label>
          <input v-model="profile.username" placeholder="Nome de usuário" :disabled="isUpdating" />
        </div>
        <div class="form-group">
          <label>E-mail</label>
          <input v-model="profile.email" placeholder="E-mail" type="email" :disabled="isUpdating" />
        </div>
        <button type="submit" :disabled="isUpdating">
          <LoadingSpinner v-if="isUpdating" :loading="true" message="" class="button-spinner" />
          Salvar Alterações
        </button>
      </form>
      <form @submit.prevent="changePassword" class="password-form">
        <div class="form-group">
          <label>Senha atual</label>
          <input v-model="currentPassword" type="password" placeholder="Senha atual" required :disabled="isChangingPassword" />
        </div>
        <div class="form-group">
          <label>Nova senha</label>
          <input v-model="newPassword" type="password" placeholder="Nova senha" required :disabled="isChangingPassword" />
        </div>
        <button type="submit" :disabled="isChangingPassword">
          <LoadingSpinner v-if="isChangingPassword" :loading="true" message="" class="button-spinner" />
          Alterar Senha
        </button>
      </form>
      
      <div class="profile-actions">
      </div>
    </div>
  </div>
</template>

<script>
import LoadingSpinner from './LoadingSpinner.vue';
import { useFeedback } from '../composables/useFeedback';
import api from '../utils/axios';

export default {
  components: {
    LoadingSpinner
  },
  data() {
    return {
      profile: {
        username: '',
        email: '',
        profilePicture: '',
      },
      currentPassword: '',
      newPassword: '',
      selectedFile: null,
      isUploading: false,
      isUpdating: false,
      isChangingPassword: false,
    };
  },
  setup() {
    const { isLoading, showError, showSuccess, withFeedback } = useFeedback();
    return { isLoading, showError, showSuccess, withFeedback };
  },
  computed: {
    profilePictureUrl() {
      if (this.profile.profilePicture) {
        return `http://localhost:3000${this.profile.profilePicture}`;
      }
      return '';
    },
  },
  mounted() {
    this.loadProfile();
  },
  methods: {
    async loadProfile() {
      try {
        await this.withFeedback(
          async () => {
            const response = await api.get('/api/auth/profile');
            this.profile = response.data;
          },
          'Perfil carregado com sucesso',
          'Carregando perfil...'
        );
      } catch (error) {
        console.error('Erro ao carregar perfil:', error.response?.data);
        this.showError(error.response?.data?.error || 'Erro ao carregar perfil');
      }
    },
    async updateProfile() {
      this.isUpdating = true;
      try {
        const response = await this.withFeedback(
          () => api.put('/api/auth/profile', {
            username: this.profile.username || undefined,
            email: this.profile.email || undefined,
          }),
          'Perfil atualizado com sucesso!',
          'Salvando alterações...'
        );
        this.profile = response.data;
      } catch (error) {
        console.error('Erro ao atualizar perfil:', error.response?.data);
        const message = error.response?.data?.error || 
                       error.response?.data?.errors?.map(e => e.msg).join(', ') || 
                       'Erro ao atualizar perfil';
        this.showError(message);
      } finally {
        this.isUpdating = false;
      }
    },
    async changePassword() {
      if (this.newPassword.length < 6) {
        this.showError('A nova senha deve ter pelo menos 6 caracteres');
        return;
      }
      
      this.isChangingPassword = true;
      try {
        await this.withFeedback(
          () => api.put('/api/auth/password', {
            currentPassword: this.currentPassword,
            newPassword: this.newPassword,
          }),
          'Senha alterada com sucesso!',
          'Alterando senha...'
        );
        this.currentPassword = '';
        this.newPassword = '';
      } catch (error) {
        console.error('Erro ao alterar senha:', error.response?.data);
        const message = error.response?.data?.error || 
                       error.response?.data?.errors?.map(e => e.msg).join(', ') || 
                       'Erro ao alterar senha';
        this.showError(message);
      } finally {
        this.isChangingPassword = false;
      }
    },
    onFileChange(event) {
      this.selectedFile = event.target.files[0];
    },
    async uploadPicture() {
      if (!this.selectedFile) {
        this.showError('Selecione uma imagem primeiro');
        return;
      }
      
      this.isUploading = true;
      const formData = new FormData();
      formData.append('profilePicture', this.selectedFile);
      
      try {
        const response = await this.withFeedback(
          () => api.post('/api/auth/profile/picture', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }),
          'Foto de perfil atualizada com sucesso!',
          'Enviando foto...'
        );
        this.profile.profilePicture = response.data.profilePicture;
        this.$refs.fileInput.value = '';
        this.selectedFile = null;
        this.loadProfile();
      } catch (error) {
        console.error('Erro ao enviar foto:', error.response?.data);
        this.showError(error.response?.data?.error || 'Erro ao enviar foto');
      } finally {
        this.isUploading = false;
      }
    },
  },
};
</script>

<style scoped>
.profile-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
}

.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.profile-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.profile-picture {
  text-align: center;
  margin-bottom: 2rem;
}

.profile-img {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 1rem;
  border: 3px solid #646cff;
}

.placeholder {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background-color: #333;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  color: #fff;
  font-size: 1.2rem;
}

.upload-form {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: center;
}

.custom-file-upload {
  display: inline-block;
  padding: 0.5rem 1rem;
  background-color: #646cff;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.custom-file-upload:hover {
  background-color: #535bf2;
}

input[type="file"] {
  display: none;
}

.file-name {
  margin-top: 0.5rem;
  font-size: 0.9rem;
  color: #666;
}

.profile-form,
.password-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: bold;
  color: #333;
}

.form-group input {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

button {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background-color: #646cff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

button:hover:not(:disabled) {
  background-color: #535bf2;
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

input:disabled,
button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

@media (prefers-color-scheme: light) {
  .placeholder {
    background-color: #f0f0f0;
    color: #333;
  }
}

.profile-actions {
  display: flex;
  justify-content: center;
  margin-top: 1rem;
}
</style>