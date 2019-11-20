<template>
  <div class="row g-0">
    <!-- Filter Section -->
    <div class="col-md-2 p-2">
      <div class="card h-100">
        <div class="card-body">
          <p class="card-text fw-bold">Data Set</p>
          <div v-for="(option, index) in dataOptions" :key="index" class="form-check text-start">
            <input class="form-check-input" type="checkbox" :value="option.value" :id="'check' + index"
              :checked="selectedOption === option.value" @change="handleCheckboxChange(option.value)" />
            <label class="form-check-label" :for="'check' + index">
              {{ option.label }}
            </label>
          </div>
          <button @click="generateReport" class="btn btn-primary mt-3 w-100" :disabled="!selectedOption">
            Generate
          </button>
        </div>
      </div>
    </div>

    <!-- Report Display Section -->
    <div class="col-md-10 p-2">
      <div class="card h-100">
        <div class="card-body">
          <!-- Initial Message -->
          <div v-if="!showReport" class="text-center">
            <p class="text-primary mb-3">Note: Please select a parameter and press the Generate button</p>
          </div>

          <!-- Report Content -->
          <div v-else>
            <!-- Loading State -->
            <div v-if="isLoading" class="text-center">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>

            <!-- Report Display -->
            <div v-else>
              <div v-if="selectedOption === 'all'" class="showtable">
                <MHMonitorTable :filteredData="filteredData" />
              </div>
              <ChartComponent v-else :filteredData="filteredData" :activeFiltersList="[selectedOption]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import MHMonitorTable from './MonitorTable.vue'
import ChartComponent from './ChartComponent.vue'

// Props
const props = defineProps({
  filteredData: {
    type: Array,
    required: true,
    default: () => []
  },
  activeFiltersList: {
    type: Array,
    required: true,
    default: () => []
  }
})

// Data options
const dataOptions = [
  {
    label: 'Screening',
    value: 'screening',
    description: 'View screening status and statistics'
  },
  {
    label: 'Counseling',
    value: 'counseling',
    description: 'View counseling status and progress'
  },
  {
    label: 'Assessment Status',
    value: 'assessment_status',
    description: 'View assessment completion status'
  },
  {
    label: 'Referral',
    value: 'referred',
    description: 'View referral statistics'
  },
  {
    label: 'Follow-up',
    value: 'follow_up',
    description: 'View follow-up status'
  },
  {
    label: 'All',
    value: 'all',
    description: 'View complete dataset'
  }
]

// Refs
const selectedOption = ref('')
const showReport = ref(false)
const isLoading = ref(false)

// Methods
const handleCheckboxChange = (value) => {
  selectedOption.value = value
  showReport.value = false
}

const generateReport = async () => {
  try {
    isLoading.value = true
    showReport.value = true
  } catch (error) {
    console.error('Error generating report:', error)
    showReport.value = false
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.card {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-check {
  margin-bottom: 0.5rem;
}
</style>