<template>
  <div class="container-fluid">
    <!-- Filters -->
    <div class="row d-flex align-items-center">
      <div class="col-11">
        <MonitorFilterCard @filtersApplied="handleFiltersApplied" />
      </div>
      <div class="col-1">
        <el-button class="btn hwss-btn" @click="rescreenSelectedPatients">Rescreen</el-button>
      </div>
    </div>

    <!-- Table -->
    <div class="main-container mt-5">
      <el-table :data="filteredUsers" :row-class-name="rowClassName" height="500px" stripe
        :default-sort="{ prop: 'date', order: 'descending' }" @selection-change="onSelectionChanged"
        style="width: 100%">
        <el-table-column type="selection" width="50"></el-table-column>
        <el-table-column prop="date" label="Date" sortable show-overflow-tooltip></el-table-column>
        <el-table-column prop="name" label="Name" sortable show-overflow-tooltip></el-table-column>
        <el-table-column prop="age" label="Age" sortable show-overflow-tooltip></el-table-column>
        <el-table-column prop="sex" label="Sex" sortable show-overflow-tooltip></el-table-column>
        <el-table-column prop="pastMentalDisorder" label="Past Mental Disorder History" sortable
          show-overflow-tooltip></el-table-column>
        <el-table-column prop="depressionSeverity" label="Depression Severity" sortable :formatter="severityFormatter"
          show-overflow-tooltip></el-table-column>
        <el-table-column prop="generalAnxietySeverity" label="General Anxiety Severity" sortable
          :formatter="severityFormatter" show-overflow-tooltip></el-table-column>
        <el-table-column prop="adverseChildhoodExperienceSeverity" label="Adverse Childhood Experience Severity"
          sortable :formatter="severityFormatter" show-overflow-tooltip></el-table-column>
        <!-- Add more columns as needed -->
        <el-table-column label="Actions">
          <template #default="{ row }">
            <el-button class="btn hwss-btn" @click="rescreenSelectedPatients(row.id)">Rescreen</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import MonitorFilterCard from './MonitorFilterCard.vue';
import { useRouter } from 'vue-router';
import endpoints from '@/api';
import axios from 'axios';
import Swal from 'sweetalert2';

const router = useRouter();

const rescreenSelectedPatients = (patientId) => {
  const selectedPatient = selectedUsers.value.find(patient => patient.id === patientId);

  if (!selectedPatient) {
    Swal.fire({
      icon: 'warning',
      text: 'Please select a valid patient to rescreen.',
      timer: 2000,
      timerProgressBar: true,
    });
    return;
  }

  Swal.fire({
    title: 'Confirm Rescreen',
    text: `Are you sure you want to rescreen ${selectedPatient.name}?`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Rescreen',
    cancelButtonText: 'Cancel',
    reverseButtons: true,
  }).then((result) => {
    if (result.isConfirmed) {
      console.log('Patient selected for rescreening:', selectedPatient);
      router.push('/counselor-dashboard/counselor-rescreening');
    }
  });
};

const severityFormatter = (row) => {
  const severity = row.value;
  let iconClass = 'fas fa-flag'; // Default icon class
  let severityClass = ''; // Default severity class

  // Determine severity icon and class based on severity level
  switch (severity) {
    case 'severe':
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

  // Return the HTML string with severity class applied
  return `<span class="${severityClass}"><i class="${iconClass}"></i> ${severity}</span>`;
};

const columnDefs = ref([
  { headerCheckboxSelection: true, checkboxSelection: true },
  { headerName: 'Date', field: 'date', sortable: true, filter: true, floatingFilter: true },
  { headerName: 'Name', field: 'name', sortable: true, filter: true, floatingFilter: true },
  { headerName: 'Age', field: 'age', sortable: true, filter: true, floatingFilter: true },
  { headerName: 'Sex', field: 'sex', sortable: true, filter: true, floatingFilter: true },
  { headerName: 'Past Mental Disorder History', field: 'pastMentalDisorder', sortable: true, filter: true, floatingFilter: true },
  { headerName: 'Depression Severity', field: 'depressionSeverity', sortable: true, filter: true, floatingFilter: true },
  { headerName: 'General Anxiety Severity', field: 'generalAnxietySeverity', sortable: true, filter: true, floatingFilter: true },
  { headerName: 'Adverse Childhood Experience Severity', field: 'adverseChildhoodExperienceSeverity', sortable: true, filter: true, floatingFilter: true },
  // Add more columns as needed
]);

const users = ref([]);
const searchQuery = ref('');
const selectedUsers = ref([]);

const filteredUsers = computed(() => {
  if (!searchQuery.value.trim() || !Array.isArray(users.value) || users.value.length === 0) {
    return users.value;
  }

  return users.value.filter(user => {
    return columnDefs.value.some(column => {
      const fieldValue = user[column.field];
      return fieldValue !== undefined && fieldValue.toString().toLowerCase().includes(searchQuery.value.toLowerCase());
    });
  });
});

const onSelectionChanged = (event) => {
  const selectedNodes = event.api.getSelectedNodes();
  const selectedData = selectedNodes.map(node => node.data);
  selectedUsers.value = selectedData.map(user => user);
};

const handleFiltersApplied = (filterValues) => {
  console.log("Selected filter values:", filterValues);
};

onMounted(async () => {
  try {
    const response = await axios.get(endpoints.getRescreeningList);
    if (response && response.data && response.data.flag_details) {
      const mappedUsers = response.data.flag_details.map(detail => {
        const submissionData = detail.submission_details[0].submission_data;
        const measurementData = detail.submission_details[0].measurement_data;
        // const measurementAssistData = detail.submission_details[0].measurement_assist_data;

        return {
          id: detail.user_data.id,
          date: submissionData.submission_date.split(' ')[0],
          name: `${detail.user_data.first_name} ${detail.user_data.middle_name ? detail.user_data.middle_name + ' ' : ''}${detail.user_data.last_name}`,
          age: new Date().getFullYear() - new Date(detail.user_data.date_of_birth).getFullYear(),
          sex: detail.user_data.gender,
          pastMentalDisorder: submissionData.diagnosis || 'none',
          depressionSeverity: measurementData.phq_measurement || 'none',
          generalAnxietySeverity: measurementData.gad_measurement || 'none',
          adverseChildhoodExperienceSeverity: 'none',
          // Add more fields as needed
        };
      });
      users.value = mappedUsers;
    }
  } catch (error) {
    console.error(error);
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
  color: #c40000;
  background: #a800003a;
}

.severity-moderate-severe {
  color: #dc6503;
  background: #b563003a;
}

.severity-moderate {
  color: #e39700;
  background: #c8aa003a;
}

.severity-mild {
  color: #008300;
  background: #0083003a;
}

.severity-none {
  color: #5f5f5f;
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
</style>
