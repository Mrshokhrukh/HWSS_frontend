<template>
  <div class="container">
    <!-- Centered tabs -->
    <el-tabs v-model="currentTab" class="bg-white" justified>
      <el-tab-pane label="Data" name="data">
        <div class="tab-pane-content">
          <h2>Select Data Table(s)</h2>
          <el-checkbox-group v-model="selectedTables">
            <el-checkbox :label="table.name" v-for="table in dataTables" :key="table.name" size="medium">{{ table.name }}</el-checkbox>
          </el-checkbox-group>
          <el-button class="mt-3" type="primary" @click="gotoAttributes" :disabled="selectedTables.length === 0" size="medium">Next</el-button>
        </div>
      </el-tab-pane>
      <el-tab-pane label="Attributes" name="attributes" :disabled="!dataSelected">
        <div class="tab-pane-content">
          <h2>Select Columns</h2>
          <el-checkbox-group v-model="selectedColumns">
            <el-checkbox :label="column" v-for="column in selectedTableColumns" :key="column" size="medium">{{ column }}</el-checkbox>
          </el-checkbox-group>
          <el-button class="mt-3" type="primary" @click="gotoCharts" size="medium">Next</el-button>
        </div>
      </el-tab-pane>
      <el-tab-pane label="Charts" name="charts" :disabled="!attributesSelected">
        <div class="tab-pane-content">
          <h2>Select Chart Type</h2>
          <el-select v-model="selectedChartType" placeholder="Select chart type" size="medium">
            <el-option label="Pie Chart" value="pie"></el-option>
            <el-option label="Bar Chart" value="bar"></el-option>
            <!-- Add more chart types as needed -->
          </el-select>
          <h2 class="mt-3">Select Fields for Chart</h2>
          <el-checkbox-group v-model="selectedChartFields">
            <el-checkbox :label="column" v-for="column in selectedColumns" :key="column" size="medium">{{ column }}</el-checkbox>
          </el-checkbox-group>
          <el-button class="mt-3" type="primary" @click="generateChart" size="medium">Generate Graph</el-button>
          <div class="mt-3" id="chartContainer" style="height: 400px;">
            <h2>Chart</h2>
            <!-- Placeholder for chart -->
            <canvas id="chartCanvas"></canvas>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import Chart from 'chart.js/auto';
import { ElTabs, ElTabPane, ElCheckbox, ElCheckboxGroup, ElButton, ElSelect, ElOption } from 'element-plus';

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
.el-tabs__nav {
  font-size: 24px;
}

.tab-pane-content {
  padding: 20px;
}

#chartContainer h2 {
  font-size: 28px;
}
</style>
