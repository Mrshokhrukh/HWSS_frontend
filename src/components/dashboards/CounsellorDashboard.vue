<template>
  <div class="container-fluid bg-color">
    <div class="row py-5">
      <!-- Quick Tool Cards -->
      <div class="col-md-4 mb-4">
        <div class="card">
          <div class="card-header bg-light">
            <ul class="nav nav-tabs card-header-tabs">
              <li class="nav-item">
                <a class="nav-link active" id="quickToolTab" data-bs-toggle="tab" href="#quickToolContent">Quick
                  Tool</a>
              </li>
            </ul>
          </div>
          <div class="card-body">
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
      <div class="col-md-12 mt-4">
        <SeverityCountsCard />
      </div>

      <!-- Suicidal Behaviour Card -->
      <div class="col-md-6 mt-4">
        <div class="card h-100">
          <div class="card-body">
            <SuicidalBehaviourCard />
          </div>
        </div>
      </div>

      <!-- Graph Card -->
      <div class="col-md-6 mt-4">
        <div class="h-100">
          <GraphCard />
        </div>
      </div>

    </div>
  </div>
</template>

    
<script setup>
import GraphCard from '@/components/dashboards/CounsellorDashboardCard/GraphCard.vue';
import QuickToolCard from '@/components/dashboards/CounsellorDashboardCard/QuickToolCard.vue';
import ScreeningPrevYearCard from '@/components/dashboards/CounsellorDashboardCard/ScreeningPrevYearCard.vue';
import ScreeningCurrentYearCard from '@/components/dashboards/CounsellorDashboardCard/ScreeningCurrentYearCard.vue';
import SeverityCountsCard from '@/components/dashboards/CounsellorDashboardCard/SeverityCountsCard.vue';
import SuicidalBehaviourCard from '@/components/dashboards/CounsellorDashboardCard/SuicidalBehaviourCard.vue';

</script>
    
<style scoped>
.nav-link {
  color: #2B656F !important;
}

.nav-link.active {
  border-color: #2B656F;
}
</style>
