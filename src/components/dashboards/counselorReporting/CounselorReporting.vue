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
          <Button label="Download Excel" @click="downloadExcelWithZip" class="btn hwss-btn w-100" icon="pi pi-download" />
        </div>
      </div>

      <!-- General Report Table (for school/clinical counselors) -->
      <div v-if="(selectedOption === 'generalReport' && isSchoolCounselor) ||
        (selectedOption === 'generalReport' && isClinicalCounselor)
        " class="table-container">
        <DataTable :value="filteredReportData" :paginator="true" :rows="10" :resizableColumns="true" sortField="username"
          :sortOrder="1" class="custom-table">
          <!-- Display user-related columns -->
          <Column v-for="field in tableFields" :key="field.key" :field="field.key" :header="field.header" :sortable="true"
            :style="field.width ? { width: field.width } : {}">
            <template #body="{ data }">
              <template v-if="field.key === 'suicidal_score'">
                <Tag class="w-100" :value="data[field.key]" :severity="getSuicideSeverityClass(data[field.key])" />
              </template>
              <template v-else>
                <span>{{ data[field.key] || 'None' }}</span>
              </template>
            </template>
          </Column>

          <!-- Display substances with separate columns and severityClass for tags -->
          <Column field="tobacco_flag" header="Tobacco" :sortable="true">
            <template #body="{ data }">
              <Tag class="w-100" :value="severityText(data.tobacco_flag || 'None')"
                :severity="severityClass(data.tobacco_flag)" />
            </template>
          </Column>
          <Column field="alcohol_flag" header="Alcohol" :sortable="true">
            <template #body="{ data }">
              <Tag class="w-100" :value="severityText(data.alcohol_flag || 'None')"
                :severity="severityClass(data.alcohol_flag)" />
            </template>
          </Column>
          <Column field="cannabis_flag" header="Cannabis" :sortable="true">
            <template #body="{ data }">
              <Tag class="w-100" :value="severityText(data.cannabis_flag || 'None')"
                :severity="severityClass(data.cannabis_flag)" />
            </template>
          </Column>
          <Column field="cocaine_flag" header="Cocaine" :sortable="true">
            <template #body="{ data }">
              <Tag class="w-100" :value="severityText(data.cocaine_flag || 'None')"
                :severity="severityClass(data.cocaine_flag)" />
            </template>
          </Column>
          <Column field="amphetamine_flag" header="Amphetamines" :sortable="true">
            <template #body="{ data }">
              <Tag class="w-100" :value="severityText(data.amphetamine_flag || 'None')"
                :severity="severityClass(data.amphetamine_flag)" />
            </template>
          </Column>
          <Column field="inhalants_flag" header="Inhalants" :sortable="true">
            <template #body="{ data }">
              <Tag class="w-100" :value="severityText(data.inhalants_flag || 'None')"
                :severity="severityClass(data.inhalants_flag)" />
            </template>
          </Column>
          <Column field="sedatives_flag" header="Sedatives" :sortable="true">
            <template #body="{ data }">
              <Tag class="w-100" :value="severityText(data.sedatives_flag || 'None')"
                :severity="severityClass(data.sedatives_flag)" />
            </template>
          </Column>
          <Column field="hallucinogens_flag" header="Hallucinogens" :sortable="true">
            <template #body="{ data }">
              <Tag class="w-100" :value="severityText(data.hallucinogens_flag || 'None')"
                :severity="severityClass(data.hallucinogens_flag)" />
            </template>
          </Column>
          <Column field="opioids_flag" header="Opioids" :sortable="true">
            <template #body="{ data }">
              <Tag class="w-100" :value="severityText(data.opioids_flag || 'None')"
                :severity="severityClass(data.opioids_flag)" />
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
        <DataTable :value="filteredGyalsungData" :paginator="true" :rows="10" :resizableColumns="true"
          sortField="username" :sortOrder="1" class="custom-table">
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
              <Tag class="w-100" :value="data.inhalants_flag || 'None'" :severity="severityClass(data.inhalants_flag)" />
            </template>
          </Column>
          <Column field="sedatives_flag" header="Sedatives" :sortable="true">
            <template #body="{ data }">
              <Tag class="w-100" :value="data.sedatives_flag || 'None'" :severity="severityClass(data.sedatives_flag)" />
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
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import endpoints from '@/api';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import SchoolEnvironmentTable from './SchoolEnvironmentTable.vue';
import { BlobWriter, BlobReader, ZipWriter } from "@zip.js/zip.js";

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
  { label: 'School', value: 'school' },
];

