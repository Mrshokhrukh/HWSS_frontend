<template>
  <div class="row g-0">
    <div class="col-md-2 p-2">
      <div class="card h-100">
        <div class="card-body">
          <p class="card-text">Data Set</p>
          <div v-for="(option, index) in dataOptions" :key="index" class="form-check text-start">
            <input class="form-check-input" type="checkbox" :value="option.value" :id="'check' + index"
              :checked="selectedOption === option.value" @change="handleCheckboxChange(option.value)" />
            <label class="form-check-label" :for="'check' + index">
              {{ option.label }}
            </label>
          </div>
          <button @click="generateReport" class="btn btn-primary mt-3" :disabled="!selectedOption">Generate</button>
        </div>
      </div>
    </div>
    <div class="col-md-10 p-2">
      <div class="card h-100">
        <div class="card-body">
          <div v-if="!showReport" class="text-center">
            <p class="text-primary mb-3">Note: Please select a parameter and press the Generate button</p>
          </div>
          <div v-else>
            <!-- Additional filters -->
            <div class="row mb-3">
              <div class="col-md-2">
                <label for="yearFilter" class="form-label">Year</label>
                <select id="yearFilter" v-model="additionalFilters.year" class="form-select">
                  <option value="">All Years</option>
                  <option v-for="year in availableYears" :key="year" :value="year">{{ year }}</option>
                </select>
              </div>
              <div class="col-md-2">
                <label for="genderFilter" class="form-label">Gender</label>
                <select id="genderFilter" v-model="additionalFilters.gender" class="form-select">
                  <option value="">All Genders</option>
                  <option v-for="gender in availableGenders" :key="gender" :value="gender">{{ gender }}</option>
                </select>
              </div>
              <div class="col-md-3">
                <label for="organizationFilter" class="form-label">Organization</label>
                <div class="searchable-dropdown">
                  <input type="text" id="organizationFilter" class="form-control" v-model="organizationSearch"
                    placeholder="Search organization..." @input="filterOrganizations"
                    @focus="showOrganizationDropdown = true" />
                  <ul class="dropdown-menu" :class="{ show: showOrganizationDropdown && filteredOrganizations.length }">
                    <li v-for="org in filteredOrganizations" :key="org">
                      <a class="dropdown-item" href="#" @click.prevent="selectOrganization(org)">{{ org }}</a>
                    </li>
                  </ul>
                </div>
              </div>
              <div class="col-md-2" v-if="isUserClassFilterActive">
                <label for="userClassFilter" class="form-label">User Class</label>
                <select id="userClassFilter" v-model="additionalFilters.userClass" class="form-select">
                  <option value="">All User Classes</option>
                  <option v-for="userClass in availableUserClassesForOrganization" :key="userClass" :value="userClass">
                    {{ userClass }}
                  </option>
                </select>
              </div>
              <div class="col-md-2">
                <label for="employmentFilter" class="form-label">Employment</label>
                <select id="employmentFilter" v-model="additionalFilters.employment" class="form-select">
                  <option value="">All Employment</option>
                  <option v-for="emp in availableEmployment" :key="emp" :value="emp">{{ emp }}</option>
                </select>
              </div>
            </div>

            <div v-if="selectedOption === 'all'" class="showtable">
              <MHMonitorTable :filteredData="finalFilteredData" />
            </div>
            <ChartComponent v-else :chartData="processedChartData" :chartOptions="[selectedOption]" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import MHMonitorTable from './MHMonitorTable.vue'
import ChartComponent from './ChartComponent.vue'

const props = defineProps({
  filteredData: {
    type: Array,
    required: true
  }
});

const dataOptions = [
  { label: 'Rescreening Count', value: 'rescreened' },
  { label: 'Counseling', value: 'counseling' },
  { label: 'Assessment', value: 'assessment_status' },
  { label: 'Referral', value: 'referred' },
  { label: 'Follow-up', value: 'follow_up' },
  { label: 'All', value: 'all' }
]

const selectedOption = ref('')
const showReport = ref(false)
const additionalFilters = ref({
  year: '',
  gender: '',
  organization: '',
  employment: '',
  userClass: ''
})

// New refs for searchable organization dropdown
const organizationSearch = ref('')
const showOrganizationDropdown = ref(false)
const filteredOrganizations = ref([])

