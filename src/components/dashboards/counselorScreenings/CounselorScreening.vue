<template>
  <div class="screening-container">
    <div class="screening-wrapper">
      <div class="tabs-container">
        <div
          class="tab"
          :class="{ active: activeTab === 'case-screening' }"
          @click="activateTab('case-screening')"
        >
          <span>Case Screening</span>
        </div>
        <div
          class="tab"
          :class="{ active: activeTab === 'event-based-screening' }"
          @click="activateTab('event-based-screening')"
        >
          <span>Event Based Screening</span>
        </div>
      </div>

      <div class="content-panel">
        <!-- Case Screening tab -->
        <div v-if="activeTab === 'case-screening'" class="tab-content">
          <component
            :is="currentComponent"
            @proceedToSelectTools="switchComponent(CaseScreeningSelectTools)"
            @proceedToScreening="switchComponent(CaseScreeningScreening)"
            @goBackToRegister="switchComponent(CaseScreeningRegister)"
            @goBackToSelectTools="switchComponent(CaseScreeningSelectTools)"
          />
        </div>

        <!-- Event Based Screening tab -->
        <div v-if="activeTab === 'event-based-screening'" class="tab-content">
          <component
            :is="currentEventComponent"
            @proceedToUserSelectionTools="switchEventComponent(EventUserRegistration)"
            @proceedToEventSelectTools="switchEventComponent(EventScreeningSelectTools)"
            @proceedToEventScreening="switchEventComponent(EventScreeningScreening)"
            @logEmit="logEmit()"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, provide } from 'vue'
import apiClient from '@/apiClient'
import endpoints from '@/api'
import { useRoute } from 'vue-router'

import CaseScreeningRegister from '@/components/dashboards/counselorScreenings/counselorScreeningStages/CaseScreeningRegister.vue'
import CaseScreeningSelectTools from '@/components/dashboards/counselorScreenings/counselorScreeningStages/CaseScreeningSelectTools.vue'
import CaseScreeningScreening from '@/components/dashboards/counselorScreenings/counselorScreeningStages/CaseScreeningScreening.vue'

import EventScreeningRegister from '@/components/dashboards/counselorScreenings/counselorScreeningStages/EventScreeningRegister.vue'
import EventScreeningSelectTools from '@/components/dashboards/counselorScreenings/counselorScreeningStages/EventScreeningSelectTools.vue'
import EventScreeningScreening from '@/components/dashboards/counselorScreenings/counselorScreeningStages/EventScreeningScreening.vue'
import EventUserRegistration from '@/components/dashboards/counselorScreenings/counselorScreeningStages/EventUserRegistration.vue'

const counselorScreeningQuestions = ref([])
const isLoadingQuestions = ref(false)
const errorFetchingQuestions = ref(null)
const userAgeGroup = ref({})

// Define a ref to hold the current component
const currentComponent = ref(CaseScreeningRegister)
const currentEventComponent = ref(EventScreeningRegister)

// Define a ref to hold the active tab
const activeTab = ref('')
const route = useRoute()

function switchComponent(component) {
  currentComponent.value = component
}

function switchEventComponent(component) {
  currentEventComponent.value = component
}

onMounted(() => {
  const hash = route.hash

  if (hash) {
    const id = hash.substring(1)

    activeTab.value = id
  } else {
    activeTab.value = 'case-screening'
  }
})

// Function to activate a tab
function activateTab(tabName) {
  activeTab.value = tabName
}

async function fetchCounselorScreeningQuestions() {
  try {
    isLoadingQuestions.value = true
    const response = await apiClient.get(`${endpoints.screeningPreTests}?name=Case Screening`)
    counselorScreeningQuestions.value = response.data
    sessionStorage.setItem(
      'counselorScreeningQuestions',
      JSON.stringify(counselorScreeningQuestions.value)
    )
  } catch (error) {
    console.error('Error fetching questions:', error)
    errorFetchingQuestions.value = error
  } finally {
    isLoadingQuestions.value = false
  }
}

onMounted(fetchCounselorScreeningQuestions)

onMounted(() => {
  try {
    const userDataJSON = sessionStorage.getItem('userAgeData')
    if (userDataJSON) {
      const userData = JSON.parse(userDataJSON)
      if (userData.ageGroup !== undefined) {
        userAgeGroup.value = userData.ageGroup
      } else {
        console.error('Error: ageGroup not found in userAgeData')
      }
    } else {
      console.error('Error: userAgeData not found in session storage')
    }
  } catch (error) {
    console.error('Error parsing userAgeData:', error)
  }
})

provide('counselorScreeningQuestions', counselorScreeningQuestions)
provide('isLoadingQuestions', isLoadingQuestions)
provide('errorFetchingQuestions', errorFetchingQuestions)
provide('userAgeGroup', userAgeGroup)
</script>

<style scoped>
.screening-wrapper {
  max-width: 1200px;
  margin: 0 auto;
}

.tabs-container {
  display: flex;
  gap: 0.5rem;
  margin-bottom: -1px;
}

.tab {
  padding: 1rem 2.5rem;
  background: linear-gradient(135deg, #5a919b 0%, #628991 100%);
  border-radius: 12px 12px 0 0;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-bottom: none;
}

.tab span {
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
}

.tab.active {
  background: linear-gradient(135deg, #2b656f 0%, #1d4851 100%);
  background: linear-gradient(135deg, #2b656f 0%, #1d4851 100%);
}

.tab.active span {
  color: white;
  font-weight: 600;
}

.tab:hover:not(.active) {
  background: linear-gradient(135deg, #1a525c 0%, #072c33 100%);
}

.content-panel {
  background: linear-gradient(135deg, #2b656f 0%, #1d4851 100%);
  backdrop-filter: blur(10px);
  border-radius: 0 12px 12px 12px;
  padding: 2rem;
  min-height: 500px;
}

.tab-content {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Add responsive design */
@media (max-width: 768px) {
  .screening-container {
    padding: 1rem;
  }

  .tabs-container {
    flex-direction: column;
    gap: 0.25rem;
  }

  .tab {
    border-radius: 8px;
    text-align: center;
  }

  .content-panel {
    border-radius: 12px;
    padding: 1rem;
  }
}
</style>