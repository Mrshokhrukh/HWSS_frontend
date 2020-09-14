<template>
  <div>
    <!-- Add toggle button to CounselorReports -->
    <div class="report-toggle mb-4" v-if="showToggle">
      <div class="toggle-buttons">
        <Button
          label="Switch to Gyalsung Reports"
          class="toggle-btn"
          @click="switchToGyalsung"
          icon="pi pi-shield"
        />
      </div>
    </div>
  <div class="card-container">
    <div class="card p-4">
      <!-- Filters -->
      <div class="p-field p-grid row mb-4">
        <div class="col-12 col-md-3 mb-2 mb-md-0">
          <Dropdown
            v-model="selectedYear"
            :options="years"
            optionLabel="label"
            optionValue="value"
            placeholder="Select Year"
            class="w-100"
            :disabled="isLoading"
          />
        </div>
        <div class="col-12 col-md-3 mb-2 mb-md-0">
          <span class="p-input-icon-left w-100">
            <InputText
              v-model="globalFilterInput"
              placeholder="Search Reports..."
              class="w-100"
              :disabled="isLoading || (!reportData.length && !gyalsungData.length)"
            />
          </span>
        </div>
        <div v-if="isSchoolCounselor" class="col-12 col-md-3 mb-2 mb-md-0">
          <Dropdown
            v-model="selectedOption"
            :options="options"
            optionLabel="label"
            optionValue="value"
            placeholder="Select Report Type"
            class="w-100"
            :disabled="isLoading"
          />
        </div>
        <div class="col-12 col-md-3">
          <Button
            label="Download Excel"
            @click="downloadExcelWithZip"
            class="btn hwss-btn w-100"
            icon="pi pi-download"
            :disabled="
              isLoading ||
              isDownloading ||
              (!filteredReportData.length && !filteredGyalsungData.length)
            "
            :loading="isDownloading"
          />
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
          Failed to load reports: {{ fetchError }}. Please try again later or select a different
          year.
        </Message>
      </div>

      <!-- Report Tables (conditionally rendered) -->
      <div v-if="!isLoading && !fetchError">
        <!-- General Report Table -->
        <div
          v-if="selectedOption === 'generalReport' && (isSchoolCounselor || isClinicalCounselor)"
          class="table-container"
        >
          <div v-if="!filteredReportData.length && !globalFilterInput" class="text-center my-3">
            <p>No general reports found for the year {{ selectedYear }}.</p>
          </div>
          <div v-else-if="!filteredReportData.length && globalFilterInput" class="text-center my-3">
            <p>No general reports match your search criteria for the year {{ selectedYear }}.</p>
          </div>
          <DataTable
            v-else
            :value="filteredReportData"
            :paginator="true"
            :rows="10"
            :rowsPerPageOptions="[10, 25, 50]"
            paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords}"
            :resizableColumns="true"
            sortField="full_name"
            :sortOrder="1"
            class="custom-table p-datatable-sm p-datatable-striped"
            :globalFilterFields="searchableFields"
            :filters="filters"
            filterDisplay="menu"
            dataKey="identity_number"
            removableSort
            stateStorage="session"
            stateKey="dt-general-report-state"
          >
            <!-- Static Columns -->
            <Column
              v-for="field in tableFields"
              :key="field.key"
              :field="field.key"
              :header="field.header"
              :sortable="true"
              :style="field.width ? { width: field.width } : {}"
              :filterField="field.key"
              :showFilterMatchModes="field.key !== 'suicidal_score'"
              :dataType="getDataType(field.key)"
            >
              <template #body="{ data }">
                <template v-if="field.key === 'suicidal_score'">
                  <Tag
                    class="w-100"
                    :value="data[field.key]"
                    :severity="getSuicideSeverityClass(data[field.key])"
                  />
                </template>
                <template v-else>
                  <span>{{ data[field.key] || 'N/A' }}</span>
                </template>
              </template>
              <template
                v-if="field.key !== 'suicidal_score'"
                #filter="{ filterModel, filterCallback }"
              >
                <InputText
                  type="text"
                  v-model="filterModel.value"
                  @keydown.enter="filterCallback()"
                  class="p-column-filter"
                  :placeholder="`Search by ${field.header}`"
                />
              </template>
            </Column>

            <!-- Dynamic Substance Columns -->
            <Column
              v-for="substance in substanceColumns"
              :key="substance.field"
              :field="substance.field"
              :header="substance.header"
              :sortable="true"
              :filterField="substance.field"
              :showFilterMatchModes="false"
            >
              <template #body="{ data }">
                <Tag
                  class="w-100"
                  :value="severityText(data[substance.field] || 'grey')"
                  :severity="severityClass(data[substance.field])"
                />
              </template>
              <template #filter="{ filterModel, filterCallback }">
                <Dropdown
                  v-model="filterModel.value"
                  :options="severityFilterOptions"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Any"
                  class="p-column-filter"
                  :showClear="true"
                  @change="filterCallback()"
                >
                  <template #option="slotProps">
                    <Tag :value="slotProps.option.label" :severity="slotProps.option.severity" />
                  </template>
                </Dropdown>
              </template>
            </Column>

            <!-- Service Fields Columns -->
            <Column
              v-for="field in tableServiceFields"
              :key="field.key"
              :field="field.key"
              :header="field.header"
              :sortable="true"
              :style="field.width ? { width: field.width } : {}"
              :filterField="field.key"
              :showFilterMatchModes="true"
            >
              <template #body="{ data }">
                <span>{{ data[field.key] || 'N/A' }}</span>
              </template>
              <template #filter="{ filterModel, filterCallback }">
                <InputText
                  type="text"
                  v-model="filterModel.value"
                  @keydown.enter="filterCallback()"
                  class="p-column-filter"
                  :placeholder="`Search by ${field.header}`"
                />
              </template>
            </Column>

            <template #empty> No reports match your current filter settings. </template>
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
          <div
            v-else-if="!filteredGyalsungData.length && globalFilterInput"
            class="text-center my-3"
          >
            <p>No Gyalsung reports match your search criteria for the year {{ selectedYear }}.</p>
          </div>
          <DataTable
            v-else
            :value="filteredGyalsungData"
            :paginator="true"
            :rows="10"
            :rowsPerPageOptions="[10, 25, 50]"
            paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords}"
            :resizableColumns="true"
            sortField="full_name"
            :sortOrder="1"
            class="custom-table p-datatable-sm p-datatable-striped"
            :globalFilterFields="gyalsungSearchableFields"
            v-model="gyalsungFilters"
            filterDisplay="menu"
            dataKey="identity_number"
            removableSort
            stateStorage="session"
            stateKey="dt-gyalsung-report-state"
          >
            <!-- Gyalsung User Columns -->
            <Column
              v-for="field in gyalsungTableFields"
              :key="field.key"
              :field="field.key"
              :header="field.header"
              :sortable="true"
              :style="field.width ? { width: field.width } : {}"
              :filterField="field.key"
              :showFilterMatchModes="true"
              :dataType="getDataType(field.key)"
            >
              <template #body="{ data }">
                <span>{{ data[field.key] || 'N/A' }}</span>
              </template>
              <template #filter="{ filterModel, filterCallback }">
                <InputText
                  type="text"
                  v-model="filterModel.value"
                  @keydown.enter="filterCallback()"
                  class="p-column-filter"
                  :placeholder="`Search by ${field.header}`"
                />
              </template>
            </Column>

            <!-- Gyalsung Substance Columns -->
            <Column
              v-for="substance in substanceColumns"
              :key="substance.field"
              :field="substance.field"
              :header="substance.header"
              :sortable="true"
              :filterField="substance.field"
              :showFilterMatchModes="false"
            >
              <template #body="{ data }">
                <!-- Assuming Gyalsung data also uses the same severity flags -->
                <Tag
                  class="w-100"
                  :value="severityText(data[substance.field] || 'grey')"
                  :severity="severityClass(data[substance.field])"
                />
              </template>
              <template #filter="{ filterModel, filterCallback }">
                <Dropdown
                  v-model="filterModel.value"
                  :options="severityFilterOptions"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Any"
                  class="p-column-filter"
                  :showClear="true"
                  @change="filterCallback()"
                >
                  <template #option="slotProps">
                    <Tag :value="slotProps.option.label" :severity="slotProps.option.severity" />
                  </template>
                </Dropdown>
              </template>
            </Column>
            <template #empty> No reports match your current filter settings. </template>
          </DataTable>
        </div>
      </div>
    </div>
  </div>
