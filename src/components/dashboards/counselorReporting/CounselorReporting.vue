<template>
  <div class="card-container">
    <div class="card p-4">
      <!-- Filters -->
      <div class="p-field p-grid row mb-4">
        <div class="col-12 col-md-3 mb-2 mb-md-0">
          <Dropdown v-model="selectedYear" :options="years" optionLabel="label" optionValue="value"
            placeholder="Select Year" class="w-100" :disabled="isLoading" />
        </div>
        <div class="col-12 col-md-3 mb-2 mb-md-0">
          <span class="p-input-icon-left w-100">
            <InputText v-model="globalFilterInput" placeholder="Search Reports..." class="w-100"
              :disabled="isLoading || (!reportData.length && !gyalsungData.length)" />
          </span>
        </div>
        <div v-if="isSchoolCounselor" class="col-12 col-md-3 mb-2 mb-md-0">
          <Dropdown v-model="selectedOption" :options="options" optionLabel="label" optionValue="value"
            placeholder="Select Report Type" class="w-100" :disabled="isLoading" />
        </div>
        <div class="col-12 col-md-3">
          <Button label="Download Excel" @click="downloadExcelWithZip" class="btn hwss-btn w-100" icon="pi pi-download"
            :disabled="isLoading || isDownloading || (!filteredReportData.length && !filteredGyalsungData.length)"
            :loading="isDownloading" />
        </div>
      </div>

      <!-- Loading Indicator -->
      <div v-if="isLoading" class="text-center my-5">
        <ProgressSpinner strokeWidth="4" style="width: 50px; height: 50px" />
        <p>Loading reports for {{ selectedYear }}...</p>
      </div>

      <!-- Fetch Error Message -->
      <div v-if="fetchError && !isLoading" class="text-center my-5">
        <Message severity="error" :closable="false">
          Failed to load reports: {{ fetchError }}. Please try again later or select a different year.
        </Message>
      </div>

      <!-- Report Tables (conditionally rendered) -->
      <div v-if="!isLoading && !fetchError">
        <!-- General Report Table -->
        <div v-if="(selectedOption === 'generalReport' && (isSchoolCounselor || isClinicalCounselor))"
          class="table-container">
          <div v-if="!filteredReportData.length && !globalFilterInput" class="text-center my-3">
            <p>No general reports found for the year {{ selectedYear }}.</p>
          </div>
          <div v-else-if="!filteredReportData.length && globalFilterInput" class="text-center my-3">
            <p>No general reports match your search criteria for the year {{ selectedYear }}.</p>
          </div>
          <DataTable v-else :value="filteredReportData" :paginator="true" :rows="10" :rowsPerPageOptions="[10, 25, 50]"
            paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords}" :resizableColumns="true"
            sortField="full_name" :sortOrder="1" class="custom-table p-datatable-sm p-datatable-striped"
            :globalFilterFields="searchableFields" v-model:filters="filters" filterDisplay="menu"
            dataKey="identity_number" removableSort stateStorage="session" stateKey="dt-general-report-state">
            <!-- Static Columns -->
            <Column v-for="field in tableFields" :key="field.key" :field="field.key" :header="field.header"
              :sortable="true" :style="field.width ? { width: field.width } : {}" :filterField="field.key"
              :showFilterMatchModes="field.key !== 'suicidal_score'" :dataType="getDataType(field.key)">
              <template #body="{ data }">
                <template v-if="field.key === 'suicidal_score'">
                  <Tag class="w-100" :value="data[field.key]" :severity="getSuicideSeverityClass(data[field.key])" />
                </template>
                <template v-else>
                  <span>{{ data[field.key] || 'N/A' }}</span>
                </template>
              </template>
              <template v-if="field.key !== 'suicidal_score'" #filter="{ filterModel, filterCallback }">
                <InputText type="text" v-model="filterModel.value" @keydown.enter="filterCallback()"
                  class="p-column-filter" :placeholder="`Search by ${field.header}`" />
              </template>
            </Column>

            <!-- Dynamic Substance Columns -->
            <Column v-for="substance in substanceColumns" :key="substance.field" :field="substance.field"
              :header="substance.header" :sortable="true" :filterField="substance.field" :showFilterMatchModes="false">
              <template #body="{ data }">
                <Tag class="w-100" :value="severityText(data[substance.field] || 'grey')"
                  :severity="severityClass(data[substance.field])" />
              </template>
              <template #filter="{ filterModel, filterCallback }">
                <Dropdown v-model="filterModel.value" :options="severityFilterOptions" optionLabel="label"
                  optionValue="value" placeholder="Any" class="p-column-filter" :showClear="true"
                  @change="filterCallback()">
                  <template #option="slotProps">
                    <Tag :value="slotProps.option.label" :severity="slotProps.option.severity" />
                  </template>
                </Dropdown>
              </template>
            </Column>

            <!-- Service Fields Columns -->
            <Column v-for="field in tableServiceFields" :key="field.key" :field="field.key" :header="field.header"
              :sortable="true" :style="field.width ? { width: field.width } : {}" :filterField="field.key"
              :showFilterMatchModes="true">
              <template #body="{ data }">
                <span>{{ data[field.key] || 'N/A' }}</span>
              </template>
              <template #filter="{ filterModel, filterCallback }">
                <InputText type="text" v-model="filterModel.value" @keydown.enter="filterCallback()"
                  class="p-column-filter" :placeholder="`Search by ${field.header}`" />
              </template>
            </Column>

            <template #empty>
              No reports match your current filter settings.
            </template>
          </DataTable>
        </div>

        <!-- School Environment Report Table -->
        <div v-if="selectedOption === 'school' && isSchoolCounselor" class="table-container">
          <!-- Assuming SchoolEnvironmentTable handles its own loading/data -->
          <SchoolEnvironmentTable :selectedYear="selectedYear" />
        </div>

        <!-- Gyalsung Report Table -->
        <div v-if="isGyalsungCounselor" class="table-container">
          <div v-if="!filteredGyalsungData.length && !globalFilterInput" class="text-center my-3">
            <p>No Gyalsung reports found for the year {{ selectedYear }}.</p>
          </div>
          <div v-else-if="!filteredGyalsungData.length && globalFilterInput" class="text-center my-3">
            <p>No Gyalsung reports match your search criteria for the year {{ selectedYear }}.</p>
          </div>
          <DataTable v-else :value="filteredGyalsungData" :paginator="true" :rows="10"
            :rowsPerPageOptions="[10, 25, 50]"
            paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords}" :resizableColumns="true"
            sortField="full_name" :sortOrder="1" class="custom-table p-datatable-sm p-datatable-striped"
            :globalFilterFields="gyalsungSearchableFields" v-model:filters="gyalsungFilters" filterDisplay="menu"
            dataKey="identity_number" removableSort stateStorage="session" stateKey="dt-gyalsung-report-state">
            <!-- Gyalsung User Columns -->
            <Column v-for="field in gyalsungTableFields" :key="field.key" :field="field.key" :header="field.header"
              :sortable="true" :style="field.width ? { width: field.width } : {}" :filterField="field.key"
              :showFilterMatchModes="true" :dataType="getDataType(field.key)">
              <template #body="{ data }">
                <span>{{ data[field.key] || 'N/A' }}</span>
              </template>
              <template #filter="{ filterModel, filterCallback }">
                <InputText type="text" v-model="filterModel.value" @keydown.enter="filterCallback()"
                  class="p-column-filter" :placeholder="`Search by ${field.header}`" />
              </template>
            </Column>

            <!-- Gyalsung Substance Columns -->
            <Column v-for="substance in substanceColumns" :key="substance.field" :field="substance.field"
              :header="substance.header" :sortable="true" :filterField="substance.field" :showFilterMatchModes="false">
              <template #body="{ data }">
                <!-- Assuming Gyalsung data also uses the same severity flags -->
                <Tag class="w-100" :value="severityText(data[substance.field] || 'grey')"
                  :severity="severityClass(data[substance.field])" />
              </template>
              <template #filter="{ filterModel, filterCallback }">
                <Dropdown v-model="filterModel.value" :options="severityFilterOptions" optionLabel="label"
                  optionValue="value" placeholder="Any" class="p-column-filter" :showClear="true"
                  @change="filterCallback()">
                  <template #option="slotProps">
                    <Tag :value="slotProps.option.label" :severity="slotProps.option.severity" />
                  </template>
                </Dropdown>
              </template>
            </Column>
            <template #empty>
              No reports match your current filter settings.
            </template>
          </DataTable>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import axios from 'axios';
