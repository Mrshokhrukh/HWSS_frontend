<template>
  <div class="container">
    <div class="row d-flex justify-content-center">
      <!-- Clustered Screening Donut Graph -->
      <div class="col-md-4 mx-auto">
        <h4 class="text-center fw-bold mt-5 mb-4" style="color: #2c6975;">Clustered Screening</h4>
        <div class="card">
          <div class="card-body">
            <Chart :type="chartType" :data="clusteredData" :options="donutOptions" legend="bottom" loading="Loading..." />
          </div>
          <div class="d-flex align-items-center ">
            <p class="fs-5 fw-bold mx-auto">Male: {{ maleCount }}</p>
            <p class="fs-5 fw-bold mx-auto">Female: {{ femaleCount }}</p>
            <p class="fs-5 fw-bold mx-auto">Total: {{ totalCount }}</p>
          </div>
        </div>
      </div>

      <!-- Independent Donut Graph -->
      <div class="col-md-4 mx-auto">
        <h4 class="text-center fw-bold mt-5 mb-4" style="color: #2c6975;">Independent Screening</h4>
        <div class="card">
          <div class="card-body">
            <Chart :type="chartType" :data="independentData" :options="donutOptions" />
          </div>
          <div class="d-flex align-items-center">
            <p class="fs-5 fw-bold mx-auto">Male: {{ data1 }}</p>
            <p class="fs-5 fw-bold mx-auto">Female: {{ data2 }}</p>
            <p class="fs-5 fw-bold mx-auto">Total: {{ total }}</p>  
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import Chart from 'primevue/chart';


const maleCount = ref(200);
const femaleCount = ref(300);
const totalCount = ref(500);
const data1 = ref(300);
const data2 = ref(100);
const total = ref(400);

const clusteredData = ref([]);
const independentData = ref([]);
const donutOptions = ref({});
const chartType = 'doughnut';

onMounted(() => {
  setChartData();
  setChartOptions();
});

const setChartData = () => {
  clusteredData.value = {
    labels: ['Male', 'Female'],
    datasets: [
      {
        data: [maleCount.value, femaleCount.value],
        backgroundColor: ['#2c6975', '#64ac99']
      }
    ]
  };

  independentData.value = {
    labels: ['Male', 'Female'],
    datasets: [
      {
        data: [data1.value, data2.value],
        backgroundColor: ['#2c6975', '#64ac99']
      }
    ]
  };

};

const setChartOptions = () => {
  // Set common options for both charts here
  donutOptions.value = {
    plugins: {
      legend: {
        labels: {
          cutout: '60%',
          color: '#242424'
        }
      }
    }
  };

};
</script>

<style scoped>
.graph2 {
  margin-left: 300px;
}
</style>
