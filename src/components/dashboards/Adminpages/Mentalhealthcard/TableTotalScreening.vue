<template>
  <div>
    <h5 class="card-title text-center">Screening Data</h5>
    <div class="row">
      <div class="col-md-6">
        <!-- First Table: Total Screened -->
        <el-card class="table-container mt-4" style="font-weight: bold;">
          <h5 class="card-title text-center">Total Screened</h5>
          <div class="table-responsive">
            <el-table :data="totalScreenedData" border style="width: 100%" :default-sort="{ prop: 'category', order: 'descending' }" row-class-name="rowClassName">
              <el-table-column class="bg" prop="category" label="" sortable></el-table-column>
              <el-table-column class="bg" prop="female" label="Female"></el-table-column>
              <el-table-column class="bg" prop="male" label="Male"></el-table-column>
            </el-table>
          </div>
        </el-card>
      </div>

      <div class="col-md-6">
        <!-- Second Table: Weekly Screened -->
        <el-card class="table-container mt-4" style="font-weight: bold;">
          <h5 class="card-title text-center">Weekly Screened</h5>
          <div class="table-responsive">
            <el-table :data="weeklyScreenedData" border style="width: 100%" :default-sort="{ prop: 'category', order: 'descending' }" row-class-name="rowClassName">
              <el-table-column class="bg" prop="category" label="" sortable></el-table-column>
              <el-table-column class="bg" prop="female" label="Female"></el-table-column>
              <el-table-column class="bg" prop="male" label="Male"></el-table-column>
            </el-table>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElTable, ElTableColumn, ElCard } from 'element-plus';

// Define reactive variables to store table data fetched from API
const totalScreenedData = ref([]);
const weeklyScreenedData = ref([]);

// Function to fetch total screened data from API
const fetchTotalScreenedData = async () => {
  try {
    const response = await fetch('TOTAL_SCREENED_API_ENDPOINT');
    const data = await response.json();
    // Assuming API response contains total screened data
    totalScreenedData.value = data;
  } catch (error) {
    console.error('Error fetching total screened data:', error);
  }
};

// Function to fetch weekly screened data from API
const fetchWeeklyScreenedData = async () => {
  try {
    const response = await fetch('WEEKLY_SCREENED_API_ENDPOINT');
    const data = await response.json();
    // Assuming API response contains weekly screened data
    weeklyScreenedData.value = data;
  } catch (error) {
    console.error('Error fetching weekly screened data:', error);
  }
};

// Call fetch functions when component is mounted
onMounted(() => {
  fetchTotalScreenedData();
  fetchWeeklyScreenedData();
});

// Function to apply row class based on condition
const rowClassName = ({ row }) => {
  if (row.category === 'Total New Screened') {
    return 'highlight-row';
  }
};
</script>

<style scoped>
.bg {
  background-color: #68B2A0;
}
</style>
