<template>
  <div class="container-fluid bg-color">
    <!-- Main Dashboard Content -->
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

      <!-- Gyalsung Profiles Card -->
      <div class="col-md-12 mb-4">
        <GyalsungProfiles />
      </div>

      <div class="col-md-12 my-4">
        <SeverityCountsCard />
      </div>
    </div>

    <!-- Gyalsung Register Route -->
    <div v-if="showGyalsungRegister" class="gyalsung-register">
      <GyalsungRegister />
    </div>

    <!-- Gyalsung Screening Route - ADD THIS SECTION -->
    <div v-if="showGyalsungScreening" class="gyalsung-screening">
      <GyalsungScreening />
    </div>

<!-- Gyalsung Reports Route -->
    <div v-if="showGyalsungReports" class="gyalsung-reports">
  <GyalsungReports />
</div>

    <!-- Other Routes -->
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
import { ref, computed, onMounted, provide, watch } from 'vue'
import { useRoute } from 'vue-router'
import apiClient from '@/apiClient'
import endpoints from '@/api'
import QuickToolCard from '@/components/dashboards/CounsellorDashboardCard/QuickToolCard.vue'
import ScreeningPrevYearCard from '@/components/dashboards/CounsellorDashboardCard/ScreeningPrevYearCard.vue'
import ScreeningCurrentYearCard from '@/components/dashboards/CounsellorDashboardCard/ScreeningCurrentYearCard.vue'
import SeverityCountsCard from '@/components/dashboards/CounsellorDashboardCard/SeverityCountsCard.vue'
import GyalsungProfiles from '@/components/dashboards/GyalsungModel/GyalsungProfiles.vue'
import CounselorScreening from '@/components/dashboards/counselorScreenings/CounselorScreening.vue'
import CounselorRescreening from '@/components/dashboards/counselorRescreenings/CounselorRescreening.vue'
import CounselorReporting from '@/components/dashboards/counselorReporting/CounselorReporting.vue'
import CounselorMonitor from '@/components/dashboards/counselorMonitor/CounselorMonitor.vue'
import CounselorHelp from '@/components/dashboards/counselorHelp/CounselorHelp.vue'
import CounselorSetting from '@/components/dashboards/counselorSetting/CounselorSetting.vue'
import CounselorFlagReports from '@/components/dashboards/counselorReporting/CounselorFlagReports.vue'
import GyalsungRegister from '@/components/dashboards/GyalsungModel/GyalsungRegister.vue'
import GyalsungScreening from '@/components/dashboards/GyalsungModel/GyalsungScreening.vue' 


const route = useRoute()
const currentRoute = computed(() => route.path)
const flag = computed(() => route.query.flag)
const currentYear = new Date().getFullYear()
const websiteName = 'The PEMA HWSS'

// Debug mode - set to false in production
const showDebugInfo = ref(true)

// Enhanced computed property for Gyalsung Register visibility
const showGyalsungRegister = computed(() => {
  const path = currentRoute.value.toLowerCase()
  const gyalsungRoutes = [
    '/gyalsungmodel/gyalsungregister',
    '/GyalsungModel/GyalsungRegister',
    '/gyalsung/register',
    '/counselor-dashboard/gyalsung-register'
  ]
  
  return gyalsungRoutes.some(routePath => 
    path === routePath.toLowerCase() || 
    path.includes(routePath.toLowerCase())
  )
})


const showGyalsungScreening = computed(() => {
  const path = currentRoute.value.toLowerCase()
  const gyalsungScreeningRoutes = [
    '/gyalsungmodel/gyalsungscreening',
    '/GyalsungModel/GyalsungScreening',
    '/gyalsung/screening',
    '/counselor-dashboard/gyalsung-screening'
  ]

  
  return gyalsungScreeningRoutes.some(routePath => 
    path === routePath.toLowerCase() || 
    path.includes(routePath.toLowerCase())
  )
})

const showGyalsungReports = computed(() => {
  const path = currentRoute.value.toLowerCase()
  const gyalsungReportsRoutes = [
    '/gyalsungmodel/gyalsungreports',
    '/GyalsungModel/GyalsungReports',
    '/gyalsung/reports',
    '/GyalsungModel/gyalsung-reports'
  ]
  
  return gyalsungReportsRoutes.some(routePath => 
    path === routePath.toLowerCase() || 
    path.includes(routePath.toLowerCase())
  )
})

const sudData = ref(null)
const assistMeasurementData = ref(null)
const measurementData = ref(null)
const userRole = ref(null)
const agencyName = ref(null)
const mappedData = ref([])
const userDzongkhag = ref(null)

