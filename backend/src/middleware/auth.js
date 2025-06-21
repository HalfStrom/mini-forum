const jwt = require('jsonwebtoken');
const secretKey = 'testando123' // Substitua por uma chave segura (use env vars em produção)

module.exports = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token não fornecido' });
    
    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) return res.status(401).json({ error: 'Token inválido' });
        req.userId = decoded.userId;
        next();
    });
};