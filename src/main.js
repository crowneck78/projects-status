import { createApp } from 'vue';
import App from './App.vue';
import store from './store';
import router from './router';
import 'animate.css';
// Импорт стилей Element Plus
import 'element-plus/dist/index.css';
// Импорт самой библиотеки Element Plus
import ElementPlus from 'element-plus';

const app = createApp(App);

app.use(store);
app.use(router);
app.use(ElementPlus);

app.mount('#app');

