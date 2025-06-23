const express = require('express');
const router = express.Router();
const db = require('../database');
const { body, validationResult } = require('express-validator');
const sanitizeHtml = require('sanitize-html');
const authenticateToken = require('../middleware/auth');

// Buscar posts
router.get('/search', async (req, res) => {
  console.log('GET /api/posts/search chamado');
  const { q } = req.query;
  
  if (!q) {
    return res.status(400).json({ error: 'Parâmetro de busca é obrigatório' });
  }
  
  try {
    const rows = await db('posts')
      .select('id', 'title', 'content', 'userId', 'username', 'createdAt')
      .where(function() {
        this.where('title', 'like', `%${q}%`)
            .orWhere('content', 'like', `%${q}%`)
            .orWhere('username', 'like', `%${q}%`);
      })
      .orderBy('createdAt', 'desc');
    
    console.log(`Posts encontrados na busca: ${rows.length}`);
    res.json(rows);
  } catch (err) {
    console.error('Erro ao buscar posts:', err);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Listar todos os posts
router.get('/', async (req, res) => {
  console.log('GET /api/posts chamado');
  try {
    const rows = await db('posts')
      .select('id', 'title', 'content', 'userId', 'username', 'createdAt')
      .orderBy('createdAt', 'desc');
    
    console.log(`Posts encontrados: ${rows.length}`);
    res.json(rows);
  } catch (err) {
    console.error('Erro ao listar posts:', err);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Obter post por ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  console.log(`GET /api/posts/${id} chamado`);
  try {
    const row = await db('posts')
      .select('id', 'title', 'content', 'userId', 'username', 'createdAt')
      .where('id', id)
      .first();
    
    if (!row) {
      return res.status(404).json({ error: 'Post não encontrado' });
    }
    res.json(row);
  } catch (err) {
    console.error('Erro ao obter post:', err);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar post
router.post(
  '/',
  authenticateToken,
  [
    body('title').notEmpty().withMessage('Título é obrigatório'),
    body('content').notEmpty().withMessage('Conteúdo é obrigatório'),
  ],
  async (req, res) => {
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
    
    try {
      const [postId] = await db('posts').insert({
        title: sanitizedTitle,
        content: sanitizedContent,
        userId: req.user.userId,
        username: req.user.username,
        createdAt,
      });
      
      console.log(`Post criado com ID: ${postId}`);
      res.status(201).json({
        id: postId,
        title: sanitizedTitle,
        content: sanitizedContent,
        userId: req.user.userId,
        username: req.user.username,
        createdAt,
      });
    } catch (err) {
      console.error('Erro ao inserir post:', err);
      return res.status(500).json({ error: 'Erro ao criar post: ' + err.message });
    }
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
  async (req, res) => {
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
    
    try {
      const post = await db('posts')
        .select('userId')
        .where('id', id)
        .first();
      
      if (!post) {
        console.error('Post não encontrado');
        return res.status(404).json({ error: 'Post não encontrado' });
      }
      
      if (post.userId !== req.user.userId) {
        return res.status(403).json({ error: 'Permissão negada' });
      }
      
      await db('posts')
        .where('id', id)
        .update({
          title: sanitizedTitle,
          content: sanitizedContent
        });
      
      console.log(`Post ${id} atualizado`);
      res.json({ id, title: sanitizedTitle, content: sanitizedContent });
    } catch (err) {
      console.error('Erro ao atualizar post:', err);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
);

// Excluir post
router.delete('/:id', authenticateToken, async (req, res) => {
  console.log(`DELETE /api/posts/${req.params.id} chamado`);
  if (!req.user) {
    console.error('req.user não definido após autenticação');
    return res.status(401).json({ error: 'Usuário não autenticado' });
  }
  const { id } = req.params;
  
  try {
    const post = await db('posts')
      .select('userId')
      .where('id', id)
      .first();
    
    if (!post) {
      console.error('Post não encontrado');
      return res.status(404).json({ error: 'Post não encontrado' });
    }
    
    if (post.userId !== req.user.userId) {
      return res.status(403).json({ error: 'Permissão negada' });
    }
    
    await db('posts')
      .where('id', id)
      .del();
    
    console.log(`Post ${id} excluído`);
    res.status(204).send();
  } catch (err) {
    console.error('Erro ao excluir post:', err);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;