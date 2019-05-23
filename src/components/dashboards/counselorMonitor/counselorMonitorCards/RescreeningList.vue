<template>
  <div class="container-fluid">
    <!-- Title -->
    <h4 class="mt-2 text-center mb-3">Refine Results</h4>

    <!-- Filters -->
    <div class="row d-flex align-items-center mb-4">
      <div class="col-5">
        <!-- Search Input -->
        <InputText v-model="tableSearch" placeholder="Search in table" class="w-100"></InputText>
      </div>
      <div class="col-5">
        <!-- Multiselect -->
        <MultiSelect :modelValue="selectedColumns" :options="columns" optionLabel="header" @update:modelValue="onToggle"
          display="chip" placeholder="Select Columns" class="w-100" />
      </div>
      <div class="col-2">
        <!-- Rescreen Button -->
        <Button class="btn w-100 hwss-btn" @click="handleRescreen(selectedUsers.value)" icon="pi pi-user-edit"
          label="Rescreen" />
      </div>
    </div>

    <!-- Table -->
    <div class="main-container mt-2">
      <DataTable v-model:selection="selectedUsers" :value="filteredPatients" :loading="loadingPatients"
        :paginator="true" :rows="10" resizableColumns size="large" columnResizeMode="expand"
        :rowsPerPageOptions="[5, 10, 20]" :responsive="true" selectionMode="single" :selection="selectedUsers"
        @selectionChange="handleSelectionChange">
        <!-- Columns -->
        <Column selectionMode="single" headerStyle="width: 3rem" frozen class="font-bold"></Column>
        <Column field="date" header="Date" frozen sortable></Column>
        <Column field="name" header="Name" frozen sortable></Column>
        <Column field="age" header="Age" sortable></Column>
        <Column field="sex" header="Sex" sortable></Column>
        <Column field="pastDiagnosis" header="Past Diagnosis" sortable></Column>
        <Column field="phqSeverity" header="PHQ Severity" sortable class="text-center">
          <template #body="slotProps">
            <Tag rounded :value="slotProps.data.phqSeverity" class="w-100 text-capitalize"
              :severity="getSeverity(slotProps.data.phqSeverity)"
              :style="{ color: getSeverity(slotProps.data.phqSeverity).colorCode, backgroundColor: getSeverity(slotProps.data.phqSeverity).bgColor }" />
          </template>
        </Column>
        <Column field="gadSeverity" header="GAD Severity" sortable class="text-center">
          <template #body="slotProps">
            <Tag rounded :value="slotProps.data.gadSeverity" class="w-100 text-capitalize"
              :severity="getSeverity(slotProps.data.gadSeverity)"
              :style="{ color: getSeverity(slotProps.data.gadSeverity).colorCode, backgroundColor: getSeverity(slotProps.data.gadSeverity).bgColor }" />
          </template>
        </Column>
        <Column field="aceSeverity" header="ACE Severity" sortable class="text-center">
          <template #body="slotProps">
            <Tag rounded :value="slotProps.data.aceSeverity" class="w-100 text-capitalize"
              :severity="getSeverity(slotProps.data.aceSeverity)"
              :style="{ color: getSeverity(slotProps.data.aceSeverity).colorCode, backgroundColor: getSeverity(slotProps.data.aceSeverity).bgColor }" />
          </template>
        </Column>
        <Column field="tobaccoRisk" header="Tobacco Risk" sortable class="text-center">
          <template #body="slotProps">
            <Tag rounded :value="slotProps.data.tobaccoRisk" class="w-100 text-capitalize"
              :severity="getSeverity(slotProps.data.tobaccoRisk)"
              :style="{ color: getSeverity(slotProps.data.tobaccoRisk).colorCode, backgroundColor: getSeverity(slotProps.data.tobaccoRisk).bgColor }" />
          </template>
        </Column>
        <Column field="alcoholRisk" header="Alcohol Risk" sortable class="text-center">
          <template #body="slotProps">
            <Tag rounded :value="slotProps.data.alcoholRisk" class="w-100 text-capitalize"
              :severity="getSeverity(slotProps.data.alcoholRisk)"
              :style="{ color: getSeverity(slotProps.data.alcoholRisk).colorCode, backgroundColor: getSeverity(slotProps.data.alcoholRisk).bgColor }" />
          </template>
        </Column>
        <Column field="cannabisRisk" header="Cannabis Risk" sortable class="text-center">
          <template #body="slotProps">
            <Tag rounded :value="slotProps.data.cannabisRisk" class="w-100 text-capitalize"
              :severity="getSeverity(slotProps.data.cannabisRisk)"
              :style="{ color: getSeverity(slotProps.data.cannabisRisk).colorCode, backgroundColor: getSeverity(slotProps.data.cannabisRisk).bgColor }" />
          </template>
        </Column>
        <Column field="cocaineRisk" header="Cocaine Risk" sortable class="text-center">
          <template #body="slotProps">
            <Tag rounded :value="slotProps.data.cocaineRisk" class="w-100 text-capitalize"
              :severity="getSeverity(slotProps.data.cocaineRisk)"
              :style="{ color: getSeverity(slotProps.data.cocaineRisk).colorCode, backgroundColor: getSeverity(slotProps.data.cocaineRisk).bgColor }" />
          </template>
        </Column>
        <Column field="amphetamineRisk" header="Amphetamine Risk" sortable class="text-center">
          <template #body="slotProps">
            <Tag rounded :value="slotProps.data.amphetamineRisk" class="w-100 text-capitalize"
              :severity="getSeverity(slotProps.data.amphetamineRisk)"
              :style="{ color: getSeverity(slotProps.data.amphetamineRisk).colorCode, backgroundColor: getSeverity(slotProps.data.amphetamineRisk).bgColor }" />
          </template>
        </Column>
        <Column field="inhalantsRisk" header="Inhalants Risk" sortable class="text-center">
          <template #body="slotProps">
            <Tag rounded :value="slotProps.data.inhalantsRisk" class="w-100 text-capitalize"
              :severity="getSeverity(slotProps.data.inhalantsRisk)"
              :style="{ color: getSeverity(slotProps.data.inhalantsRisk).colorCode, backgroundColor: getSeverity(slotProps.data.inhalantsRisk).bgColor }" />
          </template>
        </Column>
        <Column field="sedativeRisk" header="Sedative Risk" sortable class="text-center">
          <template #body="slotProps">
            <Tag rounded :value="slotProps.data.sedativeRisk" class="w-100 text-capitalize"
              :severity="getSeverity(slotProps.data.sedativeRisk)"
              :style="{ color: getSeverity(slotProps.data.sedativeRisk).colorCode, backgroundColor: getSeverity(slotProps.data.sedativeRisk).bgColor }" />
          </template>
        </Column>
        <Column field="hallucinogensRisk" header="Hallucinogens Risk" sortable class="text-center">
          <template #body="slotProps">
            <Tag rounded :value="slotProps.data.hallucinogensRisk" class="w-100 text-capitalize"
              :severity="getSeverity(slotProps.data.hallucinogensRisk)"
              :style="{ color: getSeverity(slotProps.data.hallucinogensRisk).colorCode, backgroundColor: getSeverity(slotProps.data.hallucinogensRisk).bgColor }" />
          </template>
        </Column>
        <Column field="opioidsRisk" header="Opioids Risk" sortable class="text-center">
          <template #body="slotProps">
            <Tag rounded :value="slotProps.data.opioidsRisk" class="w-100 text-capitalize"
              :severity="getSeverity(slotProps.data.opioidsRisk)"
              :style="{ color: getSeverity(slotProps.data.opioidsRisk).colorCode, backgroundColor: getSeverity(slotProps.data.opioidsRisk).bgColor }" />
          </template>
        </Column>
        <Column field="othersRisk" header="Others Risk" sortable class="text-center">
          <template #body="slotProps">
            <Tag rounded :value="slotProps.data.othersRisk" class="w-100 text-capitalize"
              :severity="getSeverity(slotProps.data.othersRisk)"
              :style="{ color: getSeverity(slotProps.data.othersRisk).colorCode, backgroundColor: getSeverity(slotProps.data.othersRisk).bgColor }" />
          </template>
        </Column>
        <Column field="nonMedicalInjectionUse" header="Non Medical Injection Use" sortable class="text-center">
          <template #body="slotProps">
            <Tag rounded :value="slotProps.data.nonMedicalInjectionUse" class="w-100 text-capitalize"
              :severity="getSeverity(slotProps.data.nonMedicalInjectionUse)"
              :style="{ color: getSeverity(slotProps.data.nonMedicalInjectionUse).colorCode, backgroundColor: getSeverity(slotProps.data.nonMedicalInjectionUse).bgColor }" />
          </template>
        </Column>
        <Column field="Action" header="Action" sortable>
          <template #body="slotProps">
            <Button icon="pi pi-check-circle" label="Mark As Safe" @click="handleMarkAsSafe(slotProps)"
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
const selectedUsers = ref([]);

