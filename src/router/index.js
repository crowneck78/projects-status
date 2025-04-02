import { createRouter, createWebHistory } from 'vue-router';
import LoginMenu from '@/components/LoginMenu.vue';
import RegisterMenu from '@/components/RegisterMenu.vue';
import DashboardMenu from '@/components/DashboardMenu.vue';
import HomePage from '@/components/HomePage.vue';

const routes = [
  { path: '/', name: 'HomePage', component: HomePage }, // Главная страница для неавторизованных пользователей
  { path: '/login', name: 'LoginMenu', component: LoginMenu }, // Страница логина
  { path: '/register', name: 'RegisterMenu', component: RegisterMenu }, // Страница регистрации
  { path: '/dashboard', name: 'DashboardMenu', component: DashboardMenu }, // Главная страница пользователя после логина
];

const router = createRouter({
  history: createWebHistory(), // Используем history mode для чистых URL
  routes,
});

// Добавляем защиту маршрутов и перенаправление
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  
  // Если пользователь авторизован (есть токен)
  if (token) {
    if (to.path === '/login' || to.path === '/register') {
      // Перенаправляем на /dashboard, если пытается зайти на логин или регистрацию
      next('/dashboard');
    } else {
      next(); // Разрешаем переход на другие маршруты
    }
  } else {
    // Если пользователь не авторизован
    if (to.path === '/dashboard') {
      // Перенаправляем на /login, если пытается зайти на защищенный маршрут
      next('/login');
    } else {
      next(); // Разрешаем переход на общедоступные маршруты
    }
  }
});

export default router;