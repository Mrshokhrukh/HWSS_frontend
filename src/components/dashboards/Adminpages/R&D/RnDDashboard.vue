<template>
    <div class="container">
      <!-- Centered tabs -->
      <ul class="nav nav-tabs justify-content-center bg-white" role="tablist">
        <li class="nav-item">
          <a class="nav-link" :class="{ active: currentTab === 'data' }" @click="currentTab = 'data'">Data</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" :class="{ active: currentTab === 'attributes' }" @click="currentTab = 'attributes'" :disabled="!dataSelected">Attributes</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" :class="{ active: currentTab === 'charts' }" @click="currentTab = 'charts'" :disabled="!attributesSelected">Charts</a>
        </li>
      </ul>
  
      <!-- Tab content -->
      <div class="tab-content">
        <!-- Data tab content -->
        <div class="tab-pane fade" :class="{ 'show active': isDataTab }" id="data-tab">
          <h4>Select Data Table(s)</h4>
          <div class="form-check" v-for="table in dataTables" :key="table.name">
            <input class="form-check-input" type="checkbox" :id="table.name" :value="table.name" v-model="selectedTables">
            <label class="form-check-label" :for="table.name">{{ table.name }}</label>
          </div>
          <button class="btn btn-primary mt-3" @click="gotoAttributes" :disabled="selectedTables.length === 0">Next</button>
        </div>
  
        <!-- Attributes tab content -->
        <div class="tab-pane fade" :class="{ 'show active': isAttributesTab }" id="attributes-tab">
          <h4>Select Columns</h4>
          <div class="form-check" v-for="column in selectedTableColumns" :key="column">
            <input class="form-check-input" type="checkbox" :id="column" :value="column" v-model="selectedColumns">
            <label class="form-check-label" :for="column">{{ column }}</label>
          </div>
          <button class="btn btn-primary mt-3" @click="gotoCharts">Next</button>
        </div>
  
        <!-- Charts tab content -->
        <div class="tab-pane fade" :class="{ 'show active': isChartsTab }" id="charts-tab">
          <h4>Select Chart Type</h4>
          <select v-model="selectedChartType">
            <option value="pie">Pie Chart</option>
            <option value="bar">Bar Chart</option>
            <!-- Add more chart types as needed -->
          </select>
          <h4>Select Fields for Chart</h4>
          <div class="form-check" v-for="column in selectedColumns" :key="column">
            <input class="form-check-input" type="checkbox" :id="column" :value="column" v-model="selectedChartFields">
            <label class="form-check-label" :for="column">{{ column }}</label>
          </div>
          <button class="btn btn-primary mt-3" @click="generateChart">Generate Graph</button>
          <div class="mt-3" id="chartContainer" style="height: 400px;">
            <h4>Chart</h4>
            <!-- Placeholder for chart -->
            <canvas id="chartCanvas"></canvas>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue';
  import Chart from 'chart.js/auto';
  
  // Data and methods
  const currentTab = ref('data');
  const dataSelected = ref(false); // Set to true to enable Attributes tab
  const attributesSelected = ref(false); // Set to true to enable Charts tab
  
  // Example data tables received from the API
  const dataTables = ref([
    {
      name: 'Table 1',
      columns: ['Column 1', 'Column 2', 'Column 3']
    },
    {
      name: 'Table 2',
      columns: ['Name', 'Age', 'Gender']
    }
  ]);
  
  // Selected tables and columns
  const selectedTables = ref([]);
  const selectedColumns = ref([]);
  
  // Chart type selection
  const selectedChartType = ref('pie');
  
  // Selected fields for the chart
  const selectedChartFields = ref([]);
  
  // Computed properties
  const isDataTab = computed(() => currentTab.value === 'data');
  const isAttributesTab = computed(() => currentTab.value === 'attributes');
  const isChartsTab = computed(() => currentTab.value === 'charts');
  
  // Get columns of selected table
  const selectedTableColumns = computed(() => {
    const columns = [];
    selectedTables.value.forEach(tableName => {
      const table = dataTables.value.find(table => table.name === tableName);
      if (table) {
        columns.push(...table.columns);
      }
    });
    return columns;
  });
  
  // Go to Attributes tab
  const gotoAttributes = () => {
    if (selectedTables.value.length > 0) {
      currentTab.value = 'attributes';
    }
  };
  
  // Go to Charts tab
  const gotoCharts = () => {
    if (selectedColumns.value.length > 0) {
      currentTab.value = 'charts';
    }
  };
  
  // Function to generate chart
  const generateChart = () => {
    // Prepare chart data based on selectedChartFields and selectedChartType
    const chartData = {
      labels: selectedChartFields.value,
      datasets: [{
        label: 'Dataset',
        data: [10, 20, 30], // Example data
        backgroundColor: ['red', 'blue', 'green'], // Example colors
      }]
    };
  
    // Chart configuration
    const chartConfig = {
      type: selectedChartType.value, // Use selected chart type
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false
        // Add more chart options as needed
      }
    };
  
    // Render the chart
    const ctx = document.getElementById('chartCanvas').getContext('2d');
    new Chart(ctx, chartConfig);
  };
  </script>
  
  <style scoped>
  /* Larger tabs */
  .nav-tabs .nav-link {
    font-size: 20px;
  }
  
  #chartContainer {
    margin-top: 20px;
  }
  </style>
  