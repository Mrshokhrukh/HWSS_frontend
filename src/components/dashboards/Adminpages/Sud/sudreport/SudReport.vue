<template>
  <div class="page-container">
    <!-- Buttons -->
    <div class="buttons-container">
      <el-button type="primary" round class="report-button" @click="selectReport('Monitor Report')">Monitor Report</el-button>
      <el-button type="primary" round class="report-button" @click="selectReport('Case Status Report')">Case Status Report</el-button>
      <el-button type="primary" round class="report-button" @click="selectReport('Severity Report')">Severity Report</el-button>
    </div>
    
    <!-- Filter Fields -->
    <div v-if="selectedReport">
      <h3>Filter {{ selectedReport }}</h3>
      <div class="filter-fields">
        <!-- Filter fields go here -->
        <!-- Year Wise Filter -->
        <div class="filter-item">
          <label for="year">Year:</label>
          <el-input v-model="filters.year" placeholder="Enter year"></el-input>
        </div>
        
        <!-- Gender Wise Filter -->
        <div class="filter-item">
          <label for="gender">Gender:</label>
          <el-select v-model="filters.gender" placeholder="Select gender">
            <el-option label="Male" value="Male"></el-option>
            <el-option label="Female" value="Female"></el-option>
            <el-option label="Other" value="Other"></el-option>
          </el-select>
        </div>
        
        <!-- Dzongkha Wise Filter -->
        <div class="filter-item">
          <label for="dzongkha">Dzongkha:</label>
          <el-input v-model="filters.dzongkha" placeholder="Enter Dzongkha"></el-input>
        </div>
        
        <!-- Location Wise Filter -->
        <div class="filter-item">
          <label for="location">Location:</label>
          <el-select v-model="filters.location" placeholder="Select location">
            <el-option label="Agency" value="Agency"></el-option>
            <el-option label="School" value="School"></el-option>
          </el-select>
        </div>
        
        <!-- Age Wise Filter -->
        <div class="filter-item">
          <label for="age">Age:</label>
          <el-input v-model="filters.age" placeholder="Enter age" type="number"></el-input>
        </div>
        
        <!-- Class Wise Filter -->
        <div class="filter-item">
          <label for="class">Class:</label>
          <el-input v-model="filters.class" placeholder="Enter class"></el-input>
        </div>
        
        <!-- Employment History Filter -->
        <div class="filter-item">
          <label for="employment">Employment:</label>
          <el-select v-model="filters.employment" placeholder="Select employment status">
            <el-option label="Working" value="Working"></el-option>
            <el-option label="Not Working" value="Not Working"></el-option>
          </el-select>
        </div>
        
        <!-- Severity Wise for Mental Health Filter -->
        <div class="filter-item" v-if="selectedReport === 'Severity Report'">
          <label for="mentalHealthSeverity">Mental Health Severity:</label>
          <el-select v-model="filters.mentalHealthSeverity" placeholder="Select mental health severity">
            <el-option label="Low" value="Low"></el-option>
            <el-option label="Medium" value="Medium"></el-option>
            <el-option label="High" value="High"></el-option>
          </el-select>
        </div>
        
        <!-- Severity Wise for Substance Use Filter -->
        <div class="filter-item" v-if="selectedReport === 'Severity Report'">
          <label for="substanceUseSeverity">Substance Use Severity:</label>
          <el-select v-model="filters.substanceUseSeverity" placeholder="Select substance use severity">
            <el-option label="Low" value="Low"></el-option>
            <el-option label="Medium" value="Medium"></el-option>
            <el-option label="High" value="High"></el-option>
          </el-select>
        </div>
      </div>
      
      <!-- Generate Button -->
      <el-button class="generate-button" :disabled="!areFiltersFilled" @click="fetchDataAndGenerateTable">Generate Table</el-button>
    </div>
    
    <!-- Blank Canvas for Generated Tables -->
    <div v-if="selectedReport">
      <h3 class="bold mt-3">{{ selectedReport }}</h3>
      <div class="tables-container">
        <div v-for="(table, index) in generatedTables[selectedReport]" :key="index" class="generated-table">
          <h4>{{ table.title }}</h4>
          <el-table :data="table.rows" stripe border>
            <el-table-column v-for="(header, headerIndex) in table.headers" :key="headerIndex" :prop="header" :label="header"></el-table-column>
          </el-table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { ElButton, ElSelect, ElOption, ElInput, ElTable, ElTableColumn } from 'element-plus';

