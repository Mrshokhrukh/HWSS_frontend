import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';

// Define a reusable dashboard component
const DashboardView = () => import('@/views/dashboard/DashboardView.vue');

// Define a function to generate routes for user dashboards
const generateDashboardRoutes = (userType) => {
  const dashboardRoutes = [
    {
      path: `/${userType}-dashboard`,
      name: `${userType}-dashboard`,
      component: DashboardView,
      meta: { title: `${userType.charAt(0).toUpperCase() + userType.slice(1)} Dashboard`, requiresAuth: true }
    },
    // -------------------------- Student specific routes ---------------------------------------------------
    {
      path: `/${userType}-dashboard/screening`,
      name: `${userType}-screening`,
      component: DashboardView,
      meta: { title: `${userType.charAt(0).toUpperCase() + userType.slice(1)} Screening Test`, requiresAuth: true }
    },
    {
      path: `/${userType}-dashboard/screening-start`,
      name: `${userType}-screening-start`,
      component: DashboardView,
      meta: { title: `${userType.charAt(0).toUpperCase() + userType.slice(1)} Screening Start`, requiresAuth: true }
    },
    {
      path: `/${userType}-dashboard/profile`,
      name: `${userType}-profile`,
      component: DashboardView,
      meta: { title: `${userType.charAt(0).toUpperCase() + userType.slice(1)} Profile`, requiresAuth: true }
    },
    // -------------------------- Public specific routes ---------------------------------------------------
    {
      path: `/${userType}-dashboard/public-screening`,
      name: `${userType}-public-screening`,
      component: DashboardView,
      meta: { title: `${userType.charAt(0).toUpperCase() + userType.slice(1)} Public Screening Test`, requiresAuth: true }
    },
    {
      path: `/${userType}-dashboard/public-screening-start`,
      name: `${userType}-public-screening-start`,
      component: DashboardView,
      meta: { title: `${userType.charAt(0).toUpperCase() + userType.slice(1)} Public Screening Start`, requiresAuth: true }
    },
    {
      path: `/${userType}-dashboard/public-profile`,
      name: `${userType}-public-profile`,
      component: DashboardView,
      meta: { title: `${userType.charAt(0).toUpperCase() + userType.slice(1)} Public Profile`, requiresAuth: true }
    },
    // -------------------------- Counselor specific routes ---------------------------------------------------
    {
      path: `/${userType}-dashboard/counselor-screening`,
      name: `${userType}-counselor-screening`,
      component: DashboardView,
      meta: { title: `${userType.charAt(0).toUpperCase() + userType.slice(1)} Counselor Screening Test`, requiresAuth: true }
    },
    {
      path: `/${userType}-dashboard/counselor-rescreening`,
      name: `${userType}-counselor-rescreening`,
      component: DashboardView,
      meta: { title: `${userType.charAt(0).toUpperCase() + userType.slice(1)} Counselor Rescreening Test`, requiresAuth: true }
    },
    {
      path: `/${userType}-dashboard/counselor-monitor`,
      name: `${userType}-counselor-monitor`,
      component: DashboardView,
      meta: { title: `${userType.charAt(0).toUpperCase() + userType.slice(1)} Counselor Monitor`, requiresAuth: true }
    },
    {
      path: `/${userType}-dashboard/counselor-reports`,
      name: `${userType}-counselor-reports`,
      component: DashboardView,
      meta: { title: `${userType.charAt(0).toUpperCase() + userType.slice(1)} Counselor Reports`, requiresAuth: true }
    },
    {
      path: `/${userType}-dashboard/counselor-help`,
      name: `${userType}-counselor-help`,
      component: DashboardView,
      meta: { title: `${userType.charAt(0).toUpperCase() + userType.slice(1)} Counselor Help`, requiresAuth: true }
    },
    {
      path: `/${userType}-dashboard/counselor-settings`,
      name: `${userType}-counselor-settings`,
      component: DashboardView,
      meta: { title: `${userType.charAt(0).toUpperCase() + userType.slice(1)} Counselor Settings`, requiresAuth: true }
    },

    // -------------------------- Admin specific routes ---------------------------------------------------
    {
      path: `/${userType}-dashboard/admin-approval`,
      name: `${userType}-admin-approval`,
      component: DashboardView,
      meta: { title: `${userType.charAt(0).toUpperCase() + userType.slice(1)} Admin approval`, requiresAuth: true }
    },
    {
      path: `/${userType}-dashboard/admin-report`,
      name: `${userType}-admin-report`,
      component: DashboardView,
      meta: { title: `${userType.charAt(0).toUpperCase() + userType.slice(1)} Admin report`, requiresAuth: true }
    },
    {
      path: `/${userType}-dashboard/admin-help`,
      name: `${userType}-admin-help`,
      component: DashboardView,
      meta: { title: `${userType.charAt(0).toUpperCase() + userType.slice(1)} Admin help`, requiresAuth: true }
    },
    {
      path: `/${userType}-dashboard/admin-setting`,
      name: `${userType}-admin-setting`,
      component: DashboardView,
      meta: { title: `${userType.charAt(0).toUpperCase() + userType.slice(1)} Admin setting`, requiresAuth: true }
    },


  ];

  return dashboardRoutes;
};

const createAppRouter = () => {
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
        path: '/forgot-password',
        name: 'forgot-password',
        component: () => import('@/views/auth/ForgotPasswordView.vue'),
        meta: { title: 'Forgot Password' }
      },
      {
        path: '/register',
        name: 'register',
        component: () => import('@/views/auth/RegisterView.vue'),
        meta: { title: 'Register' }
      },
      // Use route nesting to dynamically generate user dashboard routes
      ...generateDashboardRoutes('student'),
      ...generateDashboardRoutes('counselor'),
      ...generateDashboardRoutes('admin'),
      ...generateDashboardRoutes('public'),
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
