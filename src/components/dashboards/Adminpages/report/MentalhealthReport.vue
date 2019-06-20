<template>
  <div>
    <Quaryfilter />
    <!-- Options to select -->
    <div class="row justify-content-center mb-3">
      <div class="col-md-4 text-center">
        <div class="card option" :class="{ active: selectedOption === 'monitor' }" @click="selectOption('monitor')">
          <div class="card-body">
            <i class="fas fa-desktop fa-3x mb-3"></i>
            <p class="card-text">Monitor Report</p>
          </div>
        </div>
      </div>
      <div class="col-md-4 text-center">
        <div class="card option" :class="{ active: selectedOption === 'case' }" @click="selectOption('case')">
          <div class="card-body">
            <i class="fas fa-briefcase fa-3x mb-3"></i>
            <p class="card-text">Case Report</p>
          </div>
        </div>
      </div>
      <div class="col-md-4 text-center">
        <div class="card option" :class="{ active: selectedOption === 'severity' }" @click="selectOption('severity')">
          <div class="card-body">
            <i class="fas fa-exclamation-triangle fa-3x mb-3"></i>
            <p class="card-text">Severity Report</p>
          </div>
        </div>
      </div>

    </div>

    <!-- Show different components based on selected option -->
    <div class="row justify-content-center mt-3">
      <div v-if="selectedOption === 'monitor'">
        <!-- Show Monitor Report Component -->
        <MonitorReport />
      </div>
      <div v-if="selectedOption === 'case'">
        <!-- Show Case Status Report Component -->
        <CaseStatusReport />
      </div>
      <div v-if="selectedOption === 'severity'">
        <!-- Show Severity Report Component -->
        <SeverityReport />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import MonitorReport from "./MHMonitorReport.vue"
import CaseStatusReport from "./MHCaseStatusReport.vue" // Corrected import
import SeverityReport from "./MHSeverityReport.vue"
import Quaryfilter from './Quaryfilter.vue'
const selectedOption = ref(null)

onMounted(() => {
  selectedOption.value = 'monitor'
})

// Function to handle option selection
const selectOption = (option) => {
  selectedOption.value = option
}

</script>

<style scoped>
.row {
  margin-top: 20px;
}

.card.active {
  border: 2px solid #2c6975;
  color: #2c6975;
  font-weight: bold;
}

.card:hover {
  background-color: #f9f9f9;
  cursor: pointer;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

th,
td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: center;
}

th {
  background-color: #f2f2f2;
}
</style>
