<template>
  <div class="card text-center card-bg h-100">
    <div class="card-header">
      <h4 class="severity-title">{{ props.cardTitle }}</h4>
    </div>
    <div class="card-body p-4">
      <div class="row">
        <div :class="columnClass" v-for="(buttonRow, index) in buttonRows" :key="index">
          <div v-for="(data, dataIndex) in buttonRow" :key="dataIndex" class="my-3">
            <router-link :to="`#${data.text.toLowerCase()}`" class="card bg-hwss">
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
import { ref, computed, inject, defineProps } from 'vue';

const measurementData = ref(inject('measurementData'));
const measuremenAssisttData = ref(inject('measuremenAssisttData'));
const maxButtonsInRow = 3;

const buttonData = computed(() => {
  const cardTitle = props.cardTitle.toLowerCase();
  let fieldToExtract = '';

  // Adjusted the field extraction logic for "Assist"
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
      // Handle multiple fields in the "Assist" case
      fieldToExtract = ['alcoholic_measurement', 'tobacco_measurement', 'cannabis_measurement', 'cocaine_measurement', 'amphetamine_measurement', 'inhalants_measurement', 'sedatives_measurement', 'hallucinogens_measurement', 'opioids_measurement', 'other_measurement'];
      break;
    default:
      break;
  }

  const buttonDataMap = new Map();

  // Choose the appropriate data source based on the cardTitle
  const data = cardTitle === 'assist' ? measuremenAssisttData.value : measurementData.value;

  data.forEach(entry => {
    const measurement = cardTitle === 'assist' ? entry.measurement_assist : entry.measurement;

    // Adjusted the field extraction for the "Assist" case
    if (cardTitle === 'assist') {
      fieldToExtract.forEach(field => {
        const fieldValue = measurement[field];
        if (fieldValue !== null) {
          if (buttonDataMap.has(fieldValue)) {
            buttonDataMap.set(fieldValue, buttonDataMap.get(fieldValue) + 1);
          } else {
            buttonDataMap.set(fieldValue, 1);
          }
        }
      });
    } else {
      const fieldValue = measurement[fieldToExtract];
      if (fieldValue !== null) {
        if (buttonDataMap.has(fieldValue)) {
          buttonDataMap.set(fieldValue, buttonDataMap.get(fieldValue) + 1);
        } else {
          buttonDataMap.set(fieldValue, 1);
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
  if (value === 'nearly everyday' || value === 'red') return 'red';
  else if (value === 'several days' || value === 'yellow') return 'yellow';
  else if (value === 'severe' || value === 'red') return 'red';
  else if (value === 'moderately severe' || value === 'orange') return 'orange';
  else if (value === 'moderate' || value === 'yellow') return 'yellow';
  else if (value === 'mild' || value === 'blue') return 'skyblue';
  else if (value === 'minimal' || value === 'green') return 'green';
  else return 'blue';
};

const determineIcon = (buttonText) => {
  if (buttonText === 'nearly everyday') return 'fas fa-biohazard';
  else if (buttonText === 'several days') return 'fas fa-radiation';
  else if (buttonText === 'severe') return 'fas fa-biohazard';
  else if (buttonText === 'moderately severe') return 'fas fa-radiation';
  else if (buttonText === 'moderate') return 'fas fa-exclamation-triangle';
  else if (buttonText === 'mild') return 'fas fa-exclamation-circle';
  else if (buttonText === 'minimal') return 'fas fa-thumbs-up';
  else return 'fas fa-ban';
};
const props = defineProps({
  cardTitle: String
});
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