</div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import apiClient from '@/apiClient'
import endpoints from '@/api'
import { saveAs } from 'file-saver'
import * as XLSX from 'xlsx'
import { BlobWriter, BlobReader, ZipWriter } from '@zip.js/zip.js'
import { FilterMatchMode } from 'primevue/api'
import { useDebounce } from '@vueuse/core'

// PrimeVue Components
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import Tag from 'primevue/tag'
import ProgressSpinner from 'primevue/progressspinner'
import Message from 'primevue/message'

// Child Component
import SchoolEnvironmentTable from './SchoolEnvironmentTable.vue'

// --- State ---
const reportData = ref([])
const gyalsungData = ref([])
const isLoading = ref(false)
const isDownloading = ref(false)
const fetchError = ref(null)

const globalFilterInput = ref('')
const globalFilter = useDebounce(globalFilterInput, 300)

const isClinicalCounselor = ref(false)
const isGyalsungCounselor = ref(false)
const isSchoolCounselor = ref(false)
const selectedOption = ref('generalReport')

const selectedYear = ref(new Date().getFullYear())
const userDetails = ref(null)

// --- Constants & Configuration ---
const options = [
  { label: 'General Report', value: 'generalReport' },
  { label: 'School Environment', value: 'school' }
]

const years = computed(() => {
  const currentYear = new Date().getFullYear()
  return Array.from({ length: 10 }, (_, index) => {
    const year = currentYear - index
    return { label: String(year), value: year }
  })
})

