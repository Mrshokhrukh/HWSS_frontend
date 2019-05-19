<template>
  <h3 class="text-center fw-bold my-4 hwss-primary">Current Status in Bhutan</h3>
  <div class="row d-flex justify-content-center">
    <div
      v-for="(status, index) in statuses"
      :key="index"
      class="card col-3 bg-light mx-auto h-100"
      style="border-radius: 15px"
    >
      <h4 class="card-title text-center fw-bold mt-3">{{ status.title }}</h4>
      <div class="card-body text-center d-flex align-items-center justify-content-center">
        <span class="material-symbols-outlined hwss-primary display-3">{{ status.iconClass }}</span>
        <p class="card-text display-3 fw-bold me-2 ms-2">{{ formatNumber(status.count) }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import endpoints from '@/api' // Assuming this is correctly imported

const reportData = ref([])
const Totalcaseongoing = ref(0) // Use let instead of const for reassignment
const TotalcasDiscontinue = ref(0) // Use let instead of const for reassignment
const TotalCaseClosed = ref(0) // Use let instead of const for reassignment

const fetchReportData = async () => {
  try {
    const response = await axios.get(endpoints.generateReport)
    if (response.data && Array.isArray(response.data)) {
      reportData.value = response.data
      const TotalCaseOngoingfilter = reportData.value.filter(
        (item) => item.case_status === 'On Going'
      ) // Use .value to access ref value
      Totalcaseongoing.value = TotalCaseOngoingfilter.length // Use .value to assign the value to ref
      const TotalCaseDiscontinuefilter = reportData.value.filter(
        (item) => item.case_status === 'Discontinued'
      ) // Use .value to access ref value
      TotalcasDiscontinue.value = TotalCaseDiscontinuefilter.length // Use .value to assign the value to ref
      const TotalCaseClosedfilter = reportData.value.filter((item) => item.case_status === 'Closed') // Use .value to access ref value
      TotalCaseClosed.value = TotalCaseClosedfilter.length // Use .value to assign the value to ref
    } else {
      handleFetchError()
    }
  } catch (error) {
    handleFetchError()
  }
}

const handleFetchError = () => {
  reportData.value = []
  // Handle error
}

onMounted(() => {
  fetchReportData()
})

const statuses = ref([
  { title: 'Total Case Ongoing', iconClass: 'description', count: Totalcaseongoing }, // Use .value to access ref value
  { title: 'Total Case Discontinue', iconClass: 'credit_card_off', count: TotalcasDiscontinue },
  { title: 'Total Case Closed', iconClass: 'fact_check', count: TotalCaseClosed }
])

// Method to format numbers with K, M, B
const formatNumber = (num) => {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(2) + 'B'
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(2) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(2) + 'K'
  }
  return num
}
</script>
