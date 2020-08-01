<template>
  <div class="container-fluid">
    <!-- Title -->
    <h4 class="mt-2 text-center mb-3">Rescreening List</h4>

    <!-- Filters -->
    <div class="row d-flex align-items-center mb-4">
      <div class="col-4">
        <!-- Year Filter -->
        <select v-model="selectedYear" @change="filterByYear" class="form-select">
          <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
        </select>
      </div>
      <div class="col-4">
        <!-- Search Input -->
        <InputText v-model="tableSearch" placeholder="Search in table" class="w-100"></InputText>
      </div>
      <div class="col-4">
        <!-- Multiselect -->
        <MultiSelect v-model="selectedColumns" :options="columns" optionLabel="header" @update:modelValue="onToggle"
          display="chip" placeholder="Select Columns" class="w-100" />
      </div>
    </div>

    <!-- Table -->
    <div class="main-container mt-2">
      <DataTable :value="filteredPatients" :loading="loadingPatients" :paginator="true" :rows="10" resizableColumns
        size="large" columnResizeMode="expand" :rowsPerPageOptions="[5, 10, 20]" :responsive="true">
        <!-- Columns -->
        <Column v-for="col in selectedColumns" :key="col.field" :field="col.field" :header="col.header" :sortable="true"
          :frozen="col.frozen">
          <template #body="slotProps" v-if="isRiskColumn(col.field)">
            <Tag rounded :value="slotProps.data[col.field]" class="w-100 text-capitalize"
              :severity="getSeverity(slotProps.data[col.field])"
              :style="{ color: getSeverity(slotProps.data[col.field]).colorCode, backgroundColor: getSeverity(slotProps.data[col.field]).bgColor }" />
          </template>
        </Column>
        <Column field="Action" header="Action" sortable>
          <template #body="slotProps">
            <Button icon="pi pi-user-edit" label="Rescreen" @click="handleRescreen(slotProps.data)"
              class="btn w-100 hwss-btn" />
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import Swal from 'sweetalert2';
import endpoints from '@/api';

const router = useRouter();
const users = ref([]);
const tableSearch = ref('');
const loadingPatients = ref(false);

// Year Filter
const selectedYear = ref(new Date().getFullYear()); // Default to current year
const years = computed(() => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 10 }, (_, index) => currentYear - index); // Past 10 years
});

const filterByYear = () => {
  // Trigger filtering when the year changes
  filteredPatients.value = filterDataByYear(users.value, selectedYear.value);
};

const filterDataByYear = (data, year) => {
  return data.filter(user => {
    const submissionDate = user.date; // Assuming `date` is in 'YYYY-MM-DD' format
    const submissionYear = submissionDate ? new Date(submissionDate).getFullYear() : null;
    return submissionYear === year;
  });
};

const columns = ref([
  { header: 'Date', field: 'date', frozen: true },
  { header: 'Name', field: 'name', frozen: true },
  { header: 'Age', field: 'age' },
  { header: 'Sex', field: 'sex' },
  { header: 'Past Diagnosis', field: 'pastDiagnosis' },
  { header: 'Suicidal Measurement', field: 'suicidal_measurement' },
  { header: 'suicidal_score', field: 'suicidal_score' },
  { header: 'PHQ Severity', field: 'phqSeverity' },
  { header: 'GAD Severity', field: 'gadSeverity' },
  { header: 'ACE Severity', field: 'aceSeverity' },
  { header: 'Tobacco Risk', field: 'tobaccoRisk' },
  { header: 'Alcohol Risk', field: 'alcoholRisk' },
  { header: 'Cannabis Risk', field: 'cannabisRisk' },
  { header: 'Cocaine Risk', field: 'cocaineRisk' },
  { header: 'Amphetamine Risk', field: 'amphetamineRisk' },
  { header: 'Inhalants Risk', field: 'inhalantsRisk' },
  { header: 'Sedative Risk', field: 'sedativeRisk' },
  { header: 'Hallucinogens Risk', field: 'hallucinogensRisk' },
  { header: 'Opioids Risk', field: 'opioidsRisk' },
  { header: 'Others Risk', field: 'othersRisk' },
  { header: 'Non Medical Injection Use', field: 'nonMedicalInjectionUse' },
]);