import endpoints from '@/api';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { BlobWriter, BlobReader, ZipWriter } from "@zip.js/zip.js";
import { FilterMatchMode } from 'primevue/api';
import { useDebounce } from '@vueuse/core'; // Using vueuse for debounce

// PrimeVue Components (ensure they are registered globally or imported locally)
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import Tag from 'primevue/tag';
import ProgressSpinner from 'primevue/progressspinner';
import Message from 'primevue/message';

// Child Component
import SchoolEnvironmentTable from './SchoolEnvironmentTable.vue'; // Assuming this handles its own data/loading

// --- State ---
const reportData = ref([]); // Raw data for the selected year (General/Clinical)
const gyalsungData = ref([]); // Raw data for the selected year (Gyalsung)
const isLoading = ref(false);
const isDownloading = ref(false);
const fetchError = ref(null); // To store API fetch errors

const globalFilterInput = ref(''); // User input for global search
const globalFilter = useDebounce(globalFilterInput, 300); // Debounced value for filtering

const isClinicalCounselor = ref(false);
const isGyalsungCounselor = ref(false);
const isSchoolCounselor = ref(false);
const selectedOption = ref('generalReport'); // Default for School Counselor

const selectedYear = ref(new Date().getFullYear()); // Default to current year
const userDetails = ref(null); // Store user details once

