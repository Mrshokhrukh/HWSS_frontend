<template>
  <div>
    <!-- Big cards on the top -->
    <div class="mt-5">
      <div class="row justify-content-center mb-3">
        <!-- Card for selecting Data -->
        <div class="col-md-4 text-center">
          <div class="card option" :class="{ active: currentStage === 'data', completed: currentStage !== 'data' }"
            @click="selectStage('data')">
            <div class="card-body">
              <i class="fas fa-database fa-3x mb-3"></i>
              <p class="card-text">DATA</p>
            </div>
          </div>
        </div>
        <!-- Card for selecting Attributes (Disabled if no table selected) -->
        <div class="col-md-4 text-center">
          <div class="card option"
            :class="{ active: currentStage === 'attributes', completed: currentStage === 'charts' }"
            :disabled="currentStage !== 'attributes'" @click="selectStage('attributes')">
            <div class="card-body">
              <i class="fas fa-tags fa-3x mb-3"></i>
              <p class="card-text">Attributes</p>
            </div>
          </div>
        </div>
        <!-- Card for selecting Charts (Disabled if no table selected) -->
        <div class="col-md-4 text-center">
          <div class="card option" :class="{ active: currentStage === 'charts' }" :disabled="currentStage !== 'charts'"
            @click="selectStage('charts')">
            <div class="card-body">
              <i class="fas fa-chart-bar fa-3x mb-3"></i>
              <p class="card-text">Charts</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Show different components based on selected option -->
      <div class="row justify-content-center mt-3">
        <div v-if="currentStage === 'data'" class="col-md-8">
          <!-- Show DATA Component -->
          <div v-if="currentStage === 'data'" class="data-content">
            <!-- Content -->
            <h2 class="text-center">Select the Data set you want</h2>
            <!-- Checklist -->
            <ul class="list-group">
              <li v-for="(item, index) in dataSets" :key="index" class="list-group-item">
                <div class="form-check">
                  <input class="form-check-input" type="checkbox" :id="'dataset' + index" v-model="selectedDataSets"
                    :value="item">
                  <label class="form-check-label" :for="'dataset' + index">{{ item }}</label>
                </div>
              </li>
            </ul>
            <button class="btn btn-primary" @click="nextStage('attributes')">Next</button>
          </div>
        </div>
        <div v-if="currentStage === 'attributes'" class="col-md-8">
          <!-- Show Attributes Component -->
          <div v-if="currentStage === 'attributes'" class="data-content">
            <h2 class="text-center">Select the Attributes you want</h2>
            <ul class="list-group">
              <li v-for="(key, index) in selectedDataKeys" :key="index" class="list-group-item">
                <div class="form-check">
                  <input class="form-check-input" type="checkbox" :id="'attribute' + index" :value="key">
                  <label class="form-check-label" :for="'attribute' + index">{{ key }}</label>
                </div>
              </li>
            </ul>
            <button class="btn btn-primary" @click="nextStage('charts')">Next</button>
          </div>
        </div>
        <!-- Char Content -->
        <div v-if="currentStage === 'charts'" class="col-md-8">
          <!-- Show Charts Component -->
          <div v-if="currentStage === 'charts'" class="data-content">
            <h2 class="text-center">Select Chart Type</h2>
            <!-- Dropdown menu for chart type -->
            <select class="form-select mb-3" v-model="selectedChartType">
              <option disabled value="">Select Chart Type</option>
              <option value="pie">Pie Chart</option>
              <option value="bar">Bar Chart</option>
              <option value="donut">Donut Graph</option>
            </select>
            <!-- Display selected chart type -->
            <p v-if="selectedChartType" class="text-center">Selected Chart Type: {{ selectedChartType }}</p>

            <h2 class="text-center">Select Attribute for Chart</h2>

            <select class="form-select mb-3" v-model="selectedAttribute">
              <option disabled value="">Select Attribute</option>
              <option v-for="(key, index) in selectedDataKeys" :key="index" :value="key">{{ key }}</option>
            </select>
            <!-- Display selected attribute -->
            <p v-if="selectedAttribute" class="text-center">Selected Attribute: {{ selectedAttribute }}</p>

            <!-- Button to generate graph -->
            <button class="btn btn-primary" @click="generateGraph">Generate Graph</button>
          </div>
          <div>
            <canvas id="myChart" width="400" height="400"></canvas>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import Chart from 'chart.js/auto';

const currentStage = ref('data');

