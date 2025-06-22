const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const commentRoutes = require('./routes/comments');
const messageRoutes = require('./routes/messages');
const db = require('./database');

const app = express();
const server = require('http').createServer(app);
const wss = new WebSocket.Server({ server });

app.use(helmet());
app.use(cors());
app.use(express.json());

console.log('Registrando rotas...');
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/messages', messageRoutes);

app.use((req, res, next) => {
  console.log(`Requisição recebida: ${req.method} ${req.url}`);
  next();
});

// Mapa para armazenar conexões WebSocket por userId
const clients = new Map();

wss.on('connection', (ws, req) => {
  console.log('Nova conexão WebSocket');
  const token = req.url.split('token=')[1];
  if (!token) {
    console.log('WebSocket: Token não fornecido');
    ws.close(1008, 'Token não fornecido');
    return;
  }
  try {
    const decoded = jwt.verify(token, 'my_secure_jwt_secret');
    console.log('WebSocket: Usuário autenticado:', decoded.userId);
    clients.set(decoded.userId, ws);
    ws.userId = decoded.userId;

    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data);
        console.log('Mensagem recebida:', message);
        const { receiverId, content } = message;
        if (!receiverId || !content) {
          ws.send(JSON.stringify({ error: 'Destinatário ou conteúdo ausente' }));
          return;
        }
        const sanitizedContent = require('sanitize-html')(content, {
          allowedTags: [],
          allowedAttributes: {},
        });
        if (sanitizedContent.length < 1) {
          ws.send(JSON.stringify({ error: 'Conteúdo inválido' }));
          return;
        }
        const createdAt = new Date().toISOString();
        db.run(
          'INSERT INTO messages (senderId, receiverId, content, createdAt) VALUES (?, ?, ?, ?)',
          [ws.userId, receiverId, sanitizedContent, createdAt],
          function (err) {
            if (err) {
              console.error('Erro ao salvar mensagem:', err);
              ws.send(JSON.stringify({ error: 'Erro ao enviar mensagem' }));
              return;
            }
            const messageData = {
              id: this.lastID,
              senderId: ws.userId,
              receiverId,
              content: sanitizedContent,
              createdAt,
              senderUsername: decoded.username,
            };
            console.log('Mensagem salva e enviada:', messageData);
            ws.send(JSON.stringify({ status: 'sent', message: messageData }));
            const receiverWs = clients.get(parseInt(receiverId, 10));
            if (receiverWs && receiverWs.readyState === WebSocket.OPEN) {
              receiverWs.send(JSON.stringify({ status: 'received', message: messageData }));
            }
          }
        );
      } catch (err) {
        console.error('Erro ao processar mensagem:', err);
        ws.send(JSON.stringify({ error: 'Formato de mensagem inválido' }));
      }
    });

    ws.on('close', () => {
      console.log(`WebSocket fechado para userId: ${ws.userId}`);
      clients.delete(ws.userId);
    });
  } catch (err) {
    console.log('WebSocket: Token inválido:', err.message);
    ws.close(1008, 'Token inválido');
  }
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err.stack);
  res.status(500).json({ error: 'Erro interno do servidor', details: err.message });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});