const tableFields = [
  { key: 'full_name', header: 'Full Name' },
  { key: 'gender', header: 'Gender' },
  { key: 'dob', header: 'Date of Birth' },
  { key: 'identity_number', header: 'Identity Number' },
  { key: 'mobile_number', header: 'Mobile Number' },
  { key: 'ps_add_village', header: 'Present Village' },
  { key: 'phq9_score', header: 'PHQ-9 Score', taggable: true },
  { key: 'gad7_score', header: 'GAD-7 Score', taggable: true },
  { key: 'suicidal_score', header: 'Suicidal Score', taggable: true, style: { maxWidth: '150px' } },
  { key: 'ace_score', header: 'ACE Score', taggable: true },
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
  { key: 'suicidal_score', header: 'Suicidal Score', taggable: true },
];

// Transform the main dataset to match the table structure
const transformData = (item) => {
  const screeningData = item.screening_data || {};
  const substances = extractSubstances(item);

  // Extract suicidal score
  let suicidalData = null;
  if (screeningData.phq_data) {
    suicidalData = extractSuicidalScore(screeningData.phq_data);
  }

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
    suicidal_score: suicidalData ? `${suicidalData.severity} (${suicidalData.score})` : 'None',
    ace_score: screeningData.ace_interpretation || 'None',
    assessment_status: item.assessment_status || 'None',
    case_status: item.case_status || 'None',
    counseling: item.counseling || 'None',
    follow_up: item.follow_up || 'None',
    referred: item.referred || 'None',
    ...substances,
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
    suicidal_score: screeningData.suicidal_score || 'None',
  };
};

const extractSubstances = (item) => {
  const substanceMapping = {
    'Tobacco products (cigarettes, chewing tobacco etc)': 'tobacco_flag',
    'Alcoholic beverages (beer, wine, spirits, ara etc.)': 'alcohol_flag',
    'Cannabis (marijuana, pot, grass, hash, black etc.)': 'cannabis_flag',
    'Cocaine': 'cocaine_flag',
    'Amphetamine-type stimulants (meth, ecstasy, diet pills etc.)': 'amphetamine_flag',
    'Inhalants (dendrite, glue, petrol, paint thinner, etc.)': 'inhalants_flag',
    'Sedatives or Sleeping Pills (N-10, diazepam etc.)': 'sedatives_flag',
    'Hallucinogens (LSD, trips, Ketamine, etc.)': 'hallucinogens_flag',
    'Opioids (heroin, morphine, fentanyl, codeine, SP+, tramadol, BS etc)': 'opioids_flag',
  };

  const result = {};

  // Helper function to process substance array
  const processSubstanceArray = (substances) => {
    if (!Array.isArray(substances)) return;

    substances.forEach((substance) => {
      const mappedKey = substanceMapping[substance.substance_name];
      if (mappedKey) {
        result[mappedKey] = mapSeverity(substance.risk_flag);
      }
    });
  };

  // Process case_substance_risks if available
  if (item.case_substance_risks) {
    processSubstanceArray(item.case_substance_risks);
  }

  // Process event_substance_risks if available
  if (item.event_substance_risks) {
    processSubstanceArray(item.event_substance_risks);
  }

  // Process assist_data if available through screening_data
  if (item.screening_data?.assist_data) {
    processSubstanceArray(item.screening_data.assist_data);
  }

  return result;
};

// Helper function to map severity from risk flag
const mapSeverity = (riskFlag) => {
  if (!riskFlag) return 'grey';

  const riskLevel = riskFlag.toLowerCase();
  if (riskLevel.includes('severe')) return 'red';
  if (riskLevel.includes('moderate')) return 'yellow';
  if (riskLevel.includes('mild')) return 'blue';
  if (riskLevel.includes('none')) return 'green';
  return 'grey';
};

//sucidal score
const extractSuicidalScore = (phqData) => {
  try {
    // Handle string PHQ data
    if (typeof phqData === 'string') {
      try {
        phqData = JSON.parse(phqData);
      } catch (e) {
        return null;
      }
    }

    // Handle different PHQ data formats
    let responses = null;
    if (phqData.responses) {
      responses = phqData.responses;
    } else if (Array.isArray(phqData)) {
      responses = phqData;
    }

    if (responses) {
      const suicideQuestion = responses.find((item) =>
        item.question?.toLowerCase().includes('thoughts that you would be better off dead') ||
        item.question?.toLowerCase().includes('hurting yourself'),
      );

      if (suicideQuestion) {
        const score = suicideQuestion.score;
        const severity = getSuicideSeverity(score);
        return { score, severity };
      }
    }
    return null;
  } catch (error) {
    console.error('Error extracting suicidal score:', error);
    return null;
  }
};

