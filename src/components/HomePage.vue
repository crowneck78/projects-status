<template>
 <div class="fullscreen-gradient"></div>
  <div id="home-page">
    <section class="hero-section">
      <div class = "circlemain">
      <div class="circle">
  <div class="wave"></div>
  </div>
</div>
      <div class="right-content">
          <p class="welcome-text">Управляйте своими проектами</p>
        </div>
        <div class="info-text">
          <p>TeamSyncer — это современная платформа для управления проектами, разработанная для повышения производительности и координации работы команд. </p>
        </div>  
        <div class="image-container">
  <div class="image-wrapper">
    <img src="@/assets/version.png" alt="Версия программы" class="app-version-image" />
  </div>
</div>
      <h2 class="main-text">Ваши проекты можно интегрировать из:</h2>
      <div class="features-grid">
        <div class="feature-item">
          <a href="https://github.com" target="_blank">
            <img src="@/assets/GitHub.svg" alt="GitHub Logo" class="logo animated-logo"></a>
        </div>
      </div>
    </section>
  </div>  
</template>

<script>
export default {
  name: 'HomePage',
  data() {
    return {
      activeInfo: null,
      clickedButton: null,
      backgroundImageUrl: require('@/assets/Main.png') 
    };
  },
  computed: {
    
  },
  methods: {
    showInfo(info) {
      if (!this.clickedButton || this.clickedButton !== info) {
        this.activeInfo = info;
      }
    },
    hideInfo(info) {
      if (this.activeInfo === info && !this.clickedButton) {
        this.activeInfo = null;
      }
    },
    toggleInfo(info) {
      if (this.clickedButton === info) {
        this.clickedButton = null;
        this.activeInfo = null;
      } else {
        this.clickedButton = info;
        this.activeInfo = info;
      }
    }
  }
}
</script>

<style scoped>

@import url('https://fonts.googleapis.com/css2?family=Shantell+Sans:wght@300;400;500;600;800&display=swap');

*, *:before, *:after{
  margin:0;
  padding: 0;
  box-sizing:border-box;
}


.circle{
  margin-left:600px;
  margin-top:200px;
  position: flex;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 250px;
  height: 250px;
  border: 5px solid #FFFFFF;
  box-shadow: 0 0 0 5px #4973ff;
  border-radius: 50%;
  overflow: hidden;
}
.wave{
  position: relative;
  top: 0;
  width: 100%;
  height: 100%;
  background: #2C74B3;
  border-radius: 50%;
  box-shadow: inset 0 0 50px 0 rgba(0, 0, 0, 0.5);
}
.wave:before,
.wave:after{
  content:'';
  position: absolute;
  top: 0;
  left: 50%;
  width: 200%;
  height: 200%;
  background: black;
  transform: translate(-50%, -75%);
}
.wave:before{
  border-radius: 45%;
  background: rgba(255, 255, 255, 1);
  animation: animate 5s linear infinite;
}
.wave:after{
  border-radius: 40%;
  background: rgba(255, 255, 255, 0.5);
  animation: animate 10s linear infinite;
}

@keyframes animate{
  0%{
    transform: translate(-50%, -75%) rotate(0deg);
  }
  100%{
    transform: translate(-50%, -75%) rotate(360deg);
  }
}

/* Глобальные стили */
body, html {
  height: 100vh;
  margin: 0;
  overflow: hidden;
  margin: 0;
  padding: 0;
  height: 100%;
  font-family: 'Roboto', sans-serif; /* Единый шрифт */
  color: #333; /* Единый цвет текста */
}

.fullscreen-gradient {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(to bottom, #ffffff, #cce7ff);
  z-index: -1; /* Чтобы не перекрывал контент */
}

/* Контейнер для изображения */
.image-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 50px;
  border-color:#000000;
  border-radius: 50px;
}
.app-version-image {
  display: block;
  width: 250%; /* Увеличиваем в 2,5 раза */
  max-width: 1250px; /* Ограничение по ширине */
  border-radius: 40px; /* Закруглённые углы */
  border: 5px solid black; /* Чёрная обводка */
}



