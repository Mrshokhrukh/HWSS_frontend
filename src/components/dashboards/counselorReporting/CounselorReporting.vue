<template>
  <div class="card p-4">
    <div class="p-field p-grid row">
      <div class="col-5 p-md-4">
        <span class="p-input-icon-left">
          <InputText v-model="globalFilter" placeholder="earch Reports..." class="ms-2  w-100" icon="pi pi-search" />
        </span>
      </div>
      <div v-if="isSchoolCounselor" class="col-5 p-md-4">
        <Dropdown v-model="selectedOption" :options="options" placeholder="Select Report Type" class="ms-2 w-100" />
      </div>

      <div class="col-2 p-md-4">
        <Button label="Bulk Download All" @click="bulkDownload" class="btn hwss-btn" icon="pi pi-download" />
      </div>
    </div>

    <!-- General Report Table -->
    <div v-if="selectedOption === 'general Report' || !isSchoolCounselor">
      <DataTable :value="filteredPatients" :paginator="true" :rows="10" :resizableColumns="true" sortField="suicidal_measurement" :sortOrder="-1" >
        <Column v-for="field in tableFields" :key="field.key" :field="field.key" :header="field.header" :sortable="true" 
          :style="field.width ? { width: field.width } : {}">
          <template #body="{ data }">
            <Tag v-if="field.taggable" :value="data[field.key]" :severity="severityClass(data[field.key])" />
            <span v-else>{{ data[field.key] }}</span>
          </template>
        </Column>
        <!-- <Column>
          <template #body="rowData">
          <Button label="Download" @click="downloadReport(rowData)" />
        </template>
        </Column> -->
      </DataTable>
    </div>

    <!-- School Environment Report Table -->
    <div v-else-if="selectedOption === 'school' && isSchoolCounselor">
      <SchoolEnvironmentTable />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import axios from 'axios';
import endpoints from '@/api';
import SchoolEnvironmentTable from "./SchoolEnvironmentTable.vue"
const reportData = ref([]);
const globalFilter = ref('');
const filteredData = ref([]);
import { saveAs } from 'file-saver';
import JSZip from 'jszip';


// eslint-disable-next-line no-unused-vars
const globalFilterFields = [
  'date', 'username', 'age', 'sex', 'past_diagnosis',
  'gad_measurement', 'phq_measurement', 'ace_measurement', 'suicidal_measurement',
  'tobacco_measurement', 'alcoholic_measurement', 'cannabis_measurement', 'cocaine_measurement', 'amphetamine_measurement', 'inhalants_measurement', 'sedatives_measurement',
  'hallucinogens_measurement', 'opioids_measurement', 'other_measurement', 'injection_measurement'
];
const tableFields = [
  { key: 'date', header: 'Date'  },
  { key: 'username', header: 'Name' },
  { key: 'age', header: 'Age' },
  { key: 'sex', header: 'Sex' },
  { key: 'present_dzongkhag', header: 'Present Dzongkhag' },
  { key: 'present_gewog', header: 'Present Gewog' },
  { key: 'present_village', header: 'Present Village' },
  { key: 'user_code', header: 'User Code' },
  { key: 'parent_occupation', header: 'Parent Occupation' },
  { key: 'guardian_name', header: 'Guardian Name' },
  { key: 'guardian_occupation', header: 'Guardian Occupation' },
  { key: 'parent_status', header: 'Parent Status' },
  { key: 'current_living_with', header: 'Current Living With' },
  { key: 'user_role_agency', header: 'User Role Agency' },
  { key: 'user_class', header: 'User Class' },
  { key: 'user_stream', header: 'User Stream' },
  { key: 'user_sub_class', header: 'User Sub Class' },
  { key: 'past_diagnosis', header: 'Past Diagnosis' },
  { key: 'suicidal_measurement', header: 'Suicidal Measurement', taggable: true },
  { key: 'gad_measurement', header: 'GAD Measurement', taggable: true },
  { key: 'phq_measurement', header: 'PHQ Measurement', taggable: true },
  { key: 'ace_measurement', header: 'ACE Measurement', taggable: true },
  { key: 'alcoholic_measurement', header: 'Alcoholic Measurement', taggable: true },
  { key: 'tobacco_measurement', header: 'Tobacco Measurement', taggable: true },
  { key: 'cannabis_measurement', header: 'Cannabis Measurement', taggable: true },
  { key: 'cocaine_measurement', header: 'Cocaine Measurement', taggable: true },
  { key: 'amphetamine_measurement', header: 'Amphetamine Measurement', taggable: true },
  { key: 'inhalants_measurement', header: 'Inhalants Measurement', taggable: true },
  { key: 'sedatives_measurement', header: 'Sedatives Measurement', taggable: true },
  { key: 'hallucinogens_measurement', header: 'Hallucinogens Measurement', taggable: true },
  { key: 'opioids_measurement', header: 'Opioids Measurement', taggable: true },
  { key: 'injection_measurement', header: 'Injection Measurement', taggable: true },
  { key: 'other_measurement', header: 'Other Measurement', taggable: true },
  { key: 'other_name', header: 'Other Name' },
  { key: 'assessment_status', header: 'Assessment Status' },
  { key: 'case_status', header: 'Case Status' },
  { key: 'counseling', header: 'Counseling' },
  { key: 'follow_up', header: 'Follow Up' },
  { key: 'comments', header: 'Comments' },
  { key: 'referral_status', header: 'Referral Status' },
  { key: 'referral_remarks', header: 'Referral Remarks' },
];

