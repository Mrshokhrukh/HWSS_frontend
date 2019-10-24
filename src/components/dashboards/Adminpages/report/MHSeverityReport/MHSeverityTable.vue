<template>
  <div class="card">
    <h3 class="text-center font-bold text-xl mb-4" style="color: #2c6975">Substance Use Risk Level</h3>
    <div class="card-body">
      <div class="flex flex-col md:flex-row gap-4">
        <div class="w-full md:w-1/3">
          <div class="flex flex-wrap gap-2">
            <Button v-for="category in categories" :key="category" @click="setActiveButton(category)"
              :class="{ 'p-button-primary': activeButton === category }" class="text-sm">
              {{ category }}
            </Button>
          </div>
        </div>
        <div class="w-full md:w-2/3">
          <div class="mb-4">
            <DataTable :value="tableData" :paginator="false" :rows="10" class="p-datatable-sm"
              :loading="!filteredData.length">
              <Column field="riskLevel" header="Risk Level" sortable></Column>
              <Column field="totalCount" header="Total" sortable></Column>
              <Column field="maleCount" header="Male" sortable></Column>
              <Column field="femaleCount" header="Female" sortable></Column>
            </DataTable>
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

const activeButton = ref('Tobacco');

const getRiskCounts = computed(() => {
  const counts = categories.reduce((acc, category) => {
    acc[category] = {
      none: { male: 0, female: 0 },
      mild: { male: 0, female: 0 },
      moderate: { male: 0, female: 0 },
      severe: { male: 0, female: 0 }
    };
    return acc;
  }, {});

  props.filteredData.forEach(item => {
    const gender = item.user?.gender?.toLowerCase() || 'unknown';
    const assistData = item.screening_data?.assist_data;

    if (!assistData || gender === 'unknown') return;

    // Handle array format of assist_data
    if (Array.isArray(assistData)) {
      assistData.forEach(substance => {
        const categoryKey = getCategoryKey(substance.substance__name);
        if (categoryKey && substance.risk_flag) {
          const riskLevel = substance.risk_flag.toLowerCase();
          if (counts[categoryKey]?.[riskLevel] && (gender === 'male' || gender === 'female')) {
            counts[categoryKey][riskLevel][gender]++;
          }
        }
      });
    }
    // Handle object format of assist_data
    else {
      categories.forEach(category => {
        const key = category.toLowerCase();
        const measurementKey = key === 'alcohol' ? 'alcoholic' : key;
        const measurement = assistData[`${measurementKey}_measurement`];
        if (measurement) {
          const riskLevel = getRiskLevelFromMeasurement(measurement);
          if (counts[category]?.[riskLevel] && (gender === 'male' || gender === 'female')) {
            counts[category][riskLevel][gender]++;
          }
        }
      });
    }
  });

  return counts;
});

function getCategoryKey(substanceName) {
  if (substanceName.includes('Tobacco')) return 'Tobacco';
  if (substanceName.includes('Alcoholic')) return 'Alcohol';
  if (substanceName.includes('Cannabis')) return 'Cannabis';
  if (substanceName.includes('Cocaine')) return 'Cocaine';
  if (substanceName.includes('Amphetamine')) return 'Amphetamine';
  if (substanceName.includes('Inhalants')) return 'Inhalants';
  if (substanceName.includes('Sedatives')) return 'Sedatives';
  if (substanceName.includes('Hallucinogens')) return 'Hallucinogens';
  if (substanceName.includes('Opioids')) return 'Opioids';
  if (substanceName.includes('Other')) return 'Other';
  return null;
}

function getRiskLevelFromMeasurement(measurement) {
  if (measurement === 'no risk' || measurement === 'none') return 'none';
  if (measurement === 'low risk' || measurement === 'mild') return 'mild';
  if (measurement === 'moderate risk') return 'moderate';
  if (measurement === 'high risk' || measurement === 'severe') return 'severe';
  return 'none';
}

const tableData = computed(() => {
  const categoryData = getRiskCounts.value[activeButton.value];
  if (!categoryData) return [];

  return Object.entries(categoryData).map(([riskLevel, genderCounts]) => ({
    riskLevel: riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1),
    totalCount: genderCounts.male + genderCounts.female,
    maleCount: genderCounts.male,
    femaleCount: genderCounts.female
  })).filter(row => row.totalCount > 0)
    .sort((a, b) => {
      // Custom sort order: severe -> moderate -> mild -> none
      const order = { 'Severe': 0, 'Moderate': 1, 'Mild': 2, 'None': 3 };
      return order[a.riskLevel] - order[b.riskLevel];
    });
});

const setActiveButton = (buttonName) => {
  activeButton.value = buttonName;
};

// Watch for data changes and ensure default selection
watch(() => props.filteredData, () => {
  if (!activeButton.value) {
    setActiveButton('Tobacco');
  }
}, { immediate: true });
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
  background-color: #d3e2e4;
}

:deep(.p-column-header-content) {
  justify-content: center;
}
</style>