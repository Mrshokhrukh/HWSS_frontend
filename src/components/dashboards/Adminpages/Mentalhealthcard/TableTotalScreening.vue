<template>
  <el-card class="table-container" style="font-weight: bold;">
    <h5 class="card-title text-center">Status Table</h5>
    <div class="table-responsive">
      <el-table :data="tableData" border style="width: 100%" :default-sort="{ prop: 'category', order: 'descending' }" row-class-name="rowClassName">
        <el-table-column class="bg" prop="category" label="" sortable></el-table-column>
        <el-table-column class="bg" prop="female" label="Female"></el-table-column>
        <el-table-column class="bg" prop="male" label="Male"></el-table-column>
      </el-table>
    </div>
  </el-card>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElTable, ElTableColumn, ElCard } from 'element-plus';

// Define a reactive variable to store table data fetched from API
const tableData = ref([]);

// Function to fetch table data from API
const fetchTableData = async () => {
  try {
    const response = await fetch('YOUR_API_ENDPOINT');
    const data = await response.json();
    // Assuming API response contains table data
    tableData.value = data;
  } catch (error) {
    console.error('Error fetching table data:', error);
  }
};

// Call fetchTableData function when component is mounted
onMounted(() => {
  fetchTableData();
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
