<template>
  <div>
      <!-- Options to select -->
      <div class="row justify-content-center mb-3">
        <div class="col-md-4 text-center">
          <div class="card option" :class="{ active: selectedOption === 'monitor' }" @click="selectOption('monitor')">
            <div class="card-body">
              <i class="fas fa-desktop fa-3x mb-3"></i> <!-- Icon for Monitor Report (changed to monitor icon) -->
              <p class="card-text">Monitor Report</p>
            </div>
          </div>
        </div>
        <div class="col-md-4 text-center">
          <div class="card option" :class="{ active: selectedOption === 'case' }" @click="selectOption('case')">
            <div class="card-body">
              <i class="fas fa-briefcase fa-3x mb-3"></i> <!-- Icon for Case Report -->
              <p class="card-text">Case Report</p>
            </div>
          </div>
        </div>
        <div class="col-md-4 text-center">
          <div class="card option" :class="{ active: selectedOption === 'severity' }" @click="selectOption('severity')">
            <div class="card-body">
              <i class="fas fa-exclamation-triangle fa-3x mb-3"></i> <!-- Icon for Severity Report -->
              <p class="card-text">Severity Report</p>
            </div>
          </div>
        </div>
        
      </div>

      <!-- Show different components based on selected option -->
      <div class="row justify-content-center mt-3">
        <div v-if="selectedOption === 'monitor'" class="">
          <!-- Show Monitor Report Component -->
          <MonitorReport />
        </div>
        <div v-if="selectedOption === 'severity'" class="">
          <!-- Show Severity Report Component -->
          <SeverityReport />
        </div>
        <div v-if="selectedOption === 'case'" class="">
          <!-- Show Case Status Report Component -->
          <CaseStatusReport />
        </div>
      </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import MonitorReport from "./SUDMonitorReport.vue"
import CaseStatusReport from "./SUDCaseStatusReport.vue" // Corrected import
import SeverityReport from "./SUDSeverityReport.vue"

const selectedOption = ref(null)

// Function to handle option selection
const selectOption = (option) => {
  selectedOption.value = option
}

</script>

<style scoped>
/* Add your custom styles here */
.option {
  cursor: pointer;
}

.card {
  border: none;
  border-radius: 15px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.card-text {
  font-size: 1.2rem;
  font-weight: bold;
}

.option.active {
  background-color: #4ba9a8; /* Add your preferred highlight color here */
}

/* Adjusting Element Plus styles */
.el-select {
  width: 100%;
}

.custom-select {
  height: 45px; /* Adjust the height as needed */
}

.el-button {
  margin-top: 1rem;
}
</style>
