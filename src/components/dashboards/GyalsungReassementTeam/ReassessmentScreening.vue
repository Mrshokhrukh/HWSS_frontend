<template>
    <div class="container-fluid">
      <div class="row mb-4">
        <div class="col-12">
          <div class="bg-transparent">
            <component
              :is="currentRescreenComponent"
              @proceedToScreening="switchComponent(RescreeningScreening)"
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
  import RescreeningSelectTools from './ReassessmentSelectTools.vue'
  import RescreeningScreening from './ReassessmentScreeningScreeen.vue'
  
  const counselorScreeningQuestions = ref([])
  const isLoadingQuestions = ref(false)
  const errorFetchingQuestions = ref(null)
  const userAgeGroup = ref({})
  
  // Define a ref to hold the current component
  const currentRescreenComponent = ref(RescreeningSelectTools)
  
  function switchComponent(component) {
    currentRescreenComponent.value = component
  }
  
  async function fetchCounselorScreeningQuestions() {
    try {
      isLoadingQuestions.value = true
      const response = await apiClient.get(`${endpoints.screeningPreTests}?name=Gyalsung Screening`)
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
          sessionStorage.setItem('clientAgeGroup', userData.ageGroup)
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
  .custom-tabs {
    display: flex;
    justify-content: start;
  }
  
  .custom-tab {
    cursor: pointer;
    padding: 1rem 3rem;
    border: 1px solid #cde0c9;
    background-color: #cde0c9;
    border-bottom: none;
    border-radius: 10px 55px 0 0;
    font-size: large;
    font-weight: 600;
  }
  
  .custom-tab.active {
    background-color: #a3cdb8;
    border: 1px solid #a3cdb8;
    z-index: 999;
  }
  
  .card-element {
    border-radius: 0 10px 10px 10px;
    background: #a3cdb8;
    box-shadow: 4px 4px 16px 8px rgb(0, 0, 0, 0.1);
    backdrop-filter: blur(10px);
  }
  </style>
    