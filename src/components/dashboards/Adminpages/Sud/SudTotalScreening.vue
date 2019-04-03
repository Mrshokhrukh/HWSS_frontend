<template>
    <div class="row">
      <div class="col-md-6">
        <h2 class="bold">Total Screened</h2>
        <el-card class="table-container mt-4" style="font-weight: bold;">
          <h5 class="card-title text-center">Total Screened</h5>
          <div class="table-responsive">
            <el-table :data="totalScreenedData" border style="width: 100%">
              <el-table-column prop="category" label="Category"></el-table-column>
              <el-table-column prop="count" label="Count"></el-table-column>
            </el-table>
          </div>
        </el-card>
      </div>
      <div class="col-md-6">
        <h2 class="bold">Weekly Screened</h2>
        <el-card class="table-container mt-4" style="font-weight: bold;">
          <h5 class="card-title text-center">Weekly Screened</h5>
          <div class="table-responsive">
            <el-table :data="weeklyScreenedData" border style="width: 100%">
              <el-table-column prop="category" label="Category"></el-table-column>
              <el-table-column prop="count" label="Count"></el-table-column>
            </el-table>
          </div>
        </el-card>
      </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElTable, ElTableColumn, ElCard } from 'element-plus';

const totalScreenedData = ref([]);
const weeklyScreenedData = ref([]);

const fetchData = async () => {
  try {
    // Assuming these are API endpoints that return data in the format: [{ category: string, count: number }]
    const totalScreenedResponse = await fetch('TOTAL_SCREENED_API_ENDPOINT');
    const weeklyScreenedResponse = await fetch('WEEKLY_SCREENED_API_ENDPOINT');

    const totalScreenedJson = await totalScreenedResponse.json();
    const weeklyScreenedJson = await weeklyScreenedResponse.json();

    totalScreenedData.value = totalScreenedJson;
    weeklyScreenedData.value = weeklyScreenedJson;
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
/* Add custom styles here */
</style>