// ... (Your other constants like baseTableFields, tableFields, etc. are unchanged) ...
const baseTableFields = [
  { key: 'id', header: 'ID' },
  { key: 'full_name', header: 'Full Name' },
  { key: 'gender', header: 'Gender' },
  { key: 'dob', header: 'Date of Birth' },
  { key: 'identity_number', header: 'Identity Number' },
  { key: 'mobile_number', header: 'Mobile Number' }
]

const tableFields = [
  ...baseTableFields,
  { key: 'ps_add_village', header: 'Present Village' },
  { key: 'phq9_score', header: 'PHQ-9' },
  { key: 'gad7_score', header: 'GAD-7' },
  { key: 'suicidal_score', header: 'Suicidal Risk', style: { maxWidth: '150px' } },
  { key: 'ace_score', header: 'ACE' }
]

const tableServiceFields = [
  { key: 'assessment_status', header: 'Assessment' },
  { key: 'case_status', header: 'Case Status' },
  { key: 'counseling', header: 'Counseling' },
  { key: 'follow_up', header: 'Follow Up' },
  { key: 'referred', header: 'Referral' },
  { key: 'mark_as_safe', header: 'Mark as Safe' }
]

const gyalsungTableFields = [
  ...baseTableFields,
  { key: 'username', header: 'Username' },
  { key: 'academy_code', header: 'Academy Code' },
  { key: 'phq9_score', header: 'PHQ-9 Score' },
  { key: 'gad7_score', header: 'GAD-7 Score' },
  { key: 'suicidal_score', header: 'Suicidal Score' }
]

const substanceColumns = [
  { field: 'tobacco_flag', header: 'Tobacco' },
  { field: 'alcohol_flag', header: 'Alcohol' },
  { field: 'cannabis_flag', header: 'Cannabis' },
  { field: 'cocaine_flag', header: 'Cocaine' },
  { field: 'amphetamine_flag', header: 'Amphetamines' },
  { field: 'inhalants_flag', header: 'Inhalants' },
  { field: 'sedatives_flag', header: 'Sedatives' },
  { field: 'hallucinogens_flag', header: 'Hallucinogens' },
  { field: 'opioids_flag', header: 'Opioids' }
]

const searchableFields = computed(() => [
  ...tableFields.map((f) => f.key),
  ...tableServiceFields.map((f) => f.key)
])

const gyalsungSearchableFields = computed(() => [...gyalsungTableFields.map((f) => f.key)])

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  ...Object.fromEntries(
    tableFields.map((f) => [f.key, { value: null, matchMode: FilterMatchMode.CONTAINS }])
  ),
  ...Object.fromEntries(
    substanceColumns.map((f) => [f.field, { value: null, matchMode: FilterMatchMode.EQUALS }])
  ),
  ...Object.fromEntries(
    tableServiceFields.map((f) => [f.key, { value: null, matchMode: FilterMatchMode.CONTAINS }])
  )
})

const gyalsungFilters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  ...Object.fromEntries(
    gyalsungTableFields.map((f) => [f.key, { value: null, matchMode: FilterMatchMode.CONTAINS }])
  ),
  ...Object.fromEntries(
    substanceColumns.map((f) => [f.field, { value: null, matchMode: FilterMatchMode.EQUALS }])
  )
})

