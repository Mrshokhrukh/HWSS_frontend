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
              <div class="tab-pane fade show active" id="quickToolContent" role="tabpanel" aria-labelledby="quickToolTab">
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


  </div>
</template>

    
<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import QuickToolCard from '@/components/dashboards/CounsellorDashboardCard/QuickToolCard.vue';
import ScreeningPrevYearCard from '@/components/dashboards/CounsellorDashboardCard/ScreeningPrevYearCard.vue';
import ScreeningCurrentYearCard from '@/components/dashboards/CounsellorDashboardCard/ScreeningCurrentYearCard.vue';
import SeverityCountsCard from '@/components/dashboards/CounsellorDashboardCard/SeverityCountsCard.vue';
import CounselorScreening from '@/components/dashboards/counselorScreenings/CounselorScreening.vue';


const route = useRoute();

const currentRoute = computed(() => route.path);

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
