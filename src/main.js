import { createApp, nextTick } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)


router.afterEach((to) => {
    nextTick(() => {
        document.title = to.meta.title ? `HWSS | ${to.meta.title}` : 'HWSS';
    });
});

app.mount('#app')
