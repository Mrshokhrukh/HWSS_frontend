<template>
  <div class="card p-4">
    <div class="p-field p-grid row">
      <div class="col-5 p-md-4">
        <span class="p-input-icon-left">
          <InputText v-model="globalFilter" placeholder="Search Reports..." class="ms-2  w-100" icon="pi pi-search" />
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
      <DataTable :value="filteredPatients" :paginator="true" :rows="10" :resizableColumns="true"
        sortField="suicidal_measurement" :sortOrder="-1">
        <Column v-for="field in tableFields" :key="field.key" :field="field.key" :header="field.header" :sortable="true"
          :style="field.width ? { width: field.width } : {}">
          <template #body="{ data }">
            <Tag class="w-100" v-if="field.taggable" :value="data[field.key]"
              :severity="severityClass(data[field.key])" />
            <span v-else>{{ data[field.key] }}</span>
          </template>
        </Column>
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
import SchoolEnvironmentTable from "./SchoolEnvironmentTable.vue"
import { saveAs } from 'file-saver';
import JSZip from 'jszip';

const reportData = ref([]);
const globalFilter = ref('');
const filteredData = ref([]);

const globalFilterFields = [
  'date', 'username', 'age', 'sex', 'past_diagnosis',
  'gad_measurement', 'phq_measurement', 'ace_measurement', 'suicidal_measurement',
  'tobacco_measurement', 'alcoholic_measurement', 'cannabis_measurement', 'cocaine_measurement', 'amphetamine_measurement', 'inhalants_measurement', 'sedatives_measurement',
  'hallucinogens_measurement', 'opioids_measurement', 'other_measurement', 'injection_measurement'
];

const tableFields = [
  { key: 'date', header: 'Date' },
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

const selectedOption = ref('general Report');

const options = [
  'general Report',
  'school'
];

const isSchoolCounselor = computed(() => {
  return true; // For demonstration purposes
});

const fetchReportDataFromSessionStorage = () => {
  const storedReportData = sessionStorage.getItem('reportData');
  if (storedReportData) {
    try {
      const parsedData = JSON.parse(storedReportData);
      if (Array.isArray(parsedData)) {
        reportData.value = parsedData.map(transformData);
        filteredData.value = reportData.value;
      } else {
        handleFetchError();
      }
    } catch (error) {
      handleFetchError();
    }
  } else {
    console.log('No data found in sessionStorage under the key "reportData".');
    handleFetchError();
  }
};

const transformData = (item) => {
  const user = item.user.fields;
  const userAgency = item.user_agency.fields;
  const measurement = item.measurement.fields;
  const measurementAssist = item.measurement_assist.fields;
  const serviceAndTreatment = item.service_and_treatment;

  return {
    date: item.original_submission_date,
    username: `${user.first_name} ${user.middle_name} ${user.last_name}`.trim(),
    age: calculateAge(user.date_of_birth),
    sex: user.gender,
    present_dzongkhag: user.ps_add_dzongkhag,
    present_gewog: user.ps_add_gewog,
    present_village: user.ps_add_village,
    user_code: userAgency.user_code,
    parent_occupation: userAgency.parent_occupation,
    guardian_name: userAgency.guardian_name,
    guardian_occupation: userAgency.guardian_occupation,
    parent_status: userAgency.parent_status,
    current_living_with: userAgency.current_living_with,
    user_role_agency: userAgency.user_role_agency,
    user_class: userAgency.user_class,
    user_stream: userAgency.user_stream,
    user_sub_class: userAgency.user_sub_class,
    past_diagnosis: user.past_diagnosis,
    suicidal_measurement: measurement.suicidal_measurement,
    gad_measurement: measurement.gad_measurement,
    phq_measurement: measurement.phq_measurement,
    ace_measurement: measurement.ace_measurement,
    alcoholic_measurement: measurementAssist.alcoholic_measurement,
    tobacco_measurement: measurementAssist.tobacco_measurement,
    cannabis_measurement: measurementAssist.cannabis_measurement,
    cocaine_measurement: measurementAssist.cocaine_measurement,
    amphetamine_measurement: measurementAssist.amphetamine_measurement,
    inhalants_measurement: measurementAssist.inhalants_measurement,
    sedatives_measurement: measurementAssist.sedatives_measurement,
    hallucinogens_measurement: measurementAssist.hallucinogens_measurement,
    opioids_measurement: measurementAssist.opioids_measurement,
    injection_measurement: measurementAssist.injection_measurement,
    other_measurement: measurementAssist.other_measurement,
    other_name: measurementAssist.other_name,
    assessment_status: serviceAndTreatment.assessment_status,
    case_status: serviceAndTreatment.case_status,
    counseling: serviceAndTreatment.counseling,
    follow_up: serviceAndTreatment.follow_up,
    comments: serviceAndTreatment.comments,
    referral_status: serviceAndTreatment.referred,
    referral_remarks: ''  // This field is not present in the provided data structure
  };
};

const calculateAge = (birthDate) => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

const handleFetchError = () => {
  reportData.value = [];
  filteredData.value = [];
  console.error('Error fetching or parsing report data');
};

const convertToCSV = (data) => {
  const header = Object.keys(data[0]);
  const csv = [
    header.join(','),
    ...data.map(row => header.map(fieldName => JSON.stringify(row[fieldName] || '')).join(','))
  ].join('\n');
  return csv;
};

const bulkDownload = () => {
  const csvData = convertToCSV(filteredData.value);
  const zip = new JSZip();
  const zipFolder = zip.folder('reports');

  zipFolder.file('reports.csv', csvData);

  const userDetails = JSON.parse(localStorage.getItem('userDetailsStore'));
  const username = userDetails ? userDetails.user.username : 'defaultUser';
  const currentYear = new Date().getFullYear();
  const password = `${username}@${currentYear}#`;

  console.log(password);

  zip.generateAsync({ type: 'blob', compression: 'DEFLATE', password: 'password' })
    .then(function (blob) {
      saveAs(blob, 'reports.zip');
    })
    .catch(function (error) {
      console.error('Error generating ZIP file:', error);
    });
};

const filterData = () => {
  if (!globalFilter.value) {
    filteredData.value = [...reportData.value];
    return;
  }
  const filtered = reportData.value.filter(item => {
    return Object.values(item).some(val =>
      val && String(val).toLowerCase().includes(globalFilter.value.toLowerCase())
    );
  });
  filteredData.value = filtered;
};

const filteredPatients = computed(() => {
  let filtered = filteredData.value;

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
    const riskOrder = ['high risk', 'moderate risk', 'low risk', 'no risk'];
    const getRiskIndex = (risk) => riskOrder.indexOf((risk || '').toLowerCase());

    for (let column of riskColumns) {
      const aIndex = getRiskIndex(a[column]);
      const bIndex = getRiskIndex(b[column]);

      if (aIndex !== bIndex) {
        return aIndex - bIndex;
      }
    }

    return 0;
  });

  return filtered;
});

watch(globalFilter, filterData);

const severityClass = (value) => {
  if (!value) return 'info';

  switch (value.toString().toLowerCase()) {
    case 'severe':
    case 'high risk':
    case 'nearly everyday':
      return 'danger';
    case 'moderately-severe':
    case 'moderate risk':
    case 'moderate':
    case 'more than half the days':
      return 'warning';
    case 'minimal':
    case 'low risk':
    case 'several days':
    case 'no risk':
      return 'success';
    default:
      return 'info';
  }
};

onMounted(() => {
  fetchReportDataFromSessionStorage();
});
</script>

<style scoped>
.danger {
  background-color: #e6142d40;
  color: #e6142d40;
}
</style>