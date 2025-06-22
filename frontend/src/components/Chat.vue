<template>
  <div class="chat-container">
    <div class="contacts">
      <h3>Contatos</h3>
      <ul>
        <li
          v-for="contact in contacts"
          :key="contact.id"
          :class="{ active: selectedContact && selectedContact.id === contact.id }"
          @click="selectContact(contact)"
        >
          {{ contact.username }}
        </li>
      </ul>
    </div>
    <div class="chat">
      <h3 v-if="selectedContact">Chat com {{ selectedContact.username }}</h3>
      <div v-else>Selecione um contato para conversar</div>
      <div class="messages" ref="messagesContainer">
        <div
          v-for="message in messages"
          :key="message.id"
          :class="['message', message.senderId === userId ? 'sent' : 'received']"
        >
          <p>{{ message.content }}</p>
          <small>{{ new Date(message.createdAt).toLocaleString() }} - {{ message.senderUsername }}</small>
        </div>
      </div>
      <form v-if="selectedContact" @submit.prevent="sendMessage" class="message-form">
        <input v-model="content" placeholder="Digite sua mensagem..." required />
        <button type="submit">Enviar</button>
      </form>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

export default {
  data() {
    return {
      contacts: [],
      selectedContact: null,
      messages: [],
      content: '',
      ws: null,
      error: null,
    };
  },
  computed: {
    userId() {
      const token = localStorage.getItem('token');
      return token ? jwtDecode(token).userId : null;
    },
  },
  mounted() {
    this.loadContacts();
    this.connectWebSocket();
  },
  beforeDestroy() {
    if (this.ws) {
      this.ws.close();
    }
  },
  methods: {
    async loadContacts() {
      try {
        console.log('Carregando contatos');
        const response = await axios.get('http://localhost:3000/api/messages/contacts', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        this.contacts = response.data;
        console.log(`Contatos carregados: ${this.contacts.length}`);
      } catch (error) {
        console.error('Erro ao carregar contatos:', error.response?.data);
        this.error = error.response?.data?.error || 'Erro ao carregar contatos';
      }
    },
    async selectContact(contact) {
      this.selectedContact = contact;
      try {
        console.log(`Carregando mensagens com userId: ${contact.id}`);
        const response = await axios.get(`http://localhost:3000/api/messages/${contact.id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        this.messages = response.data;
        console.log(`Mensagens carregadas: ${this.messages.length}`);
        this.$nextTick(() => {
          this.scrollToBottom();
        });
      } catch (error) {
        console.error('Erro ao carregar mensagens:', error.response?.data);
        this.error = error.response?.data?.error || 'Erro ao carregar mensagens';
      }
    },
    connectWebSocket() {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('WebSocket: Token não encontrado');
        this.error = 'Você precisa estar logado';
        return;
      }
      this.ws = new WebSocket(`ws://localhost:3000/?token=${token}`);
      this.ws.onopen = () => {
        console.log('WebSocket conectado');
      };
      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Mensagem WebSocket recebida:', data);
          if (data.error) {
            this.error = data.error;
            return;
          }
          if (data.status === 'sent' || data.status === 'received') {
            if (
              (data.message.senderId === this.userId && data.message.receiverId === this.selectedContact?.id) ||
              (data.message.senderId === this.selectedContact?.id && data.message.receiverId === this.userId)
            ) {
              this.messages.push(data.message);
              this.$nextTick(() => {
                this.scrollToBottom();
              });
            }
          }
        } catch (err) {
          console.error('Erro ao processar mensagem WebSocket:', err);
        }
      };
      this.ws.onerror = (err) => {
        console.error('Erro no WebSocket:', err);
        this.error = 'Erro na conexão com o chat';
      };
      this.ws.onclose = () => {
        console.log('WebSocket desconectado');
        setTimeout(() => this.connectWebSocket(), 5000); // Reconectar após 5s
      };
    },
    sendMessage() {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        this.error = 'Conexão com o chat não estabelecida';
        return;
      }
      if (this.content.trim().length < 1) {
        alert('A mensagem não pode estar vazia');
        return;
      }
      const message = {
        receiverId: this.selectedContact.id,
        content: this.content,
      };
      console.log('Enviando mensagem:', message);
      this.ws.send(JSON.stringify(message));
      this.content = '';
    },
    scrollToBottom() {
      const container = this.$refs.messagesContainer;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    },
  },
};
</script>

<style scoped>
.chat-container {
  display: flex;
  height: calc(100vh - 60px);
  max-width: 1200px;
  margin: 0 auto;
}
.contacts {
  width: 250px;
  background-color: #333;
  padding: 1rem;
  overflow-y: auto;
}
.contacts h3 {
  color: #fff;
}
.contacts ul {
  list-style: none;
  padding: 0;
}
.contacts li {
  padding: 0.5rem;
  color: #fff;
  cursor: pointer;
  border-radius: 4px;
}
.contacts li:hover,
.contacts li.active {
  background-color: #555;
}
.chat {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  background-color: #222;
}
.chat h3 {
  color: #fff;
  margin-bottom: 1rem;
}
.messages {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  background-color: #333;
  border-radius: 6px;
}
.message {
  margin-bottom: 1rem;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  max-width: 70%;
}
.message.sent {
  background-color: #0077b6;
  color: #fff;
  margin-left: auto;
}
.message.received {
  background-color: #555;
  color: #fff;
}
.message p {
  margin: 0;
}
.message small {
  display: block;
  font-size: 0.8rem;
  color: #ccc;
}
.message-form {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}
.message-form input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #555;
  border-radius: 4px;
  background-color: #333;
  color: #fff;
}
.message-form button {
  padding: 0.5rem 1rem;
  background-color: #0077b6;
  color: #fff;
  border: none;
  border-radius: 4px;
}
.message-form button:hover {
  background-color: #005f8c;
}
@media (prefers-color-scheme: light) {
  .contacts,
  .chat,
  .messages {
    background-color: #f0f0f0;
  }
  .contacts h3,
  .chat h3 {
    color: #333;
  }
  .contacts li {
    color: #333;
  }
  .contacts li:hover,
  .contacts li.active {
    background-color: #ddd;
  }
  .message.sent {
    background-color: #0077b6;
    color: #fff;
  }
  .message.received {
    background-color: #ccc;
    color: #333;
  }
  .message-form input {
    background-color: #fff;
    color: #333;
    border-color: #ccc;
  }
}
</style>