/* Убираем отступы у фоновой картинки */
#home-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  margin: 0;
  padding: 0; /* Убираем отступы вокруг фона */
  box-sizing: border-box;
}

/* Установка единого цвета и шрифта для текста */
.main-text {
  margin-top: 100px;
  font-family: 'Roboto', sans-serif; /* Единый шрифт */
  color: #000000; /* Единый цвет текста */
}

/* Если есть другие специфичные классы или элементы, добавляем их здесь */
h2.main-text, h4.main-text, p.main-text {
  font-family: 'Roboto', sans-serif; /* Единый шрифт */
  color: #000000; /* Единый цвет текста */
}

.hero-section {
  padding: 0; /* Убираем отступы сверху и снизу для секции героя */
  text-align: center; /* Центрируем текст внутри секции героя */
  box-sizing: border-box;
}

.logo-svg {
  width: 300px; /* Размер логотипа */
  height: auto; /* Сохранение пропорций */
  max-width: 100%;
  filter: drop-shadow(2px 4px 6px rgba(0, 0, 0, 0.2)); /* Тень */
  transition: transform 0.3s ease;
}

.logo-svg:hover {
  transform: scale(1.1); /* Увеличение при наведении */
}
.left-content{
  width: 100%; /* Ширина каждого блока */
  display: flex;
  flex-direction: column;
  align-items: center; /* Горизонтальное выравнивание содержимого */
  text-align: center; /* Центрируем текст внутри блоков */
}

.right-content {
  width: 100%; 
  flex-direction: column;
}

