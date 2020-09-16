<template>
  <div>
    <!-- Gyalsung Filters -->
    <div class="filters-section mb-4">
      <div class="row g-3">
        <div class="col-12 col-md-2">
          <label class="form-label">Start Date</label>
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
        <div class="col-12 col-md-2">
          <label class="form-label">End Date</label>
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
        <div class="col-12 col-md-3">
          <label class="form-label">Search</label>
          <span class="p-input-icon-left w-100">
            <i class="pi pi-search" />
            <InputText
              v-model="gyalsungGlobalFilterInput"
              placeholder="Search Reports..."
              class="w-100"
              :disabled="isLoading || !filteredScreeningData.length"
            />
          </span>
        </div>
        <div class="col-12 col-md-2">
          <label class="form-label">Academy</label>
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
          <label class="form-label">Actions</label>
          <div class="action-buttons">
            <Button
              label="Apply Filter"
              @click="applyDateFilter"
              class="action-btn primary-btn"
              icon="pi pi-filter"
              :disabled="isLoading || (!startDate && !endDate)"
            />
            <Button
              label="Clear"
              @click="clearFilters"
              class="action-btn secondary-btn"
              icon="pi pi-refresh"
              :disabled="isLoading"
            />
            <Button
              label="Download"
              @click="downloadGyalsungExcel"
              class="action-btn success-btn"
              icon="pi pi-download"
              :disabled="isLoading || isDownloading || !filteredScreeningData.length"
              :loading="isDownloading"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Summary Stats -->
    <div class="stats-section mb-4" v-if="!isLoading && filteredScreeningData.length">
      <div class="row g-3">
        <div class="col-12 col-sm-6 col-md-3">
          <div class="stat-card total-screenings">
            <div class="stat-icon">
              <i class="pi pi-users"></i>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ filteredScreeningData.length }}</div>
              <div class="stat-label">Total Screenings</div>
            </div>
          </div>
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <div class="stat-card registered-count">
            <div class="stat-icon">
              <i class="pi pi-user-plus"></i>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ registeredCount }}</div>
              <div class="stat-label">Registered</div>
            </div>
          </div>
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <div class="stat-card screened-count">
            <div class="stat-icon">
              <i class="pi pi-check-circle"></i>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ screenedCount }}</div>
              <div class="stat-label">Screened</div>
            </div>
          </div>
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <div class="stat-card pending-count">
            <div class="stat-icon">
              <i class="pi pi-clock"></i>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ pendingCount }}</div>
              <div class="stat-label">Pending</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Gyalsung Report Table -->
    <div class="table-section" v-if="!isLoading && !fetchError">
      <div v-if="!filteredScreeningData.length && !gyalsungGlobalFilterInput" class="empty-state">
        <div class="empty-icon">
          <i class="pi pi-info-circle"></i>
        </div>
        <div class="empty-message">
          <h5>No Data Found</h5>
          <p>No Gyalsung screenings found for the selected criteria. Try adjusting your filters.</p>
        </div>
      </div>
      
      <div v-else-if="!filteredScreeningData.length && gyalsungGlobalFilterInput" class="empty-state">
        <div class="empty-icon">
          <i class="pi pi-search"></i>
        </div>
        <div class="empty-message">
          <h5>No Results Found</h5>
          <p>No screenings match your search criteria. Try different search terms.</p>
        </div>
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
        sortField="appointment_date"
        :sortOrder="-1"
        class="modern-table"
        :globalFilterFields="['name', 'cid', 'hospital', 'status']"
        :filters="gyalsungFilters"
        filterDisplay="menu"
        dataKey="sl_no"
        removableSort
        stateStorage="session"
        stateKey="dt-gyalsung-screening-state"
        responsiveLayout="scroll"
      >
        <!-- Table Columns -->
        <Column
          v-for="field in gyalsungBasicFields"
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
            <template v-if="field.key === 'dob' || field.key === 'appointment_date'">
              <span class="date-cell">{{ formatDate(data[field.key]) }}</span>
            </template>
            <template v-else-if="field.key === 'status'">
              <Tag
                :value="data[field.key]"
                :severity="getStatusSeverityClass(data[field.key])"
                class="status-tag"
              />
            </template>
            <template v-else>
              <span>{{ data[field.key] || 'N/A' }}</span>
            </template>
          </template>
          <template #filter="{ filterModel, filterCallback }">
            <template v-if="field.key === 'status'">
              <Dropdown
                v-model="filterModel.value"
                :options="statusFilterOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Any Status"
                class="p-column-filter"
                :showClear="true"
                @change="filterCallback()"
              />
            </template>
            <template v-else>
              <InputText
                type="text"
                v-model="filterModel.value"
                @keydown.enter="filterCallback()"
                class="p-column-filter"
                :placeholder="`Search ${field.header}`"
              />
            </template>
          </template>
        </Column>

        <template #empty>
          <div class="table-empty-state">
            <i class="pi pi-search text-4xl text-gray-400 mb-3"></i>
            <p class="text-gray-600">No screenings match your current filter settings.</p>
          </div>
        </template>
      </DataTable>
    </div>

    <!-- Loading Indicator -->
    <div v-if="isLoading" class="loading-state">
      <ProgressSpinner strokeWidth="4" style="width: 50px; height: 50px" />
      <p>Loading Gyalsung reports...</p>
    </div>

    <!-- Fetch Error Message -->
    <div v-if="fetchError && !isLoading" class="error-state">
      <div class="error-icon">
        <i class="pi pi-exclamation-triangle"></i>
      </div>
      <div class="error-message">
        <h5>Error Loading Reports</h5>
        <p>{{ fetchError }}. Please try again later.</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed, watch } from 'vue'
