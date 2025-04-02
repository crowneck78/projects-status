<template>
  <div id="app">
    <!-- Шапка будет отображаться только на определенных страницах -->
    <header class="header">
    <!-- Логотип слева -->
    <h1 class="site-title">TeamSyncer</h1>

    <!-- Навигационные ссылки -->
    <nav class="nav-links">
      <router-link to="/">Главная</router-link>
      <router-link v-if="isLoggedIn" to="/dashboard">Управление проектами</router-link>
    </nav>

    <!-- Выпадающее меню с тремя полосками -->
    <el-dropdown class="menu-dropdown" trigger="click">
      <button class="menu-button">
        <span class="menu-icon"></span>
        <span class="menu-icon"></span>
        <span class="menu-icon"></span>
      </button>
      <template #dropdown>
        <el-dropdown-menu class="custom-dropdown">
          <el-dropdown-item v-if="!isLoggedIn" @click="$router.push('/login')">Войти</el-dropdown-item>
          <el-dropdown-item v-if="!isLoggedIn" @click="$router.push('/register')">Регистрация</el-dropdown-item>
          <el-dropdown-item v-if="isLoggedIn" @click="logout">Выйти</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </header>
    <div class="content">
      <transition name="fade" mode="out-in">
        <router-view></router-view>
      </transition>
    </div>
    <!-- Подвал будет отображаться только на определенных страницах -->
    <footer v-if="showFooter" class="footer">
      <p>&copy; 2025 Проектное управление</p>
    </footer>
  </div>
</template>

<script>
export default {
  data() {
    return {
      isLoggedIn: false // Замените это на вашу логику проверки авторизации
    };
  },
  computed: {
    showHeader() {
      const currentRoute = this.$route.name;
      return ['HomePage', 'LoginMenu', 'RegisterMenu', 'DashboardMenu'].includes(currentRoute);
    },
    showFooter() {
      const currentRoute = this.$route.name;
      return ['HomePage', 'LoginMenu', 'RegisterMenu', 'DashboardMenu'].includes(currentRoute);
    }
  },
  methods: {
    logout() {
      // Логика выхода из системы
      this.isLoggedIn = false;
      localStorage.removeItem('token'); // Удаляем токен при выходе
      this.$router.push('/'); // Перенаправляем на главную страницу
    }
  },
  mounted() {
    // Пример проверки авторизации (замените на вашу реальную логику)
    const token = localStorage.getItem('token');
    if (token) {
      this.isLoggedIn = true;
    }
  }
}
</script>

<style>


body, html {
  margin: 0;
  padding: 0;
  height: 100%;
  font-family: 'Montserrat', sans-serif;
}
#app {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.header {
  background: rgba(66, 63, 63, 0.2); /* Полупрозрачный фон */
  backdrop-filter: blur(10px); /* Размытие */
  padding: 10px 5%;
  position: sticky;
  font-style: bold;
  white-space: nowrap;
  top: 0;
  z-index: 1000;
  border: 3px;
  border-radius: 20px;
  margin: 10px auto;
  width: 35%;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Контейнер навигации */
.navbar {
  display: flex;
  align-items: center;
  width: 100%;
}

/* Логотип (TeamSyncer) */
.site-title {
  font-size: 1.5em;
  font-weight: bold;
  margin: 0;
  background: linear-gradient(to right, black, #007bff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-size: 200% 100%;
  background-position: 100%;
  transition: background-position 1s ease-in-out;
  flex-shrink: 0;
  margin-right: 30px;
}

.site-title:hover {
  background-position: -100%; /* Изменение позиции фона при наведении */
  animation: shimmer 5s infinite alternate; /* Анимация переливания */
}
/* Ссылки навигации */
.nav-links {
  display: flex;
  align-items: center;
  gap: 20px;
}

.nav-links a {
  color: black;
  text-decoration: none;
  font-size: 18px;
  font-weight: 500;
}

/* Кнопки */
.navbar-button {
  display: flex;
  justify-content: center; /* Центрируем кнопки */
  gap: 100px; /* Отступ между кнопками */
  padding: 10px 30px; /* Внутренние отступы кнопок */
  background-color: #007bff; /* Фон кнопок */
  color: white; /* Цвет текста кнопок */
  border: none; /* Убираем границу */
  border-radius: 5px; /* Закругление углов */
  cursor: pointer; /* Курсор указывает на кликабельность */
  transition: background-color 0.3s ease, transform 0.3s ease; /* Анимация перехода */
  font-size: 16px; /* Размер шрифта */
  text-decoration: none; /* Убираем подчеркивание ссылок */
  font-style: bold; 

}

/* Стили для выпадающего меню */
.el-dropdown-menu {
  background: #888 !important; /* Серый фон */
  border-radius: 10px;

}
/* Выпадающее меню */
.menu-dropdown {
  margin-left: 10%; /* Такой же отступ, как между текстом */
}

/* Кнопка меню (3 полоски в кружке) */
.menu-button {
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.1); /* Легкий серый круг */
  transition: background 0.3s ease;
}

.menu-button:hover {
  background: rgba(0, 0, 0, 0.2);
}

.navbar-button:hover {
  background-color: #0056b3;
  transform: scale(1.05); 
}

/* Полоски внутри меню */
.menu-icon {
  width: 20px;
  height: 3px;
  background: black;
  margin: 3px 0;
  transition: transform 0.3s ease;
}
/* Стили выпадающего меню */
.custom-dropdown {
  background: rgba(136, 136, 136, 1) !important; /* Серый фон */
  border-radius: 10px;
}
.el-dropdown-item {
  color: black !important; /* Черный текст */
  text-align: center;
  font-size: 16px;
}

.el-dropdown-item:hover {
  background: rgba(102, 102, 102, 1) !important; /* Темнее при наведении */
}

.content {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  width: 100%; /* Убедимся, что занимает всю ширину экрана */
  box-sizing: border-box; /* Включаем внутренние отступы в размеры элемента */
}
.footer {
  background-color: #000000; /* Черный фон */
  padding: 20px;
  text-align: center;
  color: #ffffff; /* Белый текст */
  font-size: 16px;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s ease, transform 0.5s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>