const selectedOption = ref('general Report'); // Default option

const options = [
  'general Report',
  'school'
];

// Determine if the user is a school counselor
const isSchoolCounselor = computed(() => {
  return true; // For demonstration purposes
});

// Fetch report data from API
const fetchReportData = async () => {
  try {
    const response = await axios.get(endpoints.generateReport);
    if (response.data && Array.isArray(response.data)) {
      reportData.value = response.data;
      filteredData.value = response.data;
    } else {
      handleFetchError();
    }
  } catch (error) {
    handleFetchError();
  }
};

// Handle fetch error
const handleFetchError = () => {
  reportData.value = [];
  filteredData.value = [];
  // Handle error
}

// Function to convert data to CSV format
const convertToCSV = (data) => {
  const header = Object.keys(data[0]);
  const csv = [
    header.join(','),
    ...data.map(row => header.map(fieldName => JSON.stringify(row[fieldName])).join(','))
  ].join('\n');
  return csv;
};

// Function to trigger CSV download
// const downloadCSV = (csvData, fileName) => {
//   const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8' });
//   saveAs(blob, fileName);
// };

// Function to handle bulk download
const bulkDownload = () => {
  const csvData = convertToCSV(filteredData.value);
  const zip = new JSZip();
  const zipFolder = zip.folder('reports');

  // Add the CSV file to the ZIP folder
  zipFolder.file('reports.csv', csvData);

  // Generate password based on user's username and current year
  const userDetails = JSON.parse(localStorage.getItem('userDetailsStore'));
  const username = userDetails ? userDetails.user.username : 'defaultUser';
  const currentYear = new Date().getFullYear();
  const password = `${username}@${currentYear}#`;

  console.log(password);
  // Generate the password-protected ZIP file
  zip.generateAsync({ type: 'blob', compression: 'DEFLATE', password: 'password' })
    .then(function (blob) {
      // Trigger download
      saveAs(blob, 'reports.zip');
    })
    .catch(function (error) {
      console.error('Error generating ZIP file:', error);
    });
};



// Filter data based on global filter
const filterData = () => {
  if (!globalFilter.value) {
    filteredData.value = [...reportData.value];
    return;
  }
  const filtered = reportData.value.filter(item => {
    return Object.values(item).some(val => String(val).toLowerCase().includes(globalFilter.value.toLowerCase()));
  });
  filteredData.value = filtered;
}
const filteredPatients = computed(() => {
  let filtered = filteredData.value.filter(user => {
    return Object.values(user).some(val => {
      if (typeof val === 'string') {
        return val.toLowerCase().includes(globalFilter.value.toLowerCase());
      }
      return false;
    });
  });

  const riskColumns = [
    'tobacco_measurement',
    'alcoholic_measurement',
    'cannabis_measurement',
    'cocaine_measurement',
    'amphetamine_measurement',
    'inhalants_measurement',
    'sedatives_measurement',
    'hallucinogens_measurement',
    'opioids_measurement',
    'other_measurement'
  ];

  filtered.sort((a, b) => {
    // Compare the risk levels based on the desired order
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



// Watch for changes in global filter
watch(globalFilter, filterData);

// Function to determine severity class
const severityClass = (value) => {
  switch (value.toLowerCase()) {
    case 'severe':
    case 'high risk':
    case 'nearly everyday':
      return 'danger'; // Wine Red
    case 'moderately-severe':
      return 'warning'; // Red-Orange
    case 'moderate risk':
    case 'moderate':
    case 'more than half the days':
      return 'warning'; // Orange
    case 'minimal':
    case 'low risk':
    case 'several days':
      return 'success'; // Darker Green (More towards Blue)
    case 'no risk':
      return 'success'; // Green
    default:
      return 'info'; // Slate Grey
  }
}

onMounted(() => {
  fetchReportData();
})
</script>

<style scoped>
.danger{
  background-color: #e6142d40;
  color: #e6142d40;
}
</style>