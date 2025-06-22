const express = require('express');
const router = express.Router();
const db = require('../database');
const { body, validationResult } = require('express-validator');
const sanitizeHtml = require('sanitize-html');
const authenticateToken = require('../middleware/auth');

// Listar contatos recentes (usuários com quem o usuário conversou)
router.get('/contacts', authenticateToken, (req, res) => {
  console.log(`GET /api/messages/contacts chamado para userId: ${req.user.userId}`);
  db.all(
    `
    SELECT DISTINCT u.id, u.username
    FROM users u
    WHERE u.id IN (
      SELECT senderId FROM messages WHERE receiverId = ?
      UNION
      SELECT receiverId FROM messages WHERE senderId = ?
    ) AND u.id != ?
    ORDER BY u.username
    `,
    [req.user.userId, req.user.userId, req.user.userId],
    (err, rows) => {
      if (err) {
        console.error('Erro ao listar contatos:', err);
        return res.status(500).json({ error: 'Erro interno do servidor' });
      }
      console.log(`Contatos encontrados: ${rows.length}`);
      res.json(rows);
    }
  );
});

// Listar mensagens com um usuário específico
router.get('/:userId', authenticateToken, (req, res) => {
  const { userId } = req.params;
  console.log(`GET /api/messages/${userId} chamado para userId: ${req.user.userId}`);
  db.all(
    `
    SELECT m.id, m.senderId, m.receiverId, m.content, m.createdAt, u.username AS senderUsername
    FROM messages m
    JOIN users u ON m.senderId = u.id
    WHERE (m.senderId = ? AND m.receiverId = ?) OR (m.senderId = ? AND m.receiverId = ?)
    ORDER BY m.createdAt ASC
    `,
    [req.user.userId, userId, userId, req.user.userId],
    (err, rows) => {
      if (err) {
        console.error('Erro ao listar mensagens:', err);
        return res.status(500).json({ error: 'Erro interno do servidor' });
      }
      console.log(`Mensagens encontradas: ${rows.length}`);
      res.json(rows);
    }
  );
});

// Enviar mensagem (usado apenas se WebSocket falhar)
router.post(
  '/',
  authenticateToken,
  [
    body('receiverId').isInt().withMessage('Destinatário inválido'),
    body('content').notEmpty().withMessage('Conteúdo é obrigatório'),
  ],
  (req, res) => {
    console.log('POST /api/messages chamado:', req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Erros de validação:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }
    const { receiverId, content } = req.body;
    const sanitizedContent = sanitizeHtml(content, { allowedTags: [], allowedAttributes: {} });
    if (sanitizedContent.length < 1) {
      return res.status(400).json({ error: 'Conteúdo inválido após sanitização' });
    }
    db.get('SELECT id FROM users WHERE id = ?', [receiverId], (err, user) => {
      if (err || !user) {
        console.error('Destinatário não encontrado:', err || 'Nenhum usuário');
        return res.status(400).json({ error: 'Destinatário não encontrado' });
      }
      const createdAt = new Date().toISOString();
      db.run(
        'INSERT INTO messages (senderId, receiverId, content, createdAt) VALUES (?, ?, ?, ?)',
        [req.user.userId, receiverId, sanitizedContent, createdAt],
        function (err) {
          if (err) {
            console.error('Erro ao enviar mensagem:', err);
            return res.status(500).json({ error: 'Erro interno do servidor' });
          }
          console.log(`Mensagem criada com ID: ${this.lastID}`);
          res.status(201).json({
            id: this.lastID,
            senderId: req.user.userId,
            receiverId,
            content: sanitizedContent,
            createdAt,
            senderUsername: req.user.username,
          });
        }
      );
    });
  }
);

module.exports = router;