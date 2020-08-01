<template>
  <div class="card mt-3 b-0">
    <h3 class="text-center fw-bold mt-5 mb-4" style="color: #2c6975;">SUD Risk Level</h3>
    <DataTable :value="tableData" :scrollable="true" scrollHeight="400px" class="p-datatable-sm">
      <Column field="substance" header="Substance" frozen style="width: 200px"></Column>
      <Column field="highRiskMale" header="High-risk Male" style="width: 150px"></Column>
      <Column field="highRiskFemale" header="High-risk Female" style="width: 150px"></Column>
      <Column field="moderateRiskMale" header="Moderate-risk Male" style="width: 150px"></Column>
      <Column field="moderateRiskFemale" header="Moderate-risk Female" style="width: 150px"></Column>
    </DataTable>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';

const props = defineProps({
  filteredData: {
    type: Array,
    required: true
  }
});

const substanceMapping = {
  'Tobacco': 'Tobacco products',
  'Alcohol': 'Alcoholic beverages',
  'Cannabis': 'Cannabis',
  'Cocaine': 'Cocaine',
  'Amphetamine-type': 'Amphetamine-type stimulants',
  'Inhalant': 'Inhalants',
  'Sedative': 'Sedatives or Sleeping Pills',
  'Hallucinogens': 'Hallucinogens',
  'Opioids': 'Opioids',
  'Others': 'Other - specify'
};

function countRiskLevels(data) {
  const counts = {};

  // Initialize counts for all substances
  Object.keys(substanceMapping).forEach(substance => {
    const key = substance.toLowerCase().replace('-type', '');
    counts[`${key}_severe_male`] = 0;
    counts[`${key}_severe_female`] = 0;
    counts[`${key}_moderate_male`] = 0;
    counts[`${key}_moderate_female`] = 0;
  });

  data.forEach(record => {
    if (record.screening_data?.assist_data) {
      const assistData = Array.isArray(record.screening_data.assist_data)
        ? record.screening_data.assist_data
        : [];

      const gender = record.user?.gender?.toLowerCase() || 'other';
      if (gender === 'male' || gender === 'female') {
        assistData.forEach(substance => {
          const substanceKey = Object.entries(substanceMapping).find(([_, value]) =>
            substance.substance__name?.includes(value)
          )?.[0];

          if (substanceKey && substance.risk_flag) {
            const key = substanceKey.toLowerCase().replace('-type', '');
            const risk = substance.risk_flag.toLowerCase();

            // Map risk levels to either severe or moderate
            if (risk === 'severe') {
              counts[`${key}_severe_${gender}`]++;
            } else if (risk === 'moderate') {
              counts[`${key}_moderate_${gender}`]++;
            }
          }
        });
      }
    }
  });

  return counts;
}

const tableData = computed(() => {
  const counts = countRiskLevels(props.filteredData);

  const substances = [
    'Tobacco', 'Alcohol', 'Cannabis', 'Cocaine', 'Amphetamine-type',
    'Inhalant', 'Sedative', 'Hallucinogens', 'Opioids', 'Others'
  ];

  return substances.map(substance => {
    const key = substance.toLowerCase().replace('-type', '');
    const dbKey = key === 'alcohol' ? 'alcohol' :
      key === 'inhalant' ? 'inhalant' :
        key === 'hallucinate' ? 'hallucinate' :
          key === 'others' ? 'others' : key;

    return {
      substance,
      highRiskMale: counts[`${dbKey}_severe_male`] || 0,
      highRiskFemale: counts[`${dbKey}_severe_female`] || 0,
      moderateRiskMale: counts[`${dbKey}_moderate_male`] || 0,
      moderateRiskFemale: counts[`${dbKey}_moderate_female`] || 0
    };
  });
});
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