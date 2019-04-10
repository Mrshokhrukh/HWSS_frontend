<template>
  <div class="container">
    <div class="row">
      <!-- Clustered Screening Donut Graph -->
      <div class="col-md-4">
        <h4 class="text-center fw-bold mt-5 mb-4" style="color: #2c6975;">Clustered Screening</h4>
        <div class="card">
          <div class="card-body">
            <canvas ref="clusteredDonutChart"></canvas>
          </div>

          <p class=" text-center fs-3 fw-bold">Total {{ total }}</p>
          <div class="d-flex flex-row">
            <p class="fs-3 fw-bold ms-5">M {{ maleCount }}</p>
            <p class="fs-3 fw-bold ms-5">F {{ femaleCount }}</p>

          </div>

        </div>
      </div>

      <!-- Independent Donut Graph -->
      <div class=" graph2 col-md-4">
        <h4 class="text-center fw-bold mt-5 mb-4" style="color: #2c6975;">Independent Screening</h4>
        <div class="card">
          <div class="card-body">
            <canvas ref="independentDonutChart"></canvas>
          </div>
          <!-- Customize the data and labels as needed for the independent graph -->
          <p class=" text-center fs-3 fw-bold">Total {{ independentTotal }}</p>
          <div class="d-flex flex-row">
            <p class="fs-3 fw-bold ms-5">M {{ data1 }}</p>
            <p class="fs-3 fw-bold ms-5">F {{ data2 }}</p>
          </div>


        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import Chart from 'chart.js/auto';

export default {
  name: 'DualDonutCharts',
  data() {
    return {
      total: 500,
      maleCount: 200,
      femaleCount: 300,
      clusteredDonutChart: null,
      independentTotal: 400, // Customize with your independent data
      data1: 300, // Customize with your independent data
      data2: 100, // Customize with your independent data
      independentDonutChart: null
    };
  },
  mounted() {
    this.createClusteredDonutChart();
    this.createIndependentDonutChart();
  },
  methods: {
    createClusteredDonutChart() {
      const ctx = this.$refs.clusteredDonutChart.getContext('2d');
      this.clusteredDonutChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Male', 'Female'],
          datasets: [{
            data: [this.maleCount, this.femaleCount],
            backgroundColor: [
              '#2c6975',
              '#000000',
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          legend: {
            display: false
          }
        }
      });
    },
    createIndependentDonutChart() {
      const ctx = this.$refs.independentDonutChart.getContext('2d');
      this.independentDonutChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Label 1', 'Label 2'],
          datasets: [{
            data: [this.data1, this.data2],
            backgroundColor: [
              '#2c6975',
              '#000000',
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          legend: {
            display: false
          }
        }
      });
    }
  }
};
</script>

<style scoped>
.graph2 {
  margin-left: 300px;
  ;
}

/* Add your custom styles here */
</style>