// Function to select a stage
const selectStage = (stage) => {
  currentStage.value = stage;
};
const dataSets = [
  'Case Screening',
  'Event Based Screening',
  'PHQ Data set',
  'GAD Data Set',
  'ASSIST Data Set',
  'ACE Data Set'
]
const dataSetDummyData = {
  'Case Screening': [
    { age: 25, gender: 'Male', dzongkhag: 'Thimphu', riskLevel: 'high', depression: 'yes', anxiety: 'moderate' },
    { age: 30, gender: 'Female', dzongkhag: 'Paro', riskLevel: 'low', depression: 'no', anxiety: 'low' },
    { age: 35, gender: 'Male', dzongkhag: 'Punakha', riskLevel: 'moderate', depression: 'no', anxiety: 'high' },
    { age: 40, gender: 'Female', dzongkhag: 'Bumthang', riskLevel: 'high', depression: 'yes', anxiety: 'low' },
    { age: 45, gender: 'Male', dzongkhag: 'Wangdue', riskLevel: 'low', depression: 'yes', anxiety: 'moderate' },
    { age: 50, gender: 'Female', dzongkhag: 'Haa', riskLevel: 'moderate', depression: 'no', anxiety: 'high' },
    { age: 55, gender: 'Male', dzongkhag: 'Chukha', riskLevel: 'high', depression: 'no', anxiety: 'low' },
    { age: 60, gender: 'Female', dzongkhag: 'Samdrup Jongkhar', riskLevel: 'low', depression: 'yes', anxiety: 'moderate' },
    { age: 65, gender: 'Male', dzongkhag: 'Trashigang', riskLevel: 'moderate', depression: 'no', anxiety: 'high' },
    { age: 70, gender: 'Female', dzongkhag: 'Mongar', riskLevel: 'high', depression: 'yes', anxiety: 'low' }
  ],
  'Event Based Screening': [
    { age: 30, gender: 'Male', dzongkhag: 'Thimphu', riskLevel: 'low', depression: 'no' },
    { age: 35, gender: 'Female', dzongkhag: 'Paro', riskLevel: 'moderate', depression: 'no' },
    { age: 40, gender: 'Male', dzongkhag: 'Punakha', riskLevel: 'high', depression: 'yes' },
    { age: 45, gender: 'Female', dzongkhag: 'Bumthang', riskLevel: 'low', depression: 'yes' },
    { age: 50, gender: 'Male', dzongkhag: 'Wangdue', riskLevel: 'moderate', depression: 'no' },
    { age: 55, gender: 'Female', dzongkhag: 'Haa', riskLevel: 'high', depression: 'yes' },
    { age: 60, gender: 'Male', dzongkhag: 'Chukha', riskLevel: 'low', depression: 'yes' },
    { age: 65, gender: 'Female', dzongkhag: 'Samdrup Jongkhar', riskLevel: 'moderate', depression: 'no' },
    { age: 70, gender: 'Male', dzongkhag: 'Trashigang', riskLevel: 'high', depression: 'no' },
    { age: 75, gender: 'Female', dzongkhag: 'Mongar', riskLevel: 'low', depression: 'yes' }
  ],
  'PHQ Data set': [
    { age: 35, gender: 'Male', dzongkhag: 'Thimphu', riskLevel: 'moderate', depression: 'no' },
    { age: 40, gender: 'Female', dzongkhag: 'Paro', riskLevel: 'high', depression: 'yes' },
    { age: 45, gender: 'Male', dzongkhag: 'Punakha', riskLevel: 'low', depression: 'yes' },
    { age: 50, gender: 'Female', dzongkhag: 'Bumthang', riskLevel: 'moderate', depression: 'no' },
    { age: 55, gender: 'Male', dzongkhag: 'Wangdue', riskLevel: 'high', depression: 'no' },
    { age: 60, gender: 'Female', dzongkhag: 'Haa', riskLevel: 'low', depression: 'yes' },
    { age: 65, gender: 'Male', dzongkhag: 'Chukha', riskLevel: 'moderate', depression: 'no' },
    { age: 70, gender: 'Female', dzongkhag: 'Samdrup Jongkhar', riskLevel: 'high', depression: 'yes' },
    { age: 75, gender: 'Male', dzongkhag: 'Trashigang', riskLevel: 'low', depression: 'yes' },
    { age: 80, gender: 'Female', dzongkhag: 'Mongar', riskLevel: 'moderate', depression: 'no' }
  ],
  'GAD Data Set': [
    { age: 40, gender: 'Male', dzongkhag: 'Thimphu', riskLevel: 'high', depression: 'yes', substanceUse: 'yes' },
    { age: 45, gender: 'Female', dzongkhag: 'Paro', riskLevel: 'low', depression: 'no', substanceUse: 'no' },
    { age: 50, gender: 'Male', dzongkhag: 'Punakha', riskLevel: 'moderate', depression: 'no', substanceUse: 'no' },
    { age: 55, gender: 'Female', dzongkhag: 'Bumthang', riskLevel: 'high', depression: 'yes', substanceUse: 'yes' },
    { age: 60, gender: 'Male', dzongkhag: 'Wangdue', riskLevel: 'low', depression: 'yes', substanceUse: 'no' },
    { age: 65, gender: 'Female', dzongkhag: 'Haa', riskLevel: 'moderate', depression: 'no', substanceUse: 'no' },
    { age: 70, gender: 'Male', dzongkhag: 'Chukha', riskLevel: 'high', depression: 'no', substanceUse: 'no' },
    { age: 75, gender: 'Female', dzongkhag: 'Samdrup Jongkhar', riskLevel: 'low', depression: 'yes', substanceUse: 'yes' },
    { age: 80, gender: 'Male', dzongkhag: 'Trashigang', riskLevel: 'moderate', depression: 'no', substanceUse: 'no' },
    { age: 85, gender: 'Female', dzongkhag: 'Mongar', riskLevel: 'high', depression: 'yes', substanceUse: 'yes' }
  ],
  'ASSIST Data Set': [
    { age: 45, gender: 'Male', dzongkhag: 'Thimphu', riskLevel: 'low', depression: 'yes', strong: 'yes' },
    { age: 50, gender: 'Female', dzongkhag: 'Paro', riskLevel: 'moderate', depression: 'no', strong: 'no' },
    { age: 55, gender: 'Male', dzongkhag: 'Punakha', riskLevel: 'high', depression: 'no', strong: 'no' },
    { age: 60, gender: 'Female', dzongkhag: 'Bumthang', riskLevel: 'low', depression: 'yes', strong: 'yes' },
    { age: 65, gender: 'Male', dzongkhag: 'Wangdue', riskLevel: 'moderate', depression: 'no', strong: 'no' },
    { age: 70, gender: 'Female', dzongkhag: 'Haa', riskLevel: 'high', depression: 'yes', strong: 'yes' },
    { age: 75, gender: 'Male', dzongkhag: 'Chukha', riskLevel: 'low', depression: 'yes', strong: 'yes' },
    { age: 80, gender: 'Female', dzongkhag: 'Samdrup Jongkhar', riskLevel: 'moderate', depression: 'no', strong: 'no' },
    { age: 85, gender: 'Male', dzongkhag: 'Trashigang', riskLevel: 'high', depression: 'no', strong: 'no' },
    { age: 90, gender: 'Female', dzongkhag: 'Mongar', riskLevel: 'low', depression: 'yes', strong: 'yes' }
  ],
  'ACE Data Set': [
    { age: 50, gender: 'Male', dzongkhag: 'Thimphu', riskLevel: 'moderate', depression: 'no', weak: 'yes' },
    { age: 55, gender: 'Female', dzongkhag: 'Paro', riskLevel: 'high', depression: 'yes', weak: 'no' },
    { age: 60, gender: 'Male', dzongkhag: 'Punakha', riskLevel: 'low', depression: 'yes', weak: 'yes' },
    { age: 65, gender: 'Female', dzongkhag: 'Bumthang', riskLevel: 'moderate', depression: 'no', weak: 'no' },
    { age: 70, gender: 'Male', dzongkhag: 'Wangdue', riskLevel: 'high', depression: 'no', weak: 'yes' },
    { age: 75, gender: 'Female', dzongkhag: 'Haa', riskLevel: 'low', depression: 'yes', weak: 'no' },
    { age: 80, gender: 'Male', dzongkhag: 'Chukha', riskLevel: 'moderate', depression: 'no', weak: 'yes' },
    { age: 85, gender: 'Female', dzongkhag: 'Samdrup Jongkhar', riskLevel: 'high', depression: 'yes', weak: 'no' },
    { age: 90, gender: 'Male', dzongkhag: 'Trashigang', riskLevel: 'low', depression: 'yes', weak: 'yes' },
    { age: 95, gender: 'Female', dzongkhag: 'Mongar', riskLevel: 'moderate', depression: 'no', weak: 'no' }
  ]
};


