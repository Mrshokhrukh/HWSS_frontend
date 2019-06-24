<template>
  <div class="row">
    <div class="col-md-3 text-center">
      <div class="card option">
        <div class="card-body">
          <p class="card-text">Data Set</p>
          <div v-for="(option, index) in dataOptions" :key="index" class="form-check text-start">
            <input class="form-check-input" type="checkbox" :value="option.value" :id="'check'+index" v-model="selectedOptions">
            <label class="form-check-label" :for="'check'+index">
              {{ option.label }}
            </label>
          </div>
          <button @click="generateChart" class="btn btn-primary mt-3">Generate</button>
        </div>
      </div>
    </div>
    <div class="col-md-9 text-center">
      <div class="card option">
        <div class="card-body">
          <p class="card-text">Graph</p>
          <div>
            <canvas ref="chartCanvas"></canvas>
          </div>
          <div class=showtable >
            <table v-if="showTable" class="table mt-3">
            <thead>
              <tr>
                <th v-for="(value, key) in Tabledata[0]" :key="key">{{ key }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(data, index) in Tabledata" :key="index">
                <td v-for="(value, key) in data" :key="key">{{ value }}</td>
              </tr>
            </tbody>
          </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import Chart from 'chart.js/auto';
import { inject } from 'vue';

const chartCanvas = ref(null);
const reportData = inject('filteredData');

const dataOptions = [
  { label: 'All', value: 'all' },
  { label: 'Rescreening Count', value: 'rescreened' },
  { label: 'Counseling', value: 'counseling' },
  { label: 'Assessment', value: 'assessment_status' },
  { label: 'Referral', value: 'referred' },
  { label: 'Follow-up', value: 'follow_up' }
];

const Tabledata =[
  { 'Rescreening Count': 3,
    'Counseling': 12,
    'Assessment': 5,
    'Referral' : 2,
    'Follow-up': 4
  }
];

const selectedOptions = ref([]);

let chart = null;
let showTable = false;

const generateChart = () => {
  if (chart) {
    chart.destroy();
  }

  if (selectedOptions.value.includes('all')) {
    showTable = true;
    return;
  } else {
    showTable = false;
  }

  const data = Array.isArray(reportData.value) ? reportData.value : [];

  const chartData = {
    labels: selectedOptions.value,
    datasets: [{
      label: 'Counts',
      data: selectedOptions.value.map(option => {
        return data.reduce((count, item) => {
          if (option === 'rescreened') {
            return count + (item[option] ? 1 : 0);
          } else {
            return count + (item.service_and_treatment && item.service_and_treatment[option] ? 1 : 0);
          }
        }, 0);
      }),
      backgroundColor: [
        'rgba(44, 105, 117, 1)',
        'rgba(114, 190, 203, 1)',
        'rgba(104, 178, 160, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)'
      ],
    }]
  };

  const ctx = chartCanvas.value.getContext('2d');
  chart = new Chart(ctx, {
    type: 'bar',
    data: chartData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
    },
  });
};

onMounted(() => {
  if (chartCanvas.value) {
    generateChart();
  }
});

watch(reportData, () => {
  generateChart();
}, { deep: true });
</script>
