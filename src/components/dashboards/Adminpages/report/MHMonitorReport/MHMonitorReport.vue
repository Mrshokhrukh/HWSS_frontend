<template>
  <div class="row">
    <div class="col-md-3 text-center">
      <div class="card option">
        <div class="card-body">
          <p class="card-text">Data Set</p>
          <div class="form-check text-start">
            <input class="form-check-input" type="checkbox" value="Rescreening Count" id="check1" v-model="selectedOptions">
            <label class="form-check-label" for="check1">
              Rescreening Count
            </label>
          </div>
          <div class="form-check text-start">
            <input class="form-check-input" type="checkbox" value="Counseling" id="check2" v-model="selectedOptions">
            <label class="form-check-label" for="check2">
              Counseling
            </label>
          </div>
          <div class="form-check text-start">
            <input class="form-check-input" type="checkbox" value="Assessment" id="check3" v-model="selectedOptions">
            <label class="form-check-label" for="check3">
              Assessment
            </label>
          </div>
          <div class="form-check text-start">
            <input class="form-check-input" type="checkbox" value="Referral" id="check4" v-model="selectedOptions">
            <label class="form-check-label" for="check4">
              Referral
            </label>
          </div>
          <div class="form-check text-start">
            <input class="form-check-input" type="checkbox" value="Followup" id="check5" v-model="selectedOptions">
            <label class="form-check-label" for="check5">
              Followup
            </label>
          </div>
          <button type="submit" class="btn btn-primary mt-3" @click="generateGraph">Generate</button>
        </div>
      </div>
    </div>
    <div class="col-md-9 text-center">
      <div class="card option">
        <div class="card-body">
          <p class="card-text">Graph</p>
          <div>
            <canvas ref="SelectedChartCanvas"></canvas>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import Chart from 'chart.js/auto';
import { inject } from 'vue';

const SelectedChartCanvas = ref(null);
const reportData = inject('filteredData');
// Ensure reportData is an array
const data = Array.isArray(reportData.value) ? reportData.value : [];

const datacall = {
        'Rescreening Count': item.rescreened,
        'Counseling': item.service_and_treatment?.counseling,
        'Assessment': item.service_and_treatment?.assessment_status,
        'Referral': item.service_and_treatment?.referred,
        'Followup': item.service_and_treatment?.follow_up,
      };
// Function to extract selected data values dynamically from service_and_treatment or rescreened
function extractSelectedValues(data) {
  const selectedDataValues = new Set(); // Use a Set to ensure uniqueness
  data.forEach(item => {
    if (datacall.value) {
      selectedDataValues.add(datacall.value);
    }
  });
  return Array.from(selectedDataValues); // Convert Set to Array for easy manipulation
}

// Function to count occurrences of each follow_up value
function countSelectedDataValues(data) {
  const counts = {};
  data.forEach(value => {
    counts[value] = (counts[value] || 0) + 1;
  });
  return counts;
}

// Extract follow_up values and count them
const SelectedDataOptions = extractSelectedValues(data);
const SelectedDataCounts = countSelectedDataValues(data.map(item => datacall.value ).filter(Boolean));

// Prepare data for Chart.js
const SelectedDataLabels = Object.keys(SelectedDataCounts);
const SelectedData = Object.values(SelectedDataCounts);

// Define a larger set of colors
const followUpBackgroundColors = [
  'rgba(44, 105, 117, 1)',
  'rgba(114, 190, 203, 1)',
  'rgba(104, 178, 160, 1)',
];

</script>