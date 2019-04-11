<template>
  <div class="container-fluid">
    <!-- Title -->
    <h4 class="mt-2 text-center mb-3">Refine Results</h4>

    <!-- Filters -->
    <div class="row d-flex align-items-center mb-4">
      <div class="col-5">
        <!-- Search Input -->
        <InputText v-model="tableSearch" placeholder="Search in table" class="hwss-searchbox w-100"></InputText>
      </div>
      <div class="col-5">
        <!-- Multiselect -->
        <MultiSelect :modelValue="selectedColumns" :options="columns" optionLabel="header" @update:modelValue="onToggle"
          display="chip" placeholder="Select Columns" class="custom-multiselect w-100" />
      </div>
      <div class="col-1">
        <!-- Rescreen Button -->
        <Button class="btn hwss-btn w-100" @click="handleRescreen">Rescreen</Button>
      </div>
      <div class="col-1">
        <!-- Export Button -->
        <Button icon="pi pi-external-link" label="Export" @click="exportCSV($event)" class="btn hwss-btn" />
      </div>
    </div>

    <!-- Table -->
    <div class="main-container mt-2">
      <DataTable v-model:selection="selectedUsers" :value="filteredPatients" :loading="loadingPatients"
        :paginator="true" :rows="10" resizableColumns size="large" columnResizeMode="expand"
        :rowsPerPageOptions="[5, 10, 20]" :responsive="true" selectionMode="multiple" :selection="selectedUsers"
        @selectionChange="handleSelectionChange">
        <!-- Columns -->
        <Column selectionMode="multiple" headerStyle="width: 3rem" frozen class="font-bold"></Column>
        <Column v-for="(col, index) of selectedColumns" :field="col.field" :header="col.header"
          :key="col.field + '_' + index" :frozen="col.frozen === true ? true : false">
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



const handleRescreen = () => {
  if (selectedUsers.value.length === 0) {
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



// eslint-disable-next-line no-unused-vars
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
  return filtered;
});


const getCellClass = (cellValue) => {
  if (!cellValue) return 'severity-none';

  let severityClass = '';
  switch (cellValue.trim().toLowerCase()) {
    case 'high risk':
      severityClass = 'severity-severe';
      break;
    case 'moderately severe':
      severityClass = 'severity-moderate-severe';
      break;
    case 'moderate risk':
    case 'moderate':
      severityClass = 'severity-moderate';
      break;
    case 'low risk':
    case 'mild':
      severityClass = 'severity-mild';
      break;
    default:
      severityClass = 'severity-none';
      break;
  }

  return severityClass;
};

onMounted(async () => {
  try {
    loadingPatients.value = true;
    const response = await axios.get(endpoints.getRescreeningList);
    // console.log('Rescreening List:', response.data);
    if (response && response.data && Array.isArray(response.data['Rescreening List'])) {
      const mappedUsers = response.data['Rescreening List'].map(submissionData => {
        const user_details = submissionData.user_details;
        const measurementData = submissionData.measurement_data;
        const measurementAssistData = submissionData.measurement_assist_data;
        const flags = submissionData.flags;

        // Check if created_at property exists in submissionData
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
          flags: flags  // Add the flags object to the mapped data
        };
      });
      users.value = mappedUsers;

      // Apply cell classes simultaneously as the table is getting populated
      const table = document.querySelector('.main-container table');
      if (table) {
        const rows = table.querySelectorAll('tbody tr');
        rows.forEach(row => {
          const cells = row.querySelectorAll('td');
          cells.forEach(cell => {
            const cellText = cell.textContent.trim();
            const cellClass = getCellClass(cellText);

            // Create a span element
            const span = document.createElement('span');
            span.classList.add(cellClass); // Apply the class to the span
            span.innerHTML = `<i class="fas fa-flag"></i> ${cellText}`; // Add the icon and cell text to the span

            // Clear the cell content and append the span
            cell.innerHTML = '';
            cell.appendChild(span);
          });
        });
      }

    } else {
      console.error("Invalid response data format");
    }
  } catch (error) {
    console.error(error);
  } finally {
    loadingPatients.value = false;
  }
});

</script>


<style scoped>
table {
  border-collapse: separate;
  border-spacing: 0 10px;
  table-layout: auto;
  width: 100%;
}

tbody {
  border: 1px solid black;
}

.main-container {
  overflow: scroll;
}

.shadow-row {
  border-bottom: 1px solid #d8e2e588;
  box-shadow: 4px 4px 4px rgba(0, 0, 0, 0.15);
  background-color: #d8e2e5;
  border-radius: 20px !important;
}

.shadow-row td {
  background: transparent;
}

table th,
table td {
  width: 20rem;
}

.severity-severe {
  color: #c40000 !important;
  background: #a800003a !important;
  padding: 0.5rem 1rem;
  border: 2px solid #c40000;
  border-radius: 50px;
  line-height: 5rem;
}

.severity-moderate-severe {
  color: #dc6503 !important;
  background: #b563003a !important;
  padding: 0.5rem 1rem;
  border: 2px solid #dc6503;
  border-radius: 50px;
  line-height: 5rem;
}

.severity-moderate {
  color: #e39700, !important;
  background: #c8aa003a !important;
  padding: 0.5rem 1rem;
  border: 2px solid #e39700;
  border-radius: 50px;
  line-height: 5rem;
}

.severity-mild {
  color: #008300 !important;
  background: #0083003a !important;
  padding: 0.5rem 1rem;
  border: 2px solid #008300;
  border-radius: 50px;
  line-height: 5rem;
}

.severity-none {
  line-height: 5rem;
}

.ag-cell .ag-react-container .ag-value-wrapper .ag-group-value,
.ag-cell .ag-react-container .ag-value-wrapper span {
  border: 2px solid;
  border-radius: 50px;
  padding: 0.5rem 1rem;
}

thead tr td {
  color: green !important;
}

.me-2 {
  display: flex;
  widows: 50rem;
}

i.fas {
  margin-right: 0.5rem;
}

.el-table .cell {
  height: 2rem !important;
}

/* .custom-multiselect {
  max-width: 500px;
} */
</style>
