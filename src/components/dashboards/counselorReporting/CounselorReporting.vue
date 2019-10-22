<template>
  <div class="card-container">
    <div class="card p-4">
      <div class="p-field p-grid row mb-4">
        <div class="col-12 col-md-4 mb-2 mb-md-0">
          <span class="p-input-icon-left w-100">
            <InputText v-model="globalFilter" placeholder="Search Reports..." class="w-100" />
          </span>
        </div>
        <div v-if="isSchoolCounselor" class="col-12 col-md-4 mb-2 mb-md-0">
          <Dropdown v-model="selectedOption" :options="options" placeholder="Select Report Type" class="w-100" />
        </div>
        <div class="col-12 col-md-4">
          <Button label="Bulk Download All" @click="bulkDownload" class="btn hwss-btn w-100" icon="pi pi-download" />
        </div>
      </div>

      <!-- General Report Table -->
      <div v-if="selectedOption === 'general Report' || !isSchoolCounselor" class="table-container">
        <DataTable :value="reportData" :paginator="true" :rows="10" :resizableColumns="true"
          sortField="suicidal_measurement" :sortOrder="-1" class="custom-table">
          <Column v-for="field in tableFields" :key="field.key" :field="field.key" :header="field.header"
            :sortable="true" :style="field.width ? { width: field.width } : {}">
            <template #body="{ data }">
              <Tag class="w-100" v-if="field.taggable" :value="data[field.key]"
                :severity="severityClass(data[field.key])" />
              <span v-else>{{ data[field.key] }}</span>
            </template>
          </Column>
        </DataTable>
        <div v-if="isSchoolCounselor && reportData.length === 0">
          <p>No reports found for your agency.</p>
        </div>
      </div>

      <!-- School Environment Report Table -->
      <div v-else-if="selectedOption === 'school' && isSchoolCounselor" class="table-container">
        <SchoolEnvironmentTable />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import endpoints from '@/api';
import SchoolEnvironmentTable from './SchoolEnvironmentTable.vue';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import { BlobWriter, BlobReader, ZipWriter } from "@zip.js/zip.js";
import 'jspdf-autotable'; 

// Data refs
const reportData = ref([]);
const globalFilter = ref('');
const isClinicalCounselor = ref(false);
const isGyalsungCounselor = ref(false);
const isSchoolCounselor = ref(false);

// Option selectors
const selectedOption = ref('general Report');
const options = ['general Report', 'school'];

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

// Fetch user details from localStorage
const getUserDetailsFromStorage = () => {
  const userDetailsString = localStorage.getItem('userDetailsStore');

  if (userDetailsString) {
    const userDetails = JSON.parse(userDetailsString);
    const {
      user: { role = 'Unknown Role' } = {},
      agency: { agencyName = 'Unknown Agency', presentDzongkhag = '' } = {}
    } = userDetails;

    const roleFlags = {
      school_counselor: () => (isSchoolCounselor.value = true),
      clinical_counselor: () => (isClinicalCounselor.value = true),
      gyalsung_counselor: () => (isGyalsungCounselor.value = true),
    };

    if (roleFlags[role]) {
      roleFlags[role]();
    }

    return { userRole: role, agencyName, userDzongkhag: presentDzongkhag };
  }

  return { userRole: 'Unknown Role', agencyName: 'Unknown Agency', userDzongkhag: '' };
};

// Step 3: ZIP the files and add password protection
const bulkDownload = async () => {
  try {
    const blobWriter = new BlobWriter("application/zip");
    const zipWriter = new ZipWriter(blobWriter, {
      password: getPassword(),
      encryptionStrength: 3 
    });

    // Generate PDF
    const pdfBlob = await generatePDF();
    if (!(pdfBlob instanceof Blob)) {
      throw new Error("PDF generation failed");
    }

    // Generate Excel
    const excelBlob = await generateExcel();
    if (!(excelBlob instanceof Blob)) {
      throw new Error("Excel generation failed");
    }

    // Add PDF to zip
    await zipWriter.add("reports.pdf", new BlobReader(pdfBlob));

    // Add Excel to zip
    await zipWriter.add("reports.xlsx", new BlobReader(excelBlob));

    await zipWriter.close();
    const zipBlob = await blobWriter.getData();

    const currentDate = new Date().toISOString().slice(0, 10);
    const fileName = `${currentDate}_hwss_report.zip`;
    saveAs(zipBlob, fileName);
  } catch (error) {
    console.error("Error in bulkDownload:", error);
    // Handle the error appropriately (e.g., show an error message to the user)
  }
};

