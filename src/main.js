import { createApp, nextTick } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import createAppRouter from './router';
import '@/assets/animations.css';
import SweetAlertPlugin from './sweetalert-plugin';
import VueConfetti from 'vue-confetti';
import VueChartkick from 'vue-chartkick';
import 'chartkick/chart.js';
import PrimeVue from 'primevue/config';
import 'primevue/resources/themes/aura-light-green/theme.css'
import ToastService from 'primevue/toastservice';
import ConfirmDialog from 'primevue/confirmdialog';
import ConfirmationService from 'primevue/confirmationservice'; 

const pinia = createPinia();
const app = createApp(App);

app.use(pinia);
app.use(SweetAlertPlugin);
app.use(VueConfetti);
app.use(VueChartkick);
app.use(PrimeVue);
app.use(ConfirmationService);
app.use(ToastService);
app.use(ConfirmDialog)

const router = createAppRouter(pinia);
app.use(router);

router.afterEach((to) => {
  nextTick(() => {
    document.title = to.meta.title ? `HWSS | ${to.meta.title}` : 'HWSS';
  });
});

app.mount('#app');
