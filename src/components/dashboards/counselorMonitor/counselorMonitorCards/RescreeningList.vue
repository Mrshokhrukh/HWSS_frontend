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
        <!-- Export Button -->
        <Button icon="pi pi-external-link" label="Export" @click="exportCSV($event)" class="btn w-100 hwss-btn" />
      </div>
    </div>

    <!-- Table -->
    <div class="main-container mt-2">
      <DataTable v-model:selection="selectedUsers" :value="filteredPatients" :loading="loadingPatients"
        :paginator="true" :rows="10" resizableColumns size="large" columnResizeMode="expand"
        :rowsPerPageOptions="[5, 10, 20]" :responsive="true" selectionMode="multiple" :selection="selectedUsers"
        @selectionChange="handleSelectionChange" >
        <!-- Columns -->
        <Column field="date" header="Date" frozen sortable></Column>
        <Column field="name" header="Name" frozen sortable></Column>
        <Column field="age" header="Age" sortable></Column>
        <Column field="sex" header="Sex" sortable></Column>
        <Column field="pastDiagnosis" header="Past Diagnosis" sortable></Column>
        <Column field="phqSeverity" header="PHQ Severity" sortable></Column>
        <Column field="gadSeverity" header="GAD Severity" sortable></Column>
        <Column field="aceSeverity" header="ACE Severity" sortable></Column>
        <Column field="tobaccoRisk" header="Tobacco Risk" sortable>
          <template #body="slotProps">
            <Tag :value="slotProps.data.tobaccoRisk" :severity="getSeverity(slotProps.data.tobaccoRisk)" />
          </template>
        </Column>
        <Column field="alcoholRisk" header="Alcohol Risk" sortable>
        </Column>
        <Column field="cannabisRisk" header="Cannabis Risk" sortable></Column>
        <Column field="cocaineRisk" header="Cocaine Risk" sortable></Column>
        <Column field="amphetamineRisk" header="Amphetamine Risk" sortable></Column>
        <Column field="inhalantsRisk" header="Inhalants Risk" sortable></Column>
        <Column field="sedativeRisk" header="Sedative Risk" sortable></Column>
        <Column field="hallucinogensRisk" header="Hallucinogens Risk" sortable></Column>
        <Column field="opioidsRisk" header="Opioids Risk" sortable></Column>
        <Column field="othersRisk" header="Others Risk" sortable></Column>
        <Column field="nonMedicalInjectionUse" header="Non Medical Injection Use" sortable></Column>
        <Column field="Action" header="Action" sortable>
          <template #body="slotProps">
            <Button class="btn w-100 hwss-btn" @click="handleRescreen(slotProps)">Rescreen</Button>
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
const dt = ref();

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

const exportCSV = () => {
  dt.value.exportCSV();
};

const onToggle = (val) => {
  selectedColumns.value = columns.value.filter(col => val.includes(col));
};

const handleRescreen = (selectedUser) => {
  if (selectedUser.value.length === 0) {
    Swal.fire({
      icon: 'error',
      title: 'No users selected',
      text: 'Please select at least one user to perform rescreening.',
    });
    return;
  }

  const plural = selectedUsers.value.length > 1 ? 's' : '';
  const message = selectedUsers.value.length === 1 ? `Do you wish to rescreen ${selectedUsers.value[0].name}?` : `Do you wish to rescreen these ${selectedUsers.value.length} user${plural}?`;

  Swal.fire({
    icon: 'question',
    title: message,
    showCancelButton: true,
    confirmButtonText: 'Yes, rescreen',
    cancelButtonText: 'Cancel',
  }).then((result) => {
    if (result.isConfirmed) {
      const userIds = selectedUsers.value.map(user => user.id);
      sessionStorage.setItem('RescreeningUserIDs', JSON.stringify(userIds));
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
    'othersRisk'
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
    if (response && response.data && Array.isArray(response.data['Rescreening List'])) {
      const mappedUsers = response.data['Rescreening List'].map(submissionData => {
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
          pastDiagnosis: submissionData.diagnosis || 'none',
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
  } catch (error) {
    console.error(error);
  } finally {
    loadingPatients.value = false;
  }
});

const getSeverity = (alcoholRisk) => {
  switch (alcoholRisk.toLowerCase()) {
    case 'high risk':
      return 'custom-severe';
    case 'moderate risk':
      return 'custom-moderate';
    case 'low risk':
      return 'custom-low';
    case 'no risk':
      return 'custom-none';
    default:
      return '';
  }
};

</script>

<style>
.custom-severe {
  color: #E6142D;
}

.custom-moderate {
  color: #FFE500;
}

.custom-low {
  color: #0BE61E;
}

.custom-none {
  color: #000;
}
</style>
