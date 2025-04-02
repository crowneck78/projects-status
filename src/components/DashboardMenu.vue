<template>
  <div class="dashboard-container">
    <h2>Управление проектами</h2>
    <!-- Индикатор загрузки -->
    <div v-if="isLoading" class="loading-spinner">
      <div class="spinner"></div>
      <p>Загрузка...</p>
    </div>
    <!-- Список проектов -->
    <section v-if="!isLoading && !selectedProject" class="projects-section">
      <h3>Ваши проекты</h3>
      <ul>
        <li
          v-for="project in projects"
          :key="project.id"
          class="project-item animate__animated animate__fadeIn"
        >
          <div class="project-info">
            <h4>{{ project.name }}</h4>
            <p>{{ project.description || 'Нет описания' }}</p>
          </div>
          <div class="project-actions">
            <button
              class="animated-button view-button animate__animated animate__pulse"
              @click="selectProject(project)"
            >
              Просмотреть
            </button>
            <button
              class="animated-button delete-button animate__animated animate__shakeX"
              @click="deleteProject(project.id)"
            >
              Удалить
            </button>
          </div>
        </li>
      </ul>
      <button
        class="animated-button create-button animate__animated animate__bounceIn"
        @click="showCreateProjectForm = true"
      >
        Создать новый проект
      </button>
    </section>
    <!-- Форма создания проекта -->
    <section v-if="showCreateProjectForm" class="create-project-form animate__animated animate__fadeIn">
      <h3>Создать новый проект</h3>
      <form @submit.prevent="createProject">
        <div class="form-group">
          <label for="projectName">Название проекта:</label>
          <input type="text" v-model="newProject.name" required class="input-field" />
        </div>
        <div class="form-group">
          <label for="projectDescription">Описание проекта:</label>
          <textarea v-model="newProject.description" rows="4" class="input-field"></textarea>
        </div>
        <button type="submit" class="animated-button">Создать проект</button>
        <button
          type="button"
          class="animated-button cancel-button animate__animated animate__fadeOut"
          @click="showCreateProjectForm = false"
        >
          Отмена
        </button>
      </form>
    </section>
    <!-- Просмотр выбранного проекта -->
    <section v-if="selectedProject" class="project-details animate__animated animate__fadeIn">
      <h3>Проект: {{ selectedProject.name }}</h3>
      <!-- Блок редактирования названия и описания проекта -->
      <div class="block edit-project-block animate__animated animate__fadeIn">
        <h4>Редактирование проекта</h4>
        <div class="form-group">
          <label for="editProjectName">Новое название:</label>
          <input type="text" v-model="selectedProject.name" class="input-field" />
        </div>
        <div class="form-group">
          <label for="editProjectDescription">Новое описание:</label>
          <textarea v-model="selectedProject.description" rows="4" class="input-field"></textarea>
        </div>
        <button class="animated-button save-button" @click="saveProjectDetails">
          Сохранить изменения
        </button>
      </div>
      <!-- Блок GitHub-репозитория -->
      <div v-if="githubRepo && !showAddUserToTeamForm && !showCreateTaskForm" class="block github-block animate__animated animate__fadeIn">
        <div class="repo-header">
          <h4>{{ githubRepo.name }}</h4>
          <a :href="githubRepo.html_url" target="_blank" class="github-link">
            <img src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" alt="GitHub Logo" class="github-logo" />
            Открыть на GitHub
          </a>
        </div>
        <p class="repo-description">{{ githubRepo.description || 'Нет описания' }}</p>
        <div class="path-controls">
          <button class="animated-button back-button" @click="goBack" :disabled="currentPath === ''">
            Назад
          </button>
          <div class="path-breadcrumbs">
            <span v-for="(part, index) in breadcrumbParts" :key="index" @click="navigateToPath(index)" class="breadcrumb">
              {{ part || 'Root' }}<span v-if="index < breadcrumbParts.length - 1"> / </span>
            </span>
          </div>
        </div>

        <!-- README -->
        <div v-if="readmeContent" class="readme-section">
          <h5>README</h5>
          <div class="readme-content" v-html="readmeContent"></div>
        </div>

        <div class="files-section">
  <h5>Содержимое</h5>
  <div class="files-table">
    <div class="file-header">
      <span>Имя</span>
      <span>Тип</span>
      <span>Действия</span>
    </div>
    <div
  v-for="file in repoFiles"
  :key="file.sha"
  class="file-row animate__animated animate__fadeIn"
