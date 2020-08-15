<template>
  <div class="container-fluid py-3">
    <div class="card shadow-sm">
      <div class="card-header bg-light py-2">
        <h4 class="m-0 text-center">Rescreening List</h4>
      </div>

      <div class="card-body">
        <div class="filters-section mb-3 p-2 border rounded bg-light">
          <div class="row g-2 align-items-center">
            <div class="col-lg-3 col-md-6">
              <label for="yearFilter" class="form-label small fw-bold">Year</label>
              <select id="yearFilter" v-model="selectedYear" class="form-select form-select-sm">
                <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
              </select>
            </div>

            <div class="col-lg-5 col-md-6">
              <label for="tableSearch" class="form-label small fw-bold">Search</label>
              <InputText id="tableSearch" v-model="tableSearch" placeholder="Search in table..." class="form-control form-control-sm" />
            </div>

            <div class="col-lg-4 col-md-12">
              <label for="columnSelector" class="form-label small fw-bold">View Columns</label>
              <MultiSelect id="columnSelector" v-model="selectedColumns" :options="columns" optionLabel="header"
                         @update:modelValue="onToggle" display="chip" placeholder="Select Columns" class="w-100 p-multiselect-sm" />
            </div>
          </div>
        </div>

        <div class="table-responsive">
          <DataTable :value="filteredPatients" :loading="loadingPatients" :paginator="true" :rows="10"
                     resizableColumns size="small" columnResizeMode="expand" :rowsPerPageOptions="[5, 10, 20]">
            
            <Column v-for="col in selectedColumns" :key="col.field" :field="col.field" :header="col.header"
                    :sortable="true" :frozen="col.frozen" style="min-width: 140px;">
              <template #body="slotProps" v-if="isRiskColumn(col.field)">
                <Tag rounded :value="slotProps.data[col.field]" class="w-100 text-capitalize"
                     :style="{ 
                       color: getSeverity(slotProps.data[col.field]).colorCode, 
                       backgroundColor: getSeverity(slotProps.data[col.field]).bgColor 
                     }" />
              </template>
            </Column>

            <Column field="actions" header="Actions" :sortable="false" style="min-width: 180px;" frozen alignFrozen="right">
              <template #body="{ data }">
                <div class="btn-group w-100" role="group">
                  <Button icon="pi pi-check-circle" label="Safe" class="p-button-sm p-button-outlined p-button-success"
                          @click="handleMarkAsSafe(data)" />
                  <Button icon="pi pi-user-edit" label="Rescreen" class="p-button-sm p-button-primary"
                          @click="handleRescreen(data)" />
                </div>
              </template>
            </Column>

            <template #empty>
              <div class="text-center p-4">
                <p class="text-muted">No records found matching your criteria.</p>
              </div>
            </template>
          </DataTable>
        </div>
      </div>
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

// --- Year Filter ---
const selectedYear = ref(new Date().getFullYear());
const years = computed(() => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 10 }, (_, index) => currentYear - index);
});

// --- Table Column Configuration ---
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

// --- Main Computed Property for UI Filtering and Sorting ---
const filteredPatients = computed(() => {
  // This computed property now only handles the interactive search and year filters
  // on the data that has already been pre-filtered by the server.
  let filtered = users.value.filter(user => {
    const matchesSearch = Object.values(user).some(val => 
      String(val).toLowerCase().includes(tableSearch.value.toLowerCase())
    );

    const submissionDate = user.date;
    const submissionYear = submissionDate ? new Date(submissionDate).getFullYear() : null;
    const matchesYear = submissionYear === selectedYear.value;

    return matchesSearch && matchesYear;
  });
  
  // The client-side sorting logic remains as a UI enhancement.
  const riskColumns = [
    'tobaccoRisk', 'alcoholRisk', 'cannabisRisk', 'cocaineRisk', 'amphetamineRisk',
    'inhalantsRisk', 'sedativeRisk', 'hallucinogensRisk', 'opioidsRisk',
    'othersRisk', 'nonMedicalInjectionUse'
  ];

  filtered.sort((a, b) => {
    const riskOrder = ['high risk', 'moderate risk', 'low risk', 'no risk'];
    const getRiskIndex = (risk) => riskOrder.indexOf(String(risk).toLowerCase());

    for (const col of riskColumns) {
      const aIndex = getRiskIndex(a[col]);
      const bIndex = getRiskIndex(b[col]);
      if (aIndex < bIndex) return -1;
      if (aIndex > bIndex) return 1;
    }
    return 0;
  });

  return filtered;
});

