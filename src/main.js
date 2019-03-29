<<<<<<< Updated upstream
import { createApp, nextTick } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import createAppRouter from './router';
import '@/assets/animations.css';
import SweetAlertPlugin from './sweetalert-plugin';
import VueConfetti from 'vue-confetti';
import VueChartkick from 'vue-chartkick'
import 'chartkick/chart.js'
=======
import { createApp, nextTick } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
// import 'mdb-vue-ui-kit/css/mdb.min.css';
const app = createApp(App)
>>>>>>> Stashed changes

const pinia = createPinia();
const app = createApp(App);

app.use(pinia);
app.use(SweetAlertPlugin);
app.use(VueConfetti);
app.use(VueChartkick)

const router = createAppRouter(pinia);
app.use(router);

router.afterEach((to) => {
  nextTick(() => {
    document.title = to.meta.title ? `HWSS | ${to.meta.title}` : 'HWSS';
  });
});

app.mount('#app');
