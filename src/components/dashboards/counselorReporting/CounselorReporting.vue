<template>
  <div class="card-container">
    <div class="card p-4">
      <!-- Search and Report Type Selection -->
      <div class="p-field p-grid row mb-4">
        <div class="col-12 col-md-4 mb-2 mb-md-0">
          <span class="p-input-icon-left w-100">
            <InputText v-model="globalFilter" placeholder="Search Reports..." class="w-100" />
          </span>
        </div>
        <!-- Dropdown for school counselors to select report type -->
        <div v-if="isSchoolCounselor" class="col-12 col-md-4 mb-2 mb-md-0">
          <Dropdown v-model="selectedOption" :options="options" optionLabel="label" optionValue="value"
            placeholder="Select Report Type" class="w-100" />
        </div>
        <div class="col-12 col-md-4">
          <Button label="Bulk Download All" @click="bulkDownload" class="btn hwss-btn w-100" icon="pi pi-download" />
        </div>
      </div>

      <!-- General Report Table (for school/clinical counselors) -->
      <div v-if="(selectedOption === 'generalReport' && isSchoolCounselor) || (selectedOption === 'generalReport' && isClinicalCounselor)" class="table-container">
        <DataTable :value="reportData" :paginator="true" :rows="10" :resizableColumns="true" sortField="username"
          :sortOrder="1" class="custom-table">

          <!-- Display user-related columns -->
          <Column v-for="field in tableFields" :key="field.key" :field="field.key" :header="field.header"
            :sortable="true" :style="field.width ? { width: field.width } : {}">
            <template #body="{ data }">
              <span>{{ data[field.key] || 'None' }}</span>
            </template>
          </Column>

          <!-- Display substances with separate columns and severityClass for tags -->
          <Column field="tobacco_flag" header="Tobacco" :sortable="true">
            <template #body="{ data }">
              <Tag class="w-100" :value="data.tobacco_flag || 'None'" :severity="severityClass(data.tobacco_flag)" />
            </template>
          </Column>
          <Column field="alcohol_flag" header="Alcohol" :sortable="true">
            <template #body="{ data }">
              <Tag class="w-100" :value="data.alcohol_flag || 'None'" :severity="severityClass(data.alcohol_flag)" />
            </template>
          </Column>
          <Column field="cannabis_flag" header="Cannabis" :sortable="true">
            <template #body="{ data }">
              <Tag class="w-100" :value="data.cannabis_flag || 'None'" :severity="severityClass(data.cannabis_flag)" />
            </template>
          </Column>
          <Column field="cocaine_flag" header="Cocaine" :sortable="true">
            <template #body="{ data }">
              <Tag class="w-100" :value="data.cocaine_flag || 'None'" :severity="severityClass(data.cocaine_flag)" />
            </template>
          </Column>
          <Column field="amphetamine_flag" header="Amphetamines" :sortable="true">
            <template #body="{ data }">
              <Tag class="w-100" :value="data.amphetamine_flag || 'None'"
                :severity="severityClass(data.amphetamine_flag)" />
            </template>
          </Column>
          <Column field="inhalants_flag" header="Inhalants" :sortable="true">
            <template #body="{ data }">
              <Tag class="w-100" :value="data.inhalants_flag || 'None'"
                :severity="severityClass(data.inhalants_flag)" />
            </template>
          </Column>
          <Column field="sedatives_flag" header="Sedatives" :sortable="true">
            <template #body="{ data }">
              <Tag class="w-100" :value="data.sedatives_flag || 'None'"
                :severity="severityClass(data.sedatives_flag)" />
            </template>
          </Column>
          <Column field="hallucinogens_flag" header="Hallucinogens" :sortable="true">
            <template #body="{ data }">
              <Tag class="w-100" :value="data.hallucinogens_flag || 'None'"
                :severity="severityClass(data.hallucinogens_flag)" />
            </template>
          </Column>
          <Column field="opioids_flag" header="Opioids" :sortable="true">
            <template #body="{ data }">
              <Tag class="w-100" :value="data.opioids_flag || 'None'" :severity="severityClass(data.opioids_flag)" />
            </template>
          </Column>

          <Column v-for="field in tableServiceFields" :key="field.key" :field="field.key" :header="field.header"
            :sortable="true" :style="field.width ? { width: field.width } : {}">
            <template #body="{ data }">
              <span>{{ data[field.key] || 'None' }}</span>
            </template>
          </Column>

        </DataTable>

        <!-- Display message if no reports found -->
        <div v-if="isSchoolCounselor && reportData.length === 0">
          <p>No reports found for your agency.</p>
        </div>
      </div>

      <!-- School Environment Report Table -->
      <div v-if="selectedOption === 'school' && isSchoolCounselor" class="table-container">
        <SchoolEnvironmentTable />
      </div>


      <!-- Gyalsung Report Table (for gyalsung counselors) -->
      <div v-if="isGyalsungCounselor" class="table-container">
        <DataTable :value="gyalsungData" :paginator="true" :rows="10" :resizableColumns="true" sortField="username"
          :sortOrder="1" class="custom-table">

          <!-- Display user-related columns for Gyalsung reports -->
          <Column v-for="field in gyalsungTableFields" :key="field.key" :field="field.key" :header="field.header"
            :sortable="true" :style="field.width ? { width: field.width } : {}">
            <template #body="{ data }">
              <span>{{ data[field.key] || 'None' }}</span>
            </template>
          </Column>

          <!-- Substances Columns for Gyalsung reports with severityClass for tags -->
          <Column field="tobacco_flag" header="Tobacco" :sortable="true">
            <template #body="{ data }">
              <Tag class="w-100" :value="data.tobacco_flag || 'None'" :severity="severityClass(data.tobacco_flag)" />
            </template>
          </Column>
          <Column field="alcohol_flag" header="Alcohol" :sortable="true">
            <template #body="{ data }">
              <Tag class="w-100" :value="data.alcohol_flag || 'None'" :severity="severityClass(data.alcohol_flag)" />
            </template>
          </Column>
          <Column field="cannabis_flag" header="Cannabis" :sortable="true">
            <template #body="{ data }">
              <Tag class="w-100" :value="data.cannabis_flag || 'None'" :severity="severityClass(data.cannabis_flag)" />
            </template>
          </Column>
          <Column field="cocaine_flag" header="Cocaine" :sortable="true">
            <template #body="{ data }">
              <Tag class="w-100" :value="data.cocaine_flag || 'None'" :severity="severityClass(data.cocaine_flag)" />
            </template>
          </Column>
          <Column field="amphetamine_flag" header="Amphetamines" :sortable="true">
            <template #body="{ data }">
              <Tag class="w-100" :value="data.amphetamine_flag || 'None'"
                :severity="severityClass(data.amphetamine_flag)" />
            </template>
          </Column>
          <Column field="inhalants_flag" header="Inhalants" :sortable="true">
            <template #body="{ data }">
              <Tag class="w-100" :value="data.inhalants_flag || 'None'"
                :severity="severityClass(data.inhalants_flag)" />
            </template>
          </Column>
          <Column field="sedatives_flag" header="Sedatives" :sortable="true">
            <template #body="{ data }">
              <Tag class="w-100" :value="data.sedatives_flag || 'None'"
                :severity="severityClass(data.sedatives_flag)" />
            </template>
          </Column>
          <Column field="hallucinogens_flag" header="Hallucinogens" :sortable="true">
            <template #body="{ data }">
              <Tag class="w-100" :value="data.hallucinogens_flag || 'None'"
                :severity="severityClass(data.hallucinogens_flag)" />
            </template>
          </Column>
          <Column field="opioids_flag" header="Opioids" :sortable="true">
            <template #body="{ data }">
              <Tag class="w-100" :value="data.opioids_flag || 'None'" :severity="severityClass(data.opioids_flag)" />
            </template>
          </Column>

        </DataTable>

        <!-- Display message if no reports found -->
        <div v-if="gyalsungData.length === 0">
          <p>No reports found for gyalsung counselors.</p>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import endpoints from '@/api';
