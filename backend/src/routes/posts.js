const express = require('express');
const { body, validationResult } = require('express-validator');
const sanitizeHtml = require('sanitize-html');
const db = require('../database');
const authenticate = require('../middleware/auth');
const router = express.Route();

// Listar posts com comentários
router.get('/', (req, res) => {
    db.all(
        `SELECT posts.*, users.username,
                (SELECT json_group_array(
                    json_object('id', comments.id, 'content', comments.content,
                    'username', u2.username, 'createdAt', comments.createdAt)
                ) FROM comments
                JOIN users u2 ON comments.userId = u2.id
                WHERE comments.postId = posts.id) as comments
         FROM post
         JOIN users ON posts.userId = users.id
         ORDER BY posts.createdAt DESC`,
         (err, rows) => {
            if (err) return res.status(500).json({ error: 'Erro ao buscar posts' });
            res.json(rows.map(row => ({
                ...row,
                comments: JSON.parse(row.comments)
            })));
         }
    );
});

// Criar post
router.post(
    '/',
    authenticate,
    [
        body('title').isLength({ min: 3, max: 100 }).trim().escape(),
        body('content').isLength({ min: 1}).trim(),
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const { title, content } = req.body;
        const sanitizedContent = sanitizeHtml(content);
        db.run(
            `INSERT INTO posts (title, content, userId) VALUES (?, ?, ?)`,
            [title, sanitizedContent, req.userId],
            (err) => {
                if (err) return res.status(500).json({ error: 'Erro ao criar post' });
                res.status(201).json({ message: 'Post criado' });
            }
        );
    }
);

// Atualizar post
router.put(
    '/:id',
    authenticate,
    [
        body('title').isLength({ min: 3, max: 100 }).trim().escape(),
        body('content').isLength({ min: 1 }),
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    
        const { title, content } = req.body;
        const postId = req.params.id;
        const sanitizedContent = sanitizeHtml(content);

        db.get(`SELECT userId FROM posts WHERE id = ?`, [postId], (err, post) => 
        {
            if (err || !post) return res.status(404).json({ error: 'Post não encontrado' });
            if (post.userId !== req.userId) return res.status(403).json({ error: 'Acesso negado' });

            db.run(
                `UPDATE posts SET title = ?, content = ? WHERE id = ?`,
                [title, sanitizedContent, postId],
                (err) => {
                    if (err) return res.status(500).json({ error: 'Erro ao atualizar post' });
                    res.json({ message: 'Post atualizado '});
                }
            );
        });
    }
);

// Deletar post
router.delete('/:id', authenticate, (req, res) => {
    const postId = req.params.id;

    db.get(`SELECT userId FROM posts WHERE id = ?`, [postId], (err, post) => {
        if (err || !post) return res.status(404).json({ error: 'Post não encontrado' });
        if (post.userId !== req.userId) return res.status(403).json({ error: 'Acesso negado'});

        db.run(`DELETE FROM posts WHERE id = ?`, [postId], (err) => {
            if (err) return res.status(500).json({ error: 'Erro ao deletar post' });
            res.json({ message: 'Post deletado' });
        });
    });
});

module.exports = router;