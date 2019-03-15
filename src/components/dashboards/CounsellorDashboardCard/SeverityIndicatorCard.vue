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
                <div class="color-dot" :style="{ background: determineDotColor(data.flag) }"></div>
                <h5 class="card-title mx-2">{{ data.text }}</h5>
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
import { ref, computed } from 'vue';

const buttonData = ref([
  { flag: 'red', text: 'Severe', icon: 'fas fa-skull-crossbones', count: 12 },
  { flag: 'orange', text: 'Moderately Severe', icon: 'fas fa-flask', count: 8 },
  { flag: 'yellow', text: 'Moderate', icon: 'fas fa-balance-scale', count: 6 },
  { flag: 'green', text: 'Safe', icon: 'fas fa-shield-alt', count: 10 },
  { flag: 'blue', text: 'No Risk', icon: 'fas fa-peace', count: 102 },
  // Add more data as needed
]);

const maxButtonsInRow = 3;

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

const determineDotColor = (flag) => {
  // Implement logic to map flag to color
  switch (flag) {
    case 'red':
      return 'red';
    case 'orange':
      return 'tomato';
    case 'yellow':
      return 'orange';
    case 'green':
      return 'green';
    default:
      return 'skyblue'; // Default color or handle other cases
  }
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
