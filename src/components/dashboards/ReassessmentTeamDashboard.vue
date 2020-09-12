<template>
  <div class="container-fluid bg-color page-container">
    <div class="main-content-area">
      <transition name="fade" mode="out-in">
        <!-- 
          THIS IS THE LINE TO CHANGE. 
          Add :key="$route.fullPath" to force a re-render on navigation.
        -->
        <component :is="activeComponent" :key="$route.fullPath" />
      </transition>
    </div>
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

import ReassessmentDashboard from './GyalsungReassementTeam/ReassessmentDashboard.vue'
import ReassessmentList from './GyalsungReassementTeam/ReassessmentList.vue'
import Monitoring from './GyalsungReassementTeam/Monitoring.vue'
import ReassessmentReports from './GyalsungReassementTeam/ReassessmentReports.vue'
import ReassessmentScreeningTracking from './GyalsungReassementTeam/ReassessmentScreeningTracking.vue'
import TransfersAndHandover from './GyalsungReassementTeam/TransfersAndHandover.vue'

const route = useRoute()
const currentYear = new Date().getFullYear()
const websiteName = 'The PEMA HWSS'
const activeComponent = computed(() => {
  switch (route.name) {
    case 'reassessment-list':
      return ReassessmentList
    case 'reassessment-monitoring':
      return Monitoring
    case 'reassessment-reports':
      return ReassessmentReports
    case 'reassessment-tracking':
      return ReassessmentScreeningTracking
    case 'reassessment-transfers':
      return TransfersAndHandover
    case 'reassessment-dashboard': 
    default:
      return ReassessmentDashboard
  }
})

onMounted(() => {
  console.log('Reassessment Team Dashboard Layout Mounted!')
})
</script>

<style scoped>
.bg-color {
  background-color: #f8f9fa;
}

.page-container {
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 56px); 
}

.main-content-area {
  flex-grow: 1; 
  padding: 1rem;
}

.footer {
  margin-top: auto; 
  flex-shrink: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>