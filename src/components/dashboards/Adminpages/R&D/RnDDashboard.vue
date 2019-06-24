<template>
  <div class="container">
    <div class="card border shadow-sm w-100">
      <div class="card-header bg-white text-start">
        <h2 class="card-title mb-0 hwss-primary">Filters</h2>
      </div>
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-3">
            <label for="region" class="form-label">Region:</label>
            <select id="region" v-model="region" class="form-select">
              <option value="region1">Region 1</option>
              <option value="region2">Region 2</option>
              <!-- Add more options as needed -->
            </select>
          </div>
          <div class="col-md-3">
            <label for="dzongkhag" class="form-label">Dzongkhag:</label>
            <select id="dzongkhag" v-model="dzongkhag" class="form-select">
              <option value="dzongkhag1">Dzongkhag 1</option>
              <option value="dzongkhag2">Dzongkhag 2</option>
              <!-- Add more options as needed -->
            </select>
          </div>
          <div class="col-md-3">
            <label for="agency" class="form-label">Agency:</label>
            <select id="agency" v-model="agency" class="form-select">
              <option value="agency1">Agency 1</option>
              <option value="agency2">Agency 2</option>
              <!-- Add more options as needed -->
            </select>
          </div>
          <div class="col-md-3">
            <label for="institute" class="form-label">Institute/Org:</label>
            <select id="institute" v-model="institute" class="form-select">
              <option value="institute1">Institute 1</option>
              <option value="institute2">Institute 2</option>
              <!-- Add more options as needed -->
            </select>
          </div>
        </div>
        <div class="mt-3">
          <button @click="generateReport" class="btn btn-primary">Generate</button>
        </div>
      </div>
    </div>

    <div class="shadow-sm">
      <RndDataDisplay />
    </div>
    <div class="shadow-sm">
      <RnDChartTables />
    </div>
  </div>
</template>
<script setup>
import RndDataDisplay from './RndDataDisplay.vue'
import RnDGraph from './RnDGraph.vue'
import RnDChartTables from './RnDChartTables.vue'
import { ref } from 'vue';

const region = ref('');
const dzongkhag = ref('');
const agency = ref('');
const institute = ref('');

const generateReport = () => {
  console.log('Generating report...');
  console.log('Selected Filters:');
  console.log('Region:', region.value);
  console.log('Dzongkhag:', dzongkhag.value);
  console.log('Agency:', agency.value);
  console.log('Institute/Org:', institute.value);
};
</script>
<style scoped>
.card {
  border-radius: 4px;
  margin: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.card-header {
  padding: 10px;
  font-weight: bold;
  text-align: center;
}

.card-body {
  padding: 20px;
}

.form-label {
  font-weight: bold;
}

.form-select {
  padding: 8px;
  margin-top: 4px;
  font-size: 14px;
}

.btn-primary {
  background-color: #007bff;
  color: white;
  transition: background-color 0.3s ease;
}

.btn-primary:hover {
  background-color: #0056b3;
}
</style>