const fetchData = async () => {
  try {
    let params = {}

    switch (userRole.value) {
      case 'school_counselor':
      case 'trained_professional':
      case 'gyalsung_counselor':
        if (agencyName.value) {
          params.agency_name = agencyName.value
        }
        break
      case 'clinical_counselor':
        if (userDzongkhag.value) {
          params.dzongkhag = userDzongkhag.value
        }
        break
      default:
        break
    }

    const [assistMeasurementResponse, measurementResponse, sudResponse] = await Promise.all([
      apiClient.get(endpoints.getAssistMeasurement, { params }),
      apiClient.get(endpoints.getMeasurement, { params }),
      apiClient.get(endpoints.getSUDData, { params })
    ])

    assistMeasurementData.value = assistMeasurementResponse.data
    measurementData.value = measurementResponse.data
    sudData.value = sudResponse.data

    mapData()
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}

const getUserDetails = () => {
  const userDetailsString = localStorage.getItem('userDetailsStore')
  if (userDetailsString) {
    try {
      const userDetails = JSON.parse(userDetailsString)
      userRole.value = userDetails.user.role
      agencyName.value = userDetails.agency.agencyName
      userDzongkhag.value = userDetails.user.psAddDzongkhag
    } catch (error) {
      console.error('Error parsing user details:', error)
    }
  }
}

const mapData = () => {
  const userMap = new Map()

  const getOrCreateUser = (userId) => {
    if (!userMap.has(userId)) {
      userMap.set(userId, {
        userId,
        measurement: null,
        measurementAssist: null,
        sudData: { lifetime: null, active: null },
        userDetails: null
      })
    }
    return userMap.get(userId)
  }

  measurementData.value.forEach((item) => {
    const user = getOrCreateUser(item.measurement.user)
    user.measurement = item.measurement
    user.userDetails = item.user_details
  })

  assistMeasurementData.value.forEach((item) => {
    const user = getOrCreateUser(item.measurement_assist.user)
    user.measurementAssist = item.measurement_assist
    if (!user.userDetails) {
      user.userDetails = item.user_details
    }
  })

  if (sudData.value) {
    sudData.value.lifetime_users.forEach((user) => {
      const mappedUser = getOrCreateUser(user.user_id)
      mappedUser.sudData.lifetime = user
    })
    sudData.value.active_users.forEach((user) => {
      const mappedUser = getOrCreateUser(user.user_id)
      mappedUser.sudData.active = user
    })
  }

  mappedData.value = Array.from(userMap.values())
}

const filteredData = computed(() => mappedData.value)

provide('filteredData', filteredData)

onMounted(() => {
  getUserDetails()
  console.log('=== CounsellorDashboard Mounted ===')
  console.log('Current route on mount:', route.path)
  console.log('Show Gyalsung Register:', showGyalsungRegister.value)
  console.log('Show Gyalsung Screening:', showGyalsungScreening.value) 
  console.log('Route params:', route.params)
  console.log('Route query:', route.query)
})

watch(
  () => route.path,
  (newPath, oldPath) => {
    console.log('=== Route Change Detected ===')
    console.log('Route changed from:', oldPath)
    console.log('Route changed to:', newPath)
    console.log('Show Gyalsung Register:', showGyalsungRegister.value)
    console.log('Show Gyalsung Screening:', showGyalsungScreening.value) 
    
    // Only fetch data for non-Gyalsung routes
    if (!showGyalsungRegister.value && !showGyalsungScreening.value) {
      fetchData()
    }
  },
  {
    immediate: true 
  }
)

// Watch the computed properties directly
watch(
  showGyalsungRegister,
  (newValue, oldValue) => {
    console.log('=== Gyalsung Register Visibility Changed ===')
    console.log('Show Gyalsung Register changed from:', oldValue, 'to:', newValue)
  }
)

// ADD THIS: Watch for Gyalsung Screening changes
watch(
  showGyalsungScreening,
  (newValue, oldValue) => {
    console.log('=== Gyalsung Screening Visibility Changed ===')
    console.log('Show Gyalsung Screening changed from:', oldValue, 'to:', newValue)
  }
)

watch(
  showGyalsungReports,
  (newValue, oldValue) => {
    console.log('=== Gyalsung Reports Visibility Changed ===')
    console.log('Show Gyalsung Reports changed from:', oldValue, 'to:', newValue)
  }
)


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
  showGyalsungRegister,
  showGyalsungScreening,
  showGyalsungReports
})
</script>

<style scoped>
.bg-color {
  background-color: #f8f9fa;
}

.nav-link {
  color: #2b656f !important;
  border-radius: 20px 50px 0 0;
  margin-left: 0;
}

.nav-link.active {
  border-color: #2b656f;
}

.header {
  height: 8rem;
}

.footer {
  margin-top: auto;
}

.screening-dashboard {
  min-height: calc(100vh - 120px);
}

.gyalsung-register {
  min-height: calc(100vh - 120px);
  padding: 0;
  background-color: #e8f6ee;
}

.gyalsung-screening {
  min-height: calc(100vh - 120px);
  padding: 0;
  background-color: #e8f6ee;
}

.gyalsung-reports {
  min-height: calc(100vh - 120px);
  padding: 0;
  background-color: #e8f6ee;
}

/* Debug styles */
.alert-info {
  background-color: #d1ecf1;
  border-color: #bee5eb;
  color: #0c5460;
  padding: 0.75rem 1.25rem;
  margin-bottom: 1rem;
  border: 1px solid transparent;
  border-radius: 0.25rem;
}
</style>