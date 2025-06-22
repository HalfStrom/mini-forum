const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  console.log('Middleware authenticateToken chamado');
  const authHeader = req.headers.authorization;
  console.log('Cabeçalho de autorização:', authHeader);
  if (!authHeader) {
    console.log('Erro: Token não fornecido');
    return res.status(401).json({ error: 'Token não fornecido' });
  }
  const token = authHeader.replace('Bearer ', '').trim();
  console.log('Token extraído:', token);
  try {
    const decoded = jwt.verify(token, 'my_secure_jwt_secret');
    console.log('Token decodificado:', decoded);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Erro ao verificar token:', err.message);
    return res.status(401).json({ error: 'Token inválido', details: err.message });
  }
};