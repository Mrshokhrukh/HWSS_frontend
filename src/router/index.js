import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
// import { useAuthStore } from '@/stores/auth';

const createAppRouter = () => {
  // const authStore = useAuthStore(pinia);

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
        component: () => import('@/views/auth/LoginView.vue'),
        meta: { title: 'Login' }
      },
      {
        path: '/register',
        name: 'register',
        component: () => import('@/views/auth/RegisterView.vue'),
        meta: { title: 'Register' }
      },
      {
        path: '/student-dashboard',
        name: 'student-dashboard',
        component: () => import('@/views/Dashboard/DashboardView.vue'),
        meta: { title: 'Student Dashboard', requiresAuth: true }
      },
      {
        path: '/counsellor-dashboard',
        name: 'counsellor-dashboard',
        component: () => import('@/views/Dashboard/DashboardView.vue'),
        meta: { title: 'Counsellor Dashboard', requiresAuth: true }
      },
      {
        path: '/admin-dashboard',
        name: 'admin-dashboard',
        component: () => import('@/views/Dashboard/DashboardView.vue'),
        meta: { title: 'Admin Dashboard', requiresAuth: true }
      },
      {
        path: '/screening',
        name: 'screening',
        component: () => import('@/views/screening/ScreeningView.vue'),
        meta: { title: 'screening test' }
      },
    ],
  });

  router.beforeEach((to, from, next) => {
    if (to.matched.some(record => record.meta.requiresAuth)) {
      const isAuthenticated = localStorage.getItem('authToken') !== null;

      if (!isAuthenticated) {
        alert('Access Denied! You need to be logged in to view this page.')
        next({ name: 'login' });
      } else {
        next();
      }
    } else {
      next();
    }
  });

  return router;
};

export default createAppRouter;
