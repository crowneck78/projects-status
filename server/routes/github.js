const express = require('express');
const router = express.Router();
const axios = require('axios');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const authenticateToken = require('../middleware/auth');
require('dotenv').config();

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const GITHUB_WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET || 'mysecret123';
const JWT_SECRET = process.env.JWT_SECRET;

router.get('/login', (req, res) => {
  const redirectUri = 'http://localhost:5000/github/callback';
  const scope = 'user repo';
  const url = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${redirectUri}&scope=${scope}`;
  console.log('Сформированный URL для GitHub:', url);
  res.redirect(url);
});

router.get('/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) {
    console.error('Код авторизации отсутствует в запросе');
    return res.status(400).send('Код авторизации отсутствует');
  }

  try {
    console.log('Запрос токена с кодом:', code);
    const tokenResponse = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
      },
      { headers: { Accept: 'application/json' } }
    );

    const tokenData = tokenResponse.data;
    console.log('Ответ от GitHub:', tokenData);
    if (!tokenData.access_token) {
      console.error('Ошибка от GitHub:', tokenData);
      throw new Error('Не удалось получить access token');
    }
    const accessToken = tokenData.access_token;

    const userResponse = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const githubUser = userResponse.data;
    console.log('Данные пользователя GitHub:', githubUser);

    const username = githubUser.login;
    const email = githubUser.email || null;

    const checkUserQuery = 'SELECT * FROM users WHERE github_id = ?';
    db.query(checkUserQuery, [githubUser.id], async (err, results) => {
      if (err) return res.status(500).send(`Ошибка проверки пользователя: ${err.message}`);

      let userId;
      if (results.length === 0) {
        const insertUserQuery = 'INSERT INTO users (username, email, password_hash, github_id, github_token) VALUES (?, ?, ?, ?, ?)';
        db.query(insertUserQuery, [username, email, null, githubUser.id, accessToken], (insertErr, insertResult) => {
          if (insertErr) return res.status(500).send(`Ошибка регистрации: ${insertErr.message}`);
          userId = insertResult.insertId;

          const token = jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '1h' });
          linkProjectsAndRedirect(userId, accessToken, token, res);
        });
      } else {
        userId = results[0].id;
        const updateTokenQuery = 'UPDATE users SET github_token = ?, username = ?, email = ? WHERE id = ?';
        db.query(updateTokenQuery, [accessToken, username, email, userId], (updateErr) => {
          if (updateErr) return res.status(500).send(`Ошибка обновления токена: ${updateErr.message}`);

          const token = jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '1h' });
          linkProjectsAndRedirect(userId, accessToken, token, res);
        });
      }
    });
  } catch (error) {
    console.error('Ошибка в callback:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    res.status(500).send('Ошибка авторизации через GitHub');
  }
});

async function linkProjectsAndRedirect(userId, accessToken, token, res) {
  try {
    const reposResponse = await axios.get('https://api.github.com/user/repos', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const repos = reposResponse.data;

    for (const repo of repos) {
      const checkProjectQuery = 'SELECT id FROM projects WHERE github_repo_id = ?';
      db.query(checkProjectQuery, [repo.id], (checkErr, checkResults) => {
        if (checkErr) {
          console.error(`Ошибка проверки проекта: ${checkErr.message}`);
          return res.status(500).send(`Ошибка проверки проекта: ${checkErr.message}`);
        }
        if (checkResults.length === 0) {
          const insertProjectQuery = 'INSERT INTO projects (name, description, user_id, github_repo_id) VALUES (?, ?, ?, ?)';
          db.query(insertProjectQuery, [repo.name, repo.description || null, userId, repo.id], (insertErr, insertResult) => {
            if (insertErr) {
              console.error(`Ошибка добавления проекта: ${insertErr.message}`);
              return;
            }
            const projectId = insertResult.insertId;
            const insertMemberQuery = 'INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, "owner")';
            db.query(insertMemberQuery, [projectId, userId], (memberErr) => {
              if (memberErr) console.error(`Ошибка добавления владельца: ${memberErr.message}`);
            });
          });
        }
      });
    }

    res.redirect(`http://localhost:8080/login?token=${token}`);
  } catch (error) {
    console.error('Ошибка в linkProjectsAndRedirect:', error.response?.data || error.message);
    res.status(500).send('Ошибка получения репозиториев');
  }
}

router.post('/webhook', (req, res) => {
  const signature = req.headers['x-hub-signature-256'];
  const event = req.headers['x-github-event'];
  const payload = JSON.stringify(req.body);

  const hmac = crypto.createHmac('sha256', GITHUB_WEBHOOK_SECRET);
  const digest = 'sha256=' + hmac.update(payload).digest('hex');
  if (signature !== digest) return res.status(401).send('Неверная подпись');

  if (event === 'push') {
    const repoId = req.body.repository.id;
    const repoName = req.body.repository.name;
    console.log(`Push в репозиторий: ${repoName}`);
    const updateQuery = 'UPDATE projects SET name = ? WHERE github_repo_id = ?';
    db.query(updateQuery, [repoName, repoId], (err) => {
      if (err) console.error(`Ошибка обновления проекта: ${err.message}`);
    });
  } else if (event === 'repository' && req.body.action === 'created') {
    const repo = req.body.repository;
    const userQuery = 'SELECT id FROM users WHERE github_id = ?';
    db.query(userQuery, [req.body.sender.id], (err, results) => {
      if (err || results.length === 0) return console.error('Пользователь не найден');
      const userId = results[0].id;
      const insertQuery = 'INSERT INTO projects (name, description, user_id, github_repo_id) VALUES (?, ?, ?, ?)';
      db.query(insertQuery, [repo.name, repo.description || null, userId, repo.id], (insertErr) => {
        if (insertErr) console.error(`Ошибка создания проекта: ${insertErr.message}`);
      });
    });
  }

  res.status(200).send('Webhook обработан');
});