// Data
const selectedReport = ref('');
const filters = ref({
  year: '',
  gender: '',
  dzongkha: '',
  location: '',
  age: '',
  class: '',
  employment: '',
  mentalHealthSeverity: '',
  substanceUseSeverity: ''
});
const generatedTables = ref({
  'Monitor Report': [],
  'Case Status Report': [],
  'Severity Report': []
});

// Compute whether all filter fields are filled
const areFiltersFilled = computed(() => {
  if (!selectedReport.value) return false; // No report selected

  const requiredFilters = {
    'Monitor Report': ['year', 'gender', 'dzongkha', 'location', 'age', 'class', 'employment'],
    'Case Status Report': ['year', 'gender', 'dzongkha', 'location', 'age', 'class', 'employment'],
    'Severity Report': ['year', 'gender', 'dzongkha', 'location', 'age', 'class', 'employment', 'mentalHealthSeverity', 'substanceUseSeverity']
  };

  const requiredFilterFields = requiredFilters[selectedReport.value];
  return requiredFilterFields.every(field => filters.value[field]);
});

// Methods
const selectReport = (report) => {
  selectedReport.value = report;
};

const fetchDataAndGenerateTable = async () => {
  if (areFiltersFilled.value) {
    try {
      // Fetch data from API based on selected filters
      const data = await fetchDataFromApi();
      
      // Generate table from fetched data
      const table = generateTable(data);
      
      // Append generated table to the appropriate report's tables
      generatedTables.value[selectedReport.value].push(table);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  } else {
    alert('Please fill in all filter fields before generating the table.');
  }
};

const fetchDataFromApi = async () => {
  // Implement fetching data from API based on selected filters
  // Replace this with your actual API call
  // Example: const response = await fetch('api-url');
  // Example: const data = await response.json();
  // Example: return data;
  return Promise.resolve([
    { column1: 'Data 1', column2: 'Data 2' },
    { column1: 'Data 3', column2: 'Data 4' }
  ]);
};

const generateTable = (data) => {
  // Implement table generation logic based on fetched data
  // Example: const headers = Object.keys(data[0]);
  // Example: const rows = data.map(item => Object.values(item));
  // Example: return { title: 'Table Title', headers, rows };
  return {
    title: 'Table Title',
    headers: ['Column 1', 'Column 2'],
    rows: data
  };
};
</script>

<style scoped>
/* Container styles */
.page-container {
  background-color: #f5f5f5;
  padding: 20px;
}

/* Button styling */
.buttons-container {
  display: flex;
  justify-content: space-around;
  margin-bottom: 20px;
}

.report-button {
  font-size: 20px;
  padding: 50px 120px;
  border-radius: 2em;
  background-color: #30ad94;
}

/* Filter fields styling */
.filter-fields {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.filter-item {
  display: flex;
  align-items: center;
}

.filter-item label {
  margin-right: 10px;
}

/* Generate button styling */
.generate-button {
  background-color: #72BECB;
  color: white;
  border: none;
  padding: 15px 30px;
  cursor: pointer;
  border-radius: 8px;
  font-size: 16px;
  margin-top: 20px;
}

.generate-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

/* Generated table styling */
.generated-table {
  margin-top: 20px;
}

.generated-table h4 {
  margin-bottom: 10px;
}
</style>
