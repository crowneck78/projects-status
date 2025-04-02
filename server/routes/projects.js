const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authenticateToken = require('../middleware/auth');

// Поиск пользователей по email
router.get('/users/search', authenticateToken, (req, res) => {
  const email = req.query.email;
  const query = 'SELECT id, username, email FROM users WHERE email = ?';
  db.query(query, [email], (err, results) => {
    if (err) return res.status(500).send(`Ошибка поиска пользователя: ${err.message}`);
    res.json(results);
  });
});

// Создание нового проекта
router.post('/', authenticateToken, (req, res) => {
  const { name, description } = req.body;
  const userId = req.user.id;
  const query = 'INSERT INTO projects (name, description, user_id) VALUES (?, ?, ?)';
  db.query(query, [name, description || null, userId], (err, result) => {
    if (err) return res.status(500).send(`Ошибка создания проекта: ${err.message}`);
    const projectId = result.insertId;
    const insertMemberQuery = 'INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, "owner")';
    db.query(insertMemberQuery, [projectId, userId], (insertErr) => {
      if (insertErr) return res.status(500).send(`Ошибка добавления владельца: ${insertErr.message}`);
      res.status(201).send('Проект создан');
    });
  });
});

// Получение проектов пользователя
router.get('/', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const query = `
    SELECT p.* 
    FROM projects p 
    JOIN project_members pm ON p.id = pm.project_id
    WHERE pm.user_id = ?
  `;
  db.query(query, [userId], (err, results) => {
    if (err) return res.status(500).send(`Ошибка получения проектов: ${err.message}`);
    res.json(results);
  });
});

// Обновление проекта
router.patch('/:projectId', authenticateToken, (req, res) => {
  const projectId = req.params.projectId;
  const { name, description } = req.body;
  const checkOwnerQuery = 'SELECT role FROM project_members WHERE project_id = ? AND user_id = ?';
  db.query(checkOwnerQuery, [projectId, req.user.id], (ownerErr, ownerResults) => {
    if (ownerErr) return res.status(500).send(`Ошибка проверки владельца: ${ownerErr.message}`);
    if (ownerResults.length === 0 || ownerResults[0].role !== 'owner') return res.status(403).send('Доступ запрещен');
    const updateQuery = 'UPDATE projects SET name = ?, description = ? WHERE id = ?';
    db.query(updateQuery, [name, description || null, projectId], (updateErr) => {
      if (updateErr) return res.status(500).send(`Ошибка обновления проекта: ${updateErr.message}`);
      res.status(200).send('Проект обновлен');
    });
  });
});

// Удаление проекта
router.delete('/:projectId', authenticateToken, (req, res) => {
  const projectId = req.params.projectId;
  const checkQuery = 'SELECT * FROM projects WHERE id = ?';
  db.query(checkQuery, [projectId], (err, projectResults) => {
    if (err) return res.status(500).send(`Ошибка проверки проекта: ${err.message}`);
    if (projectResults.length === 0) return res.status(404).send('Проект не найден');
    const checkOwnerQuery = 'SELECT role FROM project_members WHERE project_id = ? AND user_id = ?';
    db.query(checkOwnerQuery, [projectId, req.user.id], (ownerErr, ownerResults) => {
      if (ownerErr) return res.status(500).send(`Ошибка проверки владельца: ${ownerErr.message}`);
      if (ownerResults.length === 0 || ownerResults[0].role !== 'owner') return res.status(403).send('Доступ запрещен');
      const checkTasksQuery = 'SELECT * FROM tasks WHERE project_id = ?';
      db.query(checkTasksQuery, [projectId], (tasksErr, tasksResults) => {
        if (tasksErr) return res.status(500).send(`Ошибка проверки задач: ${tasksErr.message}`);
        if (tasksResults.length > 0) {
          const deleteTasksQuery = 'DELETE FROM tasks WHERE project_id = ?';
          db.query(deleteTasksQuery, [projectId], (deleteTasksErr) => {
            if (deleteTasksErr) return res.status(500).send(`Ошибка удаления задач: ${deleteTasksErr.message}`);
            finishDeletion(projectId, res);
          });
        } else {
          finishDeletion(projectId, res);
        }
      });
    });
  });
});

function finishDeletion(projectId, res) {
  const deleteMembersQuery = 'DELETE FROM project_members WHERE project_id = ?';
  db.query(deleteMembersQuery, [projectId], (deleteMembersErr) => {
    if (deleteMembersErr) return res.status(500).send(`Ошибка удаления участников: ${deleteMembersErr.message}`);
    const deleteProjectQuery = 'DELETE FROM projects WHERE id = ?';
    db.query(deleteProjectQuery, [projectId], (deleteProjectErr) => {
      if (deleteProjectErr) return res.status(500).send(`Ошибка удаления проекта: ${deleteProjectErr.message}`);
      res.status(200).send('Проект удален');
    });
  });
}

