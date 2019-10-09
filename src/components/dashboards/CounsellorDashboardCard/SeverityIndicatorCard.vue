<template>
  <div class="card text-center card-bg h-100">
    <div class="card-header">
      <h4 class="severity-title">{{ props.cardTitle }}</h4>
    </div>
    <div class="card-body p-4">
      <div class="row">
        <div :class="columnClass" v-for="(buttonRow, index) in buttonRows" :key="index">
          <div v-for="(data, dataIndex) in buttonRow" :key="dataIndex" class="my-3">
            <router-link
              :to="`/counselor-dashboard/counselor-reports?flag=${data.text.toLowerCase()}&measurement=${selectedMeasurement}`"
              class="card bg-hwss" @click="handleButtonClick(data)">
              <div class="card-body d-flex align-items-center justify-content-center p-3">
                <div class="color-dot" :style="{ background: determineFlag(data.flag) }"></div>
                <h5 class="card-title mx-2 text-capitalize">{{ data.text }}</h5>
                <i :class="data.icon"></i>
                <div class="count-number p-2">
                  <h1>{{ data.count }}</h1>
                </div>
              </div>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, inject } from 'vue';

const props = defineProps({
  cardTitle: String
});

// Inject the filtered data from the parent component
const filteredData = inject('filteredData');

const maxButtonsInRow = 3;
const selectedMeasurement = ref('');

const buttonData = computed(() => {
  const cardTitle = props.cardTitle.toLowerCase();
  let fieldToExtract = '';

  switch (cardTitle) {
    case 'suicidal behavior':
      fieldToExtract = 'suicidal_measurement';
      break;
    case 'depression':
      fieldToExtract = 'phq_measurement';
      break;
    case 'anxiety':
      fieldToExtract = 'gad_measurement';
      break;
    case 'ace':
      fieldToExtract = 'ace_measurement';
      break;
    case 'assist':
      fieldToExtract = 'assist';
      break;
    default:
      break;
  }

  const buttonDataMap = new Map();

  filteredData.value.forEach(user => {
    let measurement;
    if (cardTitle === 'assist') {
      measurement = user.measurementAssist;
    } else {
      measurement = user.measurement;
    }

    if (measurement) {
      if (cardTitle === 'assist') {
        const hasRisk = Object.keys(measurement).some(key =>
          key.includes('_measurement') && measurement[key] !== 'no risk' && measurement[key] !== null
        );
        const value = hasRisk ? 'At Risk' : 'No Risk';
        buttonDataMap.set(value, (buttonDataMap.get(value) || 0) + 1);
      } else {
        const fieldValue = measurement[fieldToExtract];
        if (fieldValue !== null && fieldValue !== undefined) {
          buttonDataMap.set(fieldValue, (buttonDataMap.get(fieldValue) || 0) + 1);
        }
      }
    }
  });

  const buttons = [];
  buttonDataMap.forEach((count, value) => {
    buttons.push({
      flag: determineFlag(value),
      text: value,
      icon: determineIcon(value),
      count: count
    });
  });

  buttons.sort((a, b) => a.text.localeCompare(b.text));
  return buttons;
});

const buttonRows = computed(() => {
  const rows = [];
  for (let i = 0; i < buttonData.value.length; i += maxButtonsInRow) {
    rows.push(buttonData.value.slice(i, i + maxButtonsInRow));
  }
  return rows;
});

const columnClass = computed(() => {
  return buttonRows.value.length <= 1 ? 'col-12' : 'col-6';
});

const determineFlag = (value) => {
  if (value === 'nearly everyday' || value === 'red' || value === 'severe' || value === 'At Risk') return 'red';
  else if (value === 'several days' || value === 'yellow' || value === 'moderate') return 'yellow';
  else if (value === 'moderately severe' || value === 'orange') return 'orange';
  else if (value === 'mild' || value === 'blue') return 'skyblue';
  else if (value === 'minimal' || value === 'green' || value === 'No Risk') return 'green';
  else return 'blue';
};

const determineIcon = (buttonText) => {
  if (buttonText === 'nearly everyday' || buttonText === 'severe' || buttonText === 'At Risk') return 'fas fa-biohazard';
  else if (buttonText === 'several days' || buttonText === 'moderately severe') return 'fas fa-radiation';
  else if (buttonText === 'moderate') return 'fas fa-exclamation-triangle';
  else if (buttonText === 'mild') return 'fas fa-exclamation-circle';
  else if (buttonText === 'minimal' || buttonText === 'No Risk') return 'fas fa-thumbs-up';
  else return 'fas fa-ban';
};

const selectedButtonData = ref(null);

const handleButtonClick = (data) => {
  selectedButtonData.value = data;
  selectedMeasurement.value = determineMeasurement(props.cardTitle);
};

const determineMeasurement = (cardTitle) => {
  let measurement = '';
  switch (cardTitle.toLowerCase()) {
    case 'suicidal behavior':
      measurement = 'suicidal_measurement';
      break;
    case 'depression':
      measurement = 'phq_measurement';
      break;
    case 'anxiety':
      measurement = 'gad_measurement';
      break;
    case 'ace':
      measurement = 'ace_measurement';
      break;
    case 'assist':
      measurement = 'assist';
      break;
    default:
      console.warn('No matching measurement found for card title:', cardTitle);
      break;
  }
  return measurement;
};

</script>

<style scoped>
.color-dot {
  width: 15px;
  height: 15px;
  border-radius: 50%;
  margin-right: 10px;
}

.count-number {
  margin-left: auto;
}

.bg-hwss {
  background-color: #dde7e9;
  color: #2b656f;
}

.severity-title {
  color: #2b656f;
}
</style>