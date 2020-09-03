<template>
  <div class="data-export-reporting-tab">
    <div class="export-container">
      <!-- Data Export Section -->
      <section class="export-section">
        <div class="section-header">
          <i class="pi pi-download header-icon"></i>
          <h4 class="section-title">Data Export</h4>
        </div>
        <div class="export-options">
          <div class="form-grid">
            <div class="form-group">
              <label for="file-format">File Format</label>
              <Dropdown
                id="file-format"
                v-model="selectedFormat"
                :options="exportFormats"
                optionLabel="label"
                optionValue="value"
                placeholder="Select Format"
                class="w-100"
              />
            </div>

            <div class="form-group">
              <label for="data-scope">Data Scope</label>
              <MultiSelect
                id="data-scope"
                v-model="selectedDataScope"
                :options="dataScopeOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Select Data"
                display="chip"
                class="w-100"
              />
            </div>

            <Button
              label="Export Data"
              icon="pi pi-download"
              @click="handleExport"
              :disabled="isLoading"
              class="gradient-btn"
            />
          </div>
          <div v-if="isLoading" class="loading-overlay">
            <ProgressSpinner />
          </div>
        </div>
      </section>

      <!-- Report Generation Section -->
      <section class="report-section">
        <div class="section-header">
          <i class="pi pi-file header-icon"></i>
          <h4 class="section-title">Report Generation</h4>
        </div>
        <div class="report-options">
          <div class="form-grid">
            <div class="form-group">
              <label for="report-type">Report Type</label>
              <Dropdown
                id="report-type"
                v-model="selectedReportType"
                :options="reportTypes"
                optionLabel="label"
                optionValue="value"
                placeholder="Select Report Type"
                class="w-100"
              />
            </div>

            <Button
              label="Generate Report"
              icon="pi pi-file"
              @click="handleGenerateReport"
              :disabled="isGeneratingReport"
              class="gradient-btn"
            />
          </div>
          <div v-if="isGeneratingReport" class="loading-overlay">
            <ProgressSpinner />
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, inject } from 'vue'
import { useToast } from 'primevue/usetoast'
import Dropdown from 'primevue/dropdown'
import MultiSelect from 'primevue/multiselect'
import Button from 'primevue/button'
import apiClient from '@/apiClient'
import { saveAs } from 'file-saver'
import * as XLSX from 'xlsx' // Import the entire xlsx library
import ProgressSpinner from 'primevue/progressspinner'

const props = defineProps({
  filteredData: {
    type: Array,
    required: true
  }
})

const toast = useToast()

const isLoading = ref(false)
const isGeneratingReport = ref(false)
const selectedFormat = ref(null)
const selectedDataScope = ref([])
const selectedReportType = ref(null)

const exportFormats = [
  { label: 'CSV', value: 'csv' },
  { label: 'Excel', value: 'xlsx' },
  { label: 'JSON', value: 'json' }
]

const dataScopeOptions = [
  { label: 'Referral Data', value: 'referral' },
  { label: 'Assessment Data', value: 'assessment' },
  { label: 'Demographic Data', value: 'demographic' },
  { label: 'Substance Use Data', value: 'substance' }
  // Add more data scope options as needed
]

const reportTypes = [
  { label: 'Summary Report', value: 'summary' },
  { label: 'Detailed Report', value: 'detailed' }
  // Add more report types as needed
]

const handleExport = async () => {
  if (!selectedFormat.value) {
    toast.add({
      severity: 'warn',
      summary: 'Warning',
      detail: 'Please select a file format',
      life: 3000
    })
    return
  }
  if (selectedDataScope.value.length === 0) {
    toast.add({
      severity: 'warn',
      summary: 'Warning',
      detail: 'Please select at least one data scope',
      life: 3000
    })
    return
  }

  isLoading.value = true

  try {
    // Simulate API call or data processing
    const dataToExport = prepareDataForExport(props.filteredData, selectedDataScope.value)

    if (selectedFormat.value === 'csv') {
      const csv = convertToCSV(dataToExport)
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      saveAs(blob, 'data.csv')
    } else if (selectedFormat.value === 'xlsx') {
      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.json_to_sheet(dataToExport)
      XLSX.utils.book_append_sheet(wb, ws, 'Data')
      XLSX.writeFile(wb, 'data.xlsx')
    } else if (selectedFormat.value === 'json') {
      const json = JSON.stringify(dataToExport, null, 2)
      const blob = new Blob([json], { type: 'application/json' })
      saveAs(blob, 'data.json')
    }

    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Data exported successfully',
      life: 3000
    })
  } catch (error) {
    console.error('Error exporting data:', error)
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to export data', life: 3000 })
  } finally {
    isLoading.value = false
  }
}

