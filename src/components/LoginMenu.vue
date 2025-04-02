<template>
  <div class="login-menu-container">
    <h2>Вход</h2>
    <form @submit.prevent="login">
      <div class="form-group">
        <label for="email">Email:</label>
        <input type="email" v-model="email" required />
      </div>
      <div class="form-group">
        <label for="password">Пароль:</label>
        <input type="password" v-model="password" required />
      </div>
      <button type="submit" class="animated-button">Войти</button>
    </form>

    <div class="github-login">
      <button @click="loginWithGithub" class="github-button">
        <img src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" alt="GitHub Logo" class="github-logo" />
        Войти через GitHub
      </button>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useStore } from 'vuex';
import { ElNotification } from 'element-plus';

export default {
  name: 'LoginMenu',
  components: {},
  setup() {
    const email = ref('');
    const password = ref('');
    const store = useStore();
    const router = useRouter();
    const route = useRoute();

    const login = async () => {
      try {
        const response = await axios.post('http://localhost:5000/auth/login', {
          email: email.value,
          password: password.value,
        });
        const token = response.data.token;
        store.dispatch('login', token);
        localStorage.setItem('token', token);
        router.push('/dashboard');
        ElNotification.success({
          title: 'Успех',
          message: 'Вы успешно вошли в систему!',
          duration: 2000,
        });
      } catch (error) {
        console.error('Ошибка входа:', error);
        ElNotification.error({
          title: 'Ошибка',
          message: 'Неверный email или пароль',
          duration: 3000,
        });
      }
    };

    const loginWithGithub = async () => {
      // Перенаправляем на сервер для авторизации через GitHub
      window.location.href = 'http://localhost:5000/github/login';
    };

    const handleGithubCallback = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      if (token) {
        try {
          store.dispatch('login', token);
          localStorage.setItem('token', token);
          router.push('/dashboard'); // Перенаправляем на главную страницу
          ElNotification.success({
            title: 'Успех',
            message: 'Вы успешно вошли через GitHub!',
            duration: 2000,
          });
          // Очищаем URL
          window.history.replaceState({}, document.title, '/login');
        } catch (error) {
          console.error('Ошибка обработки токена GitHub:', error);
          ElNotification.error({
            title: 'Ошибка',
            message: 'Не удалось войти через GitHub',
            duration: 3000,
          });
        }
      }
    };

    // Вызываем обработку при монтировании компонента
    onMounted(() => {
      console.log('Текущий путь:', route.path); // Отладка
      console.log('Query параметры:', route.query); // Отладка
      handleGithubCallback(); // Вызываем сразу, если есть токен в URL
    });

    return {
      email,
      password,
      login,
      loginWithGithub,
    };
  },
};
</script>

<style scoped>
/* Стили остаются без изменений */
.custom-notification {
  background-color: #000000;
  color: #ffffff;
  border: 1px solid #007bff;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.custom-notification .el-notification__title {
  font-size: 16px;
  font-weight: bold;
  color: #ffffff;
}

.custom-notification .el-notification__content {
  font-size: 14px;
  color: #ffffff;
}

.custom-notification .el-notification__closeBtn {
  color: #ffffff;
}

.login-menu-container {
  max-width: 400px;
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

h2 {
  margin-bottom: 20px;
  font-size: 24px;
}

.form-group {
  margin-bottom: 20px;
  width: 100%;
}

label {
  display: block;
  margin-bottom: 10px;
  font-size: 16px;
}

input {
  width: 100%;
  padding: 12px;
  box-sizing: border-box;
  background-color: #ffffff;
  color: #000000;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 16px;
}

.animated-button {
  padding: 12px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  font-size: 16px;
}

.animated-button:hover {
  background-color: #0056b3;
}

.github-login {
  margin-top: 20px;
  width: 100%;
}

.github-button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 20px;
  background-color: #24292e;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  font-size: 16px;
  width: 100%;
}

.github-button:hover {
  background-color: #1a1e22;
}

.github-logo {
  width: 20px;
  height: 20px;
  margin-right: 10px;
}

@media (max-width: 600px) {
  .login-menu-container {
    padding: 20px;
  }

  input {
    padding: 10px;
  }

  .animated-button,
  .github-button {
    padding: 10px 15px;
  }
}
</style>

<style>
@import '~animate.css/animate.min.css';
</style>