.site-title {
  font-size: 6em; /* Размер шрифта */
  font-weight: bold; /* Жирный шрифт */
  margin-top: 150px; /* Отступ снизу от заголовка */
  color: black; /* Цвет текста */
  background: linear-gradient(to right, black, #007bff); /* Градиент для эффекта */
  -webkit-background-clip: text; /* Применяем градиент к тексту */
  -webkit-text-fill-color: transparent; /* Делаем текст прозрачным */
  background-size: 200% 100%; /* Размер фона */
  background-position: 100%; /* Позиция фона */
  transition: background-position 1s ease-in-out; /* Анимация перехода */
}

.site-title:hover {
  background-position: -100%; /* Изменение позиции фона при наведении */
  animation: shimmer 5s infinite alternate; /* Анимация переливания */
}

.welcome-text {
  font-size: 3em; /* Размер шрифта */
  font-weight: bold; /* Жирный шрифт */
  margin-bottom: 30px; /* Отступ снизу от текста */
  color: rgb(0, 0, 0); /* Цвет текста */
}

.buttons {
  display: flex;
  justify-content: center; /* Центрируем кнопки */
  gap: 100px; /* Отступ между кнопками */
  padding: 16px 50px; /* Внутренние отступы кнопок */
  background-color: #007bff; /* Фон кнопок */
  color: white; /* Цвет текста кнопок */
  border: none; /* Убираем границу */
  border-radius: 5px; /* Закругление углов */
  cursor: pointer; /* Курсор указывает на кликабельность */
  transition: background-color 0.3s ease, transform 0.3s ease; /* Анимация перехода */
  font-size: 16px; /* Размер шрифта */
  text-decoration: none; /* Убираем подчеркивание ссылок */
  font-style: bold; 
  margin-top: 30px;
}

.mainbuttons{
  display: flex;          /* Включаем flexbox */
  gap: 100px;              /* Расстояние между кнопками */
  justify-content: center; /* Выравнивание по центру */
  align-items: center;    /* Выравнивание по вертикали */
}

.buttons:hover {
  background-color: #0056b3; /* Изменение цвета фона при наведении */
  transform: scale(1.05); /* Масштабирование при наведении */
}

.info-buttons {
  display: flex;
  justify-content: center; /* Центрируем кнопки информации */
  gap: 20px; /* Отступ между кнопками */
  margin: 40px 0; /* Отступы сверху и снизу */
}

.info-button {
  padding: 12px 20px; /* Внутренние отступы кнопок */
  background-color: #007bff; /* Фон кнопок */
  color: white; /* Цвет текста кнопок */
  border: none; /* Убираем границу */
  border-radius: 5px; /* Закругление углов */
  cursor: pointer; /* Курсор указывает на кликабельность */
  transition: background-color 0.3s ease, transform 0.3s ease; /* Анимация перехода */
  font-size: 16px; /* Размер шрифта */
  text-decoration: none; /* Убираем подчеркивание ссылок */
  text-align: center; /* Центрируем текст внутри кнопок */
}

.info-button:hover {
  background-color: #0056b3; /* Изменение цвета фона при наведении */
  transform: scale(1.05); /* Масштабирование при наведении */
}

.info-button.active {
  background-color: #0056b3; /* Цвет фона активной кнопки */
}

.features-grid {
  display: flex;
  justify-content: center; /* Центрируем логотипы */
  margin-top:50px;
  margin-bottom: 40px; /* Отступ снизу от сетки */
  gap: 40px; /* Отступ между элементами */
}

.feature-item {
  text-align: center; /* Центрируем текст внутри элементов */
  flex: 1 0 30%; /* Ширина элементов и возможность сжатия */
}

.logo {
  width: 100px; /* Ширина логотипа */
  height: auto; /* Сохранение пропорций */
  transition: transform 0.3s ease, filter 0.3s ease; /* Анимация перехода */
}

.logo:hover {
  transform: scale(1.1); /* Масштабирование при наведении */
  animation: logo-shimmer 1.5s infinite alternate; /* Анимация переливания */
}

@keyframes logo-shimmer {
  from {
    filter: drop-shadow(0 0 10px rgba(0, 123, 255, 0)); /* Начальный эффект тени */
  }
  to {
    filter: drop-shadow(100px 0 10px rgba(0, 123, 255, 1)); /* Конечный эффект тени */
  }
}

.subversion-logo {
 width: 200px;
 margin-top: 30px;
}

.about-text, .info-text {
  font-size: 1.5em;
  margin-top: 20px; /* Отступ сверху от текста */
  max-width: 800px; /* Максимальная ширина текста */
  margin-left: auto; /* Выравнивание слева */
  margin-right: auto; /* Выравнивание справа */
  text-align: left; /* Выравнивание текста слева */
  color: #616166; /* Цвет текста */
  font-weight: bold; /* Жирный шрифт */
}

.testimonials-section, .team-section {
  background-color: white; /* Фон секций */
  padding: 40px 20px; /* Отступы внутрь секций */
  color: black; /* Цвет текста */
}

.testimonials-section h2, .team-section h2 {
  text-align: center; /* Центрируем заголовки */
  margin-bottom: 40px; /* Отступ снизу от заголовков */
}

.testimonials-grid {
  display: flex;
  justify-content: space-around; /* Располагаем элементы равномерно */
  flex-wrap: wrap; /* Перенос элементов на новую строку при необходимости */
}

.testimonial-item {
  width: 45%; /* Ширина элементов */
  margin-bottom: 40px; /* Отступ снизу от элементов */
  text-align: center; /* Центрируем текст внутри элементов */
  background-color: rgba(255, 255, 255, 0.9); /* Полупрозрачный фон */
  padding: 20px; /* Внутренние отступы */
  border-radius: 10px; /* Закругление углов */
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); /* Тень */
}

.team-section h2 {
  text-align: center; /* Центрируем заголовок */
  margin-bottom: 40px; /* Отступ снизу от заголовка */
}

.team-grid {
  display: flex;
  justify-content: space-around; /* Располагаем элементы равномерно */
  flex-wrap: wrap; /* Перенос элементов на новую строку при необходимости */
}

.team-member {
  width: 30%; /* Ширина элементов */
  text-align: center; /* Центрируем текст внутри элементов */
  background-color: rgba(255, 255, 255, 0.9); /* Полупрозрачный фон */
  padding: 20px; /* Внутренние отступы */
  border-radius: 10px; /* Закругление углов */
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); /* Тень */
}

.team-member img {
  width: 100px; /* Ширина изображения */
  height: 100px; /* Высота изображения */
  border-radius: 50%; /* Круглая форма */
  object-fit: cover; /* Сохранение пропорций */
}