const selectedColumns = ref(columns.value);

const onToggle = (val) => {
  selectedColumns.value = columns.value.filter(col => val.includes(col));
};

const isRiskColumn = (field) => {
  return [
    'suicidal_measurement', 'suicidal_score', 'phqSeverity', 'gadSeverity', 'aceSeverity', 'tobaccoRisk', 'alcoholRisk',
    'cannabisRisk', 'cocaineRisk', 'amphetamineRisk', 'inhalantsRisk',
    'sedativeRisk', 'hallucinogensRisk', 'opioidsRisk', 'othersRisk',
    'nonMedicalInjectionUse'
  ].includes(field);
};

const calculateAgeGroup = (age) => {
  if (age < 14) return "Below 14";
  if (age >= 14 && age <= 17) return "15 to 17";
  return "Above 18";
};

const handleRescreen = (user) => {
  const ageGroup = calculateAgeGroup(user.age);
  const message = `Do you wish to rescreen ${user.name}?`;

  Swal.fire({
    icon: 'question',
    title: message,
    showCancelButton: true,
    confirmButtonText: 'Yes, rescreen',
    cancelButtonText: 'Cancel',
  }).then((result) => {
    if (result.isConfirmed) {
      sessionStorage.setItem('RescreeningUserID', JSON.stringify(user.id));
      sessionStorage.setItem('clientAgeGroup', ageGroup);
      router.push('/counselor-dashboard/counselor-rescreening');
    }
  });
};

const filteredPatients = computed(() => {
  let filtered = users.value.filter(user => {
    const matchesSearch = Object.values(user).some(val => {
      if (typeof val === 'string') {
        return val.toLowerCase().includes(tableSearch.value.toLowerCase());
      }
      return false;
    });

    const submissionDate = user.date; // Assuming `date` is in 'YYYY-MM-DD' format
    const submissionYear = submissionDate ? new Date(submissionDate).getFullYear() : null;
    const matchesYear = submissionYear === selectedYear.value;

    return matchesSearch && matchesYear;
  });

  const riskColumns = [
    'tobaccoRisk',
    'alcoholRisk',
    'cannabisRisk',
    'cocaineRisk',
    'amphetamineRisk',
    'inhalantsRisk',
    'sedativeRisk',
    'hallucinogensRisk',
    'opioidsRisk',
    'othersRisk',
    'nonMedicalInjectionUse'
  ];

  filtered.sort((a, b) => {
    const riskOrder = ['high risk', 'moderate risk', 'low risk', 'no risk'];
    const getRiskIndex = (risk) => riskOrder.indexOf(risk.toLowerCase());

    const aRiskValues = riskColumns.map(column => a[column].toLowerCase());
    const bRiskValues = riskColumns.map(column => b[column].toLowerCase());

    for (let i = 0; i < riskColumns.length; i++) {
      const aIndex = getRiskIndex(aRiskValues[i]);
      const bIndex = getRiskIndex(bRiskValues[i]);

      if (aIndex < bIndex) {
        return -1;
      } else if (aIndex > bIndex) {
        return 1;
      }
    }

    return 0;
  });

  return filtered;
});