const availableYears = computed(() => [...new Set(props.filteredData.map(item => {
  const date = item.service_and_treatment?.date;
  return date ? new Date(date).getFullYear() : null;
}).filter(Boolean))].sort())

const availableGenders = computed(() => [...new Set(props.filteredData.map(item => item.user?.fields?.gender).filter(Boolean))])

const availableOrganizations = computed(() => [...new Set(props.filteredData.map(item => item.agency_name).filter(Boolean))])

const availableEmployment = computed(() => {
  const employmentSet = new Set(props.filteredData.map(item => item.user_agency?.fields?.user_role_agency).filter(Boolean));
  return Array.from(employmentSet).sort();
})

// New computed property to determine if userClass filter should be active
const isUserClassFilterActive = computed(() => {
  return additionalFilters.value.organization.toLowerCase().includes('school');
})

// New computed property to get user classes for the selected organization
const availableUserClassesForOrganization = computed(() => {
  if (!additionalFilters.value.organization) {
    return [];
  }
  return [...new Set(props.filteredData
    .filter(item => item.agency_name === additionalFilters.value.organization)
    .map(item => item.user_agency?.fields?.user_class)
    .filter(Boolean))];
})

const finalFilteredData = computed(() => {
  return props.filteredData.filter(item => {
    const itemYear = item.service_and_treatment?.date ? new Date(item.service_and_treatment.date).getFullYear() : null;
    return (
      (additionalFilters.value.year === '' || itemYear === parseInt(additionalFilters.value.year)) &&
      (additionalFilters.value.gender === '' || item.user?.fields?.gender === additionalFilters.value.gender) &&
      (additionalFilters.value.organization === '' || item.agency_name === additionalFilters.value.organization) &&
      (!isUserClassFilterActive.value || additionalFilters.value.userClass === '' || item.user_agency?.fields?.user_class === additionalFilters.value.userClass) &&
      (additionalFilters.value.employment === '' || item.user_agency?.fields?.user_role_agency === additionalFilters.value.employment)
    )
  })
})

const processedChartData = computed(() => {
  const result = {}

  if (selectedOption.value && selectedOption.value !== 'all') {
    result[selectedOption.value] = {
      male: {},
      female: {},
      other: {}
    }
    finalFilteredData.value.forEach((item) => {
      let value
      if (selectedOption.value === 'rescreened') {
        value = item.rescreened ? 'Yes' : 'No'
      } else {
        value = item.service_and_treatment?.[selectedOption.value] || 'NA'
      }
      const gender = item.user?.fields?.gender?.toLowerCase() || 'unknown'
      if (gender === 'male' || gender === 'female' || gender === 'other') {
        result[selectedOption.value][gender][value] = (result[selectedOption.value][gender][value] || 0) + 1
      }
    })
  }

  console.log('Processed Chart Data:', JSON.stringify(result, null, 2))
  return result
})

const handleCheckboxChange = (value) => {
  selectedOption.value = value
  showReport.value = false
}

const generateReport = () => {
  showReport.value = true
}

// Functions for searchable organization dropdown
const filterOrganizations = () => {
  filteredOrganizations.value = availableOrganizations.value.filter(org =>
    org.toLowerCase().includes(organizationSearch.value.toLowerCase())
  )
}

const selectOrganization = (org) => {
  organizationSearch.value = org
  additionalFilters.value.organization = org
  showOrganizationDropdown.value = false

  // Reset userClass filter when organization changes
  additionalFilters.value.userClass = ''
}

// Close dropdown when clicking outside
const handleClickOutside = (event) => {
  if (!event.target.closest('.searchable-dropdown')) {
    showOrganizationDropdown.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

watch(additionalFilters, () => {
  if (showReport.value && selectedOption.value !== 'all') {
    // The chart will be updated automatically due to the reactivity of processedChartData
  }
}, { deep: true })

// Sync organizationSearch with additionalFilters.organization
watch(() => additionalFilters.value.organization, (newValue) => {
  organizationSearch.value = newValue
})

watch(organizationSearch, (newValue) => {
  additionalFilters.value.organization = newValue
})

</script>

<style scoped>
.searchable-dropdown {
  position: relative;
}

.dropdown-menu {
  width: 100%;
  max-height: 200px;
  overflow-y: auto;
}
</style>