// --- Constants & Configuration ---
const options = [
  { label: 'General Report', value: 'generalReport' },
  { label: 'School Environment', value: 'school' }, // Updated value
];

const years = computed(() => {
  const currentYear = new Date().getFullYear();
  // Generate years from current year down to 10 years ago
  return Array.from({ length: 10 }, (_, index) => {
    const year = currentYear - index;
    return { label: String(year), value: year };
  });
});

const baseTableFields = [
  { key: 'full_name', header: 'Full Name' },
  { key: 'gender', header: 'Gender' },
  { key: 'dob', header: 'Date of Birth' },
  { key: 'identity_number', header: 'Identity Number' },
  { key: 'mobile_number', header: 'Mobile Number' },
];

const tableFields = [
  ...baseTableFields,
  { key: 'ps_add_village', header: 'Present Village' },
  { key: 'phq9_score', header: 'PHQ-9' }, // Simplified Header
  { key: 'gad7_score', header: 'GAD-7' }, // Simplified Header
  { key: 'suicidal_score', header: 'Suicidal Risk', style: { maxWidth: '150px' } }, // Use Risk
  { key: 'ace_score', header: 'ACE' }, // Simplified Header
];

const tableServiceFields = [
  { key: 'assessment_status', header: 'Assessment' }, // Simplified Header
  { key: 'case_status', header: 'Case Status' },
  { key: 'counseling', header: 'Counseling' }, // Simplified Header
  { key: 'follow_up', header: 'Follow Up' }, // Simplified Header
  { key: 'referred', header: 'Referral' }, // Simplified Header
];

const gyalsungTableFields = [
  ...baseTableFields,
  { key: 'username', header: 'Username' }, // Keep username if needed
  { key: 'academy_code', header: 'Academy Code' },
  { key: 'phq9_score', header: 'PHQ-9 Score' }, // Keep Score for Gyalsung if interpretation not available
  { key: 'gad7_score', header: 'GAD-7 Score' },
  { key: 'suicidal_score', header: 'Suicidal Score' }, // Keep Score for Gyalsung
];