// Ensure these functions return Promises
const generatePDF = async () => {
  const doc = new jsPDF();
  doc.text("Report Data", 10, 10);
  const headers = Object.keys(reportData.value[0] || {}).map(key => key.toUpperCase());
  const rows = reportData.value.map(item => headers.map(header => item[header.toLowerCase()]));
  doc.autoTable({
    head: [headers],
    body: rows,
  });
  return new Promise((resolve) => {
    resolve(doc.output('blob'));
  });
};

const generateExcel = async () => {
  const ws = XLSX.utils.json_to_sheet(reportData.value);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Reports");

  // Generate Excel file as Blob
  const excelArrayBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  return new Blob([excelArrayBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
};


// Function to generate password dynamically
const getPassword = () => {
  const { username } = JSON.parse(localStorage.getItem('userDetailsStore'))?.user || { username: 'defaultUser' };
  return `${username}@${new Date().getFullYear()}#`;
};

// Fetch report data from the API and filter based on agency
const fetchReportDataFromAPI = async () => {
  try {
    const { agencyName, userDzongkhag } = getUserDetailsFromStorage();
    const response = await axios.get(endpoints.getReport);
    const dataArray = response.data.reporting_model_data || [];
    const gyalsungDataArray = response.data.gyalsung_user_profiles || [];

    if (isSchoolCounselor.value) {
      reportData.value = dataArray
        .filter(item => item.agency_name === agencyName)
        .map(transformData);
    } else if (isClinicalCounselor.value) {
      reportData.value = dataArray
        .filter(item => item.user?.fields.ps_add_dzongkhag === userDzongkhag)
        .map(transformData);
    } else if (isGyalsungCounselor.value) {
      reportData.value = gyalsungDataArray.map(transformGyalsungData); 
    } else {
      reportData.value = dataArray.map(transformData);
    }
  } catch (error) {
    console.error('Error fetching report data:', error);
    reportData.value = [];
  }
};

// Transform Gyalsung Data to match the table structure
const transformGyalsungData = (item) => {
  return {
    username: item.username,
    full_name: item.full_name,
    gender: item.gender,
    dob: formatDate(item.dob),
    identity_number: item.identity_number,
    mobile_number: item.mobile_number,
    dzongkhag: item.ps_add_dzongkhag,
    academy_code: item.academy_code,
    batch_number: item.batch_number,
    prev_school: item.prev_school,
    phq9_score: item.phq9_score,
    suicidal_score: item.suicidal_score,
    gad7_score: item.gad7_score,
    tobacco_score: item.tobacco_score,
    alcohol_score: item.alcohol_score,
    cannabis_score: item.cannabis_score,
    cocaine_score: item.cocaine_score,
    amphetamine_score: item.amphetamine_score,
    inhalants_score: item.inhalants_score,
    sedatives_score: item.sedatives_score,
    hallucinogens_score: item.hallucinogens_score,
    opioids_score: item.opioids_score,
    injection_use_score: item.injection_use_score,
    other_score: item.other_score,
    other_name: item.other_name,
  };
};

// Transform the API data for table display
const transformData = (item) => {
  const userFields = item.user?.fields || {};
  const userAgencyFields = item.user_agency?.fields || {};
  const measurementFields = item.measurement?.fields || {};
  const measurementAssistFields = item.measurement_assist?.fields || {};
  const serviceAndTreatment = item.service_and_treatment || {};

  return {
    date: formatDate(item.original_submission_date),
    username: `${userFields.first_name || ''} ${userFields.middle_name || ''} ${userFields.last_name || ''}`.trim(),
    age: calculateAge(userFields.date_of_birth),
    sex: userFields.gender || '',
    present_dzongkhag: userFields.ps_add_dzongkhag || '',
    present_gewog: userFields.ps_add_gewog || '',
    present_village: userFields.ps_add_village || '',
    user_code: userAgencyFields.user_code || '',
    parent_occupation: userAgencyFields.parent_occupation || '',
    guardian_name: userAgencyFields.guardian_name || '',
    guardian_occupation: userAgencyFields.guardian_occupation || '',
    parent_status: userAgencyFields.parent_status || '',
    current_living_with: userAgencyFields.current_living_with || '',
    user_role_agency: userAgencyFields.user_role_agency || '',
    user_class: userAgencyFields.user_class || '',
    user_stream: userAgencyFields.user_stream || '',
    user_sub_class: userAgencyFields.user_sub_class || '',
    suicidal_measurement: measurementFields.suicidal_measurement || '',
    gad_measurement: measurementFields.gad_measurement || '',
    phq_measurement: measurementFields.phq_measurement || '',
    ace_measurement: measurementFields.ace_measurement || '',
    alcoholic_measurement: measurementAssistFields.alcoholic_measurement || '',
    tobacco_measurement: measurementAssistFields.tobacco_measurement || '',
    cannabis_measurement: measurementAssistFields.cannabis_measurement || '',
    cocaine_measurement: measurementAssistFields.cocaine_measurement || '',
    amphetamine_measurement: measurementAssistFields.amphetamine_measurement || '',
    inhalants_measurement: measurementAssistFields.inhalants_measurement || '',
    sedatives_measurement: measurementAssistFields.sedatives_measurement || '',
    hallucinogens_measurement: measurementAssistFields.hallucinogens_measurement || '',
    opioids_measurement: measurementAssistFields.opioids_measurement || '',
    injection_measurement: measurementAssistFields.injection_measurement || '',
    other_measurement: measurementAssistFields.other_measurement || '',
    assessment_status: serviceAndTreatment.assessment_status || '',
    case_status: serviceAndTreatment.case_status || '',
    counseling: serviceAndTreatment.counseling || '',
    follow_up: serviceAndTreatment.follow_up || '',
    comments: serviceAndTreatment.comments || '',
    referral_status: serviceAndTreatment.referred || '',
    referral_remarks: serviceAndTreatment.referral_remarks || '',
  };
};

// Helper to format date to 'yyyy-mm-dd'
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? '' : date.toLocaleDateString('en-CA');
};

// Helper to calculate age from birth date
const calculateAge = (birthDate) => {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

// Define the severityClass function to return a CSS class based on the field value
const severityClass = (value) => {
  if (typeof value !== 'number') {
    // Handle non-numeric values
    const lowerValue = value.toLowerCase();
    if (lowerValue.includes('severe') || lowerValue.includes('high')) return 'danger';
    if (lowerValue.includes('more than half the days') || lowerValue.includes('moderate')) return 'warning';
    if (lowerValue.includes('minimal')) return 'success';
    return 'info'; // Default for unrecognized text
  }

  // Handle numeric values (if ranges for risk are based on numbers)
  if (value >= 7) {
    return 'danger'; // High risk or severe
  } else if (value >= 4) {
    return 'warning'; // Moderate risk
  } else if (value >= 1) {
    return 'success'; // Low risk
  } else {
    return 'info'; // No risk
  }
};

// On component mount, fetch data and user details
onMounted(() => {
  fetchReportDataFromAPI();
  getUserDetailsFromStorage();
});
</script>

<style scoped>
.card-container {
  background: linear-gradient(135deg, #2B656F 0%, #1D4851 100%);
  padding: 2rem;
  border-radius: 10px;
}

.card {
  background: linear-gradient(135deg, #e6f3f5, #f0f7f8);
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.table-container {
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  overflow: hidden;
}

.custom-table {
  font-family: 'Arial', sans-serif;
}

.custom-table th {
  background-color: #2B656F;
  color: white;
  font-weight: bold;
}

.custom-table tr:nth-child(even) {
  background-color: rgba(43, 101, 111, 0.05);
}

.custom-table tr:hover {
  background-color: rgba(43, 101, 111, 0.1);
}

.hwss-btn {
  background: linear-gradient(135deg, #2B656F 0%, #1D4851 100%);
  border: none;
  color: white;
  transition: all 0.3s ease;
}

.hwss-btn:hover {
  background: linear-gradient(135deg, #1D4851 0%, #2B656F 100%);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.p-inputtext,
.p-dropdown {
  border: 1px solid #2B656F;
  border-radius: 4px;
}

.p-inputtext:focus,
.p-dropdown:focus {
  border-color: #1D4851;
  box-shadow: 0 0 0 2px rgba(43, 101, 111, 0.2);
}

.danger {
  background-color: rgba(230, 20, 45, 0.2);
  color: #e6142d;
}

.warning {
  background-color: rgba(255, 193, 7, 0.2);
  color: #ffc107;
}

.success {
  background-color: rgba(40, 167, 69, 0.2);
  color: #28a745;
}

.info {
  background-color: rgba(23, 162, 184, 0.2);
  color: #17a2b8;
}
</style>