>
  <span
    class="file-name"
    @click="file.type === 'dir' ? openFolder(file) : null"
    :class="{ 'folder-link': file.type === 'dir' }"
  >
    {{ file.name }}
  </span>
  <span class="file-type">{{ file.type === 'file' ? 'Файл' : 'Папка' }}</span>
  <span class="file-actions">
    <button
      v-if="file.type === 'file'"
      class="animated-button view-button"
      @click="viewFileContent(file)"
    >
      Просмотреть код
    </button>
  </span>
</div>
  </div>
</div>

        <!-- Коммиты -->
        <div class="commits-section">
          <h5>Последние коммиты</h5>
          <div class="commits-table">
            <div class="commit-header">
              <span>Сообщение</span>
              <span>Автор</span>
              <span>Дата</span>
            </div>
            <div
              v-for="commit in commits"
              :key="commit.sha"
              class="commit-row animate__animated animate__fadeIn"
            >
              <span class="commit-message">{{ commit.commit.message }}</span>
              <span class="commit-author">{{ commit.commit.author.name }}</span>
              <span class="commit-date">{{ new Date(commit.commit.author.date).toLocaleString() }}</span>
            </div>
          </div>
        </div>
      </div>
      <!-- Блок "Команда" -->
      <div v-if="!showAddUserToTeamForm && !showCreateTaskForm" class="block team-block animate__animated animate__fadeIn">
        <h4>Команда</h4>
        <ul>
          <li v-for="user in teamUsers" :key="user.id" class="team-member animate__animated animate__fadeIn">
            <span>{{ user.username }} ({{ user.email }}) - {{ user.role }}</span>
            <button
              v-if="isOwner()"
              class="animated-button delete-button"
              @click="removeUserFromTeam(user.id)"
            >
              Удалить
            </button>
          </li>
        </ul>
        <button
          class="animated-button add-user-button animate__animated animate__pulse"
          @click="toggleAddUserToTeamForm"
        >
          Добавить пользователя
        </button>
      </div>
      <!-- Форма добавления пользователя в команду -->
      <section v-if="showAddUserToTeamForm" class="add-user-form animate__animated animate__fadeIn">
        <h3>Добавить пользователя в команду</h3>
        <form @submit.prevent="addUserToTeam">
          <div class="form-group">
            <label for="userEmail">Email пользователя:</label>
            <input type="email" v-model="userEmail" required class="input-field" />
          </div>
          <button type="submit" class="animated-button">Добавить пользователя</button>
          <button
            type="button"
            class="animated-button cancel-button animate__animated animate__fadeOut"
            @click="showAddUserToTeamForm = false"
          >
            Отмена
          </button>
        </form>
      </section>
      <!-- Если пользователь не владелец -->
      <section v-if="showAddUserToTeamForm && !isOwner()" class="add-user-form animate__animated animate__fadeIn">
        <h3>Ошибка</h3>
        <p>Вы не можете добавлять новых пользователей в этот проект.</p>
        <button
          type="button"
          class="animated-button cancel-button animate__animated animate__fadeOut"
          @click="showAddUserToTeamForm = false"
        >
          Закрыть
        </button>
      </section>
      <!-- Блок "Задачи" -->
      <div v-if="!showAddUserToTeamForm && !showCreateTaskForm" class="block tasks-block animate__animated animate__fadeIn">
        <h4>Задачи</h4>
        <ul>
          <li v-for="task in tasks" :key="task.id" class="task-item animate__animated animate__fadeIn">
            <div class="task-info">
              <p><strong>{{ task.title }}</strong></p>
              <p>Статус: {{ task.status }}</p>
              <p v-if="task.due_date">Дата выполнения: {{ new Date(task.due_date).toLocaleDateString() }}</p>
              <p v-if="task.assigned_username">Выдал: {{ task.assigned_username }}</p>
            </div>
            <div class="task-actions">
              <button class="animated-button view-button" @click="viewTaskDetails(task)">
                Просмотреть
              </button>
              <button class="animated-button work-button" @click="markTaskAsInProgress(task.id)">
                В работе
              </button>
              <button class="animated-button complete-button" @click="markTaskAsCompleted(task.id)">
                Выполнено
              </button>
              <button class="animated-button delete-button" @click="deleteTask(task.id)">
                Удалить
              </button>
            </div>
          </li>
        </ul>
        <button
          class="animated-button create-task-button animate__animated animate__pulse"
          @click="toggleCreateTaskForm"
        >
          Создать задачу
        </button>
      </div>
      <!-- Форма создания задачи -->
      <section v-if="showCreateTaskForm" class="create-task-form animate__animated animate__fadeIn">
        <h3>Создать задачу</h3>
        <form @submit.prevent="createTask">
          <div class="form-group">
            <label for="taskTitle">Название задачи:</label>
            <input type="text" v-model="newTask.title" required class="input-field" />
          </div>
          <div class="form-group">
            <label for="taskDescription">Описание задачи:</label>
            <textarea v-model="newTask.description" rows="4" class="input-field"></textarea>
          </div>
          <div class="form-group">
            <label for="taskDueDate">Дата выполнения:</label>
            <input type="date" v-model="newTask.due_date" class="input-field" />
          </div>
          <button type="submit" class="animated-button">Создать задачу</button>
          <button
            type="button"
            class="animated-button cancel-button animate__animated animate__fadeOut"
            @click="showCreateTaskForm = false"
          >
            Отмена
          </button>
        </form>
      </section>
      <!-- Модальное окно для просмотра кода -->
      <div v-if="showCodeModal" class="modal animate__animated animate__fadeIn">
        <div class="modal-content">
          <div class="modal-header">
            <h3>{{ selectedFile.path }}</h3>
            <button class="close-modal" @click="closeCodeModal">✖</button>
          </div>
          <pre><code ref="codeBlock">{{ fileContent }}</code></pre>
        </div>
      </div>
      <button class="animated-button back-button animate__animated animate__fadeIn" @click="deselectProject">
        Назад к списку проектов
      </button>
    </section>
  </div>
