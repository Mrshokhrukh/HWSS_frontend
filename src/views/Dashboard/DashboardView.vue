<template>
  <div class="container-fluid">
    <div class="row">
      <!-- Sidebar -->
      <aside class="col-lg-2 col-md-2 col-sm-12 px-0" :class="{ 'sidebar-open': sidebarOpen }">
        <SideNavbar :sidebarActive="sidebarOpen" @toggleSidebar="toggleSidebar" />
      </aside>

      <!-- Main Content with Top Navbar -->
      <main class="col-10">
        <!-- Top Navbar -->
        <div class="container-fluid">
          <div class="row">
            <div class="col-12 mb-4 mt-3 card bg-light"
              v-if="currentComponent === CounsellorDashboard || currentComponent === AdminDashboard">
              <TopNavbarCard />
            </div>
            <div class="col-12 mb-4"
              v-if="currentComponent === StudentDashboard || currentComponent === PublicDashboard">
              <HelplineServices />
            </div>
          </div>
        </div>

        <!-- Main Content -->
        <div class="row">
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
import axios from 'axios';
import endpoints from '@/api';
import { useUserDetailsStore } from '@/stores/userDetails';

// Components
import SideNavbar from '@/components/navbar/SideNavbar.vue';
import StudentDashboard from '@/components/dashboards/StudentDashboard.vue';
import PublicDashboard from '@/components/dashboards/PublicDashboard.vue';
import CounsellorDashboard from '@/components/dashboards/CounsellorDashboard.vue';
import AdminDashboard from '@/components/dashboards/AdminDashboard.vue';
import TopNavbarCard from '@/components/navbar/TopNavbarCard.vue';
import HelplineServices from "@/components/dashboards/screenings/screeningCards/HelplineServices.vue";

// Refs
const sidebarOpen = ref(false);
const reportData = ref([]);

// Store
const userDetailsStore = useUserDetailsStore();

// Computed
const currentComponent = computed(() => {
  const role = userDetailsStore.user.role.toLowerCase().replace(/\s+/g, '-');

  switch (role) {
    case 'student':
      return StudentDashboard;
    case 'school_counselor':
    case 'clinical_counselor':
    case 'trained_professional':
      return CounsellorDashboard;
    case 'mh_admin':
    case 'sud_admin':
    case 'aaa_admin':
    case 'rd_admin':
      return AdminDashboard;
    default:
      return PublicDashboard;
  }
});

// Methods
const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value;
};

const userDetailsInLocal = () => {
  const currentUserAgencyName =  JSON.parse(localStorage.getItem('userDetailsStore'));
  return currentUserAgencyName ? currentUserAgencyName.agency.agencyName : null;
}

console.log('user aency name in local:', userDetailsInLocal())

const fetchReportData = async () => {
  try {
    const storedData = sessionStorage.getItem('reportData');
    const storedTimestamp = sessionStorage.getItem('reportDataTimestamp');
    const currentTime = new Date().getTime();
    if (storedData && storedTimestamp) {
      const dataAge = currentTime - parseInt(storedTimestamp);
      const maxDataAge = 600000; // 10 minutes

      if (dataAge < maxDataAge) {
        reportData.value = JSON.parse(storedData);
        return;
      }
    }

    const userDetails = userDetailsInLocal();
    if (userDetails) {
      const userAgencyName = userDetails.toLowerCase();

      const reportResponse = await axios.get(endpoints.getReport);
      if (reportResponse.data) {
        // alert('response received')
        console.log(reportResponse.data)
        // Find the first item in the response data based on agency_name
        const foundItem = reportResponse.data.find(item => {
          // Access agency_name directly if it exists
          if (item.agency_name) {
            console.log(item.agency_name)
            return item.agency_name.toLowerCase() === userAgencyName;
          }
          for (const key in item) {
            if (
              typeof item[key] === 'object' &&
              item[key].agency_name &&
              typeof item[key].agency_name === 'string'
            ) {
              return item[key].agency_name.toLowerCase() === userAgencyName;
            }
          }
          return false;
        });
        
        if (foundItem) {
          // Set the found item to reportData
          reportData.value = [foundItem];
          sessionStorage.setItem('reportData', JSON.stringify(reportData.value));
          sessionStorage.setItem('reportDataTimestamp', currentTime.toString());
        }
      }
    }
  } catch (error) {
    console.error(error);
  }
};


// Lifecycle hook
onMounted(fetchReportData);

</script>