const severityFilterOptions = ref([
  { label: 'Severe', value: 'red', severity: 'danger' },
  { label: 'Moderate', value: 'yellow', severity: 'warning' },
  { label: 'Mild', value: 'blue', severity: 'info' },
  { label: 'None', value: 'green', severity: 'success' },
  { label: 'Unknown', value: 'grey', severity: 'secondary' }
])

// --- Computed Properties ---
const filteredReportData = computed(() => reportData.value)
const filteredGyalsungData = computed(() => gyalsungData.value)

// --- Methods ---

const getUserDetailsFromStorage = () => {
  const userDetailsString = localStorage.getItem('userDetailsStore')
  if (!userDetailsString) {
    console.error('No userDetailsStore found in localStorage')
    return null
  }
  try {
    const parsedDetails = JSON.parse(userDetailsString)
    userDetails.value = parsedDetails
    isSchoolCounselor.value = parsedDetails?.user?.role === 'school_counselor'
    isClinicalCounselor.value = parsedDetails?.user?.role === 'clinical_counselor'
    isGyalsungCounselor.value = parsedDetails?.user?.role === 'gyalsung_counselor'
    return parsedDetails
  } catch (error) {
    console.error('Error parsing user details:', error)
    fetchError.value = 'Could not load user details.'
    return null
  }
}

// MODIFIED: This function now uses server-side filtering
const fetchReportDataForYear = async (year) => {
  if (!userDetails.value?.agency?.agencyName) {
    fetchError.value = 'User agency information is missing.'
    return
  }

  isLoading.value = true
  fetchError.value = null
  reportData.value = []
  gyalsungData.value = []

  try {
    // 1. Get the agency name from the stored user details.
    const agencyName = userDetails.value.agency.agencyName

    // 2. Construct the URL with the agency_name query parameter.
    const requestUrl = `${endpoints.newServiceAndTreatment}?agency_name=${encodeURIComponent(
      agencyName
    )}`

    // 3. Fetch the pre-filtered data from the backend.
    const response = await apiClient.get(requestUrl)

    const dataArray = response.data || []

    // 4. The client-side agency filter is now REMOVED. We only need to filter by year.
    const processedData = dataArray
      .map((item) => {
        const screeningDate = item.screening_data?.submission_date || item.date
        const submissionYear = screeningDate ? new Date(screeningDate).getFullYear() : null

        if (!submissionYear || submissionYear !== year) {
          return null
        }

        // The agency check that was here is now gone!

        return {
          transformed: transformData(item),
          gyalsungTransformed: isGyalsungCounselor.value ? transformGyalsungData(item) : null
        }
      })
      .filter((item) => item !== null)

    reportData.value = processedData.map((p) => p.transformed)
    if (isGyalsungCounselor.value) {
      gyalsungData.value = processedData.map((p) => p.gyalsungTransformed).filter(Boolean)
    }
  } catch (error) {
    console.error('Error fetching report data:', error)
    fetchError.value = error.response?.data?.message || error.message || 'An unknown error occurred'
  } finally {
    isLoading.value = false
  }
}

// ... (All your other methods like transformData, extractSubstances, downloadExcelWithZip, etc. are unchanged) ...
const transformData = (item) => {
  const screeningData = item.screening_data || {}
  const substances = extractSubstances(item)
  const suicidalData = screeningData.phq_data ? extractSuicidalScore(screeningData.phq_data) : null

  return {
    username: item.user?.username || 'N/A',
    full_name:
      `${item.user?.first_name || ''} ${item.user?.middle_name || ''} ${
        item.user?.last_name || ''
      }`.trim() || 'N/A',
    gender: item.user?.gender || 'N/A',
    dob: item.user?.date_of_birth || 'N/A',
    identity_number: item.user?.identity_number || 'N/A',
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
    mark_as_safe:
      screeningData.mark_as_safe === undefined || screeningData.mark_as_safe === null
        ? 'N/A'
        : screeningData.mark_as_safe
        ? 'TRUE'
        : 'FALSE',
    ...substances
  }
}

const transformGyalsungData = (item) => {
  const screeningData = item.screening_data || {}
  const substances = extractSubstances(item)
  const suicidalData = screeningData.phq_data ? extractSuicidalScore(screeningData.phq_data) : null

  return {
    username: screeningData.username || 'N/A',
    full_name: screeningData.full_name || 'N/A',
    gender: screeningData.gender || 'N/A',
    dob: screeningData.dob || 'N/A',
    identity_number: screeningData.identity_number || 'N/A',
    mobile_number: screeningData.mobile_number || 'N/A',
    academy_code: screeningData.academy_code || 'N/A',
    phq9_score: screeningData.phq9_score || 'N/A',
    gad7_score: screeningData.gad7_score || 'N/A',
    suicidal_score: suicidalData ? `${suicidalData.severity} (${suicidalData.score})` : 'N/A',
    ...substances
  }
}