</template>

<script>
import axios from 'axios';
import { ElNotification } from 'element-plus';
import { jwtDecode } from 'jwt-decode';
import markdownit from 'markdown-it';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';

export default {
  name: 'DashboardMenu',
  data() {
    return {
      projects: [],
      showCreateProjectForm: false,
      newProject: {
        name: '',
        description: ''
      },
      selectedProject: null,
      teamUsers: [],
      tasks: [],
      showAddUserToTeamForm: false,
      userEmail: '',
      showCreateTaskForm: false,
      newTask: {
        title: '',
        description: '',
        due_date: ''
      },
      isLoading: true,
      githubRepo: null,
      repoFiles: [],
      commits: [],
      readmeContent: '',
      showCodeModal: false,
      selectedFile: null,
      fileContent: '',
      currentPath: '' 
    };
  },
  computed: {
    currentUserId() {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Токен отсутствует в localStorage');
        return null;
      }
      try {
        const decoded = jwtDecode(token);
        return decoded.id;
      } catch (error) {
        console.error('Ошибка декодирования токена:', error);
        return null;
      }
    },
    breadcrumbParts() {
      return this.currentPath ? this.currentPath.split('/') : [];
    }
  },
  methods: {
    async fetchProjects() {
      try {
        const response = await axios.get('http://localhost:5000/projects', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        this.projects = response.data;
      } catch (error) {
        console.error('Ошибка получения проектов:', error);
        ElNotification.error({
          title: 'Ошибка',
          message: 'Не удалось загрузить проекты.',
          duration: 3000,
        });
      } finally {
        this.isLoading = false;
      }
    },
    async createProject() {
      try {
        await axios.post('http://localhost:5000/projects', this.newProject, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        this.showCreateProjectForm = false;
        this.newProject.name = '';
        this.newProject.description = '';
        this.fetchProjects();
        ElNotification.success({
          title: 'Успех',
          message: 'Проект успешно создан!',
          duration: 3000,
        });
      } catch (error) {
        console.error('Ошибка создания проекта:', error);
        ElNotification.error({
          title: 'Ошибка',
          message: 'Не удалось создать проект.',
          duration: 3000,
        });
      }
    },
    async selectProject(project) {
      this.selectedProject = { ...project };
      this.currentPath = ''; 
      this.fetchTeamUsers(project.id);
      this.fetchTasks(project.id);
      await this.fetchGithubRepo(project);
    },
    deselectProject() {
      this.selectedProject = null;
      this.teamUsers = [];
      this.tasks = [];
      this.githubRepo = null;
      this.repoFiles = [];
      this.commits = [];
      this.readmeContent = '';
      this.showAddUserToTeamForm = false;
      this.showCreateTaskForm = false;
      this.showCodeModal = false;
      this.currentPath = '';
    },
    async deleteProject(projectId) {
      if (!confirm('Вы уверены, что хотите удалить этот проект?')) return;
      try {
        await axios.delete(`http://localhost:5000/projects/${projectId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        this.fetchProjects();
        ElNotification.success({
          title: 'Успех',
          message: 'Проект успешно удален!',
          duration: 3000,
        });
      } catch (error) {
        console.error('Ошибка удаления проекта:', error);
        ElNotification.error({
          title: 'Ошибка',
          message: 'Не удалось удалить проект.',
          duration: 3000,
        });
      }
    },
    async fetchTeamUsers(projectId) {
      try {
        const response = await axios.get(`http://localhost:5000/projects/${projectId}/users`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        this.teamUsers = response.data;
      } catch (error) {
        console.error('Ошибка получения пользователей проекта:', error);
        ElNotification.error({
          title: 'Ошибка',
          message: 'Не удалось загрузить участников проекта.',
          duration: 3000,
        });
      }
    },
    async fetchTasks(projectId) {
      try {
        const response = await axios.get(`http://localhost:5000/projects/${projectId}/tasks`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        this.tasks = response.data;
      } catch (error) {
        console.error('Ошибка получения задач проекта:', error);
        ElNotification.error({
          title: 'Ошибка',
          message: 'Не удалось загрузить задачи проекта.',
          duration: 3000,
        });
      }
    },
    async fetchGithubRepo(project) {
      try {
        const response = await axios.get('http://localhost:5000/github/repos', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const repo = response.data.find(r => r.id.toString() === project.github_repo_id);
        if (repo) {
          this.githubRepo = repo;
          await Promise.all([
            this.fetchRepoContents(repo, this.currentPath),
            this.fetchCommits(repo),
            this.fetchReadme(repo)
          ]);
        } else {
          this.githubRepo = null;
          this.repoFiles = [];
          this.commits = [];
          this.readmeContent = '';
        }
      } catch (error) {
        console.error('Ошибка получения данных GitHub:', error);
        ElNotification.error({
          title: 'Ошибка',
          message: 'Не удалось загрузить данные GitHub.',
          duration: 3000,
        });
      }
    },
    async fetchRepoContents(repo, path = '') {
  try {
    console.log('Отправляем запрос для пути:', path);
    const url = `http://localhost:5000/github/repo/${repo.owner.login}/${repo.name}/contents/${path}`;
    console.log('URL запроса:', url);
    const token = localStorage.getItem('token');
    console.log('Токен для запроса:', token);
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('Получен ответ от сервера:', JSON.stringify(response.data, null, 2));
    this.repoFiles = Array.isArray(response.data) ? response.data : [];
    this.currentPath = path;
    console.log('Обновили repoFiles:', JSON.stringify(this.repoFiles, null, 2));
  } catch (error) {
    console.error('Ошибка получения содержимого репозитория:', error.response?.data || error.message);
    this.repoFiles = [];
    ElNotification.error({
      title: 'Ошибка',
      message: 'Не удалось загрузить файлы репозитория.',
      duration: 3000,
    });
  }
},
openFolder(file) {
  console.log('Кликнули на элемент:', file);
  if (!file) {
    console.error('file не передан в openFolder');
    return;
  }
  if (file.type === 'dir') {
    console.log('Полный объект file:', JSON.stringify(file, null, 2));
    console.log('Текущий путь:', this.currentPath);
    console.log('Открываем папку с путем:', file.path);
    if (!file.path) {
      console.error('file.path отсутствует или пустой');
      return;
    }
    this.fetchRepoContents(this.githubRepo, file.path);
  } else {
    console.log('Элемент не директория:', file.type);
  }
},
    async fetchCommits(repo) {
      try {
        const response = await axios.get(
          `http://localhost:5000/github/repo/${repo.owner.login}/${repo.name}/commits`,
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        this.commits = response.data.slice(0, 10);
      } catch (error) {
        console.error('Ошибка получения коммитов:', error);
        ElNotification.error({
          title: 'Ошибка',
          message: 'Не удалось загрузить коммиты.',
          duration: 3000,
        });
      }
    },
    async fetchReadme(repo) {
      try {
        const response = await axios.get(
          `http://localhost:5000/github/repo/${repo.owner.login}/${repo.name}/readme`,
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        const md = markdownit({ html: true });
        const content = atob(response.data.content);
        const decodedContent = new TextDecoder('utf-8').decode(new Uint8Array([...content].map(char => char.charCodeAt(0))));
        this.readmeContent = md.render(decodedContent);
      } catch (error) {
        console.error('README не найден или ошибка загрузки:', error);
        this.readmeContent = '';
      }
    },

    async viewFileContent(file) {
  try {
    console.log('Открываем файл с путем:', file.path);
    const url = `http://localhost:5000/github/repo/${this.githubRepo.owner.login}/${this.githubRepo.name}/file/${file.path}`;
    console.log('URL запроса:', url);
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    console.log('Полный ответ сервера:', JSON.stringify(response.data, null, 2));
    this.selectedFile = file;

    if (Array.isArray(response.data)) {
      console.warn('Получен список вместо файла:', response.data);
      this.fileContent = 'Это директория, а не файл. Выберите конкретный файл для просмотра.';
    } else if (!response.data.content) {
      console.warn('Поле content отсутствует в ответе:', response.data);
      this.fileContent = 'Файл пустой или содержимое отсутствует';
    } else {
      const base64Content = response.data.content.replace(/\n/g, '');
      try {
        const decodedContent = atob(base64Content);
        this.fileContent = new TextDecoder('utf-8').decode(new Uint8Array([...decodedContent].map(char => char.charCodeAt(0))));
      } catch (e) {
        console.error('Ошибка декодирования base64:', e);
        this.fileContent = 'Не удалось декодировать содержимое файла';
      }
    }
    this.showCodeModal = true;
    this.$nextTick(() => {
      this.highlightCode();
    });
  } catch (error) {
    console.error('Ошибка получения кода файла:', error.response?.data || error.message);
    ElNotification.error({
      title: 'Ошибка',
      message: error.response?.data || 'Не удалось загрузить содержимое файла.',
      duration: 3000,
    });
  }
},

    navigateToPath(index) {
      const newPath = this.breadcrumbParts.slice(0, index + 1).join('/');
      this.currentPath = newPath;
      this.fetchRepoContents(this.githubRepo, this.currentPath);
    },
    goBack() {
      const parts = this.currentPath.split('/');
      parts.pop(); // Удаляем последнюю часть пути
      this.currentPath = parts.join('/');
      this.fetchRepoContents(this.githubRepo, this.currentPath);
    },
    highlightCode() {
      const codeBlock = this.$refs.codeBlock;
      if (codeBlock) {
        hljs.highlightElement(codeBlock);
      }
    },
    closeCodeModal() {
      this.showCodeModal = false;
      this.selectedFile = null;
      this.fileContent = '';
    },
    async addUserToTeam() {
      if (!this.isOwner()) {
        ElNotification.warning({
          title: 'Предупреждение',
          message: 'Только владелец проекта может добавлять новых пользователей.',
          duration: 3000,
        });
        this.showAddUserToTeamForm = false;
        return;
      }
      try {
        const response = await axios.get(`http://localhost:5000/projects/users/search?email=${this.userEmail}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        if (response.data.length === 0) {
          ElNotification.warning({
            title: 'Предупреждение',
            message: 'Пользователь с таким email не найден.',
            duration: 3000,
          });
          return;
        }
        const userId = response.data[0].id;
        await axios.post(
          `http://localhost:5000/projects/${this.selectedProject.id}/users`,
          { userId },
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        ElNotification.success({
          title: 'Успех',
          message: 'Пользователь добавлен в команду.',
          duration: 3000,
        });
        this.fetchTeamUsers(this.selectedProject.id);
        this.showAddUserToTeamForm = false;
        this.userEmail = '';
      } catch (error) {
        console.error('Ошибка добавления пользователя в команду:', error.response ? error.response.data : error.message);
        ElNotification.error({
          title: 'Ошибка',
          message: error.response?.data?.message || 'Не удалось добавить пользователя в команду.',
          duration: 3000,
        });
      }
    },
    async removeUserFromTeam(userId) {
      if (!confirm('Вы уверены, что хотите удалить этого пользователя из команды?')) return;
      try {
        await axios.delete(`http://localhost:5000/projects/${this.selectedProject.id}/users/${userId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        ElNotification.success({
          title: 'Успех',
          message: 'Пользователь удален из команды.',
          duration: 3000,
        });
        this.fetchTeamUsers(this.selectedProject.id);
      } catch (error) {
        console.error('Ошибка удаления пользователя из команды:', error);
        ElNotification.error({
          title: 'Ошибка',
          message: 'Не удалось удалить пользователя из команды.',
          duration: 3000,
        });
      }
    },
    async createTask() {
      try {
        await axios.post(`http://localhost:5000/projects/${this.selectedProject.id}/tasks`, this.newTask, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        this.showCreateTaskForm = false;
        this.newTask.title = '';
        this.newTask.description = '';
        this.newTask.due_date = '';
        this.fetchTasks(this.selectedProject.id);
        ElNotification.success({
          title: 'Успех',
          message: 'Задача успешно создана!',
          duration: 3000,
        });
      } catch (error) {
        console.error('Ошибка создания задачи:', error);
        ElNotification.error({
          title: 'Ошибка',
          message: 'Не удалось создать задачу.',
          duration: 3000,
        });
      }
    },
    async markTaskAsCompleted(taskId) {
      try {
        await axios.patch(`http://localhost:5000/projects/${this.selectedProject.id}/tasks/${taskId}/complete`, {}, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        ElNotification.success({
          title: 'Успех',
          message: 'Задача помечена как выполненная!',
          duration: 3000,
        });
        this.fetchTasks(this.selectedProject.id);
      } catch (error) {
        console.error('Ошибка изменения статуса задачи:', error);
        ElNotification.error({
          title: 'Ошибка',
          message: 'Не удалось изменить статус задачи.',
          duration: 3000,
        });
      }
    },
    async markTaskAsInProgress(taskId) {
      try {
        await axios.patch(`http://localhost:5000/projects/${this.selectedProject.id}/tasks/${taskId}/in-progress`, {}, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        ElNotification.success({
          title: 'Успех',
          message: 'Задача помечена как "в процессе".',
          duration: 3000,
        });
        this.fetchTasks(this.selectedProject.id);
      } catch (error) {
        console.error('Ошибка изменения статуса задачи:', error);
        ElNotification.error({
          title: 'Ошибка',
          message: 'Не удалось изменить статус задачи.',
          duration: 3000,
        });
      }
    },
    async deleteTask(taskId) {
      if (!confirm('Вы уверены, что хотите удалить эту задачу?')) return;
      try {
        await axios.delete(`http://localhost:5000/projects/${this.selectedProject.id}/tasks/${taskId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        ElNotification.success({
          title: 'Успех',
          message: 'Задача успешно удалена!',
          duration: 3000,
        });
        this.fetchTasks(this.selectedProject.id);
      } catch (error) {
        console.error('Ошибка удаления задачи:', error.response ? error.response.data : error.message);
        ElNotification.error({
          title: 'Ошибка',
          message: error.response?.data?.message || 'Не удалось удалить задачу.',
          duration: 3000,
        });
      }
    },
    async saveProjectDetails() {
      try {
        await axios.patch(
          `http://localhost:5000/projects/${this.selectedProject.id}`,
          {
            name: this.selectedProject.name,
            description: this.selectedProject.description
          },
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        ElNotification.success({
          title: 'Успех',
          message: 'Изменения успешно сохранены!',
          duration: 3000,
        });
      } catch (error) {
        console.error('Ошибка при сохранении изменений:', error);
        ElNotification.error({
          title: 'Ошибка',
          message: 'Не удалось сохранить изменения.',
          duration: 3000,
        });
      }
    },
    toggleAddUserToTeamForm() {
      this.showAddUserToTeamForm = !this.showAddUserToTeamForm;
      this.showCreateTaskForm = false;
    },
    toggleCreateTaskForm() {
      this.showCreateTaskForm = !this.showCreateTaskForm;
      this.showAddUserToTeamForm = false;
    },
    isOwner() {
      if (!this.selectedProject || !this.teamUsers || !this.currentUserId) return false;
      return this.teamUsers.some(member => member.id === this.currentUserId && member.role === 'owner');
    },
    isMember() {
      if (!this.selectedProject || !this.teamUsers || !this.currentUserId) return false;
      return this.teamUsers.some(user => user.id === this.currentUserId);
    },
    viewTaskDetails(task) {
      ElNotification.info({
        title: 'Описание задачи',
        message: task.description || 'Нет описания',
        duration: 5000,
      });
    }
  },
  mounted() {
    this.fetchProjects();
  }
};
</script>

<style scoped>
.task-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #ddd;
}

.task-info {
  flex: 1;
}

.task-info p {
  margin: 5px 0;
}

.task-actions {
  display: flex;
  gap: 10px;
}

.task-actions button {
  padding: 5px 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.view-button {
  background-color: #007bff;
  color: white;
}

.work-button {
  background-color: #ffc107;
  color: black;
}

.complete-button {
  background-color: #28a745;
  color: white;
}

.delete-button {
  background-color: #dc3545;
  color: white;
}

.back-button {
  background-color: #6c757d;
  margin-right: 10px;
}

.back-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.back-button:hover:enabled {
  background-color: #5a6268;
}

.dashboard-container {
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 40px;
  border: 1px solid #ccc;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  background-color: rgba(255, 255, 255, 0.9);
  color: #000000;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
}

.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-left-color: #007bff;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.projects-section,
.project-details,
.create-project-form,
.add-user-form,
.create-task-form {
  width: 100%;
  margin-bottom: 30px;
  max-width: 800px;
  word-wrap: break-word;
}

h3 {
  margin-bottom: 15px;
  font-size: 24px;
  font-weight: 500;
}

.project-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border: 1px solid #e1e4e8;
  border-radius: 6px;
  margin-bottom: 10px;
  background-color: #f9f9f9;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  max-width: 800px;
  word-wrap: break-word;
}

.project-item:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.project-actions button {
  margin-left: 10px;
}

.block {
  margin-bottom: 20px;
  padding: 20px;
  border: 1px solid #e1e4e8;
  border-radius: 6px;
  background-color: #fff;
  transition: box-shadow 0.3s ease;
  max-width: 800px;
  word-wrap: break-word;
}

.block:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.block h4 {
  margin-bottom: 15px;
  font-size: 20px;
  font-weight: 600;
  color: #24292e;
}

.block h5 {
  margin: 15px 0 10px;
  font-size: 16px;
  font-weight: 600;
  color: #586069;
}

.repo-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.repo-description {
  color: #586069;
  margin-bottom: 15px;
  font-size: 14px;
}

.path-controls {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.path-breadcrumbs {
  font-size: 14px;
}

.breadcrumb {
  cursor: pointer;
  color: #0366d6;
}

.breadcrumb:hover {
  text-decoration: underline;
}

.github-link {
  display: flex;
  align-items: center;
  padding: 8px 15px;
  background-color: #24292e;
  color: white;
  text-decoration: none;
  border-radius: 6px;
  transition: background-color 0.3s ease;
}

.github-link:hover {
  background-color: #1a1e22;
}

.github-logo {
  width: 20px;
  height: 20px;
  margin-right: 8px;
}

.readme-section {
  margin-top: 20px;
  padding: 15px;
  background-color: #f6f8fa;
  border: 1px solid #e1e4e8;
  border-radius: 6px;
}

.readme-content {
  font-size: 14px;
  line-height: 1.5;
  color: #24292e;
}

.files-table, .commits-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

.file-header, .commit-header {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  padding: 10px;
  background-color: #f6f8fa;
  border-bottom: 1px solid #e1e4e8;
  font-weight: 600;
  color: #586069;
}

.file-row, .commit-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  padding: 10px;
  border-bottom: 1px solid #e1e4e8;
}

.file-row:last-child, .commit-row:last-child {
  border-bottom: none;
}

.file-row:hover, .commit-row:hover {
  background-color: #f6f8fa;
}

.file-name {
  font-size: 14px;
  color: #24292e;
}

.folder-link {
  cursor: pointer;
  color: #0366d6;
}

.folder-link:hover {
  text-decoration: underline;
}

.file-type, .commit-author, .commit-date {
  font-size: 12px;
  color: #586069;
}

.file-actions {
  display: flex;
  justify-content: flex-end;
}

.team-member,
.task-item {
  padding: 10px;
  border-bottom: 1px solid #e1e4e8;
  transition: background-color 0.3s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 800px;
  word-wrap: break-word;
}

.team-member:last-child,
.task-item:last-child {
  border-bottom: none;
}

.team-member:hover,
.task-item:hover {
  background-color: #f6f8fa;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: #fff;
  padding: 0;
  border-radius: 6px;
  max-width: 90%;
  max-height: 90%;
  overflow-y: auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  background-color: #f6f8fa;
  border-bottom: 1px solid #e1e4e8;
}

.modal-header h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

.close-modal {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #586069;
}

pre {
  margin: 0;
  padding: 15px;
  background-color: #f6f8fa;
  border-radius: 0 0 6px 6px;
  font-size: 13px;
  line-height: 1.45;
  overflow-x: auto;
}

.input-field {
  width: 100%;
  padding: 10px;
  box-sizing: border-box;
  background-color: #ffffff;
  color: #000000;
  border: 1px solid #e1e4e8;
  border-radius: 6px;
  margin-bottom: 10px;
  font-size: 14px;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  max-width: 800px;
  word-wrap: break-word;
}

.input-field:focus {
  border-color: #0366d6;
  box-shadow: 0 0 5px rgba(3, 102, 214, 0.3);
}

.animated-button {
  padding: 12px 20px;
  background-color: #0366d6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.3s ease;
  font-size: 14px;
}

.animated-button:hover {
  background-color: #005cc5;
  transform: scale(1.05);
}

.delete-button {
  background-color: #d73a49;
}

.delete-button:hover {
  background-color: #cb2431;
}

.cancel-button, .close-button {
  background-color: #6c757d;
}

.cancel-button:hover, .close-button:hover {
  background-color: #5a6268;
}
</style>

<style>
@import '~animate.css/animate.min.css';
</style>