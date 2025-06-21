const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const db = require('../database');
const router = express.Router();
const secretKey = 'testando123'; // Substitua por uma chave segura

// Registro
router.post(
    '/register',
    [
        body('username').isLength({ min: 3 }).trim().escape(),
        body('password').isLength({ min: 6 }), 
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const { username, password } = req.body;
        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            db.run(
                `INSERT INTO users (username, password) VALUES (?, ?)`,
                [username, hashedPassword],
                (err) => {
                    if (err) return res.status(400).json({ error: 'Usuário já existe' });
                    res.status(201).json({message: 'Usuário registrado '});
                }
            );
        } catch (error) {
            res.status(500).json({ error: 'Erro ao registrar' });
        }
    }
);

// Login
router.post(
    '/login',
    [
        body('username').isLength({ min: 3}).trim().escape(),
        body('password').notEmpty(),
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const { username, password } = req.body;
        db.get(`SELECT * FROM users WHERE username = ?`, [username], async (err, user) => {
            if (err || !user) return res.status(401).json({ error: 'Usuário não encontrado' });
            const isValid = await bcrypt.compare(password, user.password);
            if (!isValid) return res.status(401).json({ error: 'Usuário ou Senha incorretos' });

            const token = jwt.sign({ userId: user.id }, secretKey, { expiresIn: '1h' });
            res.json({ token });
        });
    }
);

module.exports = router;