// Добавление пользователя в проект
router.post('/:projectId/users', authenticateToken, (req, res) => {
  const projectId = req.params.projectId;
  const { userId } = req.body;
  const currentUserId = req.user.id;
  const checkMemberQuery = 'SELECT * FROM project_members WHERE project_id = ? AND user_id = ?';
  db.query(checkMemberQuery, [projectId, currentUserId], (checkErr, checkResults) => {
    if (checkErr) return res.status(500).send(`Ошибка проверки участника: ${checkErr.message}`);
    if (checkResults.length === 0) return res.status(403).send('Вы не участник проекта');
    const checkExistingMemberQuery = 'SELECT * FROM project_members WHERE project_id = ? AND user_id = ?';
    db.query(checkExistingMemberQuery, [projectId, userId], (existingErr, existingResults) => {
      if (existingErr) return res.status(500).send(`Ошибка проверки участников: ${existingErr.message}`);
      if (existingResults.length > 0) return res.status(400).send('Пользователь уже в проекте');
      const insertQuery = 'INSERT INTO project_members (project_id, user_id, role, added_by) VALUES (?, ?, "member", ?)';
      db.query(insertQuery, [projectId, userId, currentUserId], (insertErr) => {
        if (insertErr) return res.status(500).send(`Ошибка добавления пользователя: ${insertErr.message}`);
        res.status(201).send('Пользователь добавлен');
      });
    });
  });
});

// Удаление пользователя из проекта
router.delete('/:projectId/users/:userId', authenticateToken, (req, res) => {
  const projectId = req.params.projectId;
  const userId = req.params.userId;
  const currentUserId = req.user.id;
  const checkMemberQuery = 'SELECT * FROM project_members WHERE project_id = ? AND user_id = ?';
  db.query(checkMemberQuery, [projectId, currentUserId], (checkErr, checkResults) => {
    if (checkErr) return res.status(500).send(`Ошибка проверки участника: ${checkErr.message}`);
    if (checkResults.length === 0) return res.status(403).send('Вы не участник проекта');
    const deleteQuery = 'DELETE FROM project_members WHERE project_id = ? AND user_id = ?';
    db.query(deleteQuery, [projectId, userId], (deleteErr) => {
      if (deleteErr) return res.status(500).send(`Ошибка удаления пользователя: ${deleteErr.message}`);
      res.status(200).send('Пользователь удален');
    });
  });
});

// Получение пользователей проекта
router.get('/:projectId/users', authenticateToken, (req, res) => {
  const projectId = req.params.projectId;
  const currentUserId = req.user.id;
  const checkMemberQuery = 'SELECT * FROM project_members WHERE project_id = ? AND user_id = ?';
  db.query(checkMemberQuery, [projectId, currentUserId], (checkErr, checkResults) => {
    if (checkErr) return res.status(500).send(`Ошибка проверки участника: ${checkErr.message}`);
    if (checkResults.length === 0) return res.status(403).send('Вы не участник проекта');
    const getUsersQuery = `
      SELECT u.id, u.username, u.email, pm.role, u2.username AS added_by_username 
      FROM users u 
      JOIN project_members pm ON u.id = pm.user_id 
      LEFT JOIN users u2 ON pm.added_by = u2.id 
      WHERE pm.project_id = ?
    `;
    db.query(getUsersQuery, [projectId], (err, results) => {
      if (err) return res.status(500).send(`Ошибка получения пользователей: ${err.message}`);
      res.json(results);
    });
  });
});

// Создание задачи
router.post('/:projectId/tasks', authenticateToken, (req, res) => {
  const { title, description, due_date } = req.body;
  const projectId = req.params.projectId;
  const checkMemberQuery = 'SELECT role FROM project_members WHERE project_id = ? AND user_id = ?';
  db.query(checkMemberQuery, [projectId, req.user.id], (checkErr, checkResults) => {
    if (checkErr) return res.status(500).send(`Ошибка проверки участника: ${checkErr.message}`);
    if (checkResults.length === 0) return res.status(403).send('Вы не участник проекта');
    const query = 'INSERT INTO tasks (title, description, due_date, project_id, assigned_to) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [title, description || null, due_date || null, projectId, req.user.id], (err) => {
      if (err) return res.status(500).send(`Ошибка создания задачи: ${err.message}`);
      res.status(201).send('Задача создана');
    });
  });
});

