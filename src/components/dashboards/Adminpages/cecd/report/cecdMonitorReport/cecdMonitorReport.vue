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
              <cecdTableLayer :filteredData="finalFilteredData" />
            </div>
            <cecdMonitorGraph v-else :chartData="processedChartData" :chartOptions="[selectedOption]" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import cecdTableLayer from './cecdTableLayer.vue'
import cecdMonitorGraph from './cecdMonitorGraph.vue'

const props = defineProps({
  filteredData: {
    type: Array,
    required: true
  }
});

const dataOptions = [
  { label: 'Screening', value: 'screening' },
  { label: 'Counseling', value: 'counseling' },
  { label: 'Assessment Status', value: 'assessment_status' },
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

// Organization search functionality
const organizationSearch = ref('')
const showOrganizationDropdown = ref(false)
const filteredOrganizations = ref([])

// Helper function to get valid screening data
const hasValidScreeningData = (item) => {
  return item?.screening_data &&
    typeof item.screening_data === 'object' &&
    item.screening_data !== "Data not available";
};

// Helper function to get organization name
const getOrganizationName = (item) => {
  return item?.user?.agency_details?.agency?.agency_name ||
    item?.user?.active_agency?.agency_name ||
    (item?.screening_data && typeof item.screening_data === 'object' ?
      item.screening_data.prev_school : null);
};

// Computed properties for available filter options
const availableYears = computed(() => {
  const years = new Set(props.filteredData
    .filter(hasValidScreeningData)
    .map(item => item.date ? new Date(item.date).getFullYear() : null)
    .filter(Boolean));
  return Array.from(years).sort();
})

const availableGenders = computed(() => {
  return Array.from(new Set(props.filteredData
    .filter(hasValidScreeningData)
    .map(item => {
      if (item.user?.gender) return item.user.gender;
      if (item.screening_data?.gender) {
        return item.screening_data.gender === 'M' ? 'Male' :
          item.screening_data.gender === 'F' ? 'Female' : 'Other';
      }
      return null;
    })
    .filter(Boolean)));
})

const availableOrganizations = computed(() => {
  const organizations = new Set(props.filteredData
    .filter(hasValidScreeningData)
    .map(getOrganizationName)
    .filter(Boolean));
  return Array.from(organizations).sort();
})

const availableEmployment = computed(() => {
  const roles = new Set(props.filteredData
    .filter(hasValidScreeningData)
    .map(item => item.user?.role ||
      (item.screening_data?.academy_code ? 'student' : null))
    .filter(Boolean));
  return Array.from(roles).sort();
})

const isUserClassFilterActive = computed(() => {
  const org = additionalFilters.value.organization.toLowerCase();
  return org.includes('school') || org.includes('education');
})

const availableUserClassesForOrganization = computed(() => {
  if (!additionalFilters.value.organization) return [];

  const classes = new Set(props.filteredData
    .filter(item => getOrganizationName(item) === additionalFilters.value.organization)
    .map(item => item.user?.agency_details?.user_class)
    .filter(Boolean));
  return Array.from(classes).sort();
})

// Final filtered data based on all filters
const finalFilteredData = computed(() => {
  return props.filteredData.filter(item => {
    if (!hasValidScreeningData(item)) return false;

    const itemYear = item.date ? new Date(item.date).getFullYear() : null;
    const itemGender = item.user?.gender || (item.screening_data?.gender === 'M' ? 'Male' :
      item.screening_data?.gender === 'F' ? 'Female' : 'Other');
    const itemOrg = getOrganizationName(item);
    const itemClass = item.user?.agency_details?.user_class;
    const itemRole = item.user?.role || (item.screening_data?.academy_code ? 'student' : null);

    return (
      (additionalFilters.value.year === '' || itemYear === parseInt(additionalFilters.value.year)) &&
      (additionalFilters.value.gender === '' || itemGender === additionalFilters.value.gender) &&
      (additionalFilters.value.organization === '' || itemOrg === additionalFilters.value.organization) &&
      (!isUserClassFilterActive.value || additionalFilters.value.userClass === '' || itemClass === additionalFilters.value.userClass) &&
      (additionalFilters.value.employment === '' || itemRole === additionalFilters.value.employment)
    );
  });
})

// Process data for charts
const processedChartData = computed(() => {
  const result = {};

  if (selectedOption.value && selectedOption.value !== 'all') {
    result[selectedOption.value] = {
      male: {},
      female: {},
      other: {}
    };

    finalFilteredData.value.forEach((item) => {
      let value;
      if (selectedOption.value === 'screening') {
        value = hasValidScreeningData(item) ? 'Screened' : 'Not Screened';
      } else {
        value = item[selectedOption.value] || 'Not Available';
      }

      const gender = (item.user?.gender || item.screening_data?.gender)?.toLowerCase() || 'other';
      result[selectedOption.value][gender][value] = (result[selectedOption.value][gender][value] || 0) + 1;
    });
  }

  return result;
})

// Event handlers
const handleCheckboxChange = (value) => {
  selectedOption.value = value;
  showReport.value = false;
}

const generateReport = () => {
  showReport.value = true;
}

const filterOrganizations = () => {
  filteredOrganizations.value = availableOrganizations.value.filter(org =>
    org.toLowerCase().includes(organizationSearch.value.toLowerCase())
  );
}

const selectOrganization = (org) => {
  organizationSearch.value = org;
  additionalFilters.value.organization = org;
  showOrganizationDropdown.value = false;
  additionalFilters.value.userClass = '';
}

const handleClickOutside = (event) => {
  if (!event.target.closest('.searchable-dropdown')) {
    showOrganizationDropdown.value = false;
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
})

watch(additionalFilters, () => {
  if (showReport.value && selectedOption.value !== 'all') {
    // Chart will update automatically due to reactivity
  }
}, { deep: true });

watch(() => additionalFilters.value.organization, (newValue) => {
  organizationSearch.value = newValue;
});

watch(organizationSearch, (newValue) => {
  additionalFilters.value.organization = newValue;
});
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