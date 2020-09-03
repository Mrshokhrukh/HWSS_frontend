import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import apiClient from '@/apiClient';
import endpoints from '@/api';
import NotFoundPage from '@/views/errorpages/pagenotfound404.vue';

// Define a reusable dashboard component
const DashboardView = () => import('@/views/Dashboard/DashboardView.vue');

// Helper function to capitalize the first letter of a string
const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// Define a function to generate routes for user dashboards
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
    // -------------------------- Student specific routes ---------------------------------------------------
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
    // -------------------------- Public specific routes ---------------------------------------------------
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
    // -------------------------- Counselor specific routes ---------------------------------------------------
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
      props: (route) => ({ flag: route.query.flag }) // Pass query parameter as prop to the component
    },
    // -------------------------- Admin specific routes ---------------------------------------------------
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
      // ========================== GYALSUNG MODEL ROUTES - ADD THIS SECTION ==========================
      {
        path: '/GyalsungModel/GyalsungRegister',
        name: 'gyalsung-register',
        component: DashboardView,
        meta: { title: 'Gyalsung Register', requiresAuth: true }
      },
      {
        path: '/gyalsungmodel/gyalsungregister',
        redirect: '/GyalsungModel/GyalsungRegister'
      },
      // ========================================================================================
      
      // Use route nesting to dynamically generate user dashboard routes
      ...generateDashboardRoutes('student'),
      ...generateDashboardRoutes('counselor'),
      ...generateDashboardRoutes('admin'),
      ...generateDashboardRoutes('public'),
      {
        path: '/:pathMatch(.*)*',
        name: 'NotFound', // Give a name to the 404 route
        component: NotFoundPage,
        meta: { title: 'Page Not Found' } // Add a title for the 404 page
      },
    ],
  });

  // Define constants for route names
  const ROUTE_LOGIN = 'login';

  // Helper function to clear authentication related local storage
  const clearAuthStorage = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('tokenExpiry');
    localStorage.removeItem('userDetailsStore');
    localStorage.removeItem('userType');
  };

  // Helper function to get user type from user details
  const getUserTypeFromDetails = (userDetailsStore) => {
    const role = userDetailsStore?.user?.role?.toLowerCase() || 'public';
    if (role.includes('admin')) {
      return 'admin';
    } else if (role.includes('_counselor')) {
      return 'counselor';
    } else if (role === 'student') {
      return 'student';
    } else {
      return 'public';
    }
  };

  // Global variable to store authentication status and user type
  let isUserAuthenticated = false;
  let cachedUserType = null;
  let tokenValidityChecked = false; // Flag to ensure token validity check only runs once per session

  router.beforeEach(async (to, from, next) => {
    document.title = to.meta.title ? `${to.meta.title} | Your App Name` : 'Your App Name'; // Dynamic title

    const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
    const authToken = localStorage.getItem('authToken');
    const tokenExpiry = localStorage.getItem('tokenExpiry');
    const isAuthenticatedInStorage = authToken !== null;
    const isTokenExpired = tokenExpiry && new Date(tokenExpiry) < new Date();

    // If token is expired, clear storage and redirect to login
    if (isAuthenticatedInStorage && isTokenExpired) {
      clearAuthStorage();
      isUserAuthenticated = false; // Update global state
      cachedUserType = null; // Clear cached user type
      tokenValidityChecked = false; // Reset the flag
      return next({ name: ROUTE_LOGIN });
    }

    // Attempt to validate token only if it hasn't been validated in the current session
    // and a token exists in storage. This avoids repeated API calls.
    if (isAuthenticatedInStorage && !isTokenExpired && !tokenValidityChecked) {
      try {
        const response = await apiClient.post(endpoints.authenticateToken, null, {
          headers: { 'Authorization': `Token ${authToken}` },
        });

        if (response.data.valid) {
          isUserAuthenticated = true;
          const userDetailsStore = JSON.parse(localStorage.getItem('userDetailsStore'));
          cachedUserType = getUserTypeFromDetails(userDetailsStore);
          localStorage.setItem('userType', cachedUserType); // Ensure userType is always set
        } else {
          clearAuthStorage();
          isUserAuthenticated = false;
          cachedUserType = null;
        }
        tokenValidityChecked = true; // Mark as checked for this session
      } catch (error) {
        console.error('Error validating token:', error);
        clearAuthStorage();
        isUserAuthenticated = false;
        cachedUserType = null;
        tokenValidityChecked = true; // Mark as checked even on error to prevent retry loops
        return next({ name: ROUTE_LOGIN });
      }
    } else if (!isAuthenticatedInStorage) {
      // If no token, ensure global state reflects unauthenticated
      isUserAuthenticated = false;
      cachedUserType = null;
      tokenValidityChecked = false; // Reset if user logs out or token is removed
    }

    // Redirection logic based on authentication status and route requirements
    if (requiresAuth) {
      if (!isUserAuthenticated) {
        // Redirect to login if authentication is required but user is not authenticated
        return next({ name: ROUTE_LOGIN });
      } else {
        // If authenticated and trying to access an authenticated route, proceed
        return next();
      }
    } else {
      // If the route does NOT require authentication
      if (isUserAuthenticated && to.name !== ROUTE_LOGIN && to.name !== 'register' && to.name !== 'forgot-password') {
        // If authenticated and trying to access a public page (but not login/register/forgot-password)
        // Redirect to their respective dashboard
        const currentUserType = localStorage.getItem('userType') || cachedUserType; // Prefer current if set
        if (currentUserType) {
          return next({ name: `${currentUserType}-dashboard` });
        }
      }
      // Allow access to other public routes or if not authenticated
      return next();
    }
  });

  return router;
};

export default createAppRouter;