const columns = ref([
  { header: 'Date', field: 'date', frozen: true },
  { header: 'Name', field: 'name', frozen: true },
  { header: 'Age', field: 'age' },
  { header: 'Sex', field: 'sex' },
  { header: 'Past Diagnosis', field: 'pastDiagnosis' },
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
  selectedColumns.value = columns.value.filter(col => val.includes(col.header));
};

const handleRescreen = () => {
  if (!selectedUsers.value) {
    Swal.fire({
      icon: 'error',
      title: 'No user selected',
      text: 'Please select a user to perform rescreening.',
    });
    return;
  }

  const message = `Do you wish to rescreen ${selectedUsers.value.name}?`;

  Swal.fire({
    icon: 'question',
    title: message,
    showCancelButton: true,
    confirmButtonText: 'Yes, rescreen',
    cancelButtonText: 'Cancel',
  }).then((result) => {
    if (result.isConfirmed) {
      const userId = selectedUsers.value.id;
      sessionStorage.setItem('RescreeningUserID', JSON.stringify(userId));
      router.push('/counselor-dashboard/counselor-rescreening');
    }
  });
};



const handleSelectionChange = (selected) => {
  selectedUsers.value = selected;
};

const filteredPatients = computed(() => {
  let filtered = users.value.filter(user => {
    return Object.values(user).some(val => {
      if (typeof val === 'string') {
        return val.toLowerCase().includes(tableSearch.value.toLowerCase());
      }
      return false;
    });
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

onMounted(() => {
  try {
    loadingPatients.value = true;

    // Retrieve the data from session storage
    const reportData = sessionStorage.getItem('reportData');
  
    if (reportData) {
      const response = JSON.parse(reportData);
      console.log("Parsed response:", response); // Log the parsed response

      if (Array.isArray(response)) {
        const mappedUsers = response.map(data => {
          const user = data.user?.fields || {};
          const measurement = data.measurement?.fields || {};
          const measurementAssist = data.measurement_assist?.fields || {};
          const serviceAndTreatment = data.service_and_treatment || {};

          // Add logs to debug field mappings
          console.log("Measurement fields:", measurement);
          console.log("Measurement Assist fields:", measurementAssist);

          const date = data.rescreening_data?.fields?.submission_date?.split('T')[0] || '';

          return {
            id: data.userId,
            date: date,
            name: `${user.first_name || ''} ${user.middle_name || ''} ${user.last_name || ''}`.trim(),
            age: user.date_of_birth ? new Date().getFullYear() - new Date(user.date_of_birth).getFullYear() : 'N/A',
            sex: user.gender || 'N/A',
            pastDiagnosis: serviceAndTreatment.case_status || 'none',
            phqSeverity: measurement.phq_measurement || 'none',
            gadSeverity: measurement.gad_measurement || 'none',
            aceSeverity: measurement.ace_measurement || 'none',
            tobaccoRisk: measurementAssist.tobacco_measurement || 'none',
            alcoholRisk: measurementAssist.alcoholic_measurement || 'none',
            cannabisRisk: measurementAssist.cannabis_measurement || 'none',
            cocaineRisk: measurementAssist.cocaine_measurement || 'none',
            amphetamineRisk: measurementAssist.amphetamine_measurement || 'none',
            inhalantsRisk: measurementAssist.inhalants_measurement || 'none',
            sedativeRisk: measurementAssist.sedatives_measurement || 'none',
            hallucinogensRisk: measurementAssist.hallucinogens_measurement || 'none',
            opioidsRisk: measurementAssist.opioids_measurement || 'none',
            othersRisk: measurementAssist.other_measurement || 'none',
            nonMedicalInjectionUse: measurementAssist.injection_measurement || 'none',
            flags: measurement.overall_flag || 'none',
          };
        });
        users.value = mappedUsers;
        console.log("Mapped users:", mappedUsers); // Log the mapped users
      } else {
        console.error("Invalid response data format");
      }
    } else {
      console.error("No data found in session storage");
    }
  } catch (error) {
    console.error(error);
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


const handleMarkAsSafe = (rowData) => {
  if (!rowData) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Row data is undefined',
    });
    return;
  }

  handleSelectionChange([rowData]);

  const userId = rowData.data.id;
  markAsSafe(userId);
};


const markAsSafe = (userId) => {
  console.log('Marking user as safe:', userId);
  axios.post('/mark-user-as-safe', { userId })
    .then(response => {
      console.log('User marked as safe successfully:', response.data);
    })
    .catch(error => {
      console.error('Error marking user as safe:', error);
    });
};

</script>
