<template>
  <div>
    <!-- Filter container -->
    <div class="container mt-5">
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
          <div class="card option" :class="{ active: selectedOption === 'severity' }" @click="selectOption('severity')">
            <div class="card-body">
              <i class="fas fa-exclamation-triangle fa-3x mb-3"></i> <!-- Icon for Severity Report -->
              <p class="card-text">Severity Report</p>
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
      </div>

      <!-- Select fields for Monitor Report -->
      <div v-if="selectedOption === 'monitor'" class="row justify-content-center">
        <div class="col-md-4">
          <el-select v-model="selectedFields" multiple placeholder="Select Fields" class="fs-4 custom-select">
            <el-option v-for="option in monitorFieldOptions" :key="option.value" :label="option.label" :value="option.value"></el-option>
          </el-select>
        </div>
        <div class="col-md-4">
          <el-select v-model="selectedFilters" multiple placeholder="Select Filters" class="fs-4 custom-select">
            <el-option v-for="option in monitorFilterOptions" :key="option.value" :label="option.label" :value="option.value"></el-option>
          </el-select>
        </div>
      </div>

      <!-- Select fields for Severity Report -->
      <div v-if="selectedOption === 'severity'" class="row justify-content-center">
        <div class="col-md-4">
          <el-select v-model="selectedFields" multiple placeholder="Select Fields" class="fs-4 custom-select">
            <el-option v-for="option in severityFieldOptions" :key="option.value" :label="option.label" :value="option.value"></el-option>
          </el-select>
        </div>
        <div class="col-md-4">
          <el-select v-model="selectedFilters" multiple placeholder="Select Filters" class="fs-4 custom-select">
            <el-option v-for="option in severityFilterOptions" :key="option.value" :label="option.label" :value="option.value"></el-option>
          </el-select>
        </div>
      </div>

      <!-- Select fields for Case Report -->
      <div v-if="selectedOption === 'case'" class="row justify-content-center">
        <div class="col-md-4">
          <el-select v-model="selectedFields" multiple placeholder="Select Fields" class="fs-4 custom-select">
            <el-option v-for="option in caseFieldOptions" :key="option.value" :label="option.label" :value="option.value"></el-option>
          </el-select>
        </div>
        <div class="col-md-4">
          <el-select v-model="selectedFilters" multiple placeholder="Select Filters" class="fs-4 custom-select">
            <el-option v-for="option in caseFilterOptions" :key="option.value" :label="option.label" :value="option.value"></el-option>
          </el-select>
        </div>
      </div>

      <!-- Apply button -->
      <div class="row justify-content-center mt-5">
        <div class="col-md-12 text-center">
          <el-button type="primary" @click="applyFilters" :disabled="buttonDisabled">
            Apply
            <i class="el-icon-arrow-right"></i>
          </el-button>
        </div>
      </div>

      <!-- Result text -->
      <div class="row">
        <div class="col-md-12">
          <span class="result-text" :class="resultTextClass">
            results
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElSelect, ElOption, ElButton } from 'element-plus'

const selectedOption = ref(null)
const selectedFields = ref([])
const selectedFilters = ref([])
const buttonDisabled = computed(() => !selectedFields.value.length || !selectedFilters.value.length)

const applyFilters = () => {
  // Place your logic here to apply filters and change the letter 'a'
  buttonDisabled.value = true
}

const resultTextClass = ref('')

// Mock applyFilter function
const mockApplyFilter = () => {
  // Place your filtering logic here
  resultTextClass.value = 'success-result'
}

// Mock the filtering function
const debounceInterval = 1000 // in milliseconds
let debounceTimeout = null
if (selectedFields.value.length && selectedFilters.value.length) {
  clearTimeout(debounceTimeout)
  debounceTimeout = setTimeout(mockApplyFilter, debounceInterval)
}

mockApplyFilter()

// Function to handle option selection
const selectOption = (option) => {
  selectedOption.value = option
}

// Options for Select Fields - Monitor Report
const monitorFieldOptions = [
  { label: 'Rescreening', value: 'Rescreening' },
  { label: 'Counseling', value: 'Counseling' },
  { label: 'Assessment', value: 'Assessment' },
  { label: 'Follow', value: 'Follow' },
  { label: 'Referrals', value: 'Referrals' }
]

// Options for Select Filters - Monitor Report
const monitorFilterOptions = [
  { label: 'Year', value: 'year' },
  { label: 'Gender', value: 'gender' },
  { label: 'Dzongkha', value: 'dzongkha' },
  { label: 'Location', value: 'location' },
  { label: 'Age', value: 'age' },
  { label: 'Class', value: 'class' },
  { label: 'Employment History', value: 'employment' }
]

// Options for Select Fields - Severity Report
const severityFieldOptions = [
{ label: 'Depression', value: 'depression' },
  { label: 'Anxiety', value: 'anxiety' },
  { label: 'ACE', value: 'ace' },
  { label: 'Suicidal Behaviours', value: 'suicidal_behaviours' },
  { label: 'Lifetime Use', value: 'lifetime_use' },
  { label: 'Current Use', value: 'current_use' },
  { label: 'Substance Wise', value: 'substance_wise' }
]

// Options for Select Filters - Severity Report
const severityFilterOptions = [
{ label: 'Year', value: 'year' },
  { label: 'Gender', value: 'gender' },
  { label: 'Dzongkha', value: 'dzongkha' },
  { label: 'Location', value: 'location' },
  { label: 'Age', value: 'age' },
  { label: 'Class', value: 'class' },
  { label: 'Employment History', value: 'employment' }
]

// Options for Select Fields - Case Report
const caseFieldOptions = [
{ label: 'Total Case Ongoing', value: 'total_ongoing' },
  { label: 'Total Case Discontinued', value: 'total_discontinued' },
  { label: 'Total Case Closed', value: 'total_closed' }
]

// Options for Select Filters - Case Report
const caseFilterOptions = [
{ label: 'Year', value: 'year' },
  { label: 'Gender', value: 'gender' },
  { label: 'Dzongkha', value: 'dzongkha' },
  { label: 'Location', value: 'location' },
  { label: 'Age', value: 'age' },
  { label: 'Class', value: 'class' },
  { label: 'Employment History', value: 'employment' }
]
</script>

<style>
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