const handleGenerateReport = () => {
  isGeneratingReport.value = true

  // Simulate report generation
  setTimeout(() => {
    isGeneratingReport.value = false
    toast.add({
      severity: 'info',
      summary: 'Report Generated',
      detail: `Report type: ${selectedReportType.value}`,
      life: 3000
    })
  }, 2000) // Simulate a 2-second delay
}

// Helper functions for data export (you'll need to implement these)

function prepareDataForExport(data, scope) {
  let exportedData = []

  if (scope.includes('referral')) {
    exportedData = exportedData.concat(
      data.map((item) => ({
        'Referral Date': item.date,
        'Referral Source': item.user?.active_agency?.agency_name,
        'Referral Status': item.referred
        // ... add other relevant referral fields
      }))
    )
  }

  if (scope.includes('assessment')) {
    exportedData = exportedData.concat(
      data.map((item) => ({
        'Assessment Status': item.assessment_status,
        'PHQ-9 Score': item.screening_data?.phq_score,
        'PHQ-9 Interpretation': item.screening_data?.phq_interpretation,
        'GAD-7 Score': item.screening_data?.gad_score,
        'GAD-7 Interpretation': item.screening_data?.gad_interpretation
        // ... add other relevant assessment fields
      }))
    )
  }

  if (scope.includes('demographic')) {
    exportedData = exportedData.concat(
      data.map((item) => ({
        Age: calculateAge(item.user?.date_of_birth),
        Gender: item.user?.gender,
        Dzongkhag: item.user?.perm_add_dzongkhag
        // ... add other relevant demographic fields
      }))
    )
  }

  if (scope.includes('substance')) {
    exportedData = exportedData.concat(
      data.map((item) => {
        const eventSubstanceRisks = item.event_substance_risks
          ? item.event_substance_risks
              .map((risk) => `${risk.substance_name}: ${risk.risk_flag}`)
              .join('; ')
          : ''
        const caseSubstanceRisks = item.case_substance_risks
          ? item.case_substance_risks
              .map((risk) => `${risk.substance_name}: ${risk.risk_flag}`)
              .join('; ')
          : ''

        return {
          'Event Substance Risks': eventSubstanceRisks,
          'Case Substance Risks': caseSubstanceRisks
        }
      })
    )
  }

  // Deduplicate data: If the same field is included in multiple scopes, ensure it's only added once
  const uniqueData = exportedData.reduce((acc, current) => {
    const x = acc.find((item) => JSON.stringify(item) === JSON.stringify(current))
    if (!x) {
      return acc.concat([current])
    } else {
      return acc
    }
  }, [])

  return uniqueData
}

function convertToCSV(data) {
  if (!data || data.length === 0) return ''

  const columnDelimiter = ','
  const lineDelimiter = '\n'
  const keys = Object.keys(data[0])

  let result = ''
  result += keys.join(columnDelimiter)
  result += lineDelimiter

  data.forEach((item) => {
    let ctr = 0
    keys.forEach((key) => {
      if (ctr > 0) result += columnDelimiter
      result += item[key] ? `"${item[key]}"` : ''
      ctr++
    })
    result += lineDelimiter
  })

  return result
}

// Placeholder function for report generation logic
function generateReport(type, data) {
  toast.add({
    severity: 'info',
    summary: 'Report Generated',
    detail: `Generating ${type} report. This is a placeholder action.`,
    life: 3000
  })
}
</script>

<style scoped>
.data-export-reporting-tab {
  padding: 1.5rem;
}

.export-container {
  max-width: 1200px;
  margin: 0 auto;
}

.export-section,
.report-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  padding: 2rem;
  margin-bottom: 2rem;
}

.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
  gap: 0.75rem;
}

.header-icon {
  font-size: 1.5rem;
  color: #2b656f;
}

.section-title {
  color: #2b656f;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
}

.form-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  align-items: start;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  color: #495057;
  margin-bottom: 0.25rem;
}

/* Custom styling for PrimeVue components */
:deep(.p-dropdown),
:deep(.p-multiselect) {
  width: 100%;
  border-radius: 8px;
}

:deep(.p-dropdown:not(.p-disabled):hover),
:deep(.p-multiselect:not(.p-disabled):hover) {
  border-color: #2b656f;
}

:deep(.p-dropdown.p-focus),
:deep(.p-multiselect.p-focus) {
  box-shadow: 0 0 0 2px rgba(43, 101, 111, 0.2);
  border-color: #2b656f;
}

/* Gradient button styling */
.gradient-btn {
  background: linear-gradient(135deg, rgba(43, 101, 111, 0.95) 0%, rgba(29, 72, 81, 0.95) 100%);
  border: none;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.gradient-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(43, 101, 111, 0.2);
}

.gradient-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  z-index: 10;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .data-export-reporting-tab {
    padding: 1rem;
  }

  .export-section,
  .report-section {
    padding: 1.5rem;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>