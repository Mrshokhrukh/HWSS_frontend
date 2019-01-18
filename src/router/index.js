import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { title: 'Home' }
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/auth/LoginView.vue'),
      meta: { title: 'Login' }
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/auth/RegisterView.vue'),
      meta: { title: 'Register' }
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../components/navbar/SideNavbar.vue'),
      meta: { title: 'dashboard' }
    },
  ]
})

export default router
