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
import { ref, computed, onMounted, provide } from "vue";
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
      console.error('Error parsing user details:', error);
    }
  }
};

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

const filteredData = computed(() => {
  let filtered;
  switch (userRole.value) {
    case 'school_counselor':
    case 'trained_professional':
    case 'gyalsung_counselor':
      filtered = mappedData.value.filter(user =>
        user.userDetails?.active_agency?.agency_name === agencyName.value
      );
      break;
    case 'clinical_counselor':
      filtered = mappedData.value.filter(user =>
        user.userDetails?.active_agency?.present_dzongkhag === userDzongkhag.value ||
        user.userDetails?.ps_add_dzongkhag === userDzongkhag.value ||
        user.sudData?.active?.ps_dzongkhag === userDzongkhag.value ||
        user.sudData?.lifetime?.ps_dzongkhag === userDzongkhag.value
      );
      break;
    default:
      filtered = [];
  }

  return filtered;
});

provide('filteredData', filteredData);

onMounted(async () => {
  getUserDetails();
  await fetchData();
});

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