const substanceColumns = [
  { field: 'tobacco_flag', header: 'Tobacco' },
  { field: 'alcohol_flag', header: 'Alcohol' },
  { field: 'cannabis_flag', header: 'Cannabis' },
  { field: 'cocaine_flag', header: 'Cocaine' },
  { field: 'amphetamine_flag', header: 'Amphetamines' },
  { field: 'inhalants_flag', header: 'Inhalants' },
  { field: 'sedatives_flag', header: 'Sedatives' },
  { field: 'hallucinogens_flag', header: 'Hallucinogens' },
  { field: 'opioids_flag', header: 'Opioids' },
];

// Fields to include in DataTable's global search
const searchableFields = computed(() => [
  ...tableFields.map(f => f.key),
  ...tableServiceFields.map(f => f.key),
  // Add substance flags if needed for global search, though filtering by severity is better
]);

const gyalsungSearchableFields = computed(() => [
  ...gyalsungTableFields.map(f => f.key),
  // Add substance flags if needed
]);

// DataTable Column Filters (using PrimeVue's built-in filtering)
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  // Initialize filters for each column to enable menu display
  ...Object.fromEntries(tableFields.map(f => [f.key, { value: null, matchMode: FilterMatchMode.CONTAINS }])),
  ...Object.fromEntries(substanceColumns.map(f => [f.field, { value: null, matchMode: FilterMatchMode.EQUALS }])), // Use EQUALS for severity dropdown
  ...Object.fromEntries(tableServiceFields.map(f => [f.key, { value: null, matchMode: FilterMatchMode.CONTAINS }])),
});

const gyalsungFilters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  ...Object.fromEntries(gyalsungTableFields.map(f => [f.key, { value: null, matchMode: FilterMatchMode.CONTAINS }])),
  ...Object.fromEntries(substanceColumns.map(f => [f.field, { value: null, matchMode: FilterMatchMode.EQUALS }])),
});

// Options for severity filter dropdown
const severityFilterOptions = ref([
  { label: 'Severe', value: 'red', severity: 'danger' },
  { label: 'Moderate', value: 'yellow', severity: 'warning' },
  { label: 'Mild', value: 'blue', severity: 'info' },
  { label: 'None', value: 'green', severity: 'success' },
  { label: 'Unknown', value: 'grey', severity: 'secondary' } // Or 'None'/'N/A'
]);

// --- Computed Properties for Filtered Data ---
// Now filtering is primarily handled by DataTable itself using `filters` ref.
// These computed properties simply pass the data for the *selected year*.
const filteredReportData = computed(() => reportData.value);
const filteredGyalsungData = computed(() => gyalsungData.value);

// Apply global filter manually if needed outside DataTable's built-in global filter
// watch(globalFilter, (newSearchTerm) => {
//   filters.value['global'].value = newSearchTerm;
//   gyalsungFilters.value['global'].value = newSearchTerm;
// });

// --- Methods ---

// Get User Details (called once on mount)
const getUserDetailsFromStorage = () => {
  const userDetailsString = localStorage.getItem('userDetailsStore');
  if (!userDetailsString) {
    console.error('No userDetailsStore found in localStorage');
    // Potentially redirect or show a blocking error
    return null;
  }
  try {
    const parsedDetails = JSON.parse(userDetailsString);
    userDetails.value = parsedDetails; // Store details
    isSchoolCounselor.value = parsedDetails?.user?.role === 'school_counselor';
    isClinicalCounselor.value = parsedDetails?.user?.role === 'clinical_counselor';
    isGyalsungCounselor.value = parsedDetails?.user?.role === 'gyalsung_counselor';
    return parsedDetails;
  } catch (error) {
    console.error('Error parsing user details:', error);
    fetchError.value = 'Could not load user details.'; // Show error
    return null;
  }
};