// Helper function to determine suicide risk severity
const getSuicideSeverity = (score) => {
  if (score === 0) return 'None';
  if (score === 1) return 'Mild';
  if (score === 2) return 'Moderate';
  if (score === 3) return 'Severe';
  return 'None';
};

const getSuicideSeverityClass = (value) => {
  if (!value || value === 'None') return 'secondary';
  if (value.includes('Mild')) return 'info';
  if (value.includes('Moderate')) return 'warning';
  if (value.includes('Severe')) return 'danger';
  return 'success';
};


// Function to generate Excel
const generateExcel = async () => {
  let excelData;

  if (selectedOption.value === 'generalReport' && (isSchoolCounselor.value || isClinicalCounselor.value)) {
    excelData = filteredReportData.value.map(item => {
      return {
        'Full Name': item.full_name,
        'Gender': item.gender,
        'Date of Birth': item.dob,
        'Identity Number': item.identity_number,
        'Mobile Number': item.mobile_number,
        'Present Village': item.ps_add_village,
        'PHQ-9 Score': item.phq9_score,
        'GAD-7 Score': item.gad7_score,
        'Suicidal Score': item.suicidal_score,
        'ACE Score': item.ace_score,
        'Tobacco': severityText(item.tobacco_flag || 'None'),
        'Alcohol': severityText(item.alcohol_flag || 'None'),
        'Cannabis': severityText(item.cannabis_flag || 'None'),
        'Cocaine': severityText(item.cocaine_flag || 'None'),
        'Amphetamines': severityText(item.amphetamine_flag || 'None'),
        'Inhalants': severityText(item.inhalants_flag || 'None'),
        'Sedatives': severityText(item.sedatives_flag || 'None'),
        'Hallucinogens': severityText(item.hallucinogens_flag || 'None'),
        'Opioids': severityText(item.opioids_flag || 'None'),
        'Assessment Status': item.assessment_status,
        'Case Status': item.case_status,
        'Counseling Status': item.counseling,
        'Follow Up Status': item.follow_up,
        'Referral Status': item.referred
      };
    });
  } else if (isGyalsungCounselor.value) {
    excelData = filteredGyalsungData.value.map(item => {
      return {
        'Username': item.username,
        'Full Name': item.full_name,
        'Gender': item.gender,
        'Date of Birth': item.dob,
        'Identity Number': item.identity_number,
        'Mobile Number': item.mobile_number,
        'Academy Code': item.academy_code,
        'PHQ-9 Score': item.phq9_score,
        'GAD-7 Score': item.gad7_score,
        'Suicidal Score': item.suicidal_score,
        'Tobacco': item.tobacco_flag || 'None',
        'Alcohol': item.alcohol_flag || 'None',
        'Cannabis': item.cannabis_flag || 'None',
        'Cocaine': item.cocaine_flag || 'None',
        'Amphetamines': item.amphetamine_flag || 'None',
        'Inhalants': item.inhalants_flag || 'None',
        'Sedatives': item.sedatives_flag || 'None',
        'Hallucinogens': item.hallucinogens_flag || 'None',
        'Opioids': item.opioids_flag || 'None',
      }
    });
  } else {
    excelData = [];
  }
  const ws = XLSX.utils.json_to_sheet(excelData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Reports');
  const excelArrayBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  return new Blob([excelArrayBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
};

// Function to generate password dynamically for zip
const getPassword = () => {
  const { username } = JSON.parse(localStorage.getItem('userDetailsStore'))?.user || { username: 'defaultUser' };
  return `${username}@${new Date().getFullYear()}#`;
};

// Function to download Excel with zip
const downloadExcelWithZip = async () => {
  try {
    const excelBlob = await generateExcel();
    const blobWriter = new BlobWriter("application/zip");
    const zipWriter = new ZipWriter(blobWriter, {
      password: getPassword(),
      encryptionStrength: 3
    });

    await zipWriter.add("reports.xlsx", new BlobReader(excelBlob));
    await zipWriter.close();

    const zipBlob = await blobWriter.getData();
    const fileName = `hwss_report_${new Date().toISOString().slice(0, 10)}.zip`;

    saveAs(zipBlob, fileName);
  } catch (error) {
    console.error('Error in downloading zipped excel file', error);
  }
}

// Determine user role and fetch data accordingly
const getUserDetailsFromStorage = () => {
  const userDetailsString = localStorage.getItem('userDetailsStore');
  if (!userDetailsString) {
    console.error('No userDetailsStore found in localStorage');
    return { agencyName: 'Unknown Agency', role: 'unknown' };
  }

  try {
    const userDetails = JSON.parse(userDetailsString);
    return {
      agencyName: userDetails?.agency?.agencyName || 'Unknown Agency',
      role: userDetails?.user?.role || 'unknown',
    };
  } catch (error) {
    console.error('Error parsing user details:', error);
    return { agencyName: 'Unknown Agency', role: 'unknown' };
  }
};

// Add this computed property to filter data by current year and agency
const filteredReportData = computed(() => {
  if (!globalFilter.value || !reportData.value) {
    return reportData.value || [];
  }

  const searchTerm = globalFilter.value.toLowerCase().trim();

  return reportData.value.filter((item) => {
    // Search through all relevant fields
    return (
      // Basic info
      item.full_name?.toLowerCase().includes(searchTerm) ||
      item.username?.toLowerCase().includes(searchTerm) ||
      item.identity_number?.toLowerCase().includes(searchTerm) ||
      item.mobile_number?.toLowerCase().includes(searchTerm) ||
      item.ps_add_village?.toLowerCase().includes(searchTerm) ||
      // Scores
      item.phq9_score?.toLowerCase().includes(searchTerm) ||
      item.gad7_score?.toLowerCase().includes(searchTerm) ||
      item.suicidal_score?.toLowerCase().includes(searchTerm) ||
      item.ace_score?.toLowerCase().includes(searchTerm) ||
      // Status fields
      item.assessment_status?.toLowerCase().includes(searchTerm) ||
      item.case_status?.toLowerCase().includes(searchTerm) ||
      item.counseling?.toLowerCase().includes(searchTerm) ||
      item.follow_up?.toLowerCase().includes(searchTerm) ||
      item.referred?.toLowerCase().includes(searchTerm)
    );
  });
});

const filteredGyalsungData = computed(() => {
  if (!globalFilter.value || !gyalsungData.value) {
    return gyalsungData.value || [];
  }

  const searchTerm = globalFilter.value.toLowerCase().trim();

  return gyalsungData.value.filter((item) => {
    return (
      item.username?.toLowerCase().includes(searchTerm) ||
      item.full_name?.toLowerCase().includes(searchTerm) ||
      item.identity_number?.toLowerCase().includes(searchTerm) ||
      item.mobile_number?.toLowerCase().includes(searchTerm) ||
      item.academy_code?.toLowerCase().includes(searchTerm) ||
      item.phq9_score?.toLowerCase().includes(searchTerm) ||
      item.gad7_score?.toLowerCase().includes(searchTerm) ||
      item.suicidal_score?.toLowerCase().includes(searchTerm)
    );
  });
});

// Update your fetchReportDataFromAPI function
const fetchReportDataFromAPI = async () => {
  try {
    const response = await axios.get(endpoints.newServiceAndTreatment);
    const dataArray = response.data || [];

    const { agencyName } = getUserDetailsFromStorage();
    const currentYear = new Date().getFullYear();

    // Filter and transform the data
    reportData.value = dataArray
      .filter((item) => {
        const agencyMatch =
          item.user?.active_agency?.agency_name?.trim().toLowerCase() === agencyName.trim().toLowerCase();
        const screeningDate = item.screening_data?.submission_date;
        const submissionYear = screeningDate ? new Date(screeningDate).getFullYear() : null;

        return agencyMatch && submissionYear === currentYear;
      })
      .map(transformData);

    if (isGyalsungCounselor.value) {
      gyalsungData.value = dataArray
        .filter((item) => {
          const agencyMatch =
            item.user?.active_agency?.agency_name?.trim().toLowerCase() === agencyName.trim().toLowerCase();
          const screeningDate = item.screening_data?.submission_date;
          const submissionYear = screeningDate ? new Date(screeningDate).getFullYear() : null;
          return agencyMatch && submissionYear === currentYear;
        })
        .map(transformGyalsungData);
    }
  } catch (error) {
    console.error('Error fetching report data:', error);
  }
};

const severityText = (value) => {
  const textMapping = {
    red: 'Severe',
    blue: 'Mild',
    green: 'None',
    yellow: 'Moderate',
    grey: 'None',
  };
  return textMapping[value] || 'None';
};

const severityClass = (value) => {
  const severityMapping = {
    red: 'danger',
    blue: 'info',
    green: 'success',
    yellow: 'warning',
    grey: 'secondary',
  };
  return severityMapping[value] || 'secondary';
};

onMounted(() => {
  const { role } = getUserDetailsFromStorage();

  if (role === 'school_counselor') {
    isSchoolCounselor.value = true;
  } else if (role === 'clinical_counselor') {
    isClinicalCounselor.value = true;
  } else if (role === 'gyalsung_counselor') {
    isGyalsungCounselor.value = true;
  }

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