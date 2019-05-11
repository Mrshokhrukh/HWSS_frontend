<template>
  <div>
    <h1>Report Data</h1>
    <ul>
      <li v-for="(item, index) in reportData" :key="index">
        {{ item }}
      </li>
    </ul>
  </div>
  <div class="row">
    <div class="col-4">
      <div class="card bg-light h-100">
        <div class="card-header">
          <h4 class="text-center">Assists</h4>
        </div>
        <div class="card-body">
          <button class="btn btn-primary btn-block mb-3" @click="handleLifetimeUserClick">
            <h1>{{ totalLifetimeUsers }}</h1>
            <p class="mb-0">Life Time User</p>
          </button>

          <button class="btn btn-primary btn-block mb-3" @click="handleDailyUsersClick">
            <h1>{{ totalDailySubstanceUsers }}</h1>
            <p class="mb-0">Daily Substance Users</p>
          </button>

          <button class="btn btn-primary btn-block mb-3" @click="handleSubstanceSeverityClick">

            Each Substance Severity
          </button>
        </div>
      </div>
    </div>

    <div class="col-8">
      <div class="card w-100 h-100">
        <div class="card-header text-center">
          <h4 class="graph-title">Assist Graph</h4>
        </div>
        <div class="card-body d-flex justify-content-center align-items-center w-100 h-50">
          <canvas id="myChart"></canvas>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue';
import Chart from 'chart.js/auto';
import axios from 'axios'
import endpoints from '@/api'

const reportData = ref([])

const fetchAssitData = async () => {
  try {
    const response = await axios.get(endpoints.getReport)
    if (response.data && Array.isArray(response.data)) {
      reportData.value = response.data
    } else {
      handleFetchError()
    }
  } catch (error) {
    handleFetchError()
  }
}

const handleFetchError = () => {
  reportData.value = []
  // Handle error
}

// const data = reportData.value;
const substances = ["Tobacco", "Alcohol", "Cannabis", "Cocaine", "Amphetamine", "Inhalants", "Sedatives", "Hallucinogens", "Opioids", "Other drugs"];
const counts = {
    substances: {},
    sex: {
        Male: 0,
        Female: 0
    }
};

// Initialize substance counts
substances.forEach(substance => {
    counts.substances[substance] = {
        "High risk": 0,
        "Moderate risk": 0,
        "No risk": 0,
        "NA": 0
    };
});

// Count substance occurrences
substances.forEach(substance => {
    const measurement = reportData.value[substance.toLowerCase() + '_measurement'];
    if (measurement) {
        counts.substances[substance][measurement]++;
    } else {
        counts.substances[substance]["NA"]++;
    }
});

// Count occurrences of Male and Female
if (reportData.value.sex === "Male") {
    counts.sex.Male++;
} else if (reportData.value.sex === "Female") {
    counts.sex.Female++;
}

console.log(counts);

onMounted(() => {
  fetchAssitData()
  
})

</script>