// Fetch Data (now accepts year)
const fetchReportDataForYear = async (year) => {
  if (!userDetails.value?.agency?.agencyName) {
    fetchError.value = "User agency information is missing.";
    return;
  }

  isLoading.value = true;
  fetchError.value = null;
  reportData.value = []; // Clear previous data
  gyalsungData.value = []; // Clear previous data

  try {
    // OPTIMIZATION: Add year parameter to API call if backend supports it
    // const response = await axios.get(endpoints.newServiceAndTreatment, { params: { year: year } });
    // If backend doesn't support year filter, fetch all and filter client-side (less efficient)
    const response = await axios.get(endpoints.newServiceAndTreatment);

    const dataArray = response.data || [];
    const agencyNameLower = userDetails.value.agency.agencyName.trim().toLowerCase();

    const processedData = dataArray
      .map(item => {
        // Calculate submission year (handle potential missing dates)
        const screeningDate = item.screening_data?.submission_date || item.date; // Fallback if needed
        const submissionYear = screeningDate ? new Date(screeningDate).getFullYear() : null;

        // Basic validation and year check
        if (!submissionYear || submissionYear !== year) {
          return null; // Skip items not matching the selected year
        }
        // Agency Check
        const itemAgencyName = item.user?.active_agency?.agency_name?.trim().toLowerCase();
        if (itemAgencyName !== agencyNameLower) {
          return null; // Skip items not matching the user's agency
        }

        // Return transformed data along with the original item for potential further use
        return {
          transformed: transformData(item), // General/Clinical transform
          gyalsungTransformed: isGyalsungCounselor.value ? transformGyalsungData(item) : null, // Gyalsung transform (only if needed)
          // originalItem: item // Keep original if needed elsewhere, but avoid if large
        };
      })
      .filter(item => item !== null); // Remove null entries from filtering

    // Separate into respective data arrays
    reportData.value = processedData.map(p => p.transformed);
    if (isGyalsungCounselor.value) {
      gyalsungData.value = processedData.map(p => p.gyalsungTransformed).filter(Boolean); // Filter out nulls if transform failed
    }

  } catch (error) {
    console.error('Error fetching report data:', error);
    fetchError.value = error.response?.data?.message || error.message || 'An unknown error occurred';
  } finally {
    isLoading.value = false;
  }
};

// Data Transformation (Keep these functions, ensure they are efficient)
const transformData = (item) => {
  const screeningData = item.screening_data || {};
  const substances = extractSubstances(item);
  const suicidalData = screeningData.phq_data ? extractSuicidalScore(screeningData.phq_data) : null;

  return {
    // Use 'N/A' or similar for missing data for clarity in the table
    username: item.user?.username || 'N/A',
    full_name: `${item.user?.first_name || ''} ${item.user?.middle_name || ''} ${item.user?.last_name || ''}`.trim() || 'N/A',
    gender: item.user?.gender || 'N/A',
    dob: item.user?.date_of_birth || 'N/A',
    identity_number: item.user?.identity_number || 'N/A', // Use as dataKey if unique
    mobile_number: item.user?.mob_number || 'N/A',
    ps_add_village: item.user?.ps_add_village || 'N/A',
    academy_code: item.user?.academy_code || 'N/A',
    phq9_score: screeningData.phq_interpretation || 'N/A',
    gad7_score: screeningData.gad_interpretation || 'N/A',
    suicidal_score: suicidalData ? `${suicidalData.severity} (${suicidalData.score})` : 'N/A',
    ace_score: screeningData.ace_interpretation || 'N/A',
    assessment_status: item.assessment_status || 'N/A',
    case_status: item.case_status || 'N/A',
    counseling: item.counseling || 'N/A',
    follow_up: item.follow_up || 'N/A',
    referred: item.referred || 'N/A',
    ...substances, // Add substance flags (e.g., tobacco_flag: 'red')
  };
};

