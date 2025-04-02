const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const githubRoutes = require('./routes/github');
require('dotenv').config({ path: './.env' });

const app = express();

// Отладка всех запросов
app.use((req, res, next) => {
  console.log(`Получен запрос: ${req.method} ${req.url}`);
  next();
});

console.log('Подключаем маршруты GitHub:', githubRoutes);

app.use(cors({ origin: 'http://localhost:8080' }));
app.use(bodyParser.json());
app.use(express.json());
app.use('/auth', authRoutes);
app.use('/projects', projectRoutes);
app.use('/github', githubRoutes);

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});