import { BlobWriter, BlobReader, ZipWriter } from "@zip.js/zip.js";
import SchoolEnvironmentTable from './SchoolEnvironmentTable.vue';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import 'jspdf-autotable';

// Data refs
const reportData = ref([]);
const gyalsungData = ref([]);
const globalFilter = ref('');
const isClinicalCounselor = ref(false);
const isGyalsungCounselor = ref(false);
const isSchoolCounselor = ref(false);
const selectedOption = ref('generalReport');
const options = [
  { label: 'General Report', value: 'generalReport' },
  { label: 'School', value: 'school' }
];

const tableFields = [
  { key: 'username', header: 'Username' },
  { key: 'full_name', header: 'Full Name' },
  { key: 'gender', header: 'Gender' },
  { key: 'dob', header: 'Date of Birth' },
  { key: 'identity_number', header: 'Identity Number' },
  { key: 'mobile_number', header: 'Mobile Number' },
  { key: 'ps_add_village', header: 'Present Village' },
  { key: 'phq9_score', header: 'PHQ-9 Score', taggable: true },
  { key: 'gad7_score', header: 'GAD-7 Score', taggable: true },
  { key: 'suicidal_score', header: 'Suicidal Score', taggable: true },
  { key: 'ace_score', header: 'ACE Score', taggable: true }
];