const transformGyalsungData = (item) => {
  const screeningData = item.screening_data || {};
  const substances = extractSubstances(item); // Extract substances for Gyalsung too
  const suicidalData = screeningData.phq_data ? extractSuicidalScore(screeningData.phq_data) : null; // Also for Gyalsung if needed

  return {
    username: screeningData.username || 'N/A',
    full_name: screeningData.full_name || 'N/A',
    gender: screeningData.gender || 'N/A',
    dob: screeningData.dob || 'N/A',
    identity_number: screeningData.identity_number || 'N/A',
    mobile_number: screeningData.mobile_number || 'N/A',
    academy_code: screeningData.academy_code || 'N/A',
    phq9_score: screeningData.phq9_score || 'N/A', // Raw score if interpretation not available
    gad7_score: screeningData.gad7_score || 'N/A', // Raw score
    suicidal_score: suicidalData ? `${suicidalData.severity} (${suicidalData.score})` : 'N/A', // Use interpretation if available
    ...substances,
  };
};

// Substance Extraction (Seems okay, ensure mapping is correct)
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
  // Initialize all flags to grey (or a default 'unknown' state)
  Object.values(substanceMapping).forEach(key => { result[key] = 'grey'; });

  const processSubstanceArray = (substances) => {
    if (!Array.isArray(substances)) return;
    substances.forEach((substance) => {
      const mappedKey = substanceMapping[substance.substance_name];
      if (mappedKey) {
        result[mappedKey] = mapSeverity(substance.risk_flag); // mapSeverity returns 'red', 'yellow' etc.
      }
    });
  };

  // Consolidate sources
  const allSubstances = [
    ...(item.case_substance_risks || []),
    ...(item.event_substance_risks || []),
    ...(item.screening_data?.assist_data || [])
  ];

  // Process unique substances (in case of overlap, prioritize?) - Simple overwrite for now
  processSubstanceArray(allSubstances);

  return result;
};

// Severity Mapping (Returns color code)
const mapSeverity = (riskFlag) => {
  if (!riskFlag) return 'grey'; // Unknown/Not assessed
  const riskLevel = String(riskFlag).toLowerCase(); // Ensure it's a string
  if (riskLevel.includes('severe')) return 'red';
  if (riskLevel.includes('moderate')) return 'yellow';
  if (riskLevel.includes('mild') || riskLevel.includes('low')) return 'blue'; // Include 'low'
  if (riskLevel.includes('none') || riskLevel.includes('no risk')) return 'green';
  return 'grey'; // Default for unexpected values
};

// Suicidal Score Extraction (Keep robust parsing)
const extractSuicidalScore = (phqData) => {
  try {
    let dataToParse = phqData;
    // Handle stringified JSON
    if (typeof dataToParse === 'string') {
      try {
        dataToParse = JSON.parse(dataToParse);
      } catch (e) {
        console.warn('Failed to parse PHQ data string:', phqData);
        return null; // Cannot parse
      }
    }

    // Find the suicidal ideation question (handle variations)
    let responses = dataToParse?.responses || (Array.isArray(dataToParse) ? dataToParse : null);

    if (!responses) {
      // Maybe it's directly the score object? (Less common based on structure)
      if (typeof dataToParse === 'object' && dataToParse !== null && dataToParse.hasOwnProperty('score') && dataToParse.hasOwnProperty('severity')) {
        return dataToParse; // Assume it's already { score, severity }
      }
      console.warn('Could not find responses array in PHQ data:', phqData);
      return null;
    }


    const suicideQuestion = responses.find(item =>
      item && item.question && (
        item.question.toLowerCase().includes('thoughts that you would be better off dead') ||
        item.question.toLowerCase().includes('hurting yourself')
      )
    );

    if (suicideQuestion && typeof suicideQuestion.score === 'number') {
      const score = suicideQuestion.score;
      const severity = getSuicideSeverity(score);
      return { score, severity };
    } else {
      // Fallback: Check if the root object has interpretation directly
      if (dataToParse.interpretation && typeof dataToParse.total_score === 'number' && dataToParse.interpretation.toLowerCase().includes('suicidal')) {
        // This is less precise as it might be the overall PHQ score interpretation
        // console.warn("Using overall PHQ interpretation for suicidal risk - less precise.");
        // Might need a better mapping based on overall score if specific question unavailable
      }
    }

    return null; // Not found or invalid format
  } catch (error) {
    console.error('Error extracting suicidal score:', error, 'Data:', phqData);
    return null;
  }
};

