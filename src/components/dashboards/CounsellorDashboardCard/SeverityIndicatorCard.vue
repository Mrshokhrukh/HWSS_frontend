<template>
  <div class="card text-center h-100 shadow-sm">
    <div class="card-header bg-gradient-dark">
      <h4 class="severity-title text-white mb-0">{{ props.cardTitle }}</h4>
    </div>
    <div class="card-body p-4">
      <div class="row g-3">
        <div :class="columnClass" v-for="(buttonRow, index) in buttonRows" :key="index">
          <div v-for="(data, dataIndex) in buttonRow" :key="dataIndex" class="mb-3">
            <router-link
              :to="`/counselor-dashboard/counselor-reports?flag=${data.text.toLowerCase()}&measurement=${selectedMeasurement}`"
              class="card bg-hwss hover-effect" @click="handleButtonClick(data)">
              <div class="card-body d-flex align-items-center justify-content-between p-3">
                <div class="d-flex align-items-center">
                  <div class="color-dot" :style="{ background: determineFlag(data.flag) }"></div>
                  <h5 class="card-title mb-0 text-capitalize">{{ data.text }}</h5>
                </div>
                <div class="d-flex align-items-center">
                  <i :class="[data.icon, 'me-2']"></i>
                  <div class="count-number">
                    <h2 class="mb-0">{{ data.count }}</h2>
                  </div>
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
.card {
  border: none;
  border-radius: 1rem;
  overflow: hidden;
  transition: all 0.3s ease;
  background: white;
}

.card-header {
  border-bottom: none;
  padding: 1.5rem;
}

.bg-gradient-dark {
  background: linear-gradient(135deg, #2B656F 0%, #1D4851 100%);
}

.severity-title {
  color: white;
}

.bg-hwss {
  background: linear-gradient(135deg, #e6f3f5, #f0f7f8);
  color: #2b656f;
  border-radius: 0.5rem;
  transition: all 0.3s ease;
}

.hover-effect:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.color-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 10px;
}

.count-number {
  font-weight: bold;
}

.card-title {
  font-size: 1rem;
  font-weight: 600;
}

i {
  font-size: 1.2rem;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .card-body {
    padding: 1rem;
  }
  
  .card-title {
    font-size: 0.9rem;
  }

  .count-number h2 {
    font-size: 1.5rem;
  }

  i {
    font-size: 1rem;
  }
}
</style>