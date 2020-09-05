<template>
    <div class="container-fluid bg-color">
      <!-- Main Dashboard Content -->
      <!-- This v-if block shows the content only on the main dashboard page -->
      <div class="row my-2" v-if="currentRoute === '/gyalsung-reassessment-dashboard'">
        <!-- We can reuse some cards or create new ones specific to this role -->
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
  
        <!-- Gyalsung Profiles Card might be very relevant here -->
        <div class="col-md-12 mb-4">
          <GyalsungProfiles />
        </div>
  
        <div class="col-md-12 my-4">
          <SeverityCountsCard />
        </div>
      </div>
  
      <!-- TODO: Add child components for reassessment-specific routes later -->
      <!-- 
        Example of how you would add child pages:
        <div v-if="currentRoute === '/gyalsung-reassessment-dashboard/some-page'">
          <SomePageComponent />
        </div>
        <div v-if="currentRoute === '/gyalsung-reassessment-dashboard/another-page'">
          <AnotherPageComponent />
        </div>
      -->
  
      <footer class="footer">
        <div class="container text-center my-4">
          <p>&copy; {{ currentYear }} {{ websiteName }}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  </template>
  
  <script setup>
  import { computed, onMounted } from 'vue'
  import { useRoute } from 'vue-router'
  
  // Import the same card components for a consistent layout
  import QuickToolCard from '@/components/dashboards/CounsellorDashboardCard/QuickToolCard.vue'
  import ScreeningPrevYearCard from '@/components/dashboards/CounsellorDashboardCard/ScreeningPrevYearCard.vue'
  import ScreeningCurrentYearCard from '@/components/dashboards/CounsellorDashboardCard/ScreeningCurrentYearCard.vue'
  import SeverityCountsCard from '@/components/dashboards/CounsellorDashboardCard/SeverityCountsCard.vue'
  import GyalsungProfiles from '@/components/dashboards/GyalsungModel/GyalsungProfiles.vue'
  
  // Setup route and constants
  const route = useRoute()
  const currentRoute = computed(() => route.path)
  const currentYear = new Date().getFullYear()
  const websiteName = 'The PEMA HWSS'
  
  // TODO: Implement data fetching specific to the Gyalsung Reassessment Team
  const fetchDataForReassessment = async () => {
    console.log('Fetching data for Gyalsung Reassessment Team...')
    // try {
    //   // Example:
    //   // const response = await apiClient.get(endpoints.getReassessmentData);
    //   // ...process data
    // } catch (error) {
    //   console.error('Error fetching reassessment data:', error);
    // }
  }
  
  onMounted(() => {
    console.log('Gyalsung Reassessment Dashboard Mounted!')
    // Call the specific data fetching function for this dashboard
    fetchDataForReassessment()
  })
  </script>
  
  <style scoped>
  .bg-color {
    background-color: #f8f9fa;
  }
  .footer {
    margin-top: auto;
  }
  </style>