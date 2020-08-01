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

const reportData = JSON.parse(sessionStorage.getItem('reportData')) || [];

function extractMeasurementData(reportData) {
  const results = [];

  reportData.forEach(person => {
    const measurementAssist = person.measurement_assist?.fields;
    const gender = person.user?.fields?.gender || "unknown";
    if (measurementAssist) {
      const data = {
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
      results.push(data);
    }
  });

  return results;
}

const extractedData = extractMeasurementData(reportData);

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
    inhalant_moderate_male: 0, inhalant_moderate_female: 0,
    inhalant_high_male: 0, inhalant_high_female: 0,
    sedative_moderate_male: 0, sedative_moderate_female: 0,
    sedative_high_male: 0, sedative_high_female: 0,
    hallucinate_moderate_male: 0, hallucinate_moderate_female: 0,
    hallucinate_high_male: 0, hallucinate_high_female: 0,
    opioids_moderate_male: 0, opioids_moderate_female: 0,
    opioids_high_male: 0, opioids_high_female: 0,
    others_moderate_male: 0, others_moderate_female: 0,
    others_high_male: 0, others_high_female: 0,
  };

  data.forEach(personData => {
    Object.keys(personData).forEach(substance => {
      const riskLevel = personData[substance];
      const substanceKey = substance.toLowerCase().replace('-', '_');

      if (riskLevel === 'moderate risk' || riskLevel === 'high risk') {
        const genderKeyModerate = `${substanceKey}_moderate`;
        const genderKeyHigh = `${substanceKey}_high`;

        if (personData.gender === 'Male') {
          if (riskLevel === 'moderate risk') counts[`${genderKeyModerate}_male`]++;
          if (riskLevel === 'high risk') counts[`${genderKeyHigh}_male`]++;
        } else if (personData.gender === 'Female') {
          if (riskLevel === 'moderate risk') counts[`${genderKeyModerate}_female`]++;
          if (riskLevel === 'high risk') counts[`${genderKeyHigh}_female`]++;
        }
      }
    });
  });

  return counts;
}

const counts = countRiskLevels(extractedData);

const tableData = computed(() => {
  const substances = [
    'Tobacco', 'Alcohol', 'Cannabis', 'Cocaine', 'Amphetamine-type',
    'Inhalant', 'Sedative', 'Hallucinogens', 'Opioids', 'Others'
  ];

  return substances.map(substance => {
    const key = substance.toLowerCase().replace('-type', '');
    return {
      substance,
      highRiskMale: counts[`${key}_high_male`] || 0,
      highRiskFemale: counts[`${key}_high_female`] || 0,
      moderateRiskMale: counts[`${key}_moderate_male`] || 0,
      moderateRiskFemale: counts[`${key}_moderate_female`] || 0
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