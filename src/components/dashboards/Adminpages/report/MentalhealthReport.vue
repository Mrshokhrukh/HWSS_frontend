<template>
    <div>
  
      <!-- Filter container -->
      <div class="container mt-5">
        <!-- Options to select -->
        <div class="row justify-content-center mb-3">
          <div class="col-md-4 text-center">
            <div class="card option" @click="selectOption('monitor')">
              <div class="card-body">
                <i class="fas fa-desktop fa-3x mb-3"></i> <!-- Icon for Monitor Report (changed to monitor icon) -->
                <p class="card-text">Monitor Report</p>
              </div>
            </div>
          </div>
          <div class="col-md-4 text-center">
            <div class="card option" @click="selectOption('severity')">
              <div class="card-body">
                <i class="fas fa-exclamation-triangle fa-3x mb-3"></i> <!-- Icon for Severity Report -->
                <p class="card-text">Severity Report</p>
              </div>
            </div>
          </div>
          <div class="col-md-4 text-center">
            <div class="card option" @click="selectOption('case')">
              <div class="card-body">
                <i class="fas fa-briefcase fa-3x mb-3"></i> <!-- Icon for Case Report -->
                <p class="card-text">Case Report</p>
              </div>
            </div>
          </div>
        </div>
  
        <!-- Select fields -->
        <div class="row justify-content-center">
          <div class="col-md-4">
            <div class="mb-3">
              <label class="form-label fs-4">Select Field:</label>
              <select v-model="selectedField" class="form-select fs-4">
                <option value="field1">Field 1</option>
                <option value="field2">Field 2</option>
                <option value="field3">Field 3</option>
              </select>
            </div>
          </div>
          <div class="col-md-4">
            <div class="mb-3">
              <label class="form-label fs-4">Filter by:</label>
              <select v-model="selectedFilter" class="form-select fs-4">
                <option value="CR-SR">CR → SR</option>
                <option value="SR-CR">SR → CR</option>
              </select>
            </div>
          </div>
        </div>
  
        <!-- Apply button -->
        <div class="row justify-content-center">
          <div class="col-md-12 text-center">
            <button class="btn btn-primary" @click="applyFilters" :disabled="buttonDisabled">
              Apply
              <img class="arrow-icon" src="data:image/png;base64,iVBORw0KGg.......(trimmed).......NO0eTQA7" alt="arrow">
            </button>
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
  
  const selectedField = ref(null)
  const selectedFilter = ref(null)
  const buttonDisabled = computed(() => !selectedField.value || !selectedFilter.value)
  
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
  if (selectedField.value && selectedFilter.value) {
    clearTimeout(debounceTimeout)
    debounceTimeout = setTimeout(mockApplyFilter, debounceInterval)
  }
  
  mockApplyFilter()
  
  // Function to handle option selection
  const selectOption = (option) => {
    // Implement your logic here based on the selected option
    console.log(option)
  }
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
  </style>
  