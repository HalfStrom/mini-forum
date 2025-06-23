const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { createServer } = require('http');
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const commentRoutes = require('./routes/comments');
const db = require('./database');
const path = require('path');

const app = express();
const server = createServer(app);

app.use(helmet());
app.use(cors());
app.use(express.json());

console.log('Registrando rotas...');
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);

// Rota dedicada para servir imagens com os cabeçalhos corretos
app.get('/uploads/:filename', (req, res) => {
  const { filename } = req.params;
  
  if (!/^[a-zA-Z0-9.-]+$/.test(filename)) {
    return res.status(400).send('Nome de arquivo inválido.');
  }

  const filePath = path.join(__dirname, '../uploads', filename);

  if (path.dirname(filePath) !== path.join(__dirname, '../uploads')) {
    return res.status(403).send('Acesso proibido.');
  }
  
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  
  res.sendFile(filePath, (err) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.status(404).send('Arquivo não encontrado.');
      } else {
        res.status(500).send('Erro ao servir o arquivo.');
      }
    }
  });
});

app.use((req, res, next) => {
  console.log(`Requisição recebida: ${req.method} ${req.url}`);
  next();
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err.stack);
  if (err.message.includes('Only JPG or PNG images are allowed')) {
    return res.status(400).json({ error: 'Apenas imagens JPG ou PNG são permitidas' });
  }
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'A imagem deve ter no máximo 5MB' });
  }
  res.status(500).json({ error: 'Erro interno do servidor', details: err.message });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
}); 