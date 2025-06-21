const express = require('express');
const { body, validationResult } = require('express-validator');
const sanitizeHtml = require('sanitize-html');
const db = require('../database');
const authenticate = require('../middleware/auth');
const auth = require('../middleware/auth');
const router = express.Router();

// Criar comentário
router.post(
    '/:postId',
    authenticate,
    [
        body('content').isLength({ min: 1, max: 500 }).trim(),
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const { content } = req.body;
        const postId = req.params.postId;
        const sanitizedContent = sanitizeHtml(content);

        db.get(`SELECT id FROM posts WHERE id = ?`, [postId], (err, post) => {
            if (err || !post) return res.status(404).json({ error: 'Post não encontrado' });

            db.run(
                `INSERT INTO comments (content, userId, postId) VALUES (?, ?, ?)`,
                [sanitizedContent, req.userId, postId],
                (err) => {
                    if (err) return res.status(500).json({ error: 'Erro ao criar comentário' });
                    res.status(201).json({ message: 'Comentário criado' });
                }
            );
        });
    }
);

// Listar comentários de um post
router.get('/:postId', (req, res) => {
    const postId = req.params.postId;
    db.all(
        `SELECT comments.*, users.username
         FROM comments
         JOIN users ON comments.userId = users.id
         WHERE comments.postId = ?
         ORDER BY comments.createdAt ASC`,
        [postId],
        (err, rows) => {
            if (err) return res.status(500).json({ error: 'Erro ao buscar comentários' });
            res.json(rows);
        }
    );
});

// Atualizar comentário
router.put(
    '/:id',
    authenticate,
    [
        body('content').isLength({ min: 1, max: 500 }).trim(),
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const { content } = req.body;
        const commentId = req.params.id;
        const sanitizedContent = sanitizeHtml(content);

        db.get(`SELECT userId FROM comments WHERE id = ?`, [commentId], (err, comment) => {
            if (err || !comment) return res.status(404).json({ error: 'Comentário não encontrado' });
            if (comment.userId !== req.userId) return res.status(403).json({ error: 'Acesso negado' });

            db.run(
                `UPDATE comments SET content = ? WHERE id = ?`,
                [sanitizedContent, commentId],
                (err) => {
                    if (err) return res.status(500).json({ error: 'Erro ao atualizar comentário' });
                    res.json({ message: 'Comentário atualizado' });
                }
            );
        });
    }
);

// Deletar comentário
router.delete('/:id', authenticate, (req, res) => {
    const commentId = req.params.id;

    db.get(`SELECT userId FROM comments WHERE id = ?`, [commentId], (err, comment) => {
        if (err || !comment) return res.status(404).json({ error: 'Comentário não encontrado' });
        if (comment.userId !== req.userId) return res.status(403).json({ error: 'Acesso negado' });

        db.run(`DELETE FROM comments WHERE id = ?`, [commentId], (err) => {
            if (err) return res.status(500).json({ error: 'Erro ao deletar comentário' });
            res.json({ message: 'Comentário deletado' });
        });
    });
});

module.exports = router;