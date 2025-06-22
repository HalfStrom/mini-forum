const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../database');
const { body, validationResult } = require('express-validator');

router.post(
  '/register',
  [
    body('username').isLength({ min: 3 }).withMessage('Usuário deve ter pelo menos 3 caracteres'),
    body('password').isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres'),
  ],
  (req, res) => {
    console.log('POST /api/auth/register chamado:', req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Erros de validação:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }
    const { username, password } = req.body;
    bcrypt.hash(password, 10, (err, hash) => {
      if (err) {
        console.error('Erro ao criptografar senha:', err);
        return res.status(500).json({ error: 'Erro interno do servidor' });
      }
      db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hash], function (err) {
        if (err) {
          console.error('Erro ao registrar usuário:', err);
          return res.status(400).json({ error: 'Usuário já existe ou erro ao registrar' });
        }
        console.log(`Usuário registrado com ID: ${this.lastID}`);
        res.status(201).json({ message: 'Usuário registrado com sucesso' });
      });
    });
  }
);

router.post(
  '/login',
  [
    body('username').notEmpty().withMessage('Usuário é obrigatório'),
    body('password').notEmpty().withMessage('Senha é obrigatória'),
  ],
  (req, res) => {
    console.log('POST /api/auth/login chamado:', { username: req.body.username });
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Erros de validação:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }
    const { username, password } = req.body;
    db.get('SELECT id, username, password FROM users WHERE username = ?', [username], (err, user) => {
      if (err || !user) {
        console.error('Usuário não encontrado ou erro:', err || 'Nenhum usuário');
        return res.status(400).json({ error: 'Usuário ou senha inválidos' });
      }
      bcrypt.compare(password, user.password, (err, result) => {
        if (err || !result) {
          console.error('Erro ao comparar senha ou senha inválida:', err || 'Senha inválida');
          return res.status(400).json({ error: 'Usuário ou senha inválidos' });
        }
        const token = jwt.sign(
          { userId: user.id, username: user.username },
          'my_secure_jwt_secret',
          { expiresIn: '1h' }
        );
        console.log('Token gerado:', token);
        res.json({ token });
      });
    });
  }
);

module.exports = router;