// Suicide Severity Text
const getSuicideSeverity = (score) => {
  if (score === 0) return 'None';
  if (score === 1) return 'Mild';
  if (score === 2) return 'Moderate';
  if (score === 3) return 'Severe';
  return 'Unknown'; // Should not happen if score is 0-3
};

// Suicide Severity CSS Class for Tag
const getSuicideSeverityClass = (value) => {
  if (!value || typeof value !== 'string') return 'secondary';
  const lowerValue = value.toLowerCase();
  if (lowerValue.includes('severe')) return 'danger';
  if (lowerValue.includes('moderate')) return 'warning';
  if (lowerValue.includes('mild')) return 'info';
  if (lowerValue.includes('none')) return 'success'; // Or 'secondary' if 'None' isn't a success state
  return 'secondary'; // Default
};

// Substance Severity Text (from color code)
const severityText = (value) => {
  const textMapping = {
    red: 'Severe',
    yellow: 'Moderate',
    blue: 'Mild',
    green: 'None',
    grey: 'N/A', // Or 'Unknown'
  };
  return textMapping[value] || 'N/A';
};

// Substance Severity CSS Class (from color code)
const severityClass = (value) => {
  const severityMapping = {
    red: 'danger',
    yellow: 'warning',
    blue: 'info',
    green: 'success',
    grey: 'secondary',
  };
  return severityMapping[value] || 'secondary';
};

// Determine data type for DataTable filtering
const getDataType = (key) => {
  if (key === 'dob') return 'date';
  return 'text';
}


