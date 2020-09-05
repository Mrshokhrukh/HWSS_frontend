import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import apiClient from '@/apiClient';
import endpoints from '@/api';
import NotFoundPage from '@/views/errorpages/pagenotfound404.vue';
import { useUserDetailsStore } from '@/stores/userDetails';

const DashboardView = () => import('@/views/Dashboard/DashboardView.vue');

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

const generateDashboardRoutes = (userType) => {
  const commonMeta = { requiresAuth: true };
  const capitalizedUserType = capitalize(userType);

  const dashboardRoutes = [
    {
      path: `/${userType}-dashboard`,
      name: `${userType}-dashboard`,
      component: DashboardView,
      meta: { title: `${capitalizedUserType} Dashboard`, ...commonMeta }
    },
    {
      path: `/${userType}-dashboard/screening`,
      name: `${userType}-screening`,
      component: DashboardView,
      meta: { title: `${capitalizedUserType} Screening Test`, ...commonMeta }
    },
    {
      path: `/${userType}-dashboard/screening-start`,
      name: `${userType}-screening-start`,
      component: DashboardView,
      meta: { title: `${capitalizedUserType} Screening Start`, ...commonMeta }
    },
    {
      path: `/${userType}-dashboard/profile`,
      name: `${userType}-profile`,
      component: DashboardView,
      meta: { title: `${capitalizedUserType} Profile`, ...commonMeta }
    },
    {
      path: `/${userType}-dashboard/public-screening`,
      name: `${userType}-public-screening`,
      component: DashboardView,
      meta: { title: `${capitalizedUserType} Public Screening Test`, ...commonMeta }
    },
    {
      path: `/${userType}-dashboard/public-screening-start`,
      name: `${userType}-public-screening-start`,
      component: DashboardView,
      meta: { title: `${capitalizedUserType} Public Screening Start`, ...commonMeta }
    },
    {
      path: `/${userType}-dashboard/public-profile`,
      name: `${userType}-public-profile`,
      component: DashboardView,
      meta: { title: `${capitalizedUserType} Public Profile`, ...commonMeta }
    },
    {
      path: `/${userType}-dashboard/counselor-screening`,
      name: `${userType}-counselor-screening`,
      component: DashboardView,
      meta: { title: `${capitalizedUserType} Counselor Screening Test`, ...commonMeta }
    },
    {
      path: `/${userType}-dashboard/counselor-rescreening`,
      name: `${userType}-counselor-rescreening`,
      component: DashboardView,
      meta: { title: `${capitalizedUserType} Counselor Rescreening Test`, ...commonMeta }
    },
    {
      path: `/${userType}-dashboard/counselor-monitor`,
      name: `${userType}-counselor-monitor`,
      component: DashboardView,
      meta: { title: `${capitalizedUserType} Counselor Monitor`, ...commonMeta }
    },
    {
      path: `/${userType}-dashboard/counselor-reports`,
      name: `${userType}-counselor-reports`,
      component: DashboardView,
      meta: { title: `${capitalizedUserType} Counselor Reports`, ...commonMeta }
    },
    {
      path: `/${userType}-dashboard/counselor-help`,
      name: `${userType}-counselor-help`,
      component: DashboardView,
      meta: { title: `${capitalizedUserType} Counselor Help`, ...commonMeta }
    },
    {
      path: `/${userType}-dashboard/counselor-settings`,
      name: `${userType}-counselor-settings`,
      component: DashboardView,
      meta: { title: `${capitalizedUserType} Counselor Settings`, ...commonMeta }
    },
    {
      path: `/${userType}-dashboard/flagged-reports`,
      name: `${userType}-flagged-reports`,
      component: DashboardView,
      meta: { title: `${capitalizedUserType} Flagged Reports`, ...commonMeta },
      props: (route) => ({ flag: route.query.flag })
    },
    {
      path: `/${userType}-dashboard/admin-approval`,
      name: `${userType}-admin-approval`,
      component: DashboardView,
      meta: { title: `${capitalizedUserType} Admin approval`, ...commonMeta }
    },
    {
      path: `/${userType}-dashboard/admin-report`,
      name: `${userType}-admin-report`,
      component: DashboardView,
      meta: { title: `${capitalizedUserType} Admin report`, ...commonMeta }
    },
    {
      path: `/${userType}-dashboard/admin-help`,
      name: `${userType}-admin-help`,
      component: DashboardView,
      meta: { title: `${capitalizedUserType} Admin help`, ...commonMeta }
    },
    {
      path: `/${userType}-dashboard/admin-settings`,
      name: `${userType}-admin-setting`,
      component: DashboardView,
      meta: { title: `${capitalizedUserType} Admin setting`, ...commonMeta }
    },
    {
      path: `/${userType}-dashboard/admin-chart-maker`,
      name: `${userType}-admin-chart-maker`,
      component: DashboardView,
      meta: { title: `${capitalizedUserType} Admin chart maker`, ...commonMeta }

    },
  ];

  return dashboardRoutes;
};