// Получение задач проекта
router.get('/:projectId/tasks', authenticateToken, (req, res) => {
  const projectId = req.params.projectId;
  const checkMemberQuery = 'SELECT role FROM project_members WHERE project_id = ? AND user_id = ?';
  db.query(checkMemberQuery, [projectId, req.user.id], (checkErr, checkResults) => {
    if (checkErr) return res.status(500).send(`Ошибка проверки участника: ${checkErr.message}`);
    if (checkResults.length === 0) return res.status(403).send('Вы не участник проекта');
    const query = `
      SELECT t.*, u.username AS assigned_username 
      FROM tasks t 
      LEFT JOIN users u ON t.assigned_to = u.id 
      WHERE t.project_id = ?
    `;
    db.query(query, [projectId], (err, results) => {
      if (err) return res.status(500).send(`Ошибка получения задач: ${err.message}`);
      res.json(results);
    });
  });
});

// Обновление статуса задачи (completed)
router.patch('/tasks/:taskId/complete', authenticateToken, (req, res) => {
  const taskId = req.params.taskId;
  const checkTaskQuery = 'SELECT project_id FROM tasks WHERE id = ?';
  db.query(checkTaskQuery, [taskId], (taskErr, taskResults) => {
    if (taskErr) return res.status(500).send(`Ошибка проверки задачи: ${taskErr.message}`);
    if (taskResults.length === 0) return res.status(404).send('Задача не найдена');
    const projectId = taskResults[0].project_id;
    const checkMemberQuery = 'SELECT role FROM project_members WHERE project_id = ? AND user_id = ?';
    db.query(checkMemberQuery, [projectId, req.user.id], (checkErr, checkResults) => {
      if (checkErr) return res.status(500).send(`Ошибка проверки участника: ${checkErr.message}`);
      if (checkResults.length === 0) return res.status(403).send('Вы не участник проекта');
      const updateQuery = 'UPDATE tasks SET status = "completed" WHERE id = ?';
      db.query(updateQuery, [taskId], (err) => {
        if (err) return res.status(500).send(`Ошибка обновления статуса: ${err.message}`);
        res.status(200).send('Статус обновлен');
      });
    });
  });
});

// Обновление статуса задачи (in_progress)
router.patch('/tasks/:taskId/in-progress', authenticateToken, (req, res) => {
  const taskId = req.params.taskId;
  const checkTaskQuery = 'SELECT project_id FROM tasks WHERE id = ?';
  db.query(checkTaskQuery, [taskId], (taskErr, taskResults) => {
    if (taskErr) return res.status(500).send(`Ошибка проверки задачи: ${taskErr.message}`);
    if (taskResults.length === 0) return res.status(404).send('Задача не найдена');
    const projectId = taskResults[0].project_id;
    const checkMemberQuery = 'SELECT role FROM project_members WHERE project_id = ? AND user_id = ?';
    db.query(checkMemberQuery, [projectId, req.user.id], (checkErr, checkResults) => {
      if (checkErr) return res.status(500).send(`Ошибка проверки участника: ${checkErr.message}`);
      if (checkResults.length === 0) return res.status(403).send('Вы не участник проекта');
      const updateQuery = 'UPDATE tasks SET status = "in_progress" WHERE id = ?';
      db.query(updateQuery, [taskId], (err) => {
        if (err) return res.status(500).send(`Ошибка обновления статуса: ${err.message}`);
        res.status(200).send('Статус обновлен');
      });
    });
  });
});

// Удаление задачи
router.delete('/:projectId/tasks/:taskId', authenticateToken, (req, res) => {
  const projectId = req.params.projectId;
  const taskId = req.params.taskId;
  const checkTaskQuery = 'SELECT project_id FROM tasks WHERE id = ?';
  db.query(checkTaskQuery, [taskId], (taskErr, taskResults) => {
    if (taskErr) return res.status(500).send(`Ошибка проверки задачи: ${taskErr.message}`);
    if (taskResults.length === 0) return res.status(404).send('Задача не найдена');
    const actualProjectId = taskResults[0].project_id;
    if (actualProjectId != projectId) return res.status(404).send('Задача не принадлежит этому проекту');
    const checkMemberQuery = 'SELECT role FROM project_members WHERE project_id = ? AND user_id = ?';
    db.query(checkMemberQuery, [projectId, req.user.id], (checkErr, checkResults) => {
      if (checkErr) return res.status(500).send(`Ошибка проверки участника: ${checkErr.message}`);
      if (checkResults.length === 0) return res.status(403).send('Вы не участник этого проекта');
      const deleteQuery = 'DELETE FROM tasks WHERE id = ?';
      db.query(deleteQuery, [taskId], (deleteErr) => {
        if (deleteErr) return res.status(500).send(`Ошибка удаления задачи: ${deleteErr.message}`);
        res.status(200).send('Задача удалена');
      });
    });
  });
});

module.exports = router;