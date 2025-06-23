const express = require('express');
const router = express.Router();
const db = require('../database');
const { body, validationResult } = require('express-validator');
const sanitizeHtml = require('sanitize-html');
const authenticateToken = require('../middleware/auth');

// Listar comentários por postId
router.get('/', async (req, res) => {
  const { postId } = req.query;
  console.log(`GET /api/comments chamado com postId: ${postId}`);
  if (!postId) {
    return res.status(400).json({ error: 'postId é obrigatório' });
  }
  
  try {
    const rows = await db('comments')
      .select('id', 'content', 'userId', 'username', 'createdAt')
      .where('postId', postId)
      .orderBy('createdAt', 'desc');
    
    console.log(`Comentários encontrados: ${rows.length}`);
    res.json(rows);
  } catch (err) {
    console.error('Erro ao listar comentários:', err);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar comentário
router.post(
  '/',
  authenticateToken,
  [
    body('content').notEmpty().withMessage('Conteúdo é obrigatório'),
    body('postId').isInt().withMessage('postId deve ser um número inteiro'),
  ],
  async (req, res) => {
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
    
    try {
      const post = await db('posts')
        .select('id')
        .where('id', postId)
        .first();
      
      if (!post) {
        console.error('Post não encontrado para postId:', postId);
        return res.status(400).json({ error: 'Post não encontrado' });
      }
      
      const createdAt = new Date().toISOString();
      const [commentId] = await db('comments').insert({
        content: sanitizedContent,
        userId: req.user.userId,
        username: req.user.username,
        postId,
        createdAt,
      });
      
      console.log(`Comentário criado com ID: ${commentId}`);
      res.status(201).json({
        id: commentId,
        content: sanitizedContent,
        userId: req.user.userId,
        username: req.user.username,
        postId,
        createdAt,
      });
    } catch (err) {
      console.error('Erro ao criar comentário:', err);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
);

// Excluir comentário
router.delete('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  console.log(`DELETE /api/comments/${id} chamado`);
  
  try {
    const comment = await db('comments')
      .select('userId')
      .where('id', id)
      .first();
    
    if (!comment) {
      console.error('Comentário não encontrado para ID:', id);
      return res.status(404).json({ error: 'Comentário não encontrado' });
    }
    
    if (comment.userId !== req.user.userId) {
      return res.status(403).json({ error: 'Permissão negada' });
    }
    
    await db('comments')
      .where('id', id)
      .del();
    
    console.log(`Comentário ${id} excluído`);
    res.status(204).send();
  } catch (err) {
    console.error('Erro ao excluir comentário:', err);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;