<!-- SchoolCounselorDashboard.vue -->
<template>
    <div>
      <div class="row my-2">
        <!-- Quick Tool Cards -->
        <div class="col-md-4 mb-4">
          <div class="card h-100">
            <div class="card-header">
              <ul class="nav nav-tabs card-header-tabs">
                <li class="nav-item">
                  <a class="nav-link active" id="quickToolTab" data-bs-toggle="tab" href="#quickToolContent">Quick Tool</a>
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
      <div v-if="isScreeningRoute" class="screening-dashboard">
        <CounselorScreening />
      </div>
  
      <!-- Monitor Dashboard View -->
      <div v-if="isMonitorRoute" class="screening-dashboard">
        <CounselorMonitor />
      </div>
  
      <!-- Rescreening Dashboard View -->
      <div v-if="isRescreeningRoute" class="screening-dashboard">
        <CounselorRescreening />
      </div>
  
      <!-- Reporting Dashboard View -->
      <div v-if="isReportingRoute" class="screening-dashboard">
        <CounselorReporting />
      </div>
  
      <!-- Help Dashboard View -->
      <div v-if="isHelpRoute" class="screening-dashboard">
        <CounselorHelp />
      </div>
  
      <!-- Settings Dashboard View -->
      <div v-if="isSettingsRoute" class="screening-dashboard">
        <CounselorSetting />
      </div>
  
      <!-- Flagged Reports View -->
      <div v-if="isFlaggedReportsRoute" class="screening-dashboard">
        <CounselorFlagReports :flag="flag" />
      </div>
    </div>
  </template>
  
  <script setup>
  import { computed } from 'vue';
  import QuickToolCard from './SchoolCounselorDashboardpage/QuickToolCard.vue';
  import ScreeningCurrentYearCard from './SchoolCounselorDashboardpage/ScreeningCurrentYearCard.vue';
  import ScreeningPrevYearCard from './SchoolCounselorDashboardpage/ScreeningPrevYearCard.vue';
  import SeverityCountsCard from './SchoolCounselorDashboardpage/SeverityCountsCard.vue';
  import CounselorScreening from '@/components/dashboards/counselorScreenings/CounselorScreening.vue';

  const props = defineProps({
    reportData: {
      type: Array,
      required: true
    },
    currentRoute: {
      type: String,
      default: ''
    },
    flag: {
      type: String,
      default: ''
    }
  });
  
  // Computed properties for route checks
  const isMainDashboard = computed(() => props.currentRoute === '/counselor-dashboard');
  const isScreeningRoute = computed(() => props.currentRoute === '/counselor-dashboard/counselor-screening');
  const isMonitorRoute = computed(() => props.currentRoute === '/counselor-dashboard/counselor-monitor');
  const isRescreeningRoute = computed(() => props.currentRoute === '/counselor-dashboard/counselor-rescreening');
  const isReportingRoute = computed(() => props.currentRoute === '/counselor-dashboard/counselor-reports');
  const isHelpRoute = computed(() => props.currentRoute === '/counselor-dashboard/counselor-help');
  const isSettingsRoute = computed(() => props.currentRoute === '/counselor-dashboard/counselor-settings');
  const isFlaggedReportsRoute = computed(() => props.currentRoute && props.currentRoute.includes('/counselor-dashboard/flagged-reports'));
  
  // Add any School Counselor specific logic here
  </script>