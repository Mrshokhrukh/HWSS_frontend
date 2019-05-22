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
import { ref, computed, onMounted } from "vue";
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

// Dynamically populate website name
const websiteName = "The PEMA HWSS";
const sudData = ref(null);

const userDetailsInLocal = () => {
  const userDetails = JSON.parse(localStorage.getItem('userDetailsStore'));
  if (userDetails) {
    const agencyName = userDetails.agency ? userDetails.agency.agencyName : null;
    return agencyName;
  }
  return null;
}

const fetchReportData = async () => {
  try {
    console.log('function is triggered from counselor dashboard😊')
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
      const userAgencyName = userDetails.agencyName ? userDetails.agencyName : null;

      const reportResponse = await axios.get(endpoints.getReport);
      if (reportResponse.data) {
        let reportItems = reportResponse.data;

        if (userAgencyName) {
          // Find the first item in the response data based on agency_name
          reportItems = reportItems.filter(item => {
            if (item.agency_name) {
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
        }

        if (reportItems.length > 0) {
          // Set the found items to reportData
          reportData.value = reportItems;
          sessionStorage.setItem('reportData', JSON.stringify(reportData.value));
          sessionStorage.setItem('reportDataTimestamp', currentTime.toString());
        }
      }
    }
  } catch (error) {
    console.error(error);
  }
};

    
onMounted(async () => {

  fetchReportData;

    try {
        const sudResponse = await axios.get(endpoints.getSUDData);
        if (sudResponse.data.success) {
            localStorage.setItem('SUDData', JSON.stringify(sudResponse.data.data));
            sudData.value = sudResponse.data.data;
        }
    } catch (error) {
        console.error("Error fetching data:", error);
    }
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
