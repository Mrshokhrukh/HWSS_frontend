<template>
    <div class="card-container">
      <div class="card p-4">
        <!-- Filters -->
        <div class="p-field p-grid row mb-4">
          <div class="col-12 col-md-2 mb-2 mb-md-0">
            <label class="block text-sm font-medium mb-1">Start Date</label>
            <Calendar
              v-model="startDate"
              placeholder="Select Start Date"
              class="w-100"
              :disabled="isLoading"
              dateFormat="yy-mm-dd"
              :maxDate="endDate || new Date()"
              showIcon
            />
          </div>
          <div class="col-12 col-md-2 mb-2 mb-md-0">
            <label class="block text-sm font-medium mb-1">End Date</label>
            <Calendar
              v-model="endDate"
              placeholder="Select End Date"
              class="w-100"
              :disabled="isLoading"
              dateFormat="yy-mm-dd"
              :minDate="startDate"
              :maxDate="new Date()"
              showIcon
            />
          </div>
          <div class="col-12 col-md-3 mb-2 mb-md-0">
            <label class="block text-sm font-medium mb-1">Search</label>
            <span class="p-input-icon-left w-100">
              <i class="pi pi-search" />
              <InputText
                v-model="globalFilterInput"
                placeholder="Search Reports..."
                class="w-100"
                :disabled="isLoading || !filteredScreeningData.length"
              />
            </span>
          </div>
          <div class="col-12 col-md-2 mb-2 mb-md-0">
            <label class="block text-sm font-medium mb-1">Academy</label>
            <Dropdown
              v-model="selectedAcademy"
              :options="academyOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="All Academies"
              class="w-100"
              :disabled="isLoading"
              showClear
            />
          </div>
          <div class="col-12 col-md-3">
            <label class="block text-sm font-medium mb-1">Actions</label>
            <div class="flex gap-2">
              <Button
                label="Apply Filter"
                @click="applyDateFilter"
                class="btn hwss-btn flex-1"
                icon="pi pi-filter"
                :disabled="isLoading || (!startDate && !endDate)"
              />
              <Button
                label="Clear Filters"
                @click="clearFilters"
                class="btn p-button-outlined flex-1"
                icon="pi pi-refresh"
                :disabled="isLoading"
              />
              <Button
                label="Download Excel"
                @click="downloadExcel"
                class="btn hwss-btn flex-1"
                icon="pi pi-download"
                :disabled="isLoading || isDownloading || !filteredScreeningData.length"
                :loading="isDownloading"
              />
            </div>
          </div>
        </div>
  
        <!-- Stats Cards -->
        <div class="row mb-4" v-if="!isLoading && filteredScreeningData.length">
          <div class="col-12 col-md-3 mb-2">
            <div class="stats-card p-3 border rounded">
              <div class="flex align-items-center">
                <i class="pi pi-users text-blue-500 text-2xl mr-3"></i>
                <div>
                  <div class="text-2xl font-bold">{{ filteredScreeningData.length }}</div>
                  <div class="text-sm text-gray-600">Total Screenings</div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-12 col-md-3 mb-2">
            <div class="stats-card p-3 border rounded">
              <div class="flex align-items-center">
                <i class="pi pi-exclamation-triangle text-red-500 text-2xl mr-3"></i>
                <div>
                  <div class="text-2xl font-bold">{{ highRiskCount }}</div>
                  <div class="text-sm text-gray-600">High Risk Cases</div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-12 col-md-3 mb-2">
            <div class="stats-card p-3 border rounded">
              <div class="flex align-items-center">
                <i class="pi pi-chart-line text-yellow-500 text-2xl mr-3"></i>
                <div>
                  <div class="text-2xl font-bold">{{ moderateRiskCount }}</div>
                  <div class="text-sm text-gray-600">Moderate Risk</div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-12 col-md-3 mb-2">
            <div class="stats-card p-3 border rounded">
              <div class="flex align-items-center">
                <i class="pi pi-check-circle text-green-500 text-2xl mr-3"></i>
                <div>
                  <div class="text-2xl font-bold">{{ lowRiskCount }}</div>
                  <div class="text-sm text-gray-600">Low Risk</div>
                </div>
              </div>
            </div>
          </div>
        </div>
  
        <!-- Loading Indicator -->
        <div v-if="isLoading" class="text-center my-5">
          <ProgressSpinner strokeWidth="4" style="width: 50px; height: 50px" />
          <p>Loading Gyalsung screenings...</p>
        </div>
  
        <!-- Fetch Error Message -->
        <div v-if="fetchError && !isLoading" class="text-center my-5">
          <Message severity="error" :closable="false">
            Failed to load screenings: {{ fetchError }}. Please try again later.
          </Message>
        </div>
  
        <!-- Screening Data Table -->
        <div v-if="!isLoading && !fetchError">
          <div v-if="!filteredScreeningData.length && !globalFilterInput" class="text-center my-3">
            <Message severity="info" :closable="false">
              No Gyalsung screenings found for the selected criteria. Try adjusting your filters.
            </Message>
          </div>
          <div v-else-if="!filteredScreeningData.length && globalFilterInput" class="text-center my-3">
            <Message severity="warn" :closable="false">
              No screenings match your search criteria. Try different search terms.
            </Message>
          </div>
          <DataTable
            v-else
            :value="filteredScreeningData"
            :paginator="true"
            :rows="15"
            :rowsPerPageOptions="[10, 15, 25, 50]"
            paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords}"
            :resizableColumns="true"
            sortField="screening_date"
            :sortOrder="-1"
            class="custom-table p-datatable-sm p-datatable-striped"
            :globalFilterFields="searchableFields"
            :filters="filters"
            filterDisplay="menu"
            dataKey="id"
            removableSort
            stateStorage="session"
            stateKey="dt-gyalsung-screening-state"
            responsiveLayout="scroll"
          >
            <!-- Basic Info Columns -->
            <Column
              v-for="field in basicFields"
              :key="field.key"
              :field="field.key"
              :header="field.header"
              :sortable="true"
              :style="field.width ? { width: field.width } : {}"
              :filterField="field.key"
              :showFilterMatchModes="true"
              :dataType="getDataType(field.key)"
              :frozen="field.frozen"
            >
              <template #body="{ data }">
                <template v-if="field.key === 'screening_date'">
                  <span>{{ formatDate(data[field.key]) }}</span>
                </template>
                <template v-else-if="field.key === 'overall_risk'">
                  <Tag
                    class="w-100"
                    :value="data[field.key]"
                    :severity="getRiskSeverityClass(data[field.key])"
                  />
                </template>
                <template v-else>
                  <span>{{ data[field.key] || 'N/A' }}</span>
                </template>
              </template>
              <template #filter="{ filterModel, filterCallback }">
                <template v-if="field.key === 'overall_risk'">
                  <Dropdown
                    v-model="filterModel.value"
                    :options="riskFilterOptions"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Any Risk"
                    class="p-column-filter"
                    :showClear="true"
                    @change="filterCallback()"
                  >
                    <template #option="slotProps">
                      <Tag :value="slotProps.option.label" :severity="slotProps.option.severity" />
                    </template>
                  </Dropdown>
                </template>
                <template v-else>
                  <InputText
                    type="text"
                    v-model="filterModel.value"
                    @keydown.enter="filterCallback()"
                    class="p-column-filter"
                    :placeholder="`Search by ${field.header}`"
                  />
                </template>
              </template>
            </Column>
  
            <!-- Mental Health Scores -->
            <Column
              v-for="field in mentalHealthFields"
              :key="field.key"
              :field="field.key"
              :header="field.header"
              :sortable="true"
              :style="field.width ? { width: field.width } : {}"
              :filterField="field.key"
              :showFilterMatchModes="true"
            >
              <template #body="{ data }">
                <template v-if="field.key === 'suicidal_risk'">
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
  
            <!-- Substance Use Columns -->
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
                  :value="severityText(data[substance.field] || 'none')"
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
  
            <template #empty>
              <div class="text-center p-4">
                <i class="pi pi-search text-4xl text-gray-400 mb-3"></i>
                <p class="text-gray-600">No screenings match your current filter settings.</p>
              </div>
            </template>
          </DataTable>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, computed, watch } from 'vue'
  import { saveAs } from 'file-saver'
  import * as XLSX from 'xlsx'
  import { FilterMatchMode } from 'primevue/api'
  import { useDebounce } from '@vueuse/core'
  import endpoints from '@/api.js'
  import axios from 'axios'
  
  // PrimeVue Components
  import DataTable from 'primevue/datatable'
  import Column from 'primevue/column'
  import Button from 'primevue/button'
  import InputText from 'primevue/inputtext'
  import Dropdown from 'primevue/dropdown'
  import Tag from 'primevue/tag'
  import Calendar from 'primevue/calendar'
  import ProgressSpinner from 'primevue/progressspinner'
  import Message from 'primevue/message'
  
  // --- State ---
  const screeningData = ref([])
  const isLoading = ref(false)
  const isDownloading = ref(false)
  const fetchError = ref(null)
  
  // Date Range
  const startDate = ref(null)
  const endDate = ref(null)
  
  // Filters
  const globalFilterInput = ref('')
  const globalFilter = useDebounce(globalFilterInput, 300)
  const selectedAcademy = ref(null)
  
  // --- Constants & Configuration ---
  const basicFields = [
    { key: 'id', header: 'ID', width: '80px', frozen: true },
    { key: 'username', header: 'Username', width: '120px' },
    { key: 'full_name', header: 'Full Name', width: '180px' },
    { key: 'gender', header: 'Gender', width: '100px' },
    { key: 'dob', header: 'Date of Birth', width: '130px' },
    { key: 'identity_number', header: 'Identity Number', width: '150px' },
    { key: 'mobile_number', header: 'Mobile Number', width: '140px' },
    { key: 'academy_code', header: 'Academy Code', width: '130px' },
    { key: 'village', header: 'Village', width: '120px' },
    { key: 'screening_date', header: 'Screening Date', width: '140px' },
    { key: 'overall_risk', header: 'Overall Risk', width: '120px' }
  ]
  
  const mentalHealthFields = [
    { key: 'phq9_score', header: 'PHQ-9 Score', width: '120px' },
    { key: 'phq9_interpretation', header: 'PHQ-9 Level', width: '140px' },
    { key: 'gad7_score', header: 'GAD-7 Score', width: '120px' },
    { key: 'gad7_interpretation', header: 'GAD-7 Level', width: '140px' },
    { key: 'ace_score', header: 'ACE Score', width: '100px' },
    { key: 'suicidal_risk', header: 'Suicidal Risk', width: '130px' }
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
    ...basicFields.map(f => f.key),
    ...mentalHealthFields.map(f => f.key)
  ])
  
  const academyOptions = computed(() => {
    const academies = [...new Set(screeningData.value.map(item => item.academy_code))].sort()
    return academies.map(academy => ({ label: academy, value: academy }))
  })
  
  const riskFilterOptions = ref([
    { label: 'High', value: 'High', severity: 'danger' },
    { label: 'Moderate', value: 'Moderate', severity: 'warning' },
    { label: 'Low', value: 'Low', severity: 'success' }
  ])
  
  const severityFilterOptions = ref([
    { label: 'Severe', value: 'severe', severity: 'danger' },
    { label: 'Moderate', value: 'moderate', severity: 'warning' },
    { label: 'Mild', value: 'mild', severity: 'info' },
    { label: 'None', value: 'none', severity: 'success' }
  ])
  
  const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    ...Object.fromEntries(
      [...basicFields, ...mentalHealthFields].map(f => [f.key, { value: null, matchMode: FilterMatchMode.CONTAINS }])
    ),
    ...Object.fromEntries(
      substanceColumns.map(f => [f.field, { value: null, matchMode: FilterMatchMode.EQUALS }])
    )
  })
  
  // --- Computed Properties ---
  const filteredScreeningData = computed(() => {
    let filtered = screeningData.value
  
    // Apply date range filter
    if (startDate.value || endDate.value) {
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.screening_date)
        const start = startDate.value ? new Date(startDate.value) : null
        const end = endDate.value ? new Date(endDate.value) : null
        
        if (start && end) {
          return itemDate >= start && itemDate <= end
        } else if (start) {
          return itemDate >= start
        } else if (end) {
          return itemDate <= end
        }
        return true
      })
    }
  
    // Apply academy filter
    if (selectedAcademy.value) {
      filtered = filtered.filter(item => item.academy_code === selectedAcademy.value)
    }
  
    return filtered
  })
  
  const highRiskCount = computed(() => 
    filteredScreeningData.value.filter(item => item.overall_risk === 'High').length
  )
  
  const moderateRiskCount = computed(() => 
    filteredScreeningData.value.filter(item => item.overall_risk === 'Moderate').length
  )
  
  const lowRiskCount = computed(() => 
    filteredScreeningData.value.filter(item => item.overall_risk === 'Low').length
  )
  
  // --- Methods ---
  const fetchScreenings = async () => {
    isLoading.value = true
    fetchError.value = null
    
    try {
      // Get CSRF token first
      const csrfResponse = await axios.get(endpoints.getCSRFToken, {
        withCredentials: true
      })
      
      const csrfToken = csrfResponse.data.csrfToken
      
      // Fetch screening data with CSRF token
      const response = await axios.get(endpoints.getGyalsungScreenings, {
        headers: {
          'X-CSRFToken': csrfToken
        },
        withCredentials: true
      })
      
      if (response.data && response.data.success) {
        screeningData.value = response.data.data || []
        
        // Set default date range to last 30 days
        const today = new Date()
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(today.getDate() - 30)
        
        endDate.value = today
        startDate.value = thirtyDaysAgo
      } else {
        throw new Error(response.data.message || 'Failed to fetch screening data')
      }
    } catch (error) {
      console.error('Error fetching screening data:', error)
      fetchError.value = error.response?.data?.message || error.message || 'Failed to load screening data'
      
      // Fallback to mock data in development if API fails
      if (import.meta.env.DEV) {
        console.warn('API failed, using mock data as fallback')
        loadMockData()
      }
    } finally {
      isLoading.value = false
    }
  }
  
  const loadMockData = () => {
    // Mock data generation function (kept as fallback)
    const academies = ['GYACS-001', 'GYACS-002', 'GYACS-003', 'GYACS-004', 'GYACS-005']
    const firstNames = ['Tenzin', 'Karma', 'Pema', 'Sonam', 'Dorji', 'Choden', 'Tashi', 'Norbu', 'Yangchen', 'Phurba']
    const lastNames = ['Wangchuk', 'Dorji', 'Tshering', 'Namgay', 'Choden', 'Penjor', 'Gyeltshen', 'Norbu', 'Lhamo', 'Zangmo']
    const villages = ['Thimphu', 'Paro', 'Punakha', 'Wangdue', 'Bumthang', 'Trongsa', 'Mongar', 'Trashigang', 'Samtse', 'Chhukha']
    
    const riskLevels = ['Low', 'Moderate', 'High']
    const severityLevels = ['none', 'mild', 'moderate', 'severe']
    const suicidalRisks = ['None', 'Mild', 'Moderate', 'Severe']
  
    const mockData = []
    
    for (let i = 1; i <= 50; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
      const academy = academies[Math.floor(Math.random() * academies.length)]
      const village = villages[Math.floor(Math.random() * villages.length)]
      
      const randomDate = new Date()
      randomDate.setDate(randomDate.getDate() - Math.floor(Math.random() * 730))
      
      const identityNumber = `${Math.floor(Math.random() * 9) + 1}${Math.floor(Math.random() * 900000000) + 100000000}`
      const mobileNumber = `${Math.random() > 0.5 ? '17' : '77'}${Math.floor(Math.random() * 900000) + 100000}`
      
      const phq9Score = Math.floor(Math.random() * 24)
      const gad7Score = Math.floor(Math.random() * 21)
      const aceScore = Math.floor(Math.random() * 10)
      
      const getPhq9Interpretation = (score) => {
        if (score <= 4) return 'Minimal'
        if (score <= 9) return 'Mild'
        if (score <= 14) return 'Moderate'
        if (score <= 19) return 'Moderately Severe'
        return 'Severe'
      }
      
      const getGad7Interpretation = (score) => {
        if (score <= 4) return 'Minimal'
        if (score <= 9) return 'Mild'
        if (score <= 14) return 'Moderate'
        return 'Severe'
      }
      
      const generateSubstanceFlags = () => {
        const flags = {}
        substanceColumns.forEach(substance => {
          flags[substance.field] = severityLevels[Math.floor(Math.random() * severityLevels.length)]
        })
        return flags
      }
      
      const determineOverallRisk = (phq9, gad7, suicidal) => {
        if (phq9 >= 15 || gad7 >= 15 || suicidal === 'Severe') return 'High'
        if (phq9 >= 10 || gad7 >= 10 || suicidal === 'Moderate') return 'Moderate'
        return 'Low'
      }
      
      const suicidalRisk = suicidalRisks[Math.floor(Math.random() * suicidalRisks.length)]
      const overallRisk = determineOverallRisk(phq9Score, gad7Score, suicidalRisk)
      
      mockData.push({
        id: i,
        username: `user${i.toString().padStart(3, '0')}`,
        full_name: `${firstName} ${lastName}`,
        gender: Math.random() > 0.5 ? 'Male' : 'Female',
        dob: new Date(1995 + Math.floor(Math.random() * 8), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
        identity_number: identityNumber,
        mobile_number: mobileNumber,
        academy_code: academy,
        village: village,
        screening_date: randomDate.toISOString().split('T')[0],
        phq9_score: phq9Score,
        phq9_interpretation: getPhq9Interpretation(phq9Score),
        gad7_score: gad7Score,
        gad7_interpretation: getGad7Interpretation(gad7Score),
        ace_score: aceScore,
        suicidal_risk: suicidalRisk,
        overall_risk: overallRisk,
        ...generateSubstanceFlags(),
        screened_by: `Counselor ${Math.floor(Math.random() * 5) + 1}`,
        status: Math.random() > 0.8 ? 'Follow-up Required' : 'Completed'
      })
    }
    
    screeningData.value = mockData.sort((a, b) => new Date(b.screening_date) - new Date(a.screening_date))
    
    // Set default date range to last 30 days
    const today = new Date()
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(today.getDate() - 30)
    
    endDate.value = today
    startDate.value = thirtyDaysAgo
  }
  
  const applyDateFilter = () => {
    // Filter is automatically applied through computed property
    console.log('Filter applied:', { startDate: startDate.value, endDate: endDate.value })
  }
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-GB')
  }
  
  const getRiskSeverityClass = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'high': return 'danger'
      case 'moderate': return 'warning'
      case 'low': return 'success'
      default: return 'secondary'
    }
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
      severe: 'Severe',
      moderate: 'Moderate',
      mild: 'Mild',
      none: 'None'
    }
    return textMapping[value] || 'N/A'
  }
  
  const severityClass = (value) => {
    const severityMapping = {
      severe: 'danger',
      moderate: 'warning',
      mild: 'info',
      none: 'success'
    }
    return severityMapping[value] || 'secondary'
  }
  
  const getDataType = (key) => {
    if (key === 'dob' || key === 'screening_date') return 'date'
    if (key.includes('score')) return 'numeric'
    return 'text'
  }
  
  const downloadExcel = async () => {
    isDownloading.value = true
    try {
      // Get CSRF token first
      const csrfResponse = await axios.get(endpoints.getCSRFToken, {
        withCredentials: true
      })
      
      const csrfToken = csrfResponse.data.csrfToken
      
      // Prepare parameters for the API call
      const params = {}
      if (startDate.value) params.start_date = formatDate(startDate.value, 'yyyy-MM-dd')
      if (endDate.value) params.end_date = formatDate(endDate.value, 'yyyy-MM-dd')
      if (selectedAcademy.value) params.academy_code = selectedAcademy.value
      
      // Call the API to generate the Excel report
      const response = await axios.get(endpoints.generateGyalsungExcelReport, {
        params: params,
        headers: {
          'X-CSRFToken': csrfToken
        },
        responseType: 'blob',
        withCredentials: true
      })
      
      // Create filename with date range
      const startDateStr = startDate.value ? formatDate(startDate.value, 'yyyy-MM-dd') : 'all'
      const endDateStr = endDate.value ? formatDate(endDate.value, 'yyyy-MM-dd') : 'all'
      const filename = `Gyalsung_Screenings_${startDateStr}_to_${endDateStr}.xlsx`
      
      // Download the file
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      saveAs(blob, filename)
      
    } catch (error) {
      console.error('Error downloading Excel:', error)
      
      // Fallback: Generate Excel client-side if API fails
      try {
        const worksheet = XLSX.utils.json_to_sheet(filteredScreeningData.value)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Gyalsung Screenings')
        
        const startDateStr = startDate.value ? formatDate(startDate.value, 'yyyy-MM-dd') : 'all'
        const endDateStr = endDate.value ? formatDate(endDate.value, 'yyyy-MM-dd') : 'all'
        const filename = `Gyalsung_Screenings_${startDateStr}_to_${endDateStr}.xlsx`
        
        XLSX.writeFile(workbook, filename)
      } catch (fallbackError) {
        console.error('Fallback Excel generation failed:', fallbackError)
        alert('Failed to download Excel file. Please try again.')
      }
    } finally {
      isDownloading.value = false
    }
  }
  
  const clearFilters = () => {
    startDate.value = null
    endDate.value = null
    selectedAcademy.value = null
    globalFilterInput.value = ''
    filters.value.global.value = null
    
    // Clear individual column filters
    Object.keys(filters.value).forEach(key => {
      if (key !== 'global') {
        filters.value[key].value = null
      }
    })
  }
  
  // --- Watchers ---
  watch(globalFilter, (newValue) => {
    filters.value.global.value = newValue
  })
  
  // --- Lifecycle Hooks ---
  onMounted(() => {
    fetchScreenings()
  })
  </script>
  
  <style scoped>
  .card-container {
    padding: 1rem;
  }
  
  .card {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  .stats-card {
    background: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: 6px;
    transition: all 0.2s ease;
  }
  
  .stats-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  .hwss-btn {
    background-color: #2563eb;
    border-color: #2563eb;
    color: white;
  }
  
  .hwss-btn:hover {
    background-color: #1d4ed8;
    border-color: #1d4ed8;
  }
  
  .custom-table {
    font-size: 0.875rem;
  }
  
  .custom-table :deep(.p-datatable-thead > tr > th) {
    background-color: #f8f9fa;
    font-weight: 600;
    color: #374151;
  }
  
  .custom-table :deep(.p-datatable-tbody > tr:hover) {
    background-color: #f1f5f9 !important;
  }
  
  .p-field label {
    display: block;
    margin-bottom: 0.5rem;
  }
  
  @media (max-width: 768px) {
    .card-container {
      padding: 0.5rem;
    }
    
    .p-field .p-grid {
      margin-bottom: 0.5rem;
    }
    
    .flex.gap-2 {
      flex-direction: column;
      gap: 0.5rem !important;
    }
    
    .flex.gap-2 button {
      width: 100%;
    }
  }
  </style>