// --- Component Lifecycle: Fetches data with server-side filtering ---
onMounted(async () => {
  try {
    loadingPatients.value = true;

    // 1. Get user details from local storage to determine the filter value
    const myData = localStorage.getItem('userDetailsStore');
    const parseData = JSON.parse(myData);
    const userRole = parseData.user.role;
    const userAgencyName = parseData.agency.agencyName;

    let requestUrl = endpoints.getRescreeningList;

    // 2. Build the request URL with the agency_name query parameter if needed
    if (userRole === 'school_counselor' || userRole === 'trained_professional' || userRole === 'clinical_counselor') {
      if (userAgencyName) {
        requestUrl = `${endpoints.getRescreeningList}?agency_name=${encodeURIComponent(userAgencyName)}`;
      }
    }
    
    // 3. Fetch the pre-filtered list from the backend
    const response = await axios.get(requestUrl);

    if (response.data && Array.isArray(response.data['Rescreening List'])) {
      // The old client-side filtering block is removed.
      const mappedUsers = response.data['Rescreening List'].map(submissionData => ({
        // CRITICAL: We map submission_id to use in the 'mark as safe' action
        submission_id: submissionData.submission_id, 
        id: submissionData.user_details.user_id,
        date: submissionData.created_at ? submissionData.created_at.split('T')[0] : '',
        name: submissionData.user_details.full_name,
        age: submissionData.user_details.age,
        sex: submissionData.user_details.sex,
        userAgencyName: submissionData.user_details.PsAddDzongkhag,
        pastDiagnosis: submissionData.diagnosis || 'none',
        suicidal_measurement: submissionData.measurement_data.suicidal_measurement || 'none',
        suicidal_score: submissionData.measurement_data.suicidal_score || 'none',
        phqSeverity: submissionData.measurement_data.phq_measurement || 'none',
        gadSeverity: submissionData.measurement_data.gad_measurement || 'none',
        aceSeverity: submissionData.measurement_data.ace_measurement || 'none',
        tobaccoRisk: submissionData.measurement_assist_data.tobacco_measurement || 'none',
        alcoholRisk: submissionData.measurement_assist_data.alcoholic_measurement || 'none',
        cannabisRisk: submissionData.measurement_assist_data.cannabis_measurement || 'none',
        cocaineRisk: submissionData.measurement_assist_data.cocaine_measurement || 'none',
        amphetamineRisk: submissionData.measurement_assist_data.amphetamine_measurement || 'none',
        inhalantsRisk: submissionData.measurement_assist_data.inhalants_measurement || 'none',
        sedativeRisk: submissionData.measurement_assist_data.sedatives_measurement || 'none',
        hallucinogensRisk: submissionData.measurement_assist_data.hallucinogens_measurement || 'none',
        opioidsRisk: submissionData.measurement_assist_data.opioids_measurement || 'none',
        othersRisk: submissionData.measurement_assist_data.other_measurement || 'none',
        nonMedicalInjectionUse: submissionData.measurement_assist_data.injection_measurement || 'none',
        flags: submissionData.flags
      }));
      users.value = mappedUsers;
    } else {
      console.error("Invalid response data format");
      users.value = [];
    }
  } catch (error) {
    console.error('Error fetching rescreening list:', error);
    Swal.fire('Error', 'Could not fetch the rescreening list.', 'error');
  } finally {
    loadingPatients.value = false;
  }
});


// --- Action Handlers ---
const calculateAgeGroup = (age) => {
  if (age < 14) return "Below 14";
  if (age >= 14 && age <= 17) return "15 to 17";
  return "Above 18";
};

const handleRescreen = (user) => {
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
      sessionStorage.setItem('clientAgeGroup', calculateAgeGroup(user.age));
      router.push('/counselor-dashboard/counselor-rescreening');
    }
  });
};

const handleMarkAsSafe = (user) => {
  Swal.fire({
    icon: 'warning',
    title: `Mark ${user.name} as Safe?`,
    text: "This will remove them from the rescreening list.",
    showCancelButton: true,
    confirmButtonText: 'Yes, Mark as Safe',
    cancelButtonText: 'Cancel',
    confirmButtonColor: '#198754',
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        // Call the backend API to update the submission status
        await axios.post(endpoints.markSubmissionSafe, {
          submission_id: user.submission_id 
        });
        
        // On success, remove the user from the local state for an instant UI update
        const index = users.value.findIndex(p => p.submission_id === user.submission_id);
        if (index > -1) {
          users.value.splice(index, 1);
        }
        Swal.fire('Success!', `${user.name} has been marked as safe.`, 'success');
      } catch (error) {
        console.error('Error marking as safe:', error);
        Swal.fire('Error!', 'Could not mark the user as safe. Please try again.', 'error');
      }
    }
  });
};


// --- Helper Functions ---
const isRiskColumn = (field) => {
  return [
    'suicidal_measurement', 'suicidal_score', 'phqSeverity', 'gadSeverity', 'aceSeverity', 'tobaccoRisk', 'alcoholRisk',
    'cannabisRisk', 'cocaineRisk', 'amphetamineRisk', 'inhalantsRisk',
    'sedativeRisk', 'hallucinogensRisk', 'opioidsRisk', 'othersRisk',
    'nonMedicalInjectionUse'
  ].includes(field);
};

const getSeverity = (severity) => {
  let colorCode;
  let bgColor;
  switch (String(severity).toLowerCase()) {
    case 'severe':
    case 'high risk':
      colorCode = 'rgba(230, 20, 45, 0.75)';
      bgColor = 'rgba(230, 20, 45, 0.25)';
      break;
    case 'moderately-severe':
      colorCode = 'rgba(255, 69, 0, 0.75)';
      bgColor = 'rgba(255, 69, 0, 0.25)';
      break;
    case 'moderate risk':
    case 'moderate':
      colorCode = 'rgba(255, 165, 0, 0.75)';
      bgColor = 'rgba(255, 165, 0, 0.25)';
      break;
    case 'minimal':
    case 'low risk':
      colorCode = 'rgba(0, 100, 0, 0.75)';
      bgColor = 'rgba(0, 100, 0, 0.25)';
      break;
    default:
      colorCode = 'rgba(52, 52, 52, 0.75)';
      bgColor = 'rgba(52, 52, 52, 0.25)';
  }
  return { severity, colorCode, bgColor };
};
</script>

<style>
/* Use a global style tag (without 'scoped') OR place this in your main CSS file
   to apply the small size to the PrimeVue multiselect component */
.p-multiselect.p-multiselect-sm .p-multiselect-label {
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
}
</style>