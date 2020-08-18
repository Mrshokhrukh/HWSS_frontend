<template>
  <div class="container-fluid bg-color">
    <div class="row my-2" v-if="currentRoute === '/counselor-dashboard'">

      <div class="col-md-4 mb-4">
        <div class="h-100">
          <QuickToolCard />
        </div>
      </div>

      <div class="col-md-4 mb-4">
        <div class="h-100">
          <ScreeningCurrentYearCard />
        </div>
      </div>

      <div class="col-md-4 mb-4">
        <div class="h-100">
          <ScreeningPrevYearCard />
        </div>
      </div>

      <div class="col-md-12 my-4">
        <SeverityCountsCard />
      </div>
    </div>

    <div v-if="currentRoute === '/counselor-dashboard/counselor-screening'" class="screening-dashboard">
      <CounselorScreening />
    </div>

    <div v-if="currentRoute === '/counselor-dashboard/counselor-monitor'" class="screening-dashboard">
      <CounselorMonitor />
    </div>

    <div v-if="currentRoute === '/counselor-dashboard/counselor-rescreening'" class="screening-dashboard">
      <CounselorRescreening />
    </div>

    <div v-if="currentRoute === '/counselor-dashboard/counselor-reports'" class="screening-dashboard">
      <CounselorReporting />
    </div>

    <div v-if="currentRoute === '/counselor-dashboard/counselor-help'" class="screening-dashboard">
      <CounselorHelp />
    </div>

    <div v-if="currentRoute === '/counselor-dashboard/counselor-settings'" class="screening-dashboard">
      <CounselorSetting />
    </div>

    <div v-if="currentRoute.includes('/counselor-dashboard/flagged-reports')" class="screening-dashboard">
      <CounselorFlagReports :flag="flag" />
    </div>

    <footer class="footer">
      <div class="container text-center my-4">
        <p>&copy; {{ currentYear }} {{ websiteName }}. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, provide, watch } from "vue"; // Added watch
import { useRoute } from "vue-router";
import axios from "axios";
import endpoints from "@/api";
import QuickToolCard from '@/components/dashboards/CounsellorDashboardCard/QuickToolCard.vue';
import ScreeningPrevYearCard from '@/components/dashboards/CounsellorDashboardCard/ScreeningPrevYearCard.vue';
import ScreeningCurrentYearCard from '@/components/dashboards/CounsellorDashboardCard/ScreeningCurrentYearCard.vue';
import SeverityCountsCard from '@/components/dashboards/CounsellorDashboardCard/SeverityCountsCard.vue';
import CounselorScreening from '@/components/dashboards/counselorScreenings/CounselorScreening.vue';
import CounselorRescreening from '@/components/dashboards/counselorRescreenings/CounselorRescreening.vue';
import CounselorReporting from '@/components/dashboards/counselorReporting/CounselorReporting.vue';
import CounselorMonitor from '@/components/dashboards/counselorMonitor/CounselorMonitor.vue';
import CounselorHelp from '@/components/dashboards/counselorHelp/CounselorHelp.vue';
import CounselorSetting from '@/components/dashboards/counselorSetting/CounselorSetting.vue';
import CounselorFlagReports from '@/components/dashboards/counselorReporting/CounselorFlagReports.vue';

const route = useRoute();
const currentRoute = computed(() => route.path);
const flag = computed(() => route.query.flag);
const currentYear = new Date().getFullYear();
const websiteName = "The PEMA HWSS";

const sudData = ref(null);
const assistMeasurementData = ref(null);
const measurementData = ref(null);
const userRole = ref(null);
const agencyName = ref(null);
const mappedData = ref([]);
const userDzongkhag = ref(null);

