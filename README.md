# web-site

## English

### Description
A web application for managing projects online. It includes features for adding users to projects, assigning tasks, and tracking their completion statuses.

### Project Setup
1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run serve
   ```

3. Build for production:
   ```bash
   npm run build
   ```

4. Lint and fix files:
   ```bash
   npm run lint
   ```

### Database Setup (MySQL)
1. Create a new MySQL database:
   ```sql
   CREATE DATABASE project_status;
   ```

2. Import the database schema:
   ```bash
   mysql -u <username> -p project_status < path/to/schema.sql
   ```

3. Configure the database connection in the `.env` file:
   ```
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=<username>
   DB_PASSWORD=<password>
   DB_NAME=project_status
   ```

4. Run database migrations (if applicable):
   ```bash
   npm run migrate
   ```

### Customize Configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

---

## Русский

### Описание
Веб-приложение для управления проектами в онлайн-формате. Реализована возможность добавления пользователей в проекты, выдачи заданий и отслеживания статусов их выполнения.

### Настройка проекта
1. Установите зависимости:
   ```bash
   npm install
   ```

2. Запустите сервер разработки:
   ```bash
   npm run serve
   ```

3. Сборка для продакшена:
   ```bash
   npm run build
   ```

4. Линтинг и исправление файлов:
   ```bash
   npm run lint
   ```

### Настройка базы данных (MySQL)
1. Создайте новую базу данных MySQL:
   ```sql
   CREATE DATABASE project_status;
   ```

2. Импортируйте схему базы данных:
   ```bash
   mysql -u <username> -p project_status < path/to/schema.sql
   ```

3. Настройте подключение к базе данных в файле `.env`:
   ```
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=<username>
   DB_PASSWORD=<password>
   DB_NAME=project_status
   ```

4. Запустите миграции базы данных (если применимо):
   ```bash
   npm run migrate
   ```

### Кастомизация конфигурации
См. [Configuration Reference](https://cli.vuejs.org/config/).