const extractSubstances = (item) => {
  const substanceMapping = {
    'Tobacco products (cigarettes, chewing tobacco etc)': 'tobacco_flag',
    'Alcoholic beverages (beer, wine, spirits, ara etc.)': 'alcohol_flag',
    'Cannabis (marijuana, pot, grass, hash, black etc.)': 'cannabis_flag',
    Cocaine: 'cocaine_flag',
    'Amphetamine-type stimulants (meth, ecstasy, diet pills etc.)': 'amphetamine_flag',
    'Inhalants (dendrite, glue, petrol, paint thinner, etc.)': 'inhalants_flag',
    'Sedatives or Sleeping Pills (N-10, diazepam etc.)': 'sedatives_flag',
    'Hallucinogens (LSD, trips, Ketamine, etc.)': 'hallucinogens_flag',
    'Opioids (heroin, morphine, fentanyl, codeine, SP+, tramadol, BS etc)': 'opioids_flag'
  }
  const result = {}
  Object.values(substanceMapping).forEach((key) => {
    result[key] = 'grey'
  })

  const processSubstanceArray = (substances) => {
    if (!Array.isArray(substances)) return
    substances.forEach((substance) => {
      // ✅ Note: Changed key from substance.substance_name to substance.substance__name to match API response
      const mappedKey = substanceMapping[substance.substance__name]
      if (mappedKey) {
        result[mappedKey] = mapSeverity(substance.risk_flag)
      }
    })
  }

  // ✨ FIX: Use Array.isArray to safely handle assist_data
  const assistData = item.screening_data?.assist_data
  const allSubstances = [
    ...(item.case_substance_risks || []),
    ...(item.event_substance_risks || []),
    ...(Array.isArray(assistData) ? assistData : [])
  ]

  processSubstanceArray(allSubstances)

  return result
}

const mapSeverity = (riskFlag) => {
  if (!riskFlag) return 'grey'
  const riskLevel = String(riskFlag).toLowerCase()
  if (riskLevel.includes('severe')) return 'red'
  if (riskLevel.includes('moderate')) return 'yellow'
  if (riskLevel.includes('mild') || riskLevel.includes('low')) return 'blue'
  if (riskLevel.includes('none') || riskLevel.includes('no risk')) return 'green'
  return 'grey'
}

const extractSuicidalScore = (phqData) => {
  try {
    let dataToParse = phqData
    if (typeof dataToParse === 'string') {
      try {
        dataToParse = JSON.parse(dataToParse)
      } catch (e) {
        console.warn('Failed to parse PHQ data string:', phqData)
        return null
      }
    }

    let responses = dataToParse?.responses || (Array.isArray(dataToParse) ? dataToParse : null)

    if (!responses) {
      if (
        typeof dataToParse === 'object' &&
        dataToParse !== null &&
        dataToParse.hasOwnProperty('score') &&
        dataToParse.hasOwnProperty('severity')
      ) {
        return dataToParse
      }
      console.warn('Could not find responses array in PHQ data:', phqData)
      return null
    }

    const suicideQuestion = responses.find(
      (item) =>
        item &&
        item.question &&
        (item.question.toLowerCase().includes('thoughts that you would be better off dead') ||
          item.question.toLowerCase().includes('hurting yourself'))
    )

    if (suicideQuestion && typeof suicideQuestion.score === 'number') {
      const score = suicideQuestion.score
      const severity = getSuicideSeverity(score)
      return { score, severity }
    }

    return null
  } catch (error) {
    console.error('Error extracting suicidal score:', error, 'Data:', phqData)
    return null
  }
}

const getSuicideSeverity = (score) => {
  if (score === 0) return 'None'
  if (score === 1) return 'Mild'
  if (score === 2) return 'Moderate'
  if (score === 3) return 'Severe'
  return 'Unknown'
}

const getSuicideSeverityClass = (value) => {
  if (!value || typeof value !== 'string') return 'secondary'
  const lowerValue = value.toLowerCase()
  if (lowerValue.includes('severe')) return 'danger'
  if (lowerValue.includes('moderate')) return 'warning'
  if (lowerValue.includes('mild')) return 'info'
  if (lowerValue.includes('none')) return 'success'
  return 'secondary'
}

