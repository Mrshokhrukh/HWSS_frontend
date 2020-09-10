<template>
  <div class="report-container">
    <div class="form-header">
      <h3 class="title">Gyalsung Screening Reports</h3>
    </div>

    <div class="content-section">
      <div class="content-header">
        <h5 class="content-title">Screening Overview</h5>
        <p class="content-subtitle">A summary of screenings based on the current filters.</p>
      </div>

      <div v-if="isLoading" class="text-center my-5">
        <ProgressSpinner strokeWidth="4" style="width: 50px; height: 50px" />
        <p class="mt-2 text-gray-600">Loading Gyalsung screenings...</p>
      </div>
      <div v-if="!isLoading && filteredScreeningData.length" class="row g-3 mb-4">
        <div class="col-sm-6 col-lg-3">
          <div class="kpi-card kpi-card-total">
            <div class="kpi-icon"><i class="pi pi-users"></i></div>
            <div class="kpi-value">{{ filteredScreeningData.length }}</div>
            <div class="kpi-label">Total Screenings</div>
          </div>
        </div>
        <div class="col-sm-6 col-lg-3">
          <div class="kpi-card kpi-card-high">
            <div class="kpi-icon"><i class="pi pi-exclamation-triangle"></i></div>
            <div class="kpi-value">{{ highRiskCount }}</div>
            <div class="kpi-label">High Risk Cases</div>
          </div>
        </div>
        <div class="col-sm-6 col-lg-3">
          <div class="kpi-card kpi-card-moderate">
            <div class="kpi-icon"><i class="pi pi-chart-line"></i></div>
            <div class="kpi-value">{{ moderateRiskCount }}</div>
            <div class="kpi-label">Moderate Risk</div>
          </div>
        </div>
        <div class="col-sm-6 col-lg-3">
          <div class="kpi-card kpi-card-low">
            <div class="kpi-icon"><i class="pi pi-check-circle"></i></div>
            <div class="kpi-value">{{ lowRiskCount }}</div>
            <div class="kpi-label">Low Risk</div>
          </div>
        </div>
      </div>

      <div class="filter-section">
        <div class="row g-3 align-items-end">
          <div class="col-12 col-md-6 col-lg-2">
            <label for="startDate" class="form-label">Start Date</label>
            <Calendar
              id="startDate"
              v-model="startDate"
              placeholder="Select Start Date"
              class="w-100"
              :disabled="isLoading"
              dateFormat="yy-mm-dd"
              :maxDate="endDate || new Date()"
              showIcon
            />
          </div>
          <div class="col-12 col-md-6 col-lg-2">
            <label for="endDate" class="form-label">End Date</label>
            <Calendar
              id="endDate"
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
          <div class="col-12 col-md-6 col-lg-2">
            <label for="academyFilter" class="form-label">Academy</label>
            <Dropdown
              id="academyFilter"
              v-model="selectedAcademy"
              :options="academyOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="All"
              class="w-100"
              :disabled="isLoading"
              showClear
            />
          </div>
          <div class="col-12 col-md-6 col-lg-3">
            <label for="search" class="form-label">Global Search</label>
            <span class="p-input-icon-left w-100">
              <i class="pi pi-search" />
              <InputText
                id="search"
                v-model="globalFilterInput"
                placeholder="Search all fields..."
                class="w-100"
                :disabled="isLoading || !screeningData.length"
              />
            </span>
          </div>
          <div class="col-12 col-lg-3">
             <div class="filter-actions">
              <Button
                label="Reset"
                @click="resetFilters"
                class="action-btn action-btn-secondary"
                icon="pi pi-refresh"
                :disabled="isLoading"
              />
              <Button
                label="Apply"
                @click="applyDateFilter"
                class="action-btn action-btn-primary"
                icon="pi pi-filter"
                :disabled="isLoading || (!startDate && !endDate && !selectedAcademy)"
              />
            </div>
          </div>
        </div>
      </div>

      <div v-if="fetchError && !isLoading" class="my-5">
        <Message severity="error" :closable="false">
          Failed to load screenings: {{ fetchError }}. Please try again later.
        </Message>
      </div>
      
      <div v-if="!isLoading && !fetchError" class="report-display-section">
        <div class="content-header">
            <h5 class="content-title">Detailed Screening Data</h5>
            <Button
                label="Download Excel"
                @click="downloadExcel"
                class="action-btn action-btn-success"
                icon="pi pi-download"
                :disabled="isDownloading || !filteredScreeningData.length"
                :loading="isDownloading"
            />
        </div>

        <div v-if="!screeningData.length" class="initial-state">
          <i class="pi pi-info-circle initial-icon"></i>
          <p class="lead">No Gyalsung screenings found. Data might still be loading or none exists.</p>
        </div>
        
        <div v-else-if="!filteredScreeningData.length" class="initial-state">
            <i class="pi pi-search initial-icon"></i>
            <p class="lead">No screenings match your current search or filter criteria.</p>
        </div>

        <div v-else class="table-wrapper">
          <DataTable
            :value="filteredScreeningData"
            :paginator="true"
            :rows="15"
            :rowsPerPageOptions="[10, 15, 25, 50]"
            paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords}"
            sortField="screening_date"
            :sortOrder="-1"
            class="profiles-table"
            :globalFilterFields="searchableFields"
            :filters="filters"
            filterDisplay="menu"
            dataKey="id"
            removableSort
            stateStorage="session"
            stateKey="dt-gyalsung-screening-state"
            responsiveLayout="scroll"
          >
            <Column
              v-for="field in basicFields"
              :key="field.key"
              :field="field.key"
              :header="field.header"
              :sortable="true"
              :style="field.width ? { width: field.width, minWidth: field.width } : {}"
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
                  <Tag :value="data[field.key]" :severity="getRiskSeverityClass(data[field.key])" />
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
                  <InputText type="text" v-model="filterModel.value" @keydown.enter="filterCallback()" class="p-column-filter" :placeholder="`Search by ${field.header}`"/>
                </template>
              </template>
            </Column>
  
            <Column
              v-for="field in mentalHealthFields"
              :key="field.key"
              :field="field.key"
              :header="field.header"
              :sortable="true"
              :style="field.width ? { width: field.width, minWidth: field.width } : {}"
              :filterField="field.key"
              :showFilterMatchModes="true"
            >
              <template #body="{ data }">
                <template v-if="field.key === 'suicidal_risk'">
                  <Tag :value="data[field.key]" :severity="getSuicideSeverityClass(data[field.key])" />
                </template>
                <template v-else>
                  <span>{{ data[field.key] || 'N/A' }}</span>
                </template>
              </template>
              <template #filter="{ filterModel, filterCallback }">
                <InputText type="text" v-model="filterModel.value" @keydown.enter="filterCallback()" class="p-column-filter" :placeholder="`Search by ${field.header}`"/>
              </template>
            </Column>
  
            <Column
              v-for="substance in substanceColumns"
              :key="substance.field"
              :field="substance.field"
              :header="substance.header"
              :sortable="true"
              :filterField="substance.field"
              :showFilterMatchModes="false"
              style="min-width: 140px;"
            >
              <template #body="{ data }">
                <Tag :value="severityText(data[substance.field] || 'none')" :severity="severityClass(data[substance.field])" />
              </template>
              <template #filter="{ filterModel, filterCallback }">
                <Dropdown v-model="filterModel.value" :options="severityFilterOptions" optionLabel="label" optionValue="value" placeholder="Any" class="p-column-filter" :showClear="true" @change="filterCallback()">
                  <template #option="slotProps">
                    <Tag :value="slotProps.option.label" :severity="slotProps.option.severity" />
                  </template>
                </Dropdown>
              </template>
            </Column>
          </DataTable>
        </div>
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
    
    for (let i = 1; i <= 150; i++) {
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
        if (score <= 4) return 'Minimal'; if (score <= 9) return 'Mild'; if (score <= 14) return 'Moderate'; if (score <= 19) return 'Moderately Severe'; return 'Severe'
      }
      const getGad7Interpretation = (score) => {
        if (score <= 4) return 'Minimal'; if (score <= 9) return 'Mild'; if (score <= 14) return 'Moderate'; return 'Severe'
      }
      
      const substanceColumnsForGeneration = [
        { field: 'tobacco_flag' }, { field: 'alcohol_flag' }, { field: 'cannabis_flag' }, { field: 'cocaine_flag' }, { field: 'amphetamine_flag' },
        { field: 'inhalants_flag' }, { field: 'sedatives_flag' }, { field: 'hallucinogens_flag' }, { field: 'opioids_flag' }
      ]
      const generateSubstanceFlags = () => {
        const flags = {}
        substanceColumnsForGeneration.forEach(substance => {
          flags[substance.field] = severityLevels[Math.floor(Math.random() * severityLevels.length)]
        })
        return flags
      }
      
      const determineOverallRisk = (phq9, gad7, suicidal) => {
        if (phq9 >= 15 || gad7 >= 15 || suicidal === 'Severe') return 'High'; if (phq9 >= 10 || gad7 >= 10 || suicidal === 'Moderate') return 'Moderate'; return 'Low'
      }
      
      const suicidalRisk = suicidalRisks[Math.floor(Math.random() * suicidalRisks.length)]
      const overallRisk = determineOverallRisk(phq9Score, gad7Score, suicidalRisk)
      
      mockData.push({
        id: i, username: `user${i.toString().padStart(3, '0')}`, full_name: `${firstName} ${lastName}`, gender: Math.random() > 0.5 ? 'Male' : 'Female',
        dob: new Date(1995 + Math.floor(Math.random() * 8), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
        identity_number: identityNumber, mobile_number: mobileNumber, academy_code: academy, village: village, screening_date: randomDate.toISOString().split('T')[0],
        phq9_score: phq9Score, phq9_interpretation: getPhq9Interpretation(phq9Score), gad7_score: gad7Score, gad7_interpretation: getGad7Interpretation(gad7Score),
        ace_score: aceScore, suicidal_risk: suicidalRisk, overall_risk: overallRisk, ...generateSubstanceFlags(),
        screened_by: `Counselor ${Math.floor(Math.random() * 5) + 1}`, status: Math.random() > 0.8 ? 'Follow-up Required' : 'Completed'
      })
    }
    return mockData.sort((a, b) => new Date(b.screening_date) - new Date(a.screening_date))
  }
  
  // --- Constants & Configuration ---
  const basicFields = [
    { key: 'id', header: 'ID', width: '80px', frozen: true }, { key: 'username', header: 'Username', width: '120px' }, { key: 'full_name', header: 'Full Name', width: '180px' },
    { key: 'gender', header: 'Gender', width: '100px' }, { key: 'dob', header: 'Date of Birth', width: '130px' }, { key: 'identity_number', header: 'Identity Number', width: '150px' },
    { key: 'mobile_number', header: 'Mobile Number', width: '140px' }, { key: 'academy_code', header: 'Academy', width: '130px' }, { key: 'village', header: 'Village', width: '120px' },
    { key: 'screening_date', header: 'Screening Date', width: '140px' }, { key: 'overall_risk', header: 'Overall Risk', width: '120px' }
  ]
  const mentalHealthFields = [
    { key: 'phq9_score', header: 'PHQ-9', width: '100px' }, { key: 'phq9_interpretation', header: 'PHQ-9 Level', width: '140px' }, { key: 'gad7_score', header: 'GAD-7', width: '100px' },
    { key: 'gad7_interpretation', header: 'GAD-7 Level', width: '140px' }, { key: 'ace_score', header: 'ACE', width: '100px' }, { key: 'suicidal_risk', header: 'Suicidal Risk', width: '130px' }
  ]
  const substanceColumns = [
    { field: 'tobacco_flag', header: 'Tobacco' }, { field: 'alcohol_flag', header: 'Alcohol' }, { field: 'cannabis_flag', header: 'Cannabis' }, { field: 'cocaine_flag', header: 'Cocaine' },
    { field: 'amphetamine_flag', header: 'Amphetamines' }, { field: 'inhalants_flag', header: 'Inhalants' }, { field: 'sedatives_flag', header: 'Sedatives' },
    { field: 'hallucinogens_flag', header: 'Hallucinogens' }, { field: 'opioids_flag', header: 'Opioids' }
  ]
  const searchableFields = computed(() => [...basicFields.map(f => f.key), ...mentalHealthFields.map(f => f.key)])
  const academyOptions = computed(() => {
    const academies = [...new Set(screeningData.value.map(item => item.academy_code))].sort()
    return academies.map(academy => ({ label: academy, value: academy }))
  })
  const riskFilterOptions = ref([
    { label: 'High', value: 'High', severity: 'danger' }, { label: 'Moderate', value: 'Moderate', severity: 'warning' }, { label: 'Low', value: 'Low', severity: 'success' }
  ])
  const severityFilterOptions = ref([
    { label: 'Severe', value: 'severe', severity: 'danger' }, { label: 'Moderate', value: 'moderate', severity: 'warning' },
    { label: 'Mild', value: 'mild', severity: 'info' }, { label: 'None', value: 'none', severity: 'success' }
  ])
  const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    ...Object.fromEntries([...basicFields, ...mentalHealthFields].map(f => [f.key, { value: null, matchMode: FilterMatchMode.CONTAINS }])),
    ...Object.fromEntries(substanceColumns.map(f => [f.field, { value: null, matchMode: FilterMatchMode.EQUALS }]))
  })
  
  // --- Computed Properties ---
  const filteredDataByDateAndAcademy = computed(() => {
    let filtered = screeningData.value
    if (startDate.value || endDate.value) {
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.screening_date)
        const start = startDate.value ? new Date(startDate.value) : null
        const end = endDate.value ? new Date(endDate.value) : null
        if (start && end) return itemDate >= start && itemDate <= end
        if (start) return itemDate >= start
        if (end) return itemDate <= end
        return true
      })
    }
    if (selectedAcademy.value) {
      filtered = filtered.filter(item => item.academy_code === selectedAcademy.value)
    }
    return filtered
  })
  
  const filteredScreeningData = computed(() => filteredDataByDateAndAcademy.value);

  const highRiskCount = computed(() => filteredScreeningData.value.filter(item => item.overall_risk === 'High').length)
  const moderateRiskCount = computed(() => filteredScreeningData.value.filter(item => item.overall_risk === 'Moderate').length)
  const lowRiskCount = computed(() => filteredScreeningData.value.filter(item => item.overall_risk === 'Low').length)
  
  // --- Methods ---
  const loadMockData = () => {
    isLoading.value = true
    fetchError.value = null
    setTimeout(() => {
      try {
        screeningData.value = generateMockData()
        const today = new Date()
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(today.getDate() - 30)
        endDate.value = today
        startDate.value = thirtyDaysAgo
      } catch (error) {
        console.error('Error loading mock data:', error)
        fetchError.value = 'Failed to generate mock screening data'
      } finally {
        isLoading.value = false
      }
    }, 1200)
  }
  
  const applyDateFilter = () => {
    // This is a placeholder for any explicit action on apply, as computed properties are reactive.
    console.log('Filters applied manually.')
  }
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'; return new Date(dateString).toLocaleDateString('en-GB')
  }
  const getRiskSeverityClass = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'high': return 'danger'; case 'moderate': return 'warning'; case 'low': return 'success'; default: return 'secondary'
    }
  }
  const getSuicideSeverityClass = (value) => {
    const lowerValue = value?.toLowerCase() || ''
    if (lowerValue.includes('severe')) return 'danger'; if (lowerValue.includes('moderate')) return 'warning';
    if (lowerValue.includes('mild')) return 'info'; if (lowerValue.includes('none')) return 'success'; return 'secondary'
  }
  const severityText = (value) => ({ severe: 'Severe', moderate: 'Moderate', mild: 'Mild', none: 'None' })[value] || 'N/A'
  const severityClass = (value) => ({ severe: 'danger', moderate: 'warning', mild: 'info', none: 'success' })[value] || 'secondary'
  const getDataType = (key) => {
    if (key === 'dob' || key === 'screening_date') return 'date'; if (key.includes('score')) return 'numeric'; return 'text'
  }
  
  const downloadExcel = async () => {
    isDownloading.value = true
    try {
      const dataToExport = filteredScreeningData.value.map(item => ({
        'ID': item.id, 'Username': item.username, 'Full Name': item.full_name, 'Gender': item.gender, 'Date of Birth': item.dob, 'Identity Number': item.identity_number,
        'Mobile Number': item.mobile_number, 'Academy Code': item.academy_code, 'Village': item.village, 'Screening Date': item.screening_date, 'Overall Risk': item.overall_risk,
        'PHQ-9 Score': item.phq9_score, 'PHQ-9 Interpretation': item.phq9_interpretation, 'GAD-7 Score': item.gad7_score, 'GAD-7 Interpretation': item.gad7_interpretation,
        'ACE Score': item.ace_score, 'Suicidal Risk': item.suicidal_risk, 'Tobacco': severityText(item.tobacco_flag), 'Alcohol': severityText(item.alcohol_flag),
        'Cannabis': severityText(item.cannabis_flag), 'Cocaine': severityText(item.cocaine_flag), 'Amphetamines': severityText(item.amphetamine_flag), 'Inhalants': severityText(item.inhalants_flag),
        'Sedatives': severityText(item.sedatives_flag), 'Hallucinogens': severityText(item.hallucinogens_flag), 'Opioids': severityText(item.opioids_flag), 'Screened By': item.screened_by, 'Status': item.status
      }))
      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.json_to_sheet(dataToExport)
      ws['!cols'] = Object.keys(dataToExport[0] || {}).map(key => ({ wch: Math.max(key.length, 15) }))
      XLSX.utils.book_append_sheet(wb, ws, 'Gyalsung Screenings')
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const startDateStr = startDate.value ? new Date(startDate.value).toISOString().slice(0, 10) : 'start'
      const endDateStr = endDate.value ? new Date(endDate.value).toISOString().slice(0, 10) : 'today'
      saveAs(blob, `Gyalsung_Screenings_${startDateStr}_to_${endDateStr}.xlsx`)
    } catch (error) {
      console.error('Error generating Excel file:', error)
    } finally {
      isDownloading.value = false
    }
  }
  
  const resetFilters = () => {
    const today = new Date()
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(today.getDate() - 30)
    startDate.value = thirtyDaysAgo
    endDate.value = today
    
    selectedAcademy.value = null
    globalFilterInput.value = ''
    Object.keys(filters.value).forEach(key => {
      if (filters.value[key]) { filters.value[key].value = null }
    })
  }
  
  // --- Lifecycle & Watchers ---
  onMounted(loadMockData)
  watch(globalFilter, (newSearchTerm) => { filters.value.global.value = newSearchTerm })

