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
  
  // --- Mock Data Generation ---
  const generateMockData = () => {
    const academies = ['GYACS-001', 'GYACS-002', 'GYACS-003', 'GYACS-004', 'GYACS-005']
    const firstNames = ['Tenzin', 'Karma', 'Pema', 'Sonam', 'Dorji', 'Choden', 'Tashi', 'Norbu', 'Yangchen', 'Phurba']
    const lastNames = ['Wangchuk', 'Dorji', 'Tshering', 'Namgay', 'Choden', 'Penjor', 'Gyeltshen', 'Norbu', 'Lhamo', 'Zangmo']
    const villages = ['Thimphu', 'Paro', 'Punakha', 'Wangdue', 'Bumthang', 'Trongsa', 'Mongar', 'Trashigang', 'Samtse', 'Chhukha']
    
    const riskLevels = ['Low', 'Moderate', 'High']
    const severityLevels = ['none', 'mild', 'moderate', 'severe']
    const suicidalRisks = ['None', 'Mild', 'Moderate', 'Severe']
  
    const mockData = []
    
    // Generate 150 records for better demonstration
    for (let i = 1; i <= 150; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
      const academy = academies[Math.floor(Math.random() * academies.length)]
      const village = villages[Math.floor(Math.random() * villages.length)]
      
      // Generate random date within last 2 years
      const randomDate = new Date()
      randomDate.setDate(randomDate.getDate() - Math.floor(Math.random() * 730))
      
      // Generate identity number
      const identityNumber = `${Math.floor(Math.random() * 9) + 1}${Math.floor(Math.random() * 900000000) + 100000000}`
      
      // Generate mobile number
      const mobileNumber = `${Math.random() > 0.5 ? '17' : '77'}${Math.floor(Math.random() * 900000) + 100000}`
      
      // Generate scores
      const phq9Score = Math.floor(Math.random() * 24) // 0-23
      const gad7Score = Math.floor(Math.random() * 21) // 0-20
      const aceScore = Math.floor(Math.random() * 10) // 0-10
      
      // Determine interpretations based on scores
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
      
      // Generate substance use flags
      const generateSubstanceFlags = () => {
        const flags = {}
        substanceColumns.forEach(substance => {
          flags[substance.field] = severityLevels[Math.floor(Math.random() * severityLevels.length)]
        })
        return flags
      }
      
      // Determine overall risk based on scores and flags
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
    
    return mockData.sort((a, b) => new Date(b.screening_date) - new Date(a.screening_date))
  }
  
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
  const loadMockData = () => {
    isLoading.value = true
    fetchError.value = null
    
    // Simulate API call delay
    setTimeout(() => {
      try {
        screeningData.value = generateMockData()
        
        // Set default date range to last 30 days
        const today = new Date()
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(today.getDate() - 30)
        
        endDate.value = today
        startDate.value = thirtyDaysAgo
        
      } catch (error) {
        console.error('Error loading mock data:', error)
        fetchError.value = 'Failed to load screening data'
      } finally {
        isLoading.value = false
      }
    }, 1000)
  }
  
  const applyDateFilter = () => {
    // Filter is automatically applied through computed property
    // This method is mainly for user feedback
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
      // Prepare data for Excel export
      const dataToExport = filteredScreeningData.value.map(item => ({
        'ID': item.id,
        'Username': item.username,
        'Full Name': item.full_name,
        'Gender': item.gender,
        'Date of Birth': item.dob,
        'Identity Number': item.identity_number,
        'Mobile Number': item.mobile_number,
        'Academy Code': item.academy_code,
        'Village': item.village,
        'Screening Date': item.screening_date,
        'Overall Risk': item.overall_risk,
        'PHQ-9 Score': item.phq9_score,
        'PHQ-9 Interpretation': item.phq9_interpretation,
        'GAD-7 Score': item.gad7_score,
        'GAD-7 Interpretation': item.gad7_interpretation,
        'ACE Score': item.ace_score,
        'Suicidal Risk': item.suicidal_risk,
        'Tobacco': severityText(item.tobacco_flag),
        'Alcohol': severityText(item.alcohol_flag),
        'Cannabis': severityText(item.cannabis_flag),
        'Cocaine': severityText(item.cocaine_flag),
        'Amphetamines': severityText(item.amphetamine_flag),
        'Inhalants': severityText(item.inhalants_flag),
        'Sedatives': severityText(item.sedatives_flag),
        'Hallucinogens': severityText(item.hallucinogens_flag),
        'Opioids': severityText(item.opioids_flag),
        'Screened By': item.screened_by,
        'Status': item.status
      }))
  
      // Create workbook and worksheet
      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.json_to_sheet(dataToExport)
  
      // Auto-size columns
      const colWidths = Object.keys(dataToExport[0] || {}).map(key => ({
        wch: Math.max(key.length, 15)
      }))
      ws['!cols'] = colWidths
  
      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Gyalsung Screenings')
  
      // Generate Excel file
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      
      // Create filename with date range
      const startDateStr = startDate.value ? formatDate(startDate.value) : 'all'
      const endDateStr = endDate.value ? formatDate(endDate.value) : 'all'
      const filename = `Gyalsung_Screenings_${startDateStr}_to_${endDateStr}.xlsx`
      
      saveAs(blob, filename)
  
    } catch (error) {
      console.error('Error generating Excel file:', error)
      alert(`Error creating Excel report: ${error.message}`)
    } finally {
      isDownloading.value = false
    }
  }
  
  const clearFilters = () => {
    startDate.value = null
    endDate.value = null
    selectedAcademy.value = null
    globalFilterInput.value = ''
    
    // Reset all table filters
    Object.keys(filters.value).forEach(key => {
      if (filters.value[key]) {
        filters.value[key].value = null
      }
    })
  }
  
  // --- Lifecycle Hooks ---
  onMounted(() => {
    loadMockData()
  })
  
  // --- Watchers ---
  watch(globalFilter, (newSearchTerm) => {
    filters.value.global.value = newSearchTerm
  })
  
  watch([startDate, endDate], () => {
    // Trigger reactivity for filtered data
    console.log('Date range updated:', { start: startDate.value, end: endDate.value })
  })
  </script>
  
  <style scoped>
  /* Add or refine styles as needed */
  .card-container {
    margin: 1rem;
  }
  
  .table-container {
    margin-top: 1rem;
  }
  
  /* Stats cards styling */
  .stats-card {
    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
    border: 1px solid #e2e8f0;
    transition: all 0.3s ease;
  }
  
  .stats-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  /* Smaller text and padding for dense tables */
  .custom-table :deep(.p-datatable-tbody > tr > td),
  .custom-table :deep(.p-datatable-thead > tr > th) {
    padding: 0.5rem 0.4rem;
    font-size: 0.875rem;
  }
  
  /* Ensure tags fit well */
  .custom-table :deep(.p-tag) {
    max-width: 100%;
    white-space: normal;
    text-align: center;
    display: block;
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
  }
  
  /* Adjust filter input sizes */
  .p-column-filter {
    width: 100%;
    font-size: 0.875rem;
  }
  
  /* Style for loading spinner container */
  .text-center.my-5 {
    padding: 2rem;
  }
  
  /* Consistent button width */
  .hwss-btn {
    min-width: 120px;
  }
  
  /* Responsive grid adjustments */
  @media (max-width: 768px) {
    .p-grid .col-12 {
      margin-bottom: 0.5rem;
    }
    
    .stats-card {
      margin-bottom: 1rem;
    }
    
    .custom-table :deep(.p-datatable-thead > tr > th),
    .custom-table :deep(.p-datatable-tbody > tr > td) {
      padding: 0.4rem 0.3rem;
      font-size: 0.8rem;
    }
  }
  
  /* Calendar styling */
  .p-calendar {
    width: 100%;
  }
  
  /* Message styling */
  :deep(.p-message) {
    margin: 1rem 0;
  }
  
  /* Frozen column styling */
  .custom-table :deep(.p-datatable-frozen-column) {
    background-color: #f8fafc !important;
    border-right: 2px solid #e2e8f0 !important;
  }
  
  /* Filter dropdown styling */
  :deep(.p-dropdown.p-column-filter) {
    min-width: 100px;
  }
  
  /* Empty state styling */
  .custom-table :deep(.p-datatable-emptymessage) {
    padding: 2rem;
    text-align: center;
  }
  
  /* Progress spinner container */
  .text-center.my-5 {
    padding: 3rem 1rem;
  }
  
  .text-center.my-5 p {
    margin-top: 1rem;
    color: #6b7280;
    font-size: 0.9rem;
  }
  
  /* Button group styling */
  .flex.gap-2 {
    gap: 0.5rem;
  }
  
  /* Label styling */
  label {
    color: #374151;
    font-weight: 500;
  }
  
  /* Risk severity colors */
  :deep(.p-tag.p-tag-danger) {
    background-color: #fecaca;
    color: #991b1b;
    border: 1px solid #fca5a5;
  }
  
  :deep(.p-tag.p-tag-warning) {
    background-color: #fef3c7;
    color: #92400e;
    border: 1px solid #fcd34d;
  }
  
  :deep(.p-tag.p-tag-success) {
    background-color: #d1fae5;
    color: #065f46;
    border: 1px solid #a7f3d0;
  }
  
  :deep(.p-tag.p-tag-info) {
    background-color: #dbeafe;
    color: #1e40af;
    border: 1px solid #93c5fd;
  }
  
  :deep(.p-tag.p-tag-secondary) {
    background-color: #f3f4f6;
    color: #4b5563;
    border: 1px solid #d1d5db;
  }
  
  /* Table responsiveness */
  .custom-table :deep(.p-datatable-wrapper) {
    overflow-x: auto;
  }
  
  /* Pagination styling */
  .custom-table :deep(.p-paginator) {
    padding: 1rem;
    border-top: 1px solid #e5e7eb;
    background-color: #f9fafb;
  }
  
  /* Header styling */
  .custom-table :deep(.p-datatable-header) {
    padding: 1rem;
    background-color: #f8fafc;
    border-bottom: 2px solid #e5e7eb;
  }
  
  .custom-table :deep(.p-datatable-thead > tr > th) {
    background-color: #f1f5f9;
    color: #1f2937;
    font-weight: 600;
    border-bottom: 2px solid #e5e7eb;
  }
  
  /* Hover effects */
  .custom-table :deep(.p-datatable-tbody > tr:hover) {
    background-color: #f8fafc;
  }
  
  /* Sort indicator styling */
  .custom-table :deep(.p-sortable-column-icon) {
    color: #6b7280;
  }
  
  .custom-table :deep(.p-sortable-column.p-highlight .p-sortable-column-icon) {
    color: #3b82f6;
  }
  
  /* Filter menu styling */
  .custom-table :deep(.p-column-filter-menu) {
    background-color: white;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }
  
  /* Scrollbar styling */
  .custom-table :deep(.p-datatable-wrapper)::-webkit-scrollbar {
    height: 8px;
  }
  
  .custom-table :deep(.p-datatable-wrapper)::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 4px;
  }
  
  .custom-table :deep(.p-datatable-wrapper)::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;
  }
  
  .custom-table :deep(.p-datatable-wrapper)::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }
  </style>