<template>
  <div class="card">
    <h3 class="text-center font-bold text-xl mb-4" style="color: #2c6975">Substance Use Risk Level</h3>
    <div class="card-body">
      <div class="flex flex-col md:flex-row gap-4">
        <div class="w-full md:w-1/3">
          <div class="flex flex-wrap gap-2">
            <Button v-for="category in categories" :key="category" @click="setActiveButton(category)"
              :class="{ 'p-button-primary': activeButton === category }" class="text-sm">
              {{ formatCategoryName(category) }}
            </Button>
          </div>
        </div>
        <div class="w-full md:w-2/3">
          <div class="mb-4">
            <DataTable :value="tableData" :paginator="false" :rows="10" class="p-datatable-sm" :loading="loading"
              v-model:sortField="sortField" v-model:sortOrder="sortOrder">
              <Column field="riskLevel" header="Risk Level" :sortable="true">
                <template #body="slotProps">
                  <span :class="getRiskLevelClass(slotProps.data.riskLevel)">
                    {{ slotProps.data.riskLevel }}
                  </span>
                </template>
              </Column>
              <Column field="totalCount" header="Total" :sortable="true"></Column>
              <Column field="maleCount" header="Male" :sortable="true"></Column>
              <Column field="femaleCount" header="Female" :sortable="true"></Column>
            </DataTable>
          </div>
          <div v-if="!tableData.length" class="text-center text-gray-500 py-4">
            No data available for selected substance
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';

const props = defineProps({
  filteredData: {
    type: Array,
    required: true
  }
});

const loading = ref(true);
const sortField = ref('riskLevel');
const sortOrder = ref(-1); // Default descending order
const activeButton = ref('Tobacco');

const categories = [
  'Tobacco',
  'Alcohol',
  'Cannabis',
  'Cocaine',
  'Amphetamine',
  'Inhalants',
  'Sedatives',
  'Hallucinogens',
  'Opioids',
  'Other'
];

// Mapping for substance field names in the data
const substanceFieldMapping = {
  'Tobacco': 'tobacco',
  'Alcohol': 'alcoholic',
  'Cannabis': 'cannabis',
  'Cocaine': 'cocaine',
  'Amphetamine': 'amphetamine',
  'Inhalants': 'inhalants',
  'Sedatives': 'sedatives',
  'Hallucinogens': 'hallucinogens',
  'Opioids': 'opioids',
  'Other': 'other'
};

function formatCategoryName(category) {
  return category === 'Other' ? 'Others' : category;
}

function getRiskLevelClass(riskLevel) {
  const classes = {
    'High Risk': 'text-red-600 font-semibold',
    'Moderate Risk': 'text-yellow-600 font-semibold',
    'Low Risk': 'text-green-600 font-semibold',
    'No Risk': 'text-gray-600'
  };
  return classes[riskLevel] || '';
}

const getRiskCounts = computed(() => {
  const counts = {
    'High Risk': { male: 0, female: 0 },
    'Moderate Risk': { male: 0, female: 0 },
    'Low Risk': { male: 0, female: 0 },
    'No Risk': { male: 0, female: 0 }
  };

  props.filteredData.forEach(record => {
    if (!record.screening_data?.assist_data) return;

    const gender = record.user?.gender?.toLowerCase() ||
      (record.screening_data?.gender?.toLowerCase() === 'm' ? 'male' : 'female');

    const substanceField = substanceFieldMapping[activeButton.value];
    if (!substanceField) return;

    const assistData = record.screening_data.assist_data;
    const flag = assistData[`${substanceField}_flag`];
    const measurement = assistData[`${substanceField}_measurement`];

    let riskLevel;
    if (flag === 'red' || measurement === 'high risk') {
      riskLevel = 'High Risk';
    } else if (flag === 'green' || measurement === 'moderate risk') {
      riskLevel = 'Moderate Risk';
    } else if (flag === 'blue' || measurement === 'low risk') {
      riskLevel = 'Low Risk';
    } else {
      riskLevel = 'No Risk';
    }

    if (counts[riskLevel] && (gender === 'male' || gender === 'female')) {
      counts[riskLevel][gender]++;
    }
  });

  return counts;
});

const tableData = computed(() => {
  const counts = getRiskCounts.value;

  return Object.entries(counts)
    .map(([riskLevel, genderCounts]) => ({
      riskLevel,
      totalCount: genderCounts.male + genderCounts.female,
      maleCount: genderCounts.male,
      femaleCount: genderCounts.female
    }))
    .filter(row => row.totalCount > 0);
});

const setActiveButton = (buttonName) => {
  activeButton.value = buttonName;
};

// Watch for data changes
watch(() => props.filteredData, (newData) => {
  loading.value = true;
  if (!activeButton.value) {
    setActiveButton('Tobacco');
  }
  loading.value = newData.length === 0;
}, { immediate: true });

// Watch for active button changes
watch(activeButton, () => {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
  }, 300);
});
</script>

<style scoped>
.card {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.p-button {
  margin-right: 0.5rem;
  margin-bottom: 0.5rem;
}

.p-button-primary {
  background-color: #2c6975 !important;
  border-color: #2c6975 !important;
}

:deep(.p-datatable) {
  font-size: 0.9rem;
}

:deep(.p-datatable .p-datatable-thead > tr > th) {
  background-color: #2c6975;
  color: white;
  font-weight: 600;
  text-align: center;
  padding: 0.75rem;
}

:deep(.p-datatable .p-datatable-tbody > tr > td) {
  text-align: center;
  padding: 0.75rem;
}

:deep(.p-datatable .p-datatable-tbody > tr:nth-child(even)) {
  background-color: #f8fafc;
}

:deep(.p-column-header-content) {
  justify-content: center;
}

/* Add hover effect to rows */
:deep(.p-datatable .p-datatable-tbody > tr:hover) {
  background-color: #d3e2e4;
}
</style>