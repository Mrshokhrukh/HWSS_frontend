<template>
  <div class="container-fluid bg-color">
    <div class="row my-2" v-if="currentRoute === '/counselor-dashboard'">
      <!-- Quick Tool Cards -->
      <div class="col-md-4 mb-4">
        <div class="card h-100">
          <div class="card-header">
            <ul class="nav nav-tabs card-header-tabs">
              <li class="nav-item">
                <a class="nav-link active" id="quickToolTab" data-bs-toggle="tab" href="#quickToolContent">Quick
                  Tool</a>
              </li>
            </ul>
          </div>
          <div class="card-body align-items-center bg-white d-flex">
            <div class="tab-content">
              <div class="tab-pane fade show active" id="quickToolContent" role="tabpanel"
                aria-labelledby="quickToolTab">
                <QuickToolCard />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Screening Cards -->
      <div class="col-md-4 mb-4">
        <div class="h-100">
          <ScreeningCurrentYearCard />
        </div>
      </div>

      <!-- Screening Cards -->
      <div class="col-md-4 mb-4">
        <div class="h-100">
          <ScreeningPrevYearCard />
        </div>
      </div>

      <!-- Severity Counts -->
      <div class="col-md-12 my-4">
        <SeverityCountsCard />
      </div>
    </div>

    <!-- Screening Dashboard View -->
    <div v-if="currentRoute === '/counselor-dashboard/counselor-screening'" class="screening-dashboard">
      <CounselorScreening />
    </div>

    <!-- Screening Dashboard View -->
    <div v-if="currentRoute === '/counselor-dashboard/counselor-monitor'" class="screening-dashboard">
      <CounselorMonitor />
    </div>

    <!-- Screening Dashboard View -->
    <div v-if="currentRoute === '/counselor-dashboard/counselor-rescreening'" class="screening-dashboard">
      <CounselorRescreening />
    </div>

    <!-- Reporting Dashboard View -->
    <div v-if="currentRoute === '/counselor-dashboard/counselor-reports'" class="screening-dashboard">
      <CounselorReporting />
    </div>

    <!-- Reporting Dashboard View -->
    <div v-if="currentRoute === '/counselor-dashboard/counselor-help'" class="screening-dashboard">
      <CounselorHelp />
    </div>

    <!-- Reporting Dashboard View -->
    <div v-if="currentRoute === '/counselor-dashboard/counselor-settings'" class="screening-dashboard">
      <CounselorSetting />
    </div>

    <!-- Reporting Dashboard View -->
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
import { ref, computed, onMounted, watch, provide } from "vue";
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

// Dynamically get the current year
const currentYear = new Date().getFullYear();
const websiteName = "The PEMA HWSS";


const sudData = ref(null);
const assistMeasurementData = ref(null);
const measurementData = ref(null);
const userRole = ref(null);
const agencyName = ref(null);
const mappedData = ref([]);
const userDzongkhag = ref(null);

const fetchData = async () => {
  try {
    const [assistMeasurementResponse, measurementResponse, sudResponse] = await Promise.all([
      axios.get(endpoints.getAssistMeasurement),
      axios.get(endpoints.getMeasurement),
      axios.get(endpoints.getSUDData)
    ]);

    assistMeasurementData.value = assistMeasurementResponse.data;
    measurementData.value = measurementResponse.data;
    sudData.value = sudResponse.data;

    console.log('Assist Measurement Data:', assistMeasurementData.value);
    console.log('Measurement Data:', measurementData.value);
    console.log('SUD Data:', sudData.value);

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
      userDzongkhag.value = userDetails.user.psAddDzongkhag; // Assuming this is the correct field
      console.log('User Role:', userRole.value);
      console.log('Agency Name:', agencyName.value);
      console.log('User Dzongkhag:', userDzongkhag.value);
    } catch (error) {
      console.error('Error parsing user details:', error);
    }
  } else {
    console.log('User details not found in local storage');
  }
};

const mapData = () => {
  const userMap = new Map();

  // Helper function to get or create a user entry
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

  // Map measurement data
  measurementData.value.forEach(item => {
    const user = getOrCreateUser(item.measurement.user);
    user.measurement = item.measurement;
    user.userDetails = item.user_details;
  });

  // Map measurement assist data
  assistMeasurementData.value.forEach(item => {
    const user = getOrCreateUser(item.measurement_assist.user);
    user.measurementAssist = item.measurement_assist;
    if (!user.userDetails) {
      user.userDetails = item.user_details;
    }
  });

  // Map SUD data
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
  console.log('Mapped Data:', mappedData.value);
};

const filteredData = computed(() => {
  console.log('Filtering data for role:', userRole.value);
  console.log('User Agency Name:', agencyName.value);
  console.log('User Dzongkhag:', userDzongkhag.value);
  
  let filtered;
  switch(userRole.value) {
    case 'school_counselor':
    case 'trained_professional':
    case 'gyalsung_counselor':
      filtered = mappedData.value.filter(user => 
        user.userDetails?.active_agency?.agency_name === agencyName.value
      );
      console.log(`Filtered ${filtered.length} users for ${userRole.value} based on agency name`);
      break;
    case 'clinical_counselor':
      filtered = mappedData.value.filter(user => 
        user.userDetails?.active_agency?.present_dzongkhag === userDzongkhag.value ||
        user.userDetails?.ps_add_dzongkhag === userDzongkhag.value ||
        user.sudData?.active?.ps_dzongkhag === userDzongkhag.value ||
        user.sudData?.lifetime?.ps_dzongkhag === userDzongkhag.value
      );
      console.log(`Filtered ${filtered.length} users for clinical_counselor based on dzongkhag`);
      break;
    default:
      filtered = [];
      console.log('No matching role, returning empty array');
  }
  
  // Log a sample of filtered data (first 3 items)
  console.log('Filtered data sample:', filtered.slice(0, 3));
  
  return filtered;
});

const validateFilteredData = () => {
  console.log('Validating filtered data...');
  const totalUsers = mappedData.value.length;
  const filteredUsers = filteredData.value.length;
  
  console.log(`Total users: ${totalUsers}`);
  console.log(`Filtered users: ${filteredUsers}`);
  
  if (userRole.value === 'clinical_counselor') {
    const uniqueDzongkhags = new Set(filteredData.value.map(user => user.userDetails?.active_agency?.present_dzongkhag));
    console.log('Unique Dzongkhags in filtered data:', Array.from(uniqueDzongkhags));
    if (uniqueDzongkhags.size > 1) {
      console.warn('Warning: Multiple Dzongkhags found for clinical_counselor');
    }
  } else if (['school_counselor', 'trained_professional', 'Gyalsung Counselor'].includes(userRole.value)) {
    const uniqueAgencies = new Set(filteredData.value.map(user => user.userDetails?.active_agency?.agency_name));
    console.log('Unique Agencies in filtered data:', Array.from(uniqueAgencies));
    if (uniqueAgencies.size > 1) {
      console.warn('Warning: Multiple Agencies found for school_counselor/trained_professional/Gyalsung Counselor');
    }
  }
  
  console.log('Validation complete');
};

// Provide filteredData to descendant components
provide('filteredData', filteredData);
// Watch for changes in filteredData and validate
watch(filteredData, validateFilteredData);

onMounted(async () => {
  console.log('Component mounted');
  getUserDetails();
  await fetchData();
  validateFilteredData(); // Initial validation after data is fetched
});

// Expose variables and functions
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