router.get('/repos', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const userQuery = 'SELECT github_token FROM users WHERE id = ?';
  db.query(userQuery, [userId], async (err, results) => {
    if (err || results.length === 0) return res.status(500).send('Пользователь не найден');
    const accessToken = results[0].github_token;

    try {
      const reposResponse = await axios.get('https://api.github.com/user/repos', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      res.json(reposResponse.data);
    } catch (error) {
      console.error(error);
      res.status(500).send('Ошибка получения репозиториев');
    }
  });
});


// Маршрут для корневого содержимого репозитория
router.get('/repo/:owner/:repo/contents', authenticateToken, async (req, res) => {
  console.log('Маршрут /contents (корень) вызван');
  const userId = req.user.id;
  const { owner, repo } = req.params;
  const path = ''; // Пустой путь для корня
  console.log('Полученный путь от фронтенда:', path);

  const userQuery = 'SELECT github_token FROM users WHERE id = ?';
  db.query(userQuery, [userId], async (err, results) => {
    if (err || results.length === 0) {
      console.error('Ошибка запроса к базе данных:', err);
      return res.status(500).send('Пользователь не найден');
    }
    const accessToken = results[0].github_token;

    try {
      const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
      console.log(`Запрос к GitHub API: ${apiUrl}`);
      const response = await axios.get(apiUrl, {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: { ref: 'main' }, // Указываем ветку по умолчанию
      });
      console.log('Ответ GitHub API:', JSON.stringify(response.data, null, 2));
      res.json(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Ошибка получения содержимого от GitHub:', error.response?.data || error.message);
      if (error.response?.status === 404) {
        res.status(200).json([]);
      } else {
        res.status(error.response?.status || 500).json({ error: 'Ошибка получения содержимого' });
      }
    }
  });
});

// Маршрут для вложенных путей
router.get('/repo/:owner/:repo/contents/*', authenticateToken, async (req, res) => {
  console.log('Маршрут /contents (вложенный путь) вызван');
  const userId = req.user.id;
  const { owner, repo } = req.params;
  const path = req.params[0]; // Захватываем весь путь после /contents/
  console.log('Полученный путь от фронтенда:', path);

  const userQuery = 'SELECT github_token FROM users WHERE id = ?';
  db.query(userQuery, [userId], async (err, results) => {
    if (err || results.length === 0) {
      console.error('Ошибка запроса к базе данных:', err);
      return res.status(500).send('Пользователь не найден');
    }
    const accessToken = results[0].github_token;

    try {
      const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
      console.log(`Запрос к GitHub API: ${apiUrl}`);
      const response = await axios.get(apiUrl, {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: { ref: 'main' }, // Указываем ветку по умолчанию
      });
      console.log('Ответ GitHub API:', JSON.stringify(response.data, null, 2));
      res.json(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Ошибка получения содержимого от GitHub:', error.response?.data || error.message);
      if (error.response?.status === 404) {
        res.status(200).json([]);
      } else {
        res.status(error.response?.status || 500).json({ error: 'Ошибка получения содержимого' });
      }
    }
  });
});

// Маршрут для коммитов
router.get('/repo/:owner/:repo/commits', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { owner, repo } = req.params;
  const userQuery = 'SELECT github_token FROM users WHERE id = ?';
  db.query(userQuery, [userId], async (err, results) => {
    if (err || results.length === 0) return res.status(500).send('Пользователь не найден');
    const accessToken = results[0].github_token;

    try {
      const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/commits`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      res.json(response.data);
    } catch (error) {
      console.error('Ошибка получения коммитов:', error.response?.data || error.message);
      res.status(500).send('Ошибка получения коммитов');
    }
  });
});

// Маршрут для README
router.get('/repo/:owner/:repo/readme', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { owner, repo } = req.params;
  const userQuery = 'SELECT github_token FROM users WHERE id = ?';
  db.query(userQuery, [userId], async (err, results) => {
    if (err || results.length === 0) return res.status(500).send('Пользователь не найден');
    const accessToken = results[0].github_token;

    try {
      const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/contents/README.md`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      res.json(response.data);
    } catch (error) {
      console.error('Ошибка получения README:', error.response?.data || error.message);
      res.status(404).send('README не найден или ошибка загрузки');
    }
  });
});

// Маршрут для получения конкретного файла
router.get('/repo/:owner/:repo/file/:path*', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { owner, repo } = req.params;
  let filePath = req.params.path || '';
  if (req.params[0]) filePath += req.params[0]; // Учитываем остаток пути

  const userQuery = 'SELECT github_token FROM users WHERE id = ?';
  db.query(userQuery, [userId], async (err, results) => {
    if (err || results.length === 0) {
      console.error('Ошибка запроса к базе данных:', err);
      return res.status(500).send('Пользователь не найден');
    }
    const accessToken = results[0].github_token;

    try {
      const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;
      console.log(`Запрос к GitHub API: ${apiUrl}`);
      const response = await axios.get(apiUrl, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      console.log('Ответ GitHub API:', JSON.stringify(response.data, null, 2));

      if (Array.isArray(response.data)) {
        console.warn('Запрошенная сущность является директорией:', filePath);
        return res.status(400).send('Указанный путь является директорией, а не файлом');
      }
      console.log(`Возвращаем содержимое файла: ${filePath}`);
      res.json(response.data);
    } catch (error) {
      console.error('Ошибка получения файла от GitHub:', error.response?.data || error.message);
      if (error.response?.status === 404) {
        return res.status(404).send('Файл не найден в репозитории');
      }
      res.status(error.response?.status || 500).send('Ошибка получения файла');
    }
  });
});

module.exports = router;