const tableServiceFields = [
  { key: 'assessment_status', header: 'Assessment Status' },
  { key: 'case_status', header: 'Case Status' },
  { key: 'counseling', header: 'Counseling Status' },
  { key: 'follow_up', header: 'Follow Up Status' },
  { key: 'referred', header: 'Referral Status' },
];

const gyalsungTableFields = [
  { key: 'username', header: 'Username' },
  { key: 'full_name', header: 'Full Name' },
  { key: 'gender', header: 'Gender' },
  { key: 'dob', header: 'Date of Birth' },
  { key: 'identity_number', header: 'Identity Number' },
  { key: 'mobile_number', header: 'Mobile Number' },
  { key: 'academy_code', header: 'Academy Code' },
  { key: 'phq9_score', header: 'PHQ-9 Score', taggable: true },
  { key: 'gad7_score', header: 'GAD-7 Score', taggable: true },
  { key: 'suicidal_score', header: 'Suicidal Score', taggable: true }
];

// Fetch report data from API
const fetchReportDataFromAPI = async () => {
  try {
    const response = await axios.get(endpoints.newServiceAndTreatment);
    const dataArray = response.data || [];
    
    // Extract agencyName from localStorage
    const userAgencyName = getUserDetailsFromStorage();

    if (isGyalsungCounselor.value) {
      // Filter gyalsungData by agencyName
      gyalsungData.value = dataArray
        .filter(item => item.screening_data && item.user?.active_agency?.agency_name === userAgencyName)
        .map(transformGyalsungData);
    } else {
      // Filter reportData by agencyName
      reportData.value = dataArray
        .filter(item => item.user && item.user?.active_agency?.agency_name === userAgencyName)
        .map(transformData);
    }
  } catch (error) {
    console.error('Error fetching report data:', error);
  }
};


// Transform the main dataset to match the table structure
const transformData = (item) => {
  const screeningData = item.screening_data || {};
  const substances = extractSubstances(screeningData.assist_data || []);

  return {
    username: item.user?.username || 'None',
    full_name: `${item.user?.first_name || ''} ${item.user?.middle_name || ''} ${item.user?.last_name || ''}`.trim() || 'None',
    gender: item.user?.gender || 'None',
    dob: item.user?.date_of_birth || 'None',
    identity_number: item.user?.identity_number || 'None',
    mobile_number: item.user?.mob_number || 'None',
    ps_add_village: item.user?.ps_add_village || 'None',
    academy_code: item.user?.academy_code || 'None',
    phq9_score: screeningData.phq_interpretation || 'None',
    gad7_score: screeningData.gad_interpretation || 'None',
    suicidal_score: screeningData.suicidal_score || 'None',
    ace_score: screeningData.ace_interpretation || 'None',
    assessment_status: item.assessment_status || 'None',
    case_status: item.case_status || 'None',
    counseling: item.counseling || 'None',
    follow_up: item.follow_up || 'None',
    referred: item.referred || 'None',
    ...substances
  };
};

