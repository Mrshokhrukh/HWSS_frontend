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


  </div>
</template>


<script setup>
import { computed, onMounted } from "vue";
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


const route = useRoute();

const currentRoute = computed(() => route.path);

onMounted(async () => {
  // get user age group
  const response = await axios.get(endpoints.getSUDData);
  // if response positive then jsonify and save to local as SUD Data
  if (response.data.success) {
    localStorage.setItem('SUDData', JSON.stringify(response.data.data));
  }
});

onMounted(async () => {
  // get user age group
  const response = await axios.get(endpoints.getSUDData);
  if (response.data) {
    console.log(response.data);
    localStorage.setItem('SUDData', JSON.stringify(response.data));
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
</style>
