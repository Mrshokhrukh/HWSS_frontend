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
          <div class="col-12" v-if="router === '/screening'">
            <ScreeningTest />
          </div>
          <div class="col-12" v-else>
            <dashboardComponent />
          </div>
        </div>
      </main>
    </div>
  </div>
</template>


<script setup>
import { computed, ref, onMounted } from 'vue';
import SideNavbar from '@/components/navbar/SideNavbar.vue';
import StudentDashboard from '@/components/dashboards/StudentDashboard.vue';
import CounsellorDashboard from '@/components/dashboards/CounsellorDashboard.vue';
import AdminDashboard from '@/components/dashboards/AdminDashboard.vue';
import ScreeningTest from '@/components/screenings/ScreeningTest.vue'
import axios from 'axios';
import endpoints from '@/api';
import { useRouter } from 'vue-router';


const router = useRouter();

const sidebarOpen = ref(false);
const userName = ref('');

const dashboardComponent = computed(() => {
  const role = sessionStorage.getItem('userRole');
  console.log('User Role:', role);

  switch (role) {
    case 'student':
      console.log('Loading Student Dashboard');
      return StudentDashboard;
    case 'school_counselor':
      console.log('Loading Counsellor Dashboard');
      return CounsellorDashboard;
    default:
      console.log('Loading Admin Dashboard');
      return AdminDashboard;
  }
});

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value;
};

// Fetch user, agency, and user agency details and store them in sessionStorage
const fetchUserAndAgencyDetails = async () => {
  try {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      alert('User not Authenticated. Redirecting to login.');
      router.push('/login');
    }

    const response = await axios.get(endpoints.getUserDetails, {
      headers: {
        Authorization: `Token ${authToken}`,
      },
    });

    const data = response.data;

    if (data.user && data.agency && data.userAgency) {
      sessionStorage.setItem('userDetails', JSON.stringify(data.user));
      sessionStorage.setItem('agencyDetails', JSON.stringify(data.agency));
      sessionStorage.setItem('userAgencyDetails', JSON.stringify(data.userAgency));

      console.log('User details fetched successfully:', data.user);

      let userFullName = JSON.parse(sessionStorage.getItem('userDetails'));

      userFullName = `${data.user[0].first_name} ${data.user[0].middle_name} ${data.user[0].last_name}`;
      console.log('User Name is:', userName)

      userName.value = userFullName
    } else {
      console.error('Error: Incomplete user, agency, or user agency details in response');
    }
  } catch (error) {
    console.error('Error fetching user details:', error);
  }
};


// Call fetchUserAndAgencyDetails when the component is mounted
onMounted(fetchUserAndAgencyDetails);
</script>

<style scoped>
/* Add any additional styles if needed */
</style>