// Transform the Gyalsung dataset
const transformGyalsungData = (item) => {
  const screeningData = item.screening_data || {};
  return {
    username: screeningData.username || 'None',
    full_name: screeningData.full_name || 'None',
    gender: screeningData.gender || 'None',
    dob: screeningData.dob || 'None',
    identity_number: screeningData.identity_number || 'None',
    mobile_number: screeningData.mobile_number || 'None',
    academy_code: screeningData.academy_code || 'None',
    phq9_score: screeningData.phq9_score || 'None',
    gad7_score: screeningData.gad7_score || 'None',
    suicidal_score: screeningData.suicidal_score || 'None'
  };
};

const extractSubstances = (assistData) => {
  const substanceMapping = {
    "Tobacco products (cigarettes, chewing tobacco etc)": "tobacco_flag",
    "Alcoholic beverages (beer, wine, spirits, ara etc.)": "alcohol_flag",
    "Cannabis (marijuana, pot, grass, hash, black etc.)": "cannabis_flag",
    "Cocaine": "cocaine_flag",
    "Amphetamine-type stimulants (meth, ecstasy, yebe, diet pills etc.)": "amphetamine_flag",
    "Inhalants (dendrite, glue, petrol, paint thinner, etc.)": "inhalants_flag",
    "Sedatives or Sleeping Pills (N-10, diazepam etc.)": "sedatives_flag",
    "Hallucinogens (LSD, trips, Ketamine, etc.)": "hallucinogens_flag",
    "Opioids (heroin, morphine, fentanyl, codeine, SP+, tramadol, BS etc.)": "opioids_flag"
  };

  const result = {};

  assistData.forEach(substance => {
    const key = substanceMapping[substance.substance__name];
    if (key) {
      result[key] = substance.risk_flag || 'None';
    }
  });

  return result;
};

// Bulk download function
const bulkDownload = async () => {
  try {
    const blobWriter = new BlobWriter("application/zip");
    const zipWriter = new ZipWriter(blobWriter, {
      password: getPassword(),
      encryptionStrength: 3
    });

    const pdfBlob = await generatePDF();
    const excelBlob = await generateExcel();
    await zipWriter.add("reports.pdf", new BlobReader(pdfBlob));
    await zipWriter.add("reports.xlsx", new BlobReader(excelBlob));
    await zipWriter.close();

    const zipBlob = await blobWriter.getData();
    const fileName = `hwss_report_${new Date().toISOString().slice(0, 10)}.zip`;

    saveAs(zipBlob, fileName);
  } catch (error) {
    console.error("Error in bulkDownload:", error);
  }
};

// Function to generate PDF
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

// Function to generate Excel
const generateExcel = async () => {
  const ws = XLSX.utils.json_to_sheet(reportData.value);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Reports");

  const excelArrayBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  return new Blob([excelArrayBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
};

// Function to generate password dynamically for zip
const getPassword = () => {
  const { username } = JSON.parse(localStorage.getItem('userDetailsStore'))?.user || { username: 'defaultUser' };
  return `${username}@${new Date().getFullYear()}#`;
};

// Determine user role and fetch data accordingly
const getUserDetailsFromStorage = () => {
  const userDetailsString = localStorage.getItem('userDetailsStore');
  if (userDetailsString) {
    const { user: { role }, agency: { agencyName } } = JSON.parse(userDetailsString);

    if (role === 'gyalsung_counselor') {
      isGyalsungCounselor.value = true;
    } else if (role === 'school_counselor') {
      isSchoolCounselor.value = true;
    } else if (role === 'clinical_counselor') {
      isClinicalCounselor.value = true;
    }

    return agencyName; // Return the extracted agency name
  }
  return null;
};


// Severity class function to add styles to tags
const severityClass = (value) => {
  switch (value) {
    case 'severe':
      return 'danger'; // Red pill for severe cases
    case 'moderate':
      return 'warning'; // Yellow pill for moderate cases
    case 'mild':
      return 'success'; // Green pill for mild cases
    case 'none':
    default:
      return 'info'; // Default blue pill
  }
};

// On component mount, fetch data and user details
onMounted(() => {
  getUserDetailsFromStorage();
  fetchReportDataFromAPI();
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