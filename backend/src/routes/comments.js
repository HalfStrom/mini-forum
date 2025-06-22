const express = require('express');
const router = express.Router();
const db = require('../database');
const { body, validationResult } = require('express-validator');
const sanitizeHtml = require('sanitize-html');
const authenticateToken = require('../middleware/auth');

// Listar comentários por postId
router.get('/', (req, res) => {
  const { postId } = req.query;
  console.log(`GET /api/comments chamado com postId: ${postId}`);
  if (!postId) {
    return res.status(400).json({ error: 'postId é obrigatório' });
  }
  db.all(
    'SELECT id, content, userId, username, createdAt FROM comments WHERE postId = ? ORDER BY createdAt DESC',
    [postId],
    (err, rows) => {
      if (err) {
        console.error('Erro ao listar comentários:', err);
        return res.status(500).json({ error: 'Erro interno do servidor' });
      }
      console.log(`Comentários encontrados: ${rows.length}`);
      res.json(rows);
    }
  );
});

// Criar comentário
router.post(
  '/',
  authenticateToken,
  [
    body('content').notEmpty().withMessage('Conteúdo é obrigatório'),
    body('postId').isInt().withMessage('postId deve ser um número inteiro'),
  ],
  (req, res) => {
    console.log('POST /api/comments chamado:', req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { content, postId } = req.body;
    const sanitizedContent = sanitizeHtml(content, {
      allowedTags: [],
      allowedAttributes: {},
    });
    if (sanitizedContent.length < 1) {
      return res.status(400).json({ error: 'Conteúdo inválido após sanitização' });
    }
    db.get('SELECT id FROM posts WHERE id = ?', [postId], (err, post) => {
      if (err || !post) {
        console.error('Post não encontrado para postId:', postId);
        return res.status(400).json({ error: 'Post não encontrado' });
      }
      const createdAt = new Date().toISOString();
      db.run(
        'INSERT INTO comments (content, userId, username, postId, createdAt) VALUES (?, ?, ?, ?, ?)',
        [sanitizedContent, req.user.userId, req.user.username, postId, createdAt],
        function (err) {
          if (err) {
            console.error('Erro ao criar comentário:', err);
            return res.status(500).json({ error: 'Erro interno do servidor' });
          }
          console.log(`Comentário criado com ID: ${this.lastID}`);
          res.status(201).json({
            id: this.lastID,
            content: sanitizedContent,
            userId: req.user.userId,
            username: req.user.username,
            postId,
            createdAt,
          });
        }
      );
    });
  }
);

// Excluir comentário
router.delete('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  console.log(`DELETE /api/comments/${id} chamado`);
  db.get('SELECT userId FROM comments WHERE id = ?', [id], (err, comment) => {
    if (err || !comment) {
      console.error('Comentário não encontrado para ID:', id);
      return res.status(404).json({ error: 'Comentário não encontrado' });
    }
    if (comment.userId !== req.user.userId) {
      return res.status(403).json({ error: 'Permissão negada' });
    }
    db.run('DELETE FROM comments WHERE id = ?', [id], (err) => {
      if (err) {
        console.error('Erro ao excluir comentário:', err);
        return res.status(500).json({ error: 'Erro interno do servidor' });
      }
      console.log(`Comentário ${id} excluído`);
      res.status(204).send();
    });
  });
});

module.exports = router;