const selectedDataSets = ref([]);
const selectedDataKeys = computed(() => {
  let keys = [];
  selectedDataSets.value.forEach((item) => {
    keys = keys.concat(Object.keys(dataSetDummyData[item][0]));
  });
  return [...new Set(keys)];
});

const selectedAttribute = ref('');

const generateGraph = () => {
  const labels = selectedDataSets.value.map((item) => dataSetDummyData[item][0].dzongkhag);
  const data = selectedDataSets.value.map((item) => dataSetDummyData[item][0][selectedAttribute.value]);

  const ctx = document.getElementById('myChart').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: selectedAttribute.value,
        data: data,
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          // More colors...
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          // More colors...
        ],
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
};

// Function to move to the next stage
const nextStage = (stage) => {
  if (currentStage.value === 'data' && selectedDataSets.value.length === 0) {
    alert('Please select at least one data set');
  } else {
    currentStage.value = stage;
  }
};
</script>

<style scoped>
/* Add your custom styles here */
.option {
  cursor: pointer;
}

.card {
  border: none;
  border-radius: 15px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.card-text {
  font-size: 1.2rem;
  font-weight: bold;
}

.data-content {
  margin-top: 20px;
  padding: 20px;
  border: 1px solid #dee2e6;
  border-radius: 8px;
}

.option.active {
  background-color: #4ba9a8;
  /* Add your preferred highlight color here */
}

.option.completed {
  background-color: #5cb85c;
  /* Green color for completed stages */
}
</style>