const severityText = (value) => {
  const textMapping = {
    red: 'Severe',
    yellow: 'Moderate',
    blue: 'Mild',
    green: 'None',
    grey: 'N/A'
  }
  return textMapping[value] || 'N/A'
}

const severityClass = (value) => {
  const severityMapping = {
    red: 'danger',
    yellow: 'warning',
    blue: 'info',
    green: 'success',
    grey: 'secondary'
  }
  return severityMapping[value] || 'secondary'
}

const getDataType = (key) => {
  if (key === 'dob') return 'date'
  return 'text'
}

const generateExcelReportUsingBackendApi = async () => {
  const searchTerm = globalFilter.value.toLowerCase().trim()
  let sourceData = []
  let columnsToExport = []

  if (
    selectedOption.value === 'generalReport' &&
    (isSchoolCounselor.value || isClinicalCounselor.value)
  ) {
    sourceData = reportData.value
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
      ...substanceColumns.map((sc) => ({ field: sc.field, header: sc.header, isSeverity: true })),
      ...tableServiceFields.map((sf) => ({ field: sf.key, header: sf.header }))
    ]
  } else if (isGyalsungCounselor.value) {
    sourceData = gyalsungData.value
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
      { field: 'suicidal_score', header: 'Suicidal Risk' },
      ...substanceColumns.map((sc) => ({ field: sc.field, header: sc.header, isSeverity: true }))
    ]
  } else if (selectedOption.value === 'school' && isSchoolCounselor.value) {
    console.warn('Excel export for School Environment table not implemented yet.')
    return null
  }

  if (!sourceData || sourceData.length === 0) return null

  const dataToExportFiltered = searchTerm
    ? sourceData.filter((item) => {
        return Object.values(item).some((value) => String(value).toLowerCase().includes(searchTerm))
      })
    : sourceData

  const excelData = dataToExportFiltered.map((item) => {
    const row = {}
    columnsToExport.forEach((col) => {
      const value = item[col.field] || 'N/A'
      row[col.header] = col.isSeverity ? severityText(value) : value
    })
    return row
  })

  if (!excelData.length) return null

  const ApiResponse = await apiClient.post(
    endpoints.generateCounselorXLSEncryptedReport,
    {
      data: excelData,
      columns_to_export: columnsToExport,
      password: getPassword()
    },
    {
      responseType: 'blob'
    }
  )
  const url = window.URL.createObjectURL(new Blob([ApiResponse.data]))
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', 'report.xls') // filename
  document.body.appendChild(link)
  link.click()
  link.remove()
}

const getPassword = () => {
  const username = userDetails.value?.user?.username || 'defaultUser'
  return `${username}@${selectedYear.value}#`
}

const downloadExcelWithZip = async () => {
  isDownloading.value = true
  try {
    await generateExcelReportUsingBackendApi()
  } catch (error) {
    console.error('Error generating or downloading zipped Excel file:', error)
    alert(`Error creating report: ${error.message}`)
  } finally {
    isDownloading.value = false
  }
}

// --- Lifecycle Hooks ---
onMounted(() => {
  if (getUserDetailsFromStorage()) {
    fetchReportDataForYear(selectedYear.value)
  } else {
    isLoading.value = false
    fetchError.value = fetchError.value || 'User details not found. Cannot load reports.'
  }
})

// --- Watchers ---
watch(selectedYear, (newYear, oldYear) => {
  if (newYear !== oldYear && userDetails.value) {
    fetchReportDataForYear(newYear)
  }
})

watch(globalFilter, (newSearchTerm) => {
  filters.value.global.value = newSearchTerm
  gyalsungFilters.value.global.value = newSearchTerm
})
</script>

<script>
import { useRouter } from 'vue-router';

export default {
  name: 'CounselorReports',
  props: {
    showToggle: {
      type: Boolean,
      default: false
    }
  },
  setup() {
    const router = useRouter();
    
    const switchToGyalsung = () => {
      router.push('/GyalsungModel/GyalsungReports');
    };

    return {
      switchToGyalsung
    };
  }
};
</script>

<style scoped>
.report-toggle {
  border-bottom: 1px solid #dee2e6;
  padding-bottom: 1rem;
}

.toggle-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.toggle-btn {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  border: 2px solid #dee2e6;
  background: #f8f9fa;
  color: #6c757d;
}

.toggle-btn:hover {
  background: #e9ecef;
  border-color: #adb5bd;
}
</style>