// MODIFIED: This function now uses server-side filtering for much better performance.
const fetchData = async () => {
  try {
    // 1. Get user role and agency/dzongkhag first.
    // The getUserDetails function has already been called in onMounted.
    let params = {};
    
    // 2. Build the query parameters based on user role.
    switch (userRole.value) {
      case 'school_counselor':
      case 'trained_professional':
      case 'gyalsung_counselor':
        if (agencyName.value) {
          params.agency_name = agencyName.value;
        }
        break;
      case 'clinical_counselor':
        if (userDzongkhag.value) {
          // Assuming your backend can handle a 'dzongkhag' parameter.
          // If not, this part needs backend adjustment.
          params.dzongkhag = userDzongkhag.value;
        }
        break;
      default:
        // For other roles, send no parameters to get all data.
        break;
    }
    
    // 3. Fetch data from endpoints with the new parameters.
    const [assistMeasurementResponse, measurementResponse, sudResponse] = await Promise.all([
      axios.get(endpoints.getAssistMeasurement, { params }),
      axios.get(endpoints.getMeasurement, { params }),
      axios.get(endpoints.getSUDData, { params })
    ]);

    assistMeasurementData.value = assistMeasurementResponse.data;
    measurementData.value = measurementResponse.data;
    sudData.value = sudResponse.data;

    mapData();
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};

const getUserDetails = () => {
  const userDetailsString = localStorage.getItem('userDetailsStore');
  if (userDetailsString) {
    try {
      const userDetails = JSON.parse(userDetailsString);
      userRole.value = userDetails.user.role;
      agencyName.value = userDetails.agency.agencyName;
      userDzongkhag.value = userDetails.user.psAddDzongkhag;
    } catch (error) {
      console.error('Error parsing user details:', error)
    };
    }
  }

const mapData = () => {
  const userMap = new Map();

  const getOrCreateUser = (userId) => {
    if (!userMap.has(userId)) {
      userMap.set(userId, {
        userId,
        measurement: null,
        measurementAssist: null,
        sudData: { lifetime: null, active: null },
        userDetails: null
      });
    }
    return userMap.get(userId);
  };

  measurementData.value.forEach(item => {
    const user = getOrCreateUser(item.measurement.user);
    user.measurement = item.measurement;
    user.userDetails = item.user_details;
  });

  assistMeasurementData.value.forEach(item => {
    const user = getOrCreateUser(item.measurement_assist.user);
    user.measurementAssist = item.measurement_assist;
    if (!user.userDetails) {
      user.userDetails = item.user_details;
    }
  });

  if (sudData.value) {
    sudData.value.lifetime_users.forEach(user => {
      const mappedUser = getOrCreateUser(user.user_id);
      mappedUser.sudData.lifetime = user;
    });
    sudData.value.active_users.forEach(user => {
      const mappedUser = getOrCreateUser(user.user_id);
      mappedUser.sudData.active = user;
    });
  }

  mappedData.value = Array.from(userMap.values());
};

// MODIFIED: Since the server now does the filtering, this computed property is much simpler.
// It just returns the data that has already been mapped.
const filteredData = computed(() => mappedData.value);

provide('filteredData', filteredData);

// MODIFIED: The onMounted hook now only gets the user details once.
// The data fetch is handled by the new watcher below.
onMounted(() => {
  getUserDetails();
});

// NEW: This watcher replaces the onMounted call for fetchData.
// It will re-run the fetch every time you navigate to a different page.
watch(
  () => route.path,
  (newPath, oldPath) => {
    if (newPath !== oldPath) {
      fetchData();
    }
  },
  {
    immediate: true // This runs the fetch on initial load
  }
);


defineExpose({
  sudData,
  assistMeasurementData,
  measurementData,
  userRole,
  agencyName,
  mappedData,
  filteredData,
  fetchData,
  getUserDetails,
});
</script>

<style scoped>
.nav-link {
  color: #2B656F !important;
  border-radius: 20px 50px 0 0;
  margin-left: 0;
}

.nav-link.active {
  border-color: #2B656F;
}

.header {
  height: 8rem;
}

.footer {
  margin-top: auto;
}
</style>