const gyalsungReassessmentRoutes = [
  {
    path: '/gyalsung-reassessment-dashboard',
    name: 'reassessment-dashboard',
    component: DashboardView,
    meta: { title: 'Reassessment Dashboard', requiresAuth: true }
  },
  {
    path: '/gyalsung-reassessment-dashboard/list',
    name: 'reassessment-list',
    component: DashboardView,
    meta: { title: 'Reassessment List', requiresAuth: true }
  },
  {
    path: '/gyalsung-reassessment-dashboard/monitoring',
    name: 'reassessment-monitoring',
    component: DashboardView,
    meta: { title: 'Monitoring', requiresAuth: true }
  },
  {
    path: '/gyalsung-reassessment-dashboard/reports',
    name: 'reassessment-reports',
    component: DashboardView,
    meta: { title: 'Reassessment Reports', requiresAuth: true }
  },
  {
    path: '/gyalsung-reassessment-dashboard/tracking',
    name: 'reassessment-tracking',
    component: DashboardView,
    meta: { title: 'Screening Tracking', requiresAuth: true }
  },
  {
    path: '/gyalsung-reassessment-dashboard/transfers',
    name: 'reassessment-transfers',
    component: DashboardView,
    meta: { title: 'Transfers & Handover', requiresAuth: true }
  },
];

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
      {
        path: '/GyalsungModel/GyalsungRegister',
        name: 'gyalsung-register',
        component: DashboardView,
        meta: { title: 'Gyalsung Register', requiresAuth: true }
      },
      {
        path: '/GyalsungModel/GyalsungScreening',
        name: 'gyalsung-screening',
        component: DashboardView,
        meta: { title: 'Gyalsung Screening', requiresAuth: true }
      },
      {
        path: '/gyalsungmodel/gyalsungregister',
        redirect: '/GyalsungModel/GyalsungRegister'
      },
      {
        path: '/gyalsungmodel/gyalsungscreening',
        redirect: '/GyalsungModel/GyalsungScreening'
      },
      ...generateDashboardRoutes('student'),
      ...generateDashboardRoutes('counselor'),
      ...generateDashboardRoutes('admin'),
      ...generateDashboardRoutes('public'),
      ...gyalsungReassessmentRoutes,
      {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: NotFoundPage,
        meta: { title: 'Page Not Found' }
      },
    ],
  });

  const ROUTE_LOGIN = 'login';

  const clearAuthStorage = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('tokenExpiry');
    localStorage.removeItem('userDetailsStore');
    localStorage.removeItem('userType');
  };
  const getUserTypeFromDetails = (userDetailsStore) => {
    const role = userDetailsStore?.user?.role?.toLowerCase() || 'public';
    if (role.includes('admin')) {
      return 'admin';
    } else if (role.includes('counselor')) {
      return 'counselor';
    } else if (role.includes('gyalsung_reassessment_team')) {
      return 'gyalsung-reassessment';
    } else if (role === 'student') {
      return 'student';
    } else {
      return 'public';
    }
  };


  let isUserAuthenticated = false;
  let cachedUserType = null;
  let tokenValidityChecked = false;

  router.beforeEach(async (to, from, next) => {
    document.title = to.meta.title ? `${to.meta.title} | HWSS` : 'HWSS | Mental Health Matters';
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
    const authToken = localStorage.getItem('authToken');
    const tokenExpiry = localStorage.getItem('tokenExpiry');
    const isAuthenticatedInStorage = authToken !== null;
    const isTokenExpired = tokenExpiry && new Date(tokenExpiry) < new Date();

    if (isAuthenticatedInStorage && isTokenExpired) {
      clearAuthStorage();
      isUserAuthenticated = false;
      cachedUserType = null;
      tokenValidityChecked = false;
      return next({ name: ROUTE_LOGIN });
    }

    if (isAuthenticatedInStorage && !isTokenExpired && !tokenValidityChecked) {
      try {
        const response = await apiClient.post(endpoints.authenticateToken, null, {
          headers: { 'Authorization': `Token ${authToken}` },
        });

        if (response.data.valid) {
          isUserAuthenticated = true;
          const userDetailsStore = JSON.parse(localStorage.getItem('userDetailsStore'));
          cachedUserType = getUserTypeFromDetails(userDetailsStore);
          localStorage.setItem('userType', cachedUserType);
        } else {
          clearAuthStorage();
          isUserAuthenticated = false;
          cachedUserType = null;
        }
        tokenValidityChecked = true;
      } catch (error) {
        console.error('Error validating token:', error);
        clearAuthStorage();
        isUserAuthenticated = false;
        cachedUserType = null;
        tokenValidityChecked = true;
        return next({ name: ROUTE_LOGIN });
      }
    } else if (!isAuthenticatedInStorage) {
      isUserAuthenticated = false;
      cachedUserType = null;
      tokenValidityChecked = false;
    }

    if (requiresAuth) {
      if (!isUserAuthenticated) {
        return next({ name: ROUTE_LOGIN });
      } else {
        const gyalsungRoutes = ['gyalsung-register', 'gyalsung-screening'];
        const allowedRolesForGyalsung = ['clinical_counselor', 'trained_professional'];

        if (gyalsungRoutes.includes(to.name)) {
          const userDetailsStore = useUserDetailsStore();
          const userRole = userDetailsStore.user?.role?.toLowerCase();

          if (!allowedRolesForGyalsung.includes(userRole)) {
            console.warn(`Unauthorized access to '${to.name}' by role '${userRole}'. Redirecting.`);
            const dashboardRoute = localStorage.getItem('userType') || cachedUserType;
            return next({ name: `${dashboardRoute}-dashboard` });
          }
        }
        return next();
      }
    } else {
      if (isUserAuthenticated && to.name !== ROUTE_LOGIN && to.name !== 'register' && to.name !== 'forgot-password') {
        const currentUserType = localStorage.getItem('userType') || cachedUserType;
        if (currentUserType) {
          return next({ name: `${currentUserType}-dashboard` });
        }
      }
      return next();
    }
  });

  return router;
};

export default createAppRouter;