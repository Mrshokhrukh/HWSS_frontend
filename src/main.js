import { createApp, nextTick } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import createAppRouter from './router';
import '@/assets/animations.css';

const pinia = createPinia();
const app = createApp(App);

app.use(pinia);

const router = createAppRouter(pinia);
app.use(router);

router.afterEach((to) => {
  nextTick(() => {
    document.title = to.meta.title ? `HWSS | ${to.meta.title}` : 'HWSS';
  });
});

app.mount('#app');
