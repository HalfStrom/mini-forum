const express = require('express');
const router = express.Router();
const db = require('../database');
const { body, validationResult } = require('express-validator');
const sanitizeHtml = require('sanitize-html');
const authenticateToken = require('../middleware/auth');

// Listar todos os posts
router.get('/', (req, res) => {
  console.log('GET /api/posts chamado');
  db.all('SELECT id, title, content, userId, username, createdAt FROM posts ORDER BY createdAt DESC', [], (err, rows) => {
    if (err) {
      console.error('Erro ao listar posts:', err);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
    console.log(`Posts encontrados: ${rows.length}`);
    res.json(rows);
  });
});

// Obter post por ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  console.log(`GET /api/posts/${id} chamado`);
  db.get('SELECT id, title, content, userId, username, createdAt FROM posts WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('Erro ao obter post:', err);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
    if (!row) {
      return res.status(404).json({ error: 'Post não encontrado' });
    }
    res.json(row);
  });
});

// Criar post
router.post(
  '/',
  authenticateToken,
  [
    body('title').notEmpty().withMessage('Título é obrigatório'),
    body('content').notEmpty().withMessage('Conteúdo é obrigatório'),
  ],
  (req, res) => {
    console.log('POST /api/posts chamado:', req.body);
    if (!req.user) {
      console.error('req.user não definido após autenticação');
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Erros de validação:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }
    const { title, content } = req.body;
    const sanitizedTitle = sanitizeHtml(title, { allowedTags: [], allowedAttributes: {} });
    const sanitizedContent = sanitizeHtml(content, { allowedTags: [], allowedAttributes: {} });
    if (sanitizedTitle.length < 1 || sanitizedContent.length < 1) {
      console.log('Dados inválidos após sanitização:', { sanitizedTitle, sanitizedContent });
      return res.status(400).json({ error: 'Título ou conteúdo inválido após sanitização' });
    }
    const createdAt = new Date().toISOString();
    console.log('Tentando inserir post:', {
      title: sanitizedTitle,
      content: sanitizedContent,
      userId: req.user.userId,
      username: req.user.username,
      createdAt,
    });
    db.run(
      'INSERT INTO posts (title, content, userId, username, createdAt) VALUES (?, ?, ?, ?, ?)',
      [sanitizedTitle, sanitizedContent, req.user.userId, req.user.username, createdAt],
      function (err) {
        if (err) {
          console.error('Erro ao inserir post:', err);
          return res.status(500).json({ error: 'Erro ao criar post: ' + err.message });
        }
        console.log(`Post criado com ID: ${this.lastID}`);
        res.status(201).json({
          id: this.lastID,
          title: sanitizedTitle,
          content: sanitizedContent,
          userId: req.user.userId,
          username: req.user.username,
          createdAt,
        });
      }
    );
  }
);

// Atualizar post
router.put(
  '/:id',
  authenticateToken,
  [
    body('title').notEmpty().withMessage('Título é obrigatório'),
    body('content').notEmpty().withMessage('Conteúdo é obrigatório'),
  ],
  (req, res) => {
    console.log(`PUT /api/posts/${req.params.id} chamado`);
    if (!req.user) {
      console.error('req.user não definido após autenticação');
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Erros de validação:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }
    const { id } = req.params;
    const { title, content } = req.body;
    const sanitizedTitle = sanitizeHtml(title, { allowedTags: [], allowedAttributes: {} });
    const sanitizedContent = sanitizeHtml(content, { allowedTags: [], allowedAttributes: {} });
    db.get('SELECT userId FROM posts WHERE id = ?', [id], (err, post) => {
      if (err || !post) {
        console.error('Post não encontrado:', err || 'Nenhum post encontrado');
        return res.status(404).json({ error: 'Post não encontrado' });
      }
      if (post.userId !== req.user.userId) {
        return res.status(403).json({ error: 'Permissão negada' });
      }
      db.run(
        'UPDATE posts SET title = ?, content = ? WHERE id = ?',
        [sanitizedTitle, sanitizedContent, id],
        (err) => {
          if (err) {
            console.error('Erro ao atualizar post:', err);
            return res.status(500).json({ error: 'Erro interno do servidor' });
          }
          console.log(`Post ${id} atualizado`);
          res.json({ id, title: sanitizedTitle, content: sanitizedContent });
        }
      );
    });
  }
);

// Excluir post
router.delete('/:id', authenticateToken, (req, res) => {
  console.log(`DELETE /api/posts/${id} chamado`);
  if (!req.user) {
    console.error('req.user não definido após autenticação');
    return res.status(401).json({ error: 'Usuário não autenticado' });
  }
  const { id } = req.params;
  db.get('SELECT userId FROM posts WHERE id = ?', [id], (err, post) => {
    if (err || !post) {
      console.error('Post não encontrado:', err || 'Nenhum post encontrado');
      return res.status(404).json({ error: 'Post não encontrado' });
    }
    if (post.userId !== req.user.userId) {
      return res.status(403).json({ error: 'Permissão negada' });
    }
    db.run('DELETE FROM posts WHERE id = ?', [id], (err) => {
      if (err) {
        console.error('Erro ao excluir post:', err);
        return res.status(500).json({ error: 'Erro interno do servidor' });
      }
      console.log(`Post ${id} excluído`);
      res.status(204).send();
    });
  });
});

module.exports = router;