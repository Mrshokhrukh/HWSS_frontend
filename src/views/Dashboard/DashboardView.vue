<template>
  <div class="container-fluid">
    <div class="row">
      <!-- Sidebar -->
      <aside class="col-lg-2 col-md-2 col-sm-12 px-0" :class="{ 'sidebar-open': sidebarOpen }">
        <SideNavbar :sidebarActive="sidebarOpen" @toggleSidebar="toggleSidebar" />
      </aside>

      <!-- Main Content -->
      <main class="col-lg-10 col-md-10 col-sm-12">
        <div class="row">
          <!-- Dashboard Component -->
          <div class="col-12">
            <component :is="currentComponent"></component>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import SideNavbar from '@/components/navbar/SideNavbar.vue';
import StudentDashboard from '@/components/dashboards/StudentDashboard.vue';
import CounsellorDashboard from '@/components/dashboards/CounsellorDashboard.vue';
import AdminDashboard from '@/components/dashboards/AdminDashboard.vue';
import ScreeningTest from '@/components/screenings/ScreeningTest.vue';
import axios from 'axios';
import endpoints from '@/api';
import { useRouter } from 'vue-router';
import { useUserDetailsStore } from '@/stores/userDetails';

const router = useRouter();
const sidebarOpen = ref(false);
const currentRoute = ref(router.currentRoute.value.path);

const userDetailsStore = useUserDetailsStore();

const dashboardComponent = computed(() => {
  // Use role from Pinia store
  const role = userDetailsStore.userRole;

  switch (role) {
    case 'student':
      return StudentDashboard;
    case 'school_counselor':
    case 'clinical_counselor':
      return CounsellorDashboard;
    case 'admin':
      return AdminDashboard;
    default:
      return null;
  }
});

const currentComponent = computed(() => {
  return currentRoute.value === '/student-dashboard/screening' ? ScreeningTest : dashboardComponent.value;
});

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value;
};

/// Fetch user, agency, and user agency details and store them directly in Pinia
const fetchUserAndAgencyDetails = async () => {
  try {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      alert('User not Authenticated. Redirecting to login.');
      router.push('/login');
      return; // Stop further execution if not authenticated
    }

    const response = await axios.get(endpoints.getUserDetails, {
      headers: {
        Authorization: `Token ${authToken}`,
      },
    });

    const { data } = response;

    // Directly using the store to set user details including role, profile picture, and agency details
    userDetailsStore.setUserDetails({
      fullName: `${data.user.first_name} ${data.user.middle_name || ''} ${data.user.last_name}`,
      profilePicture: data.user.profile_picture,
      userRole: data.user.role, // Assuming you have a mechanism to set and get roles in your store
      agencyDetails: data.agency,
      userAgencyDetails: data.userAgency
    });

  } catch (error) {
    console.error('Error fetching user details:', error);
  }
};

// Watch for route changes
const updateCurrentRoute = () => {
  currentRoute.value = router.currentRoute.value.path;
};

onMounted(() => {
  updateCurrentRoute();
  router.afterEach(updateCurrentRoute);
  fetchUserAndAgencyDetails();
});
</script>



<style scoped>
/* Add any additional styles if needed */
</style>
