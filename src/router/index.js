import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import axios from 'axios';
import endpoints from '@/api';
import NotFoundPage from '@/views/errorpages/pagenotfound404.vue'
// Define a reusable dashboard component
const DashboardView = () => import('@/views/Dashboard/DashboardView.vue');


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
    {
      path: `/${userType}-dashboard/flagged-reports`,
      name: `${userType}-flagged-reports`,
      component: DashboardView,
      meta: { title: `${userType.charAt(0).toUpperCase() + userType.slice(1)} Flagged Reports`, requiresAuth: true },
      props: (route) => ({ flag: route.query.flag }) // Pass query parameter as prop to the component
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
      path: `/${userType}-dashboard/admin-settings`,
      name: `${userType}-admin-setting`,
      component: DashboardView,
      meta: { title: `${userType.charAt(0).toUpperCase() + userType.slice(1)} Admin setting`, requiresAuth: true }
    },
    {
      path: `/${userType}-dashboard/admin-chart-maker`,
      name: `${userType}-admin-chart-maker`,
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
        path: '/:pathMatch(.*)*',
        redirect: { name: 'NotFound' },
        component: NotFoundPage,
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

  // Define constants for route names
  const ROUTE_LOGIN = 'login';

  router.beforeEach(async (to, from, next) => {
    try {
      // Retrieve authentication token and expiry time from local storage
      const authToken = localStorage.getItem('authToken');
      const tokenExpiry = localStorage.getItem('tokenExpiry');
      const isAuthenticated = authToken !== null;
  
      // Check if token has expired
      const isTokenExpired = tokenExpiry && new Date(tokenExpiry) < new Date();
  
      // If token is expired, clear storage and redirect to login
      if (isAuthenticated && isTokenExpired) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('tokenExpiry');
        localStorage.removeItem('userDetailsStore');
        localStorage.removeItem('userType');
  
        next({ name: ROUTE_LOGIN });
        return;
      }
  
      if (isAuthenticated && !isTokenExpired) {
        // Retrieve user type from local storage
        const userType = localStorage.getItem('userType');
  
        // If the user is authenticated and trying to access non-authenticated pages
        if (!to.matched.some(record => record.meta.requiresAuth)) {
          // Redirect the user to their respective dashboard based on their user type
          next({ name: `${userType}-dashboard` });
          return;
        }
      }
  
      // If the route requires authentication, proceed with authentication logic
      if (to.matched.some(record => record.meta.requiresAuth)) {
        if (!isAuthenticated) {
          // Redirect to login page if the user is not authenticated
          next({ name: ROUTE_LOGIN });
        } else {
          // Validate authentication token by making an API call
          const response = await axios.post(endpoints.authenticateToken, null, {
            headers: { 'Authorization': `Token ${authToken}` },
          });
  
          if (response.data.valid) {
            // Set user type and allow access
            const userDetailsStore = JSON.parse(localStorage.getItem('userDetailsStore'));
            if (!localStorage.getItem('userType')) {
              const role = userDetailsStore?.user?.role?.toLowerCase() || "public";
              let userType;
              if (role.includes("admin")) {
                userType = "admin";
              } else if (role.includes("_counselor")) {
                userType = "counselor";
              } else if (role === "student") {
                userType = "student";
              } else {
                userType = "public";
              }
              localStorage.setItem('userType', userType);
            }
  
            next();
          } else {
            // Remove invalid token from local storage
            localStorage.removeItem('authToken');
            localStorage.removeItem('tokenExpiry');
            localStorage.removeItem('userDetailsStore');
            localStorage.removeItem('userType');
  
            // Redirect to login page if token is invalid
            next({ name: ROUTE_LOGIN });
          }
        }
      } else {
        // Allow access to other routes
        next();
      }
    } catch (error) {
      // Handle errors
      console.error('Error validating token:', error);
  
      // Clear storage and redirect to login page if there's an error validating token
      localStorage.removeItem('authToken');
      localStorage.removeItem('tokenExpiry');
      localStorage.removeItem('userDetailsStore');
      localStorage.removeItem('userType');
  
      next({ name: ROUTE_LOGIN });
    }
  });
  
  return router;
};
export default createAppRouter;
