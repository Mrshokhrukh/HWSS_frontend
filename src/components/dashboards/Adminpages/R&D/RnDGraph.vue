<template>
  <div class="row g-5 mt-1">
    <div class="col-md-6">
      <div class="card">
        <div class="card-header hwss-primary text-white">
          <h3 class="card-title mb-3 text-start">No. of Schools</h3>
        </div>
        <div class="card-body hwss-primary">
          <canvas ref="schoolsChart" width="400" height="300"></canvas>
        </div>
      </div>
    </div>
    <div class="col-md-6">
      <div class="card">
        <div class="card-header hwss-primary text-white">
          <h3 class="card-title mb-3 text-start">No. of Individuals with Suicidal Behavior</h3>
        </div>
        <div class="card-body hwss-primary">
          <canvas ref="suicidalBehaviorChart" width="400" height="300"></canvas>
        </div>
      </div>
    </div>
    <div class="col-md-6">
      <div class="card">
        <div class="card-header hwss-primary text-white">
          <h3 class="card-title mb-3 text-start">No. of Employees</h3>
        </div>
        <div class="card-body hwss-primary">
          <canvas ref="employeesChart" width="400" height="300"></canvas>
        </div>
      </div>
    </div>
    <div class="col-md-6">
      <div class="card">
        <div class="card-header hwss-primary text-white">
          <h3 class="card-title mb-3 text-start">No. of Patients</h3>
        </div>
        <div class="card-body hwss-primary">
          <canvas ref="patientsChart" width="400" height="300"></canvas>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import Chart from 'chart.js/auto';

// Example data for Chart.js (replace with your actual data)
const schoolsData = {
  labels: ['Group A', 'Group B', 'Group C', 'Group D', 'Group E'],
  datasets: [{
    label: 'No. of Schools',
    data: [12, 19, 3, 5, 2],
    backgroundColor: '#87ceeb',
    borderColor: '#87ceeb',
    borderWidth: 1
  }]
};

const suicidalBehaviorData = {
  labels: ['January', 'February', 'March', 'April', 'May'],
  datasets: [{
    label: 'No. of Individuals',
    data: [10, 20, 15, 25, 30],
    backgroundColor: '#87ceeb',
    borderColor: '#87ceeb',
    borderWidth: 1
  }]
};

const employeesData = {
  labels: ['Team A', 'Team B', 'Team C', 'Team D', 'Team E'],
  datasets: [{
    label: 'No. of Employees',
    data: [8, 15, 10, 12, 5],
    backgroundColor: '#87ceeb',
    borderColor: '#87ceeb',
    borderWidth: 1
  }]
};

const patientsData = {
  labels: ['Male', 'Female', 'Children', 'Adults', 'Seniors'],
  datasets: [{
    label: 'No. of Patients',
    data: [20, 30, 15, 25, 10],
    backgroundColor: '#87ceeb',
    borderColor: '#87ceeb',
    borderWidth: 1
  }]
};

const schoolsChart = ref(null);
const suicidalBehaviorChart = ref(null);
const employeesChart = ref(null);
const patientsChart = ref(null);

onMounted(() => {
  // Initialize Chart.js instances
  if (schoolsChart.value && suicidalBehaviorChart.value && employeesChart.value && patientsChart.value) {
    new Chart(schoolsChart.value, {
      type: 'bar',
      data: schoolsData,
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'No. of Schools'
          }
        }
      }
    });

    new Chart(suicidalBehaviorChart.value, {
      type: 'bar',
      data: suicidalBehaviorData,
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'No. of Individuals with Suicidal Behavior'
          }
        }
      }
    });

    new Chart(employeesChart.value, {
      type: 'bar',
      data: employeesData,
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'No. of Employees'
          }
        }
      }
    });

    new Chart(patientsChart.value, {
      type: 'bar',
      data: patientsData,
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'No. of Patients'
          }
        }
      }
    });
  }
});
</script>

<style scoped>
.card {
  border: 1px solid #ccc;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.card-header {
  padding: 10px;
  font-weight: bold;
  text-align: center;
  background-color: #fff;
}

.card-body {
  padding: 20px;
}

.bg-info {
  background-color: #87ceeb !important;
  /* Sky blue background color */
}
</style>