</script>

<style scoped>
/* Core Styles from Example */
.report-container { background: linear-gradient(135deg, #e6f3f5, #f0f7f8); border-radius: 16px; padding: 1.5rem; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"; }
.form-header { text-align: center; margin-bottom: 2rem; }
.title { color: #2b656f; font-weight: 600; }
.content-section { background: #ffffff; border-radius: 12px; padding: 2rem; box-shadow: 0 4px 20px rgba(43, 101, 111, 0.08); }
.content-header {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid #e9f3f3;
}
.content-title { color: #2b656f; font-weight: 600; margin: 0; }
.content-subtitle { color: #7d979d; font-size: 0.9rem; margin: 0.25rem 0 0 0; }

/* Filter Section */
.filter-section {
    background-color: #f8fbfb; border-radius: 8px; padding: 1.5rem;
    margin-bottom: 2rem; border: 1px solid #e9f1f3;
}
.form-label { font-weight: 500; color: #3e5a60; font-size: 0.9rem; margin-bottom: 0.5rem; display: block; }

/* PrimeVue Input Overrides */
:deep(.p-inputtext),
:deep(.p-dropdown .p-dropdown-label),
:deep(.p-calendar .p-inputtext) {
    background: #fff !important;
    border-color: rgba(43, 101, 111, 0.2) !important;
    transition: all 0.3s ease;
    width: 100%;
}

:deep(.p-inputtext:focus),
:deep(.p-dropdown.p-focus),
:deep(.p-calendar.p-inputwrapper-focus) {
    outline: none !important;
    border-color: #2b656f !important;
    box-shadow: 0 0 0 3px rgba(43, 101, 111, 0.1) !important;
}

:deep(.p-calendar .p-inputtext) {
    border-right: 0;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
}

:deep(.p-calendar .p-datepicker-trigger) {
    background-color: #f0f7f8 !important; /* Light background for the icon button */
    border-color: rgba(43, 101, 111, 0.2) !important;
    color: #2b656f !important; /* Icon color */
    border-left: 1px solid rgba(43, 101, 111, 0.2) !important;
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
}

:deep(.p-calendar .p-datepicker-trigger:hover) {
    background-color: #e6f3f5 !important;
    color: #1d4851 !important;
}

.filter-actions { display: flex; justify-content: flex-end; gap: 0.75rem; width: 100%; }

/* Action Buttons */
:deep(.action-btn) { border: none; padding: 0.6rem 1.25rem; border-radius: 6px; cursor: pointer; font-size: 0.9rem; font-weight: 500; transition: all 0.2s ease; }
:deep(.action-btn-primary) { background-color: #2b656f !important; color: #ffffff !important; }
:deep(.action-btn-primary:hover) { background-color: #1d4851 !important; }
:deep(.action-btn-secondary) { background-color: #f5f9fa !important; color: #3e5a60 !important; border: 1px solid #d3e0e3 !important; }
:deep(.action-btn-secondary:hover) { background-color: #e9f1f3 !important; }
:deep(.action-btn-success) { background-color: #43a047 !important; color: #fff !important; border-color: #43a047 !important; }
:deep(.action-btn-success:hover) { background-color: #388e3c !important; }
:deep(.p-button.p-button-icon-only) { width: auto; }

/* Report Display & KPI Cards */
.report-display-section { padding-top: 1rem; }
.kpi-card {
    border: 1px solid #e9f1f3; border-radius: 8px;
    padding: 1.5rem 1rem; text-align: center; height: 100%;
    display: flex; flex-direction: column; justify-content: center; transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.kpi-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 12px rgba(43, 101, 111, 0.1);
}
.kpi-icon {
    font-size: 2.25rem;
    margin-bottom: 0.75rem;
}
.kpi-value { font-size: 2.25rem; font-weight: 700; line-height: 1; }
.kpi-label { font-size: 0.9rem; margin-top: 0.25rem; }

.kpi-card-total { background-color: #eff6ff; border-color: #bfdbfe; }
.kpi-card-total .kpi-icon, .kpi-card-total .kpi-value { color: #1e40af; }
.kpi-card-total .kpi-label { color: #1d4ed8; }

.kpi-card-high { background-color: #fef2f2; border-color: #fecaca; }
.kpi-card-high .kpi-icon, .kpi-card-high .kpi-value { color: #b91c1c; }
.kpi-card-high .kpi-label { color: #991b1b; }

.kpi-card-moderate { background-color: #fffbeb; border-color: #fde68a; }
.kpi-card-moderate .kpi-icon, .kpi-card-moderate .kpi-value { color: #b45309; }
.kpi-card-moderate .kpi-label { color: #92400e; }

.kpi-card-low { background-color: #f0fdf4; border-color: #bbf7d0; }
.kpi-card-low .kpi-icon, .kpi-card-low .kpi-value { color: #166534; }
.kpi-card-low .kpi-label { color: #15803d; }


/* Table Styling */
.table-wrapper { overflow-x: auto; border: 1px solid #e9f1f3; border-radius: 8px; }
:deep(.profiles-table) { width: 100%; border-collapse: collapse; white-space: nowrap; }
:deep(.profiles-table .p-datatable-thead > tr > th) {
    background-color: #2b656f !important; color: #ffffff !important;
    padding: 1rem; text-align: left; font-weight: 600; font-size: 0.85rem;
    text-transform: uppercase; border: none;
}
:deep(.profiles-table .p-datatable-tbody > tr) { border-bottom: 1px solid #e9f1f3; }
:deep(.profiles-table .p-datatable-tbody > tr:last-child) { border-bottom: none; }
:deep(.profiles-table .p-datatable-tbody > tr > td) {
    padding: 0.85rem 1rem; vertical-align: middle; color: #3e5a60; font-size: 0.9rem; border: none;
}
:deep(.profiles-table .p-datatable-tbody > tr:hover) { background-color: #f8fbfb !important; }
:deep(.profiles-table .p-datatable-frozen-column) {
    background-color: #fdfdfd !important;
    border-right: 2px solid #e9f1f3 !important;
}

/* Tag Customization */
:deep(.p-tag) {
    max-width: 100%; white-space: normal; text-align: center; display: block;
    font-size: 0.8rem; padding: 0.3rem 0.6rem; border-radius: 6px; font-weight: 500;
}
:deep(.p-tag-danger)  { background-color: #fbe9e9; color: #c33a3a; }
:deep(.p-tag-warning) { background-color: #fff6e4; color: #c5821c; }
:deep(.p-tag-success) { background-color: #e9f6eb; color: #3a8a4f; }
:deep(.p-tag-info)    { background-color: #e8f4fe; color: #2c72c6; }

/* Initial/Empty State */
.initial-state { text-align: center; padding: 4rem 1rem; background-color: #f8fbfb; border-radius: 8px; }
.initial-icon { font-size: 3rem; color: #d3e0e3; margin-bottom: 1rem; }
.initial-state .lead { color: #7d979d; }

/* Responsive Grid Helpers */
.row { display: flex; flex-wrap: wrap; margin-right: -0.5rem; margin-left: -0.5rem; }
.g-3 { gap: 1rem 0; }
.col-12, .col-md-6, .col-lg-2, .col-lg-3, .col-sm-6 {
  padding-right: 0.5rem; padding-left: 0.5rem; box-sizing: border-box;
}
.col-12 { flex: 0 0 100%; max-width: 100%; }
.align-items-end { align-items: flex-end !important; }

@media (min-width: 576px) {
  .col-sm-6 { flex: 0 0 50%; max-width: 50%; }
}
@media (min-width: 768px) {
  .col-md-6 { flex: 0 0 50%; max-width: 50%; }
}
@media (min-width: 992px) {
  .col-lg-2 { flex: 0 0 16.66667%; max-width: 16.66667%; }
  .col-lg-3 { flex: 0 0 25%; max-width: 25%; }
}
</style>