onMounted(async () => {
  try {
    loadingPatients.value = true;
    const response = await axios.get(endpoints.getRescreeningList);
    if (response && response.data) {
      const myData = localStorage.getItem('userDetailsStore');
      const parseData = JSON.parse(myData);
      const userRole = parseData.user.role;
      const userPsAddDzongkhag = parseData.user.psAddDzongkhag;
      const userAgencyName = parseData.agency.agencyName;

      if (response.data && Array.isArray(response.data['Rescreening List'])) {
        let filteredSubmissions;

        if (userRole === 'clinical_counselor') {
          // Filter by psAddDzongkhag for clinical counselors
          filteredSubmissions = response.data['Rescreening List'].filter(submission => {
            return submission.user_agency_data && submission.user_agency_data.user_dzongkhag === userPsAddDzongkhag;
          });
        } else if (userRole === 'school_counselor' || userRole === 'trained_professional') {
          // Filter by agencyName for school counselors and trained professionals
          filteredSubmissions = response.data['Rescreening List'].filter(submission => {
            return submission.user_agency_data && submission.user_agency_data.agency_name === userAgencyName;
          });
        } else {
          // For any other role, don't apply any filter
          filteredSubmissions = response.data['Rescreening List'];
        }

        const mappedUsers = filteredSubmissions.map(submissionData => {
          const user_details = submissionData.user_details;
          const measurementData = submissionData.measurement_data;
          const measurementAssistData = submissionData.measurement_assist_data;
          const flags = submissionData.flags;

          const date = submissionData.created_at ? submissionData.created_at.split('T')[0] : '';

          return {
            id: user_details.user_id,
            date: date,
            name: user_details.full_name,
            age: user_details.age,
            sex: user_details.sex,
            userAgencyName: user_details.PsAddDzongkhag,
            pastDiagnosis: submissionData.diagnosis || 'none',
            suicidal_measurement: measurementData.suicidal_measurement || 'none',
            suicidal_score: measurementData.suicidal_score || 'none',
            phqSeverity: measurementData.phq_measurement || 'none',
            gadSeverity: measurementData.gad_measurement || 'none',
            aceSeverity: measurementData.ace_measurement || 'none',
            tobaccoRisk: measurementAssistData.tobacco_measurement || 'none',
            alcoholRisk: measurementAssistData.alcoholic_measurement || 'none',
            cannabisRisk: measurementAssistData.cannabis_measurement || 'none',
            cocaineRisk: measurementAssistData.cocaine_measurement || 'none',
            amphetamineRisk: measurementAssistData.amphetamine_measurement || 'none',
            inhalantsRisk: measurementAssistData.inhalants_measurement || 'none',
            sedativeRisk: measurementAssistData.sedatives_measurement || 'none',
            hallucinogensRisk: measurementAssistData.hallucinogens_measurement || 'none',
            opioidsRisk: measurementAssistData.opioids_measurement || 'none',
            othersRisk: measurementAssistData.other_measurement || 'none',
            nonMedicalInjectionUse: measurementAssistData.injection_measurement || 'none',
            flags: flags
          };
        });
        users.value = mappedUsers;
      } else {
        console.error("Invalid response data format");
      }
    }
  } catch (error) {
    console.error('Error in onMounted:', error);
  } finally {
    loadingPatients.value = false;
  }
});

const getSeverity = (severity) => {
  let colorCode;
  let bgColor;
  switch (severity.toLowerCase()) {
    case 'severe':
    case 'high risk':
      colorCode = 'rgba(230, 20, 45, 0.75)'; // Wine Red
      bgColor = 'rgba(230, 20, 45, 0.25)';
      break;
    case 'moderately-severe':
      colorCode = 'rgba(255, 69, 0, 0.75)'; // Red-Orange
      bgColor = 'rgba(255, 69, 0, 0.25)';
      break;
    case 'moderate risk':
    case 'moderate':
      colorCode = 'rgba(255, 165, 0, 0.75)'; // Orange
      bgColor = 'rgba(255, 165, 0, 0.25)';
      break;
    case 'minimal':
    case 'low risk':
      colorCode = 'rgba(0, 100, 0, 0.75)'; // Darker Green (More towards Blue)
      bgColor = 'rgba(0, 100, 0, 0.25)';
      break;
    default:
      colorCode = 'rgba(52, 52, 52, 0.75)'; // Slate Grey
      bgColor = 'rgba(52, 52, 52, 0.25)';
  }
  return { severity, colorCode, bgColor };
};
</script>