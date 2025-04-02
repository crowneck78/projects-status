<template>
  <div class="register-menu-container">
    <h2>Регистрация</h2>
    <form @submit.prevent="register">
      <div class="form-group">
        <label for="username">Имя пользователя:</label>
        <input type="text" v-model="username" required />
      </div>
      <div class="form-group">
        <label for="email">Email:</label>
        <input type="email" v-model="email" required />
      </div>
      <div class="form-group">
        <label for="password">Пароль:</label>
        <input type="password" v-model="password" required />
      </div>
      <button type="submit" class="animated-button">Зарегистрироваться</button>
    </form>
  </div>
</template>

<script>
import axios from 'axios';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElNotification } from 'element-plus';

export default {
  name: 'RegisterMenu',
  setup() {
    const username = ref('');
    const email = ref('');
    const password = ref('');
    const router = useRouter();

    const register = async () => {
      try {
        await axios.post('http://localhost:5000/auth/register', { // Изменил /register на /auth/register
          username: username.value,
          email: email.value,
          password: password.value,
        });
        ElNotification.success({
          title: 'Успех',
          message: 'Регистрация прошла успешно!',
          duration: 3000,
        });
        router.push('/');
      } catch (error) {
        console.error('Ошибка регистрации:', error);
        ElNotification.error({
          title: 'Ошибка',
          message: 'Ошибка при регистрации. Попробуйте снова.',
          duration: 3000,
        });
      }
    };

    return {
      username,
      email,
      password,
      register,
    };
  },
};
</script>

<style scoped>
.register-menu-container {
  max-width: 400px;
  width: 100%;
  margin: 0 auto;
  padding: 40px;
  border: 1px solid #ccc;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  background-color: rgba(255, 255, 255, 0.9); /* Прозрачный белый фон */
  color: #000000; /* Черный текст */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  box-sizing: border-box; /* Включаем внутренние отступы в размеры элемента */
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
  background-color: #ffffff; /* Белый фон */
  color: #000000; /* Черный текст */
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 16px;
}

.animated-button {
  padding: 12px 20px;
  background-color: #007bff; /* Темно-синий фон */
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  font-size: 16px;
}

.animated-button:hover {
  background-color: #0056b3; /* Темно-синий при наведении */
}

@media (max-width: 600px) {
  .register-menu-container {
    padding: 20px;
  }

  input {
    padding: 10px;
  }

  .animated-button {
    padding: 10px 15px;
  }
}
</style>

<!-- Импорт animate.css -->
<style>
@import '~animate.css/animate.min.css';
</style>