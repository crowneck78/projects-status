// middleware/auth.js
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  console.log('Заголовок Authorization:', authHeader); // Отладка
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    console.log('Токен отсутствует в запросе');
    return res.status(401).send('Токен отсутствует');
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.log('Ошибка верификации токена:', err.message);
      return res.status(403).send('Неверный токен');
    }
    console.log('Токен верифицирован, пользователь:', user);
    req.user = user;
    next();
  });
}

module.exports = authenticateToken;