/* Анимация появления текста */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s ease; /* Анимация перехода прозрачности */
}

.fade-enter-from, .fade-leave-to {
  opacity: 0; /* Начальное состояние прозрачности */
}

@media (max-width: 768px) {
  .content-wrapper {
    flex-direction: column; /* Изменение направления блоков на вертикальное */
    align-items: center; /* Выравнивание по центру */
  }

  .left-content, .right-content {
    width: 100%; /* Полная ширина блоков */
    text-align: center; /* Центрируем текст */
  }

  .buttons {
    justify-content: center; /* Центрируем кнопки */
  }

  .info-buttons {
    flex-direction: column; /* Изменение направления кнопок на вертикальное */
    align-items: center; /* Выравнивание по центру */
    gap: 10px; /* Отступ между кнопками */
  }

  .features-grid {
    gap: 20px; /* Отступ между элементами */
  }

  .about-text, .info-text {
    text-align: center; /* Центрируем текст */
  }
}

/* Планшеты и небольшие ноутбуки (до 1024px) */
@media (max-width: 1024px) {
  

  .welcome-text {
    font-size: 2.5em;
    text-align: center;
    margin: 20px 0;
  }

  .info-text {
    font-size: 1.2em;
    padding: 0 15px;
    text-align: center;
  }

  .main-text {
    font-size: 1.8em;
  }

  .app-version-image {
    width: 200%;
    max-width: 900px;
  }

  .features-grid {
    gap: 25px;
    padding: 0 20px;
  }

  .logo {
    width: 90px;
  }

  .subversion-logo {
    width: 160px;
  }
}

/* Мобильные устройства и планшеты (до 768px) */
@media (max-width: 768px) {
  

  .hero-section {
    padding: 15px;
  }

  .welcome-text {
    font-size: 1.8em;
  }

  .info-text {
    font-size: 1em;
    padding: 0 10px;
  }

  .main-text {
    font-size: 1.5em;
    margin-top: 40px;
  }

  .app-version-image {
    width: 100%;
    max-width: 400px;
  }

  .features-grid {
    flex-direction: column;
    align-items: center;
    gap: 20px;
    margin-bottom: 20px;
  }

  .feature-item {
    width: 80%;
    max-width: 250px;
  }

  .logo {
    width: 80px;
  }

  .subversion-logo {
    width: 140px;
    margin-top: 15px;
  }

  .image-container {
    margin-top: 40px;
  }
}

/* Маленькие мобильные устройства (до 480px) */
@media (max-width: 480px) {
  .circle {
    margin-top: 40px;
    width: 100px;
    height: 100px;
  }

  .welcome-text {
    font-size: 1.4em;
  }

  .info-text {
    font-size: 0.85em;
    padding: 0 5px;
  }

  .main-text {
    font-size: 1.2em;
    margin-top: 30px;
  }

  .app-version-image {
    width: 100%;
    max-width: 280px;
  }

  .features-grid {
    gap: 15px;
  }

  .feature-item {
    width: 100%;
    max-width: 200px;
  }

  .logo {
    width: 60px;
  }

  .subversion-logo {
    width: 100px;
    margin-top: 10px;
  }

  .image-container {
    margin-top: 20px;
  }
}

/* Исправление для фона и кружка */
.fullscreen-gradient {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, #ffffff, #cce7ff);
  z-index: -1;
}


/* Адаптация для разных экранов */
@media (max-width: 1024px) {
  .circlemain {
    width: 200px;
    height: 200px;
  }
  .hero-section {
    padding-top: 250px;
  }
}

@media (max-width: 768px) {
  .circlemain {
    width: 150px;
    height: 150px;
    left: 50%; /* Возвращаем центрирование через left и transform */
    transform: translateX(-50%);
    margin: 0; /* Убираем margin для мобильных */
  }
  .hero-section {
    padding-top: 200px;
  }
}

@media (max-width: 480px) {
  .circlemain {
    width: 100px;
    height: 100px;
    left: 50%;
    transform: translateX(-50%);
    margin: 0;
  }
  .hero-section {
    padding-top: 150px;
  }
}
</style>