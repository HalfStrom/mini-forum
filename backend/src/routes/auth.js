const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../database');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');

// Configuração do Multer para upload de fotos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `user-${req.user.userId}-${Date.now()}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Apenas imagens JPG ou PNG são permitidas'));
    }
  },
});

router.post(
  '/register',
  [
    body('username').isLength({ min: 3 }).withMessage('Usuário deve ter pelo menos 3 caracteres'),
    body('password').isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres'),
    body('email').isEmail().withMessage('E-mail inválido').optional({ nullable: true }),
  ],
  async (req, res) => {
    console.log('POST /api/auth/register chamado:', req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Erros de validação:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }
    const { username, password, email } = req.body;
    try {
      const hash = await bcrypt.hash(password, 10);
      const [userId] = await db('users').insert({
        username,
        password: hash,
        email: email || null
      });
      console.log(`Usuário registrado com ID: ${userId}`);
      res.status(201).json({ message: 'Usuário registrado com sucesso' });
    } catch (err) {
      console.error('Erro ao registrar usuário:', err);
      return res.status(400).json({ error: 'Usuário ou e-mail já existe' });
    }
  }
);

router.post(
  '/login',
  [
    body('username').notEmpty().withMessage('Usuário é obrigatório'),
    body('password').notEmpty().withMessage('Senha é obrigatória'),
  ],
  async (req, res) => {
    console.log('POST /api/auth/login chamado:', { username: req.body.username });
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Erros de validação:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }
    const { username, password } = req.body;
    try {
      const user = await db('users')
        .select('id', 'username', 'password', 'email', 'profilePicture')
        .where('username', username)
        .first();
      
      if (!user) {
        console.error('Usuário não encontrado');
        return res.status(400).json({ error: 'Usuário ou senha inválidos' });
      }
      
      const result = await bcrypt.compare(password, user.password);
      if (!result) {
        console.error('Senha inválida');
        return res.status(400).json({ error: 'Usuário ou senha inválidos' });
      }
      
      const token = jwt.sign(
        { userId: user.id, username: user.username },
        'my_secure_jwt_secret',
        { expiresIn: '1h' }
      );
      console.log('Token gerado:', token);
      res.json({ 
        token, 
        user: { 
          id: user.id, 
          username: user.username, 
          email: user.email, 
          profilePicture: user.profilePicture 
        } 
      });
    } catch (err) {
      console.error('Erro no login:', err);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
);

// Obter perfil do usuário
router.get('/profile', require('../middleware/auth'), async (req, res) => {
  console.log(`GET /api/auth/profile chamado para userId: ${req.user.userId}`);
  try {
    const user = await db('users')
      .select('id', 'username', 'email', 'profilePicture')
      .where('id', req.user.userId)
      .first();
    
    if (!user) {
      console.error('Usuário não encontrado');
      return res.status(500).json({ error: 'Erro ao buscar perfil' });
    }
    res.json(user);
  } catch (err) {
    console.error('Erro ao buscar perfil:', err);
    return res.status(500).json({ error: 'Erro ao buscar perfil' });
  }
});

// Atualizar username e email
router.put(
  '/profile',
  require('../middleware/auth'),
  [
    body('username').isLength({ min: 3 }).withMessage('Usuário deve ter pelo menos 3 caracteres').optional(),
    body('email').isEmail().withMessage('E-mail inválido').optional(),
  ],
  async (req, res) => {
    console.log('PUT /api/auth/profile chamado:', req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Erros de validação:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }
    const { username, email } = req.body;
    if (!username && !email) {
      return res.status(400).json({ error: 'Nenhum campo fornecido para atualização' });
    }
    
    try {
      const updateData = {};
      if (username) updateData.username = username;
      if (email) updateData.email = email;
      
      const updatedRows = await db('users')
        .where('id', req.user.userId)
        .update(updateData);
      
      if (updatedRows === 0) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }
      
      console.log(`Perfil atualizado para userId: ${req.user.userId}`);
      const user = await db('users')
        .select('id', 'username', 'email', 'profilePicture')
        .where('id', req.user.userId)
        .first();
      
      res.json(user);
    } catch (err) {
      console.error('Erro ao atualizar perfil:', err);
      return res.status(400).json({ error: 'Usuário ou e-mail já existe' });
    }
  }
);

// Alterar senha
router.put(
  '/password',
  require('../middleware/auth'),
  [
    body('currentPassword').notEmpty().withMessage('Senha atual é obrigatória'),
    body('newPassword').isLength({ min: 6 }).withMessage('Nova senha deve ter pelo menos 6 caracteres'),
  ],
  async (req, res) => {
    console.log(`PUT /api/auth/password chamado para userId: ${req.user.userId}`);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Erros de validação:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }
    const { currentPassword, newPassword } = req.body;
    
    try {
      const user = await db('users')
        .select('password')
        .where('id', req.user.userId)
        .first();
      
      if (!user) {
        console.error('Usuário não encontrado');
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }
      
      const result = await bcrypt.compare(currentPassword, user.password);
      if (!result) {
        console.error('Senha atual inválida');
        return res.status(400).json({ error: 'Senha atual inválida' });
      }
      
      const hash = await bcrypt.hash(newPassword, 10);
      await db('users')
        .where('id', req.user.userId)
        .update({ password: hash });
      
      console.log(`Senha atualizada para userId: ${req.user.userId}`);
      res.json({ message: 'Senha atualizada com sucesso' });
    } catch (err) {
      console.error('Erro ao atualizar senha:', err);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
);

// Upload de foto de perfil
router.post('/profile/picture', require('../middleware/auth'), upload.single('profilePicture'), async (req, res) => {
  console.log(`POST /api/auth/profile/picture chamado para userId: ${req.user.userId}`);
  if (!req.file) {
    console.log('Nenhuma imagem fornecida');
    return res.status(400).json({ error: 'Nenhuma imagem fornecida' });
  }
  const filePath = `/uploads/${req.file.filename}`;
  
  try {
    await db('users')
      .where('id', req.user.userId)
      .update({ profilePicture: filePath });
    
    console.log(`Foto de perfil atualizada: ${filePath}`);
    res.json({ profilePicture: filePath });
  } catch (err) {
    console.error('Erro ao atualizar foto de perfil:', err);
    return res.status(500).json({ error: 'Erro ao atualizar foto de perfil' });
  }
});

// Buscar usuários
router.get('/users', async (req, res) => {
  console.log('GET /api/auth/users chamado');
  const { search } = req.query;
  
  try {
    let query = db('users')
      .select('id', 'username', 'email', 'profilePicture')
      .orderBy('username', 'asc');
    
    if (search) {
      query = query.where('username', 'like', `%${search}%`);
    }
    
    const users = await query;
    console.log(`Usuários encontrados: ${users.length}`);
    res.json(users);
  } catch (err) {
    console.error('Erro ao buscar usuários:', err);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Obter perfil de outro usuário
router.get('/users/:id', async (req, res) => {
  const { id } = req.params;
  console.log(`GET /api/auth/users/${id} chamado`);
  
  try {
    const user = await db('users')
      .select('id', 'username', 'email', 'profilePicture')
      .where('id', id)
      .first();
    
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    res.json(user);
  } catch (err) {
    console.error('Erro ao buscar usuário:', err);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;