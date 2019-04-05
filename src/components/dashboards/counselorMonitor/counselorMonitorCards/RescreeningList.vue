<template>
  <div class="container-fluid">
    <!-- <MonitorFilterCard @filtersApplied="handleFiltersApplied" /> -->
    <!-- Filters -->
    <div class="row d-flex align-items-center">
      <div class="col-11">
        <!-- General Table Search -->
        <el-input v-model="tableSearch" placeholder="Search in table"></el-input>
      </div>
      <div class="col-1">
        <el-button class="btn hwss-btn" @click="handleRescreen">Rescreen</el-button>
      </div>
    </div>

    <!-- Table -->
    <div class="main-container mt-5">
      <el-table :data="filteredPatients" v-loading="loadingPatients" style="width: 100%;" highlight-current-row
        class="custom-table" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="50"></el-table-column>
        <el-table-column prop="date" label="Date" sortable :sort-method="dateSort" width="150"></el-table-column>
        <el-table-column prop="name" label="Name" sortable :sort-method="nameSort" width="150"></el-table-column>
        <el-table-column prop="age" label="Age" sortable :sort-method="ageSort" width="80"></el-table-column>
        <el-table-column prop="sex" label="Sex" sortable :sort-method="sexSort" width="100"></el-table-column>
        <el-table-column prop="pastDiagnosis" label="Past Diagnosis" width="150" :filters="pastDiagnosisFilters"
          :filter-method="filterPastDiagnosis"></el-table-column>
        <el-table-column prop="phqSeverity" label="PHQ Severity" width="200">
          <template #default="{ row }">
            <span class="icon-wrapper" :class="getCellClass(row.opioidsRisk)">
              <i class="fas fa-flag"></i>
              {{ row.phqSeverity }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="gadSeverity" label="GAD Severity" width="200">
          <template #default="{ row }">
            <span class="icon-wrapper" :class="getCellClass(row.opioidsRisk)">
              <i class="fas fa-flag"></i>
              {{ row.gadSeverity }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="aceSeverity" label="ACE Severity" width="200">
          <template #default="{ row }">
            <span class="icon-wrapper" :class="getCellClass(row.opioidsRisk)">
              <i class="fas fa-flag"></i>
              {{ row.aceSeverity }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="tobaccoRisk" label="Tobacco Risk" width="200">
          <template #default="{ row }">
            <span class="icon-wrapper" :class="getCellClass(row.opioidsRisk)">
              <i class="fas fa-flag"></i>
              {{ row.tobaccoRisk }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="alcoholRisk" label="Alcohol Risk" width="200">
          <template #default="{ row }">
            <span class="icon-wrapper" :class="getCellClass(row.opioidsRisk)">
              <i class="fas fa-flag"></i>
              {{ row.alcoholRisk }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="cannabisRisk" label="Cannabis Risk" width="200">
          <template #default="{ row }">
            <span class="icon-wrapper" :class="getCellClass(row.opioidsRisk)">
              <i class="fas fa-flag"></i>
              {{ row.cannabisRisk }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="cocaineRisk" label="Cocaine Risk" width="200">
          <template #default="{ row }">
            <span class="icon-wrapper" :class="getCellClass(row.opioidsRisk)">
              <i class="fas fa-flag"></i>
              {{ row.cocaineRisk }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="amphetamineRisk" label="Amphetamine Risk" width="200">
          <template #default="{ row }">
            <span class="icon-wrapper" :class="getCellClass(row.opioidsRisk)">
              <i class="fas fa-flag"></i>
              {{ row.amphetamineRisk }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="inhalantsRisk" label="Inhalants Risk" width="200">
          <template #default="{ row }">
            <span class="icon-wrapper" :class="getCellClass(row.opioidsRisk)">
              <i class="fas fa-flag"></i>
              {{ row.inhalantsRisk }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="sedativeRisk" label="Sedative Risk" width="200">
          <template #default="{ row }">
            <span class="icon-wrapper" :class="getCellClass(row.opioidsRisk)">
              <i class="fas fa-flag"></i>
              {{ row.sedativeRisk }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="hallucinogensRisk" label="Hallucinogens Risk" width="200">
          <template #default="{ row }">
            <span class="icon-wrapper" :class="getCellClass(row.opioidsRisk)">
              <i class="fas fa-flag"></i>
              {{ row.hallucinogensRisk }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="opioidsRisk" label="Opioids Risk" width="200">
          <template #default="{ row }">
            <span class="icon-wrapper" :class="getCellClass(row.opioidsRisk)">
              <i class="fas fa-flag"></i>
              {{ row.opioidsRisk }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="othersRisk" label="Others Risk" width="200">
          <template #default="{ row }">
            <span class="icon-wrapper" :class="getCellClass(row.opioidsRisk)">
              <i class="fas fa-flag"></i>
              {{ row.othersRisk }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="nonMedicalInjectionUse" label="Non Medical Injection Use" width="200">
          <template #default="{ row }">
            <span class="icon-wrapper" :class="getCellClass(row.opioidsRisk)">
              <i class="fas fa-flag"></i>
              {{ row.nonMedicalInjectionUse }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="Actions" width="120">
          <template v-slot="{ row }">
            <el-button type="btn hwss-btn" icon="el-icon-edit" size="mini" @click="handleRescreen">Rescreen</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>

  <el-dialog v-model="modalVisible" title="Modal Title">
    <!-- Modal Content Here -->
    <p>Modal Content</p>
    <template v-slot:footer>
      <span class="dialog-footer">
        <el-button @click="modalVisible = false">Cancel</el-button>
        <el-button type="primary" @click="modalVisible = false">Confirm</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
// import MonitorFilterCard from './MonitorFilterCard.vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import Swal from 'sweetalert2';
import endpoints from '@/api';
const modalVisible = ref(false);

const router = useRouter();
const users = ref([]);
const tableSearch = ref('');
const pastDiagnosisFilter = ref('');
const loadingPatients = ref(false);

const selectedUsers = ref([]);

const handleRescreen = () => {
  if (selectedUsers.value.length === 0) {
    Swal.fire({
      icon: 'error',
      title: 'No users selected',
      text: 'Please select at least one user to perform rescreening.',
    });
    return;
  }

  if (selectedUsers.value.length === 1) {
    // Only one user selected
    const user = selectedUsers.value[0];
    Swal.fire({
      icon: 'question',
      title: `Do you wish to rescreen ${user.name}?`,
      showCancelButton: true,
      confirmButtonText: 'Yes, rescreen',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        sessionStorage.setItem('RescreeningUserID', user.id);
        router.push('/counselor-dashboard/counselor-rescreening');
      }
    });
  } else {
    // Multiple users selected
    const plural = selectedUsers.value.length > 1 ? 's' : '';
    Swal.fire({
      icon: 'question',
      title: `Do you wish to rescreen these ${selectedUsers.value.length} user${plural}?`,
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
  }
};

const handleSelectionChange = (selected) => {
  selectedUsers.value = selected;
};

const filteredPatients = computed(() => {
  // Apply general table search
  let filtered = users.value.filter(user => {
    return Object.values(user).some(val => {
      if (typeof val === 'string') {
        return val.toLowerCase().includes(tableSearch.value.toLowerCase());
      }
      return false;
    });
  });

  if (pastDiagnosisFilter.value) {
    filtered = filtered.filter(user => user.pastDiagnosis === pastDiagnosisFilter.value);
  }

  return filtered;
});

const applyCellClasses = () => {
  const tableRows = document.querySelectorAll('.el-table__body .el-table__row');
  tableRows.forEach(row => {
    const cells = row.querySelectorAll('.icon-wrapper');
    cells.forEach(cell => {
      const cellText = cell.innerText.trim();
      cell.classList.add(getCellClass(cellText));
    });
  });
};

// Function to determine class based on cell value
const getCellClass = (cellValue) => {
  console.log('Cell value:', cellValue); // Log the cell value

  if (!cellValue) return 'severity-none'; // Add a guard clause

  let severityClass = '';

  switch (cellValue.trim().toLowerCase()) { // Trim whitespace and convert to lowercase for comparison
    case 'high risk':
      severityClass = 'severity-severe';
      break;
    case 'moderately severe':
      severityClass = 'severity-moderate-severe';
      break;
    case 'moderate risk':
    severityClass = 'severity-moderate';
      break;
    case 'moderate':
      severityClass = 'severity-moderate';
      break;
    case 'low risk':
    severityClass = 'severity-mild';
      break;
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
    if (response && response.data && response.data.flag_details) {
      const mappedUsers = response.data.flag_details.map(detail => {
        const submissionData = detail.submission_details[0].submission_data;
        const measurementData = detail.submission_details[0].measurement_data;
        const measurementAssistData = detail.submission_details[0].measurement_assist_data;

        return {
          id: detail.user_data.id,
          date: submissionData.submission_date.split(' ')[0],
          name: `${detail.user_data.first_name} ${detail.user_data.middle_name ? detail.user_data.middle_name + ' ' : ''}${detail.user_data.last_name}`,
          age: new Date().getFullYear() - new Date(detail.user_data.date_of_birth).getFullYear(),
          sex: detail.user_data.gender,
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
        };
      });
      users.value = mappedUsers;
    }
  } catch (error) {
    console.error(error);
  } finally {
    loadingPatients.value = false;
  }

  setTimeout(() => {
    applyCellClasses();
  }, 2000);
});

const filterPastDiagnosis = (value, row) => {
  return row.pastDiagnosis === value;
};

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
</style>
