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

### Настройка GitHub API
1. **Создайте персональный токен доступа GitHub**  
   - Перейдите в [настройки разработчика GitHub](https://github.com/settings/tokens).
   - Нажмите "Generate new token" (classic).
   - Выберите необходимые области доступа (например, `repo` для доступа к репозиториям, `read:org` для данных организации).
   - Скопируйте сгенерированный токен.

2. **Настройте переменные окружения**  
   Создайте файл `.env` в корневой директории проекта и добавьте следующую строку:
   ```env
   GITHUB_TOKEN=ваш_персональный_токен_доступа
   ```
   Замените `ваш_персональный_токен_доступа` на сгенерированный токен.

### Использование GitHub API
1. **Запустите приложение**  
   Запустите приложение с помощью команды:
   ```bash
   npm start
   ```

2. **Взаимодействие с GitHub API**  
   Приложение будет использовать GitHub API для получения данных. Убедитесь, что ваш токен имеет необходимые разрешения для выполнения операций.

### Примечания
- Держите файл `.env` в секрете и не добавляйте его в систему контроля версий.
- Для получения дополнительной информации о GitHub API обратитесь к [документации GitHub API](https://docs.github.com/en/rest).

---

# Project Status

This project uses the GitHub API to interact with GitHub repositories and retrieve data. Below are the steps to configure and use the GitHub API in this project.

## Setup

1. **Clone the Repository**  
   Clone this repository to your local machine:
   ```bash
   git clone <repository-url>
   cd projectsstatus
   ```

2. **Install Dependencies**  
   Ensure you have all required dependencies installed. Run:
   ```bash
   npm install
   ```

3. **Create a GitHub Personal Access Token**  
   - Go to [GitHub Developer Settings](https://github.com/settings/tokens).
   - Click on "Generate new token" (classic).
   - Select the required scopes (e.g., `repo` for repository access, `read:org` for organization data).
   - Copy the generated token.

4. **Set Up Environment Variables**  
   Create a `.env` file in the root of the project and add the following:
   ```env
   GITHUB_TOKEN=your_personal_access_token
   ```
   Replace `your_personal_access_token` with the token you generated.

## Usage

1. **Run the Application**  
   Start the application using:
   ```bash
   npm start
   ```

2. **Interact with the GitHub API**  
   The application will use the GitHub API to fetch data. Ensure your token has the necessary permissions for the operations you want to perform.

## Notes

- Keep your `.env` file private and do not commit it to version control.
- For more information about the GitHub API, refer to the [GitHub API Documentation](https://docs.github.com/en/rest).

## License

This project is licensed under the MIT License.