// --- Excel Export ---
const generateExcelBlob = async () => {

  const searchTerm = globalFilter.value.toLowerCase().trim();

  let sourceData = [];
  let columnsToExport = [];

  if (selectedOption.value === 'generalReport' && (isSchoolCounselor.value || isClinicalCounselor.value)) {
    sourceData = reportData.value;
    columnsToExport = [
      { field: 'full_name', header: 'Full Name' },
      { field: 'gender', header: 'Gender' },
      { field: 'dob', header: 'Date of Birth' },
      { field: 'identity_number', header: 'Identity Number' },
      { field: 'mobile_number', header: 'Mobile Number' },
      { field: 'ps_add_village', header: 'Present Village' },
      { field: 'phq9_score', header: 'PHQ-9 Interpretation' },
      { field: 'gad7_score', header: 'GAD-7 Interpretation' },
      { field: 'suicidal_score', header: 'Suicidal Risk' },
      { field: 'ace_score', header: 'ACE Interpretation' },
      ...substanceColumns.map(sc => ({ field: sc.field, header: sc.header, isSeverity: true })),
      ...tableServiceFields.map(sf => ({ field: sf.key, header: sf.header })),
    ];

  } else if (isGyalsungCounselor.value) {
    sourceData = gyalsungData.value;
    columnsToExport = [
      { field: 'username', header: 'Username' },
      { field: 'full_name', header: 'Full Name' },
      { field: 'gender', header: 'Gender' },
      { field: 'dob', header: 'Date of Birth' },
      { field: 'identity_number', header: 'Identity Number' },
      { field: 'mobile_number', header: 'Mobile Number' },
      { field: 'academy_code', header: 'Academy Code' },
      { field: 'phq9_score', header: 'PHQ-9 Score' },
      { field: 'gad7_score', header: 'GAD-7 Score' },
      { field: 'suicidal_score', header: 'Suicidal Risk' }, // Assuming interpretation applied
      ...substanceColumns.map(sc => ({ field: sc.field, header: sc.header, isSeverity: true })),
    ];
  } else if (selectedOption.value === 'school' && isSchoolCounselor.value) {
    // TODO: Add export logic for SchoolEnvironmentTable if needed
    // This might require the child component to expose its data or an export function
    console.warn("Excel export for School Environment table not implemented yet.");
    return null;
  }

  if (!sourceData || sourceData.length === 0) return null;

  // Apply global search filter for export
  const dataToExportFiltered = searchTerm
    ? sourceData.filter(item => {
      return Object.values(item).some(value =>
        String(value).toLowerCase().includes(searchTerm)
      );
    })
    : sourceData;

  // Map data to the desired Excel structure
  const excelData = dataToExportFiltered.map(item => {
    const row = {};
    columnsToExport.forEach(col => {
      const value = item[col.field] || 'N/A';
      row[col.header] = col.isSeverity ? severityText(value) : value;
    });
    return row;
  });

  if (!excelData.length) return null; // Nothing to export after filtering

  const ws = XLSX.utils.json_to_sheet(excelData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Reports');
  const excelArrayBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  return new Blob([excelArrayBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
};

const getPassword = () => {
  const username = userDetails.value?.user?.username || 'defaultUser';
  return `${username}@${selectedYear.value}#`; // Use selected year in password
};

const downloadExcelWithZip = async () => {
  isDownloading.value = true;
  try {
    const excelBlob = await generateExcelBlob();
    if (!excelBlob) {
      alert("No data available to export for the current selection and filters.");
      return;
    }

    const blobWriter = new BlobWriter("application/zip");
    const zipWriter = new ZipWriter(blobWriter, {
      password: getPassword(),
      encryptionStrength: 3, // AES-256
    });

    await zipWriter.add(`reports_${selectedYear.value}.xlsx`, new BlobReader(excelBlob));
    await zipWriter.close();

    const zipBlob = await blobWriter.getData();
    const fileName = `hwss_report_${selectedYear.value}_${new Date().toISOString().slice(0, 10)}.zip`;
    saveAs(zipBlob, fileName);

  } catch (error) {
    console.error('Error generating or downloading zipped Excel file:', error);
    alert(`Error creating report: ${error.message}`); // User feedback
  } finally {
    isDownloading.value = false;
  }
};

// --- Lifecycle Hooks ---
onMounted(() => {
  if (getUserDetailsFromStorage()) {
    // Fetch data for the initially selected year
    fetchReportDataForYear(selectedYear.value);
  } else {
    // Handle case where user details couldn't be loaded
    isLoading.value = false;
    fetchError.value = fetchError.value || "User details not found. Cannot load reports.";
  }
});

// --- Watchers ---
// Re-fetch data when the selected year changes
watch(selectedYear, (newYear, oldYear) => {
  if (newYear !== oldYear && userDetails.value) { // Avoid fetching if user details failed
    fetchReportDataForYear(newYear);
  }
});

// Watch for changes in the debounced global filter and apply it to DataTable filters
// This links the external InputText to DataTable's internal filtering
watch(globalFilter, (newSearchTerm) => {
  filters.value.global.value = newSearchTerm;
  gyalsungFilters.value.global.value = newSearchTerm;
});


</script>

<style scoped>
/* Add or refine styles as needed */
.card-container {
  margin: 1rem;
}

.table-container {
  margin-top: 1rem;
}

/* Smaller text and padding for dense tables */
.custom-table :deep(.p-datatable-tbody > tr > td),
.custom-table :deep(.p-datatable-thead > tr > th) {
  padding: 0.5rem 0.5rem;
  font-size: 0.875rem;
}

/* Ensure tags fit well */
.custom-table :deep(.p-tag) {
  max-width: 100%;
  /* Prevent overflow */
  white-space: normal;
  /* Allow wrapping */
  text-align: center;
  display: block;
  /* Make tag take full cell width if needed */
}

/* Adjust filter input sizes */
.p-column-filter {
  width: 100%;
}

/* Style for loading spinner container */
.text-center.my-5 {
  padding: 2rem;
}

/* Consistent button width */
.hwss-btn {
  min-width: 150px;
  /* Adjust as needed */
}
</style>