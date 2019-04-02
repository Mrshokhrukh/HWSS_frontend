<template>
    <div>
      <!-- Buttons -->
      <div class="buttons-container">
        <button class="button" @click="selectReport('Monitor Report')">Monitor Report</button>
        <button class="button" @click="selectReport('Case Status Report')">Case Status Report</button>
        <button class="button" @click="selectReport('Severity Report')">Severity Report</button>
      </div>
      
      <!-- Filter Fields -->
      <div v-if="selectedReport">
        <h3>Filter {{ selectedReport }}</h3>
        <div class="filter-fields">
          <!-- Filter fields go here -->
          <!-- Year Wise Filter -->
          <div class="filter-item">
            <label for="year">Year:</label>
            <input type="text" v-model="filters.year" placeholder="Enter year">
          </div>
          
          <!-- Gender Wise Filter -->
          <div class="filter-item">
            <label for="gender">Gender:</label>
            <select v-model="filters.gender">
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          <!-- Dzongkha Wise Filter -->
          <div class="filter-item">
            <label for="dzongkha">Dzongkha:</label>
            <input type="text" v-model="filters.dzongkha" placeholder="Enter Dzongkha">
          </div>
          
          <!-- Location Wise Filter -->
          <div class="filter-item">
            <label for="location">Location:</label>
            <select v-model="filters.location">
              <option value="">Select location</option>
              <option value="Agency">Agency</option>
              <option value="School">School</option>
            </select>
          </div>
          
          <!-- Age Wise Filter -->
          <div class="filter-item">
            <label for="age">Age:</label>
            <input type="number" v-model="filters.age" placeholder="Enter age">
          </div>
          
          <!-- Class Wise Filter -->
          <div class="filter-item">
            <label for="class">Class:</label>
            <input type="text" v-model="filters.class" placeholder="Enter class">
          </div>
          
          <!-- Employment History Filter -->
          <div class="filter-item">
            <label for="employment">Employment:</label>
            <select v-model="filters.employment">
              <option value="">Select employment status</option>
              <option value="Working">Working</option>
              <option value="Not Working">Not Working</option>
            </select>
          </div>
          
          <!-- Severity Wise for Mental Health Filter -->
          <div class="filter-item" v-if="selectedReport === 'Severity Report'">
            <label for="mentalHealthSeverity">Mental Health Severity:</label>
            <select v-model="filters.mentalHealthSeverity">
              <option value="">Select mental health severity</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
          
          <!-- Severity Wise for Substance Use Filter -->
          <div class="filter-item" v-if="selectedReport === 'Severity Report'">
            <label for="substanceUseSeverity">Substance Use Severity:</label>
            <select v-model="filters.substanceUseSeverity">
              <option value="">Select substance use severity</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
        </div>
        
        <!-- Generate Button -->
        <button class="generate-button" :disabled="!areFiltersFilled" @click="fetchDataAndGenerateTable">Generate Table</button>
      </div>
      
      <!-- Blank Canvas for Generated Tables -->
      <div v-if="selectedReport">
        <h3>{{ selectedReport }}</h3>
        <div class="tables-container">
          <div v-for="(table, index) in generatedTables[selectedReport]" :key="index" class="generated-table">
            <h4>{{ table.title }}</h4>
            <table class="table">
              <!-- Table headers -->
              <thead>
                <tr>
                  <th v-for="header in table.headers" :key="header">{{ header }}</th>
                </tr>
              </thead>
              <!-- Table body with dynamic data -->
              <tbody>
                <tr v-for="(row, rowIndex) in table.rows" :key="rowIndex">
                  <td v-for="(value, columnIndex) in row" :key="columnIndex">{{ value }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
import { ref, computed } from 'vue';

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
    rows: [
      ['Data 1', 'Data 2'],
      ['Data 3', 'Data 4']
    ]
  };
};
</script>

  
  <style scoped>
  /* Button styling */
  .buttons-container {
    display: flex;
    justify-content: space-around;
    margin-bottom: 20px;
  }
  
  .button {
    background-color: #72BECB;
    color: white;
    border: none;
    padding: 15px 30px;
    cursor: pointer;
    border-radius: 8px;
    font-size: 16px;
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
  
  .filter-item select,
  .filter-item input {
    padding: 8px;
    border-radius: 5px;
    border: 1px solid #ccc;
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
  .page-container {
  background-color: #D3E2E4;
  padding: 20px;
}

.tables-container {
  background-color: #D9D9D9;
  padding: 20px;
  margin-top: 20px;
}
  </style>
  