import { saveAs } from 'file-saver'
import * as XLSX from 'xlsx'
import { FilterMatchMode } from 'primevue/api'
import { useDebounce } from '@vueuse/core'
import endpoints from '@/api.js'
import apiClient from '@/apiClient'
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

export default {
  name: 'GyalsungReportContent',
  components: {
    DataTable,
    Column,
    Button,
    InputText,
    Dropdown,
    Tag,
    Calendar,
    ProgressSpinner,
    Message
  },
  setup() {
    // Gyalsung Data
    const screeningData = ref([])
    const gyalsungGlobalFilterInput = ref('')
    const gyalsungGlobalFilter = useDebounce(gyalsungGlobalFilterInput, 300)
    const startDate = ref(null)
    const endDate = ref(null)
    const selectedAcademy = ref(null)

    // Common State
    const isLoading = ref(false)
    const isDownloading = ref(false)
    const fetchError = ref(null)
    const userDetails = ref(null)

    // Gyalsung Table Fields
    const gyalsungBasicFields = [
      { key: 'sl_no', header: 'Sl.No', width: '80px', frozen: true },
      { key: 'name', header: 'Name', width: '180px' },
      { key: 'cid', header: 'CID', width: '150px' },
      { key: 'dob', header: 'Date of Birth', width: '130px' },
      { key: 'gender', header: 'Gender', width: '100px' },
      { key: 'mobile_personal', header: 'Mobile No.(Personal)', width: '150px' },
      { key: 'mobile_guardian', header: 'Mobile No.(Guardian)', width: '150px' },
      { key: 'hospital', header: 'Hospital', width: '200px' },
      { key: 'appointment_date', header: 'Appointment Date', width: '140px' },
      { key: 'status', header: 'Status', width: '120px' }
    ]

    const gyalsungSearchableFields = computed(() => 
      gyalsungBasicFields.map(f => f.key)
    )

    const academyOptions = computed(() => {
      const academies = [...new Set(screeningData.value.map(item => item.academy_code))].sort()
      return academies.map(academy => ({ label: academy, value: academy }))
    })
    
    const statusFilterOptions = ref([
      { label: 'Registered', value: 'Registered', severity: 'info' },
      { label: 'Screened', value: 'Screened', severity: 'success' },
      { label: 'Pending', value: 'Pending', severity: 'warning' },
      { label: 'Cancelled', value: 'Cancelled', severity: 'danger' }
    ])

    // Filters
    const gyalsungFilters = ref({
      global: { value: null, matchMode: FilterMatchMode.CONTAINS },
      ...Object.fromEntries(
        gyalsungBasicFields.map(f => [f.key, { value: null, matchMode: FilterMatchMode.CONTAINS }])
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

    // Status-based counts instead of risk-based
    const registeredCount = computed(() => 
      filteredScreeningData.value.filter(item => item.status === 'Registered').length
    )

    const screenedCount = computed(() => 
      filteredScreeningData.value.filter(item => item.status === 'Screened').length
    )

    const pendingCount = computed(() => 
      filteredScreeningData.value.filter(item => item.status === 'Pending').length
    )

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
        return parsedDetails
      } catch (error) {
        console.error('Error parsing user details:', error)
        fetchError.value = 'Could not load user details.'
        return null
      }
    }

    const fetchGyalsungScreenings = async () => {
      isLoading.value = true
      fetchError.value = null
      
      try {
        // Get CSRF token first
        const csrfResponse = await axios.get(endpoints.getCSRFToken, {
          withCredentials: true
        })
        
        const csrfToken = csrfResponse.data.csrfToken
        
        // Use the Gyalsung API endpoint instead of monitoring
        const response = await axios.get('http://0.0.0.0:8123/api/v1/gyalsung/counselor-users/', {
          headers: {
            'X-CSRFToken': csrfToken
          },
          withCredentials: true
        })
        
        if (response.data) {
          // Transform the API response to match our expected format
          screeningData.value = transformGyalsungData(response.data)
          
          // Set default date range to last 30 days
          const today = new Date()
          const thirtyDaysAgo = new Date()
          thirtyDaysAgo.setDate(today.getDate() - 30)
          
          endDate.value = today
          startDate.value = thirtyDaysAgo
        } else {
          throw new Error('Failed to fetch screening data')
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
    
    // Transform Gyalsung API data to our format
    const transformGyalsungData = (apiData) => {
      let userData = []
      
      // Handle different response formats
      if (Array.isArray(apiData)) {
        userData = apiData
      } else if (apiData?.user_details) {
        userData = apiData.user_details
      } else if (apiData?.data) {
        userData = apiData.data
      } else if (apiData?.users) {
        userData = apiData.users
      }
      
      return userData.map((user, index) => {
        // Transform the data to match the Excel format
        return {
          sl_no: user.sl_no || user.id || index + 1,
          name: user.name || user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unknown',
          cid: user.cid || user.identity_number || user.citizen_id || '',
          dob: user.dob || user.date_of_birth || '',
          gender: user.gender || 'Unknown',
          mobile_personal: user.mobile_personal || user.mobile_number || user.contact || '',
          mobile_guardian: user.mobile_guardian || user.guardian_contact || '',
          hospital: user.hospital || user.hospital_name || '',
          appointment_date: user.appointment_date || user.appointmentDate || '',
          status: user.status || user.appointment_status || 'Registered'
        }
      })
    }

    const loadMockData = () => {
      // Mock data for development
      const academies = ['GYACS-001', 'GYACS-002', 'GYACS-003', 'GYACS-004', 'GYACS-005']
      const firstNames = ['Tenzin', 'Karma', 'Pema', 'Sonam', 'Dorji', 'Choden', 'Tashi', 'Norbu', 'Yangchen', 'Phurba']
      const lastNames = ['Wangchuk', 'Dorji', 'Tshering', 'Namgay', 'Choden', 'Penjor', 'Gyeltshen', 'Norbu', 'Lhamo', 'Zangmo']
      const hospitals = ['Paro Hospital, Paro', 'Central Regional Referral Hospital, Gelephu', 'JDWNRH, Thimphu', 'Mongar Hospital, Mongar']
      const statusOptions = ['Registered', 'Screened', 'Pending', 'Cancelled']

      const mockData = []
      
      for (let i = 1; i <= 50; i++) {
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
        const academy = academies[Math.floor(Math.random() * academies.length)]
        const hospital = hospitals[Math.floor(Math.random() * hospitals.length)]
        const status = statusOptions[Math.floor(Math.random() * statusOptions.length)]
        
        const randomDate = new Date()
        randomDate.setDate(randomDate.getDate() - Math.floor(Math.random() * 730))
        
        const identityNumber = `${Math.floor(Math.random() * 9) + 1}${Math.floor(Math.random() * 900000000) + 100000000}`
        const mobileNumber = `${Math.random() > 0.5 ? '17' : '77'}${Math.floor(Math.random() * 900000) + 100000}`
        
        mockData.push({
          sl_no: i,
          name: `${firstName} ${lastName}`,
          cid: identityNumber,
          dob: new Date(1995 + Math.floor(Math.random() * 8), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
          gender: Math.random() > 0.5 ? 'Male' : 'Female',
          mobile_personal: mobileNumber,
          mobile_guardian: `${Math.random() > 0.5 ? '17' : '77'}${Math.floor(Math.random() * 900000) + 100000}`,
          hospital: hospital,
          appointment_date: randomDate.toISOString().split('T')[0],
          status: status,
          academy_code: academy,
          screening_date: randomDate.toISOString().split('T')[0]
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

    const clearFilters = () => {
      startDate.value = null
      endDate.value = null
      selectedAcademy.value = null
      gyalsungGlobalFilterInput.value = ''
      gyalsungFilters.value.global.value = null
      
      // Clear individual column filters
      Object.keys(gyalsungFilters.value).forEach(key => {
        if (key !== 'global') {
          gyalsungFilters.value[key].value = null
        }
      })
    }

    const formatDate = (dateString) => {
      if (!dateString) return 'N/A'
      return new Date(dateString).toLocaleDateString('en-GB')
    }
    
    const getStatusSeverityClass = (status) => {
      switch (status?.toLowerCase()) {
        case 'registered': return 'info'
        case 'screened': return 'success'
        case 'pending': return 'warning'
        case 'cancelled': return 'danger'
        default: return 'secondary'
      }
    }

    const getDataType = (key) => {
      if (key === 'dob' || key === 'screening_date' || key === 'appointment_date') return 'date'
      if (key.includes('score')) return 'numeric'
      return 'text'
    }

    const downloadGyalsungExcel = async () => {
      isDownloading.value = true
      try {
        // Get CSRF token first
        const csrfResponse = await axios.get(endpoints.getCSRFToken, {
          withCredentials: true
        })
        
        const csrfToken = csrfResponse.data.csrfToken
        
        // Prepare parameters for the API call
        const params = {}
        if (startDate.value) params.start_date = formatDateForAPI(startDate.value)
        if (endDate.value) params.end_date = formatDateForAPI(endDate.value)
        if (selectedAcademy.value) params.academy_code = selectedAcademy.value
        
        // Use the same counselor report API with password protection
        const response = await axios.get(endpoints.generateCounselorXLSEncryptedReport, {
          params: params,
          headers: {
            'X-CSRFToken': csrfToken
          },
          responseType: 'blob',
          withCredentials: true
        })
        
        // Create filename with date range
        const startDateStr = startDate.value ? formatDateForAPI(startDate.value) : 'all'
        const endDateStr = endDate.value ? formatDateForAPI(endDate.value) : 'all'
        const filename = `Gyalsung_Reports_${startDateStr}_to_${endDateStr}.xlsx`
        
        // Download the file
        const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
        saveAs(blob, filename)
        
      } catch (error) {
        console.error('Error downloading Gyalsung Excel:', error)
        
        // Fallback: Generate Excel client-side if API fails
        try {
          // Prepare data for export (only the fields we need)
          const exportData = filteredScreeningData.value.map(item => ({
            'Sl.No': item.sl_no,
            'Name': item.name,
            'CID': item.cid,
            'DOB': item.dob ? formatDate(item.dob) : 'N/A',
            'Gender': item.gender,
            'Mobile No.(Personal)': item.mobile_personal,
            'Mobile No.(Guardian)': item.mobile_guardian,
            'Hospital': item.hospital,
            'Appointment Date': item.appointment_date ? formatDate(item.appointment_date) : 'N/A',
            'Status': item.status
          }))
          
          const worksheet = XLSX.utils.json_to_sheet(exportData)
          const workbook = XLSX.utils.book_new()
          XLSX.utils.book_append_sheet(workbook, worksheet, 'Gyalsung Reports')
          
          const startDateStr = startDate.value ? formatDateForAPI(startDate.value) : 'all'
          const endDateStr = endDate.value ? formatDateForAPI(endDate.value) : 'all'
          const filename = `Gyalsung_Reports_${startDateStr}_to_${endDateStr}.xlsx`
          
          XLSX.writeFile(workbook, filename)
        } catch (fallbackError) {
          console.error('Fallback Excel generation failed:', fallbackError)
          alert('Failed to download Excel file. Please try again.')
        }
      } finally {
        isDownloading.value = false
      }
    }

    const formatDateForAPI = (date) => {
      if (!date) return ''
      return new Date(date).toISOString().split('T')[0]
    }

    // --- Lifecycle Hooks ---
    onMounted(() => {
      if (getUserDetailsFromStorage()) {
        fetchGyalsungScreenings()
      } else {
        isLoading.value = false
        fetchError.value = 'User details not found. Cannot load reports.'
      }
    })

    // --- Watchers ---
    watch(gyalsungGlobalFilter, (newValue) => {
      gyalsungFilters.value.global.value = newValue
    })

    return {
      // State
      screeningData,
      gyalsungGlobalFilterInput,
      startDate,
      endDate,
      selectedAcademy,
      isLoading,
      isDownloading,
      fetchError,
      
      // Computed
      filteredScreeningData,
      registeredCount,
      screenedCount,
      pendingCount,
      academyOptions,
      
      // Constants
      gyalsungBasicFields,
      gyalsungSearchableFields,
      statusFilterOptions,
      gyalsungFilters,
      
      // Methods
      applyDateFilter,
      clearFilters,
      downloadGyalsungExcel,
      formatDate,
      getStatusSeverityClass,
      getDataType
    }
  }
}
</script>

<style scoped>
/* Filters Section */
.filters-section {
  background: #ffffff;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #e5e7eb;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
  display: block;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.action-btn {
  flex: 1;
  min-width: 80px;
  font-size: 0.875rem;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.primary-btn {
  background-color: #3b82f6;
  border-color: #3b82f6;
  color: white;
}

.primary-btn:hover:not(:disabled) {
  background-color: #2563eb;
  border-color: #2563eb;
}

.secondary-btn {
  background-color: #f3f4f6;
  border-color: #d1d5db;
  color: #6b7280;
}

.secondary-btn:hover:not(:disabled) {
  background-color: #e5e7eb;
  border-color: #9ca3af;
  color: #4b5563;
}

.success-btn {
  background-color: #10b981;
  border-color: #10b981;
  color: white;
}

.success-btn:hover:not(:disabled) {
  background-color: #059669;
  border-color: #059669;
}

/* Stats Section */
.stats-section {
  margin-bottom: 1.5rem;
}

.stat-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  padding: 1.25rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 1rem;
  height: 100%;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.total-screenings .stat-icon {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
}

.registered-count .stat-icon {
  background: linear-gradient(135deg, #06b6d4, #0891b2);
  color: white;
}

.screened-count .stat-icon {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
}

.pending-count .stat-icon {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  line-height: 1;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

/* Table Section */
.table-section {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

.modern-table {
  font-size: 0.875rem;
}

.modern-table :deep(.p-datatable-header) {
  background: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
  padding: 1rem;
}

.modern-table :deep(.p-datatable-thead > tr > th) {
  background: #f8fafc;
  border-bottom: 2px solid #e5e7eb;
  font-weight: 600;
  color: #374151;
  padding: 0.875rem;
  font-size: 0.875rem;
}

.modern-table :deep(.p-datatable-tbody > tr > td) {
  padding: 0.875rem;
  border-bottom: 1px solid #f3f4f6;
}

.modern-table :deep(.p-datatable-tbody > tr:hover) {
  background-color: #f9fafb !important;
}

.modern-table :deep(.p-datatable-tbody > tr:nth-child(even)) {
  background-color: #fafafa;
}

.modern-table :deep(.p-datatable-tbody > tr:nth-child(even):hover) {
  background-color: #f9fafb !important;
}

.date-cell {
  color: #6b7280;
  font-size: 0.875rem;
}

.status-tag {
  font-weight: 500;
  font-size: 0.75rem;
  padding: 0.375rem 0.75rem;
  border-radius: 6px;
}

/* Empty States */
.empty-state {
  text-align: center;
  padding: 3rem 2rem;
  color: #6b7280;
}

.empty-icon {
  font-size: 3rem;
  color: #d1d5db;
  margin-bottom: 1rem;
}

.empty-message h5 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

.empty-message p {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.table-empty-state {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
}

.loading-state {
  text-align: center;
  padding: 3rem 2rem;
  color: #6b7280;
}

.loading-state p {
  margin-top: 1rem;
  font-size: 0.875rem;
}

.error-state {
  text-align: center;
  padding: 3rem 2rem;
  color: #ef4444;
}

.error-icon {
  font-size: 3rem;
  color: #fca5a5;
  margin-bottom: 1rem;
}

.error-message h5 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #dc2626;
  margin-bottom: 0.5rem;
}

.error-message p {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

/* Responsive Design */
@media (max-width: 768px) {
  .filters-section {
    padding: 1rem;
  }

  .action-buttons {
    flex-direction: column;
  }

  .action-btn {
    width: 100%;
    justify-content: center;
  }

  .stat-card {
    padding: 1rem;
  }

  .stat-number {
    font-size: 1.5rem;
  }

  .stat-icon {
    width: 40px;
    height: 40px;
    font-size: 1.25rem;
  }
}

@media (max-width: 576px) {
  .modern-table :deep(.p-datatable-thead > tr > th),
  .modern-table :deep(.p-datatable-tbody > tr > td) {
    padding: 0.5rem;
    font-size: 0.75rem;
  }

  .empty-state,
  .loading-state,
  .error-state {
    padding: 2rem 1rem;
  }
}

/* Custom PrimeVue overrides */
:deep(.p-calendar .p-inputtext) {
  border-radius: 8px;
  border-color: #d1d5db;
}

:deep(.p-dropdown) {
  border-radius: 8px;
  border-color: #d1d5db;
}

:deep(.p-inputtext) {
  border-radius: 8px;
  border-color: #d1d5db;
}

:deep(.p-button) {
  border-radius: 8px;
}

:deep(.p-paginator) {
  background: #f8fafc;
  border-top: 1px solid #e5e7eb;
  padding: 0.75rem 1rem;
}

:deep(.p-tag) {
  font-weight: 500;
}
</style>