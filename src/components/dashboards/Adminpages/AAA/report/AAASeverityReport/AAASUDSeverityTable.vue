<template>
  <div class="card mt-3 b-0">
    <h3 class="text-center fw-bold mt-5 mb-4" style="color: #2c6975;">SUD Risk Level</h3>
    <DataTable v-if="tableData.length > 0" :value="tableData" :scrollable="true" scrollHeight="400px"
      class="p-datatable-sm">
      <Column field="substance" header="Substance" frozen style="width: 200px"></Column>
      <Column field="highRiskMale" header="High-risk Male" style="width: 150px"></Column>
      <Column field="highRiskFemale" header="High-risk Female" style="width: 150px"></Column>
      <Column field="moderateRiskMale" header="Moderate-risk Male" style="width: 150px"></Column>
      <Column field="moderateRiskFemale" header="Moderate-risk Female" style="width: 150px"></Column>
    </DataTable>
    <div v-else class="text-center p-4">
      Loading data or no data available...
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';

const props = defineProps({
  filteredData: {
    type: Array,
    required: true
  }
});

const extractedData = ref([]);
const counts = ref({});
const tableData = ref([]);

function extractMeasurementData(reportData) {
  return reportData.map(person => {
    const measurementAssist = person.measurement_assist?.fields;
    const gender = person.user?.fields?.gender || "unknown";
    if (measurementAssist) {
      return {
        gender: gender,
        alcoholic: measurementAssist.alcoholic_measurement || "no data",
        amphetamine: measurementAssist.amphetamine_measurement || "no data",
        cannabis: measurementAssist.cannabis_measurement || "no data",
        cocaine: measurementAssist.cocaine_measurement || "no data",
        hallucinogens: measurementAssist.hallucinogens_measurement || "no data",
        inhalants: measurementAssist.inhalants_measurement || "no data",
        opioids: measurementAssist.opioids_measurement || "no data",
        sedatives: measurementAssist.sedatives_measurement || "no data",
        tobacco: measurementAssist.tobacco_measurement || "no data",
        other: measurementAssist.other_measurement || "no data"
      };
    }
    return null;
  }).filter(Boolean);
}

function countRiskLevels(data) {
  const counts = {
    tobacco_moderate_male: 0, tobacco_moderate_female: 0,
    tobacco_high_male: 0, tobacco_high_female: 0,
    alcoholic_moderate_male: 0, alcoholic_moderate_female: 0,
    alcoholic_high_male: 0, alcoholic_high_female: 0,
    cannabis_moderate_male: 0, cannabis_moderate_female: 0,
    cannabis_high_male: 0, cannabis_high_female: 0,
    cocaine_moderate_male: 0, cocaine_moderate_female: 0,
    cocaine_high_male: 0, cocaine_high_female: 0,
    amphetamine_moderate_male: 0, amphetamine_moderate_female: 0,
    amphetamine_high_male: 0, amphetamine_high_female: 0,
    inhalants_moderate_male: 0, inhalants_moderate_female: 0,
    inhalants_high_male: 0, inhalants_high_female: 0,
    sedatives_moderate_male: 0, sedatives_moderate_female: 0,
    sedatives_high_male: 0, sedatives_high_female: 0,
    hallucinogens_moderate_male: 0, hallucinogens_moderate_female: 0,
    hallucinogens_high_male: 0, hallucinogens_high_female: 0,
    opioids_moderate_male: 0, opioids_moderate_female: 0,
    opioids_high_male: 0, opioids_high_female: 0,
    other_moderate_male: 0, other_moderate_female: 0,
    other_high_male: 0, other_high_female: 0,
  };

  data.forEach(personData => {
    Object.entries(personData).forEach(([substance, riskLevel]) => {
      if (substance !== 'gender' && (riskLevel === 'moderate risk' || riskLevel === 'high risk')) {
        const key = `${substance}_${riskLevel === 'moderate risk' ? 'moderate' : 'high'}_${personData.gender.toLowerCase()}`;
        if (counts.hasOwnProperty(key)) {
          counts[key]++;
        }
      }
    });
  });

  return counts;
}

function generateTableData(counts) {
  const substances = [
    'Tobacco', 'Alcohol', 'Cannabis', 'Cocaine', 'Amphetamine-type',
    'Inhalant', 'Sedative', 'Hallucinate', 'Opioids', 'Others'
  ];

  return substances.map(substance => {
    const key = substance.toLowerCase().replace('-type', '');
    const dbKey = key === 'alcohol' ? 'alcoholic' :
      key === 'inhalant' ? 'inhalants' :
        key === 'hallucinate' ? 'hallucinogens' :
          key === 'others' ? 'other' : key;
    return {
      substance,
      highRiskMale: counts[`${dbKey}_high_male`] || 0,
      highRiskFemale: counts[`${dbKey}_high_female`] || 0,
      moderateRiskMale: counts[`${dbKey}_moderate_male`] || 0,
      moderateRiskFemale: counts[`${dbKey}_moderate_female`] || 0
    };
  });
}

watch(() => props.filteredData, (newData) => {
  if (newData && newData.length > 0) {
    extractedData.value = extractMeasurementData(newData);
    counts.value = countRiskLevels(extractedData.value);
    tableData.value = generateTableData(counts.value);
  } else {
    tableData.value = [];
  }
}, { immediate: true, deep: true });
</script>

<style scoped>
.card {
  margin-top: 20px;
}

:deep(.p-datatable) {
  font-size: 0.9rem;
}

:deep(.p-datatable .p-datatable-thead > tr > th) {
  background-color: #2c6975;
  color: white;
  font-weight: 600;
  text-align: center;
}

:deep(.p-datatable .p-datatable-tbody > tr > td) {
  text-align: center;
}

:deep(.p-datatable .p-datatable-tbody > tr:nth-child(even)) {
  background-color: #d3e2e4;
}
</style>