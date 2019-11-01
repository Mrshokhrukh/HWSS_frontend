<template>
  <div class="row g-0">
    <!-- Filter Section -->
    <div class="col-md-2 p-2">
      <div class="card h-100">
        <div class="card-body">
          <p class="card-text fw-bold">Data Set</p>
          <div v-for="(option, index) in dataOptions" :key="index" class="form-check text-start">
            <input class="form-check-input" type="checkbox" :value="option.value" :id="'check' + index"
              :checked="selectedOption === option.value" @change="handleCheckboxChange(option.value)" />
            <label class="form-check-label" :for="'check' + index">
              {{ option.label }}
            </label>
          </div>
          <button @click="generateReport" class="btn btn-primary mt-3 w-100" :disabled="!selectedOption">
            Generate
          </button>
        </div>
      </div>
    </div>

    <!-- Report Display Section -->
    <div class="col-md-10 p-2">
      <div class="card h-100">
        <div class="card-body">
          <!-- Initial Message -->
          <div v-if="!showReport" class="text-center">
            <p class="text-primary mb-3">Note: Please select a parameter and press the Generate button</p>
          </div>

          <!-- Report Content -->
          <div v-else>
            <!-- Filters Row -->
            <div class="row mb-3">
              <!-- Year Filter -->
              <div class="col-md-2">
                <label for="yearFilter" class="form-label">Year</label>
                <select id="yearFilter" v-model="additionalFilters.year" class="form-select">
                  <option value="">All Years</option>
                  <option v-for="year in availableYears" :key="year" :value="year">{{ year }}</option>
                </select>
              </div>

              <!-- Gender Filter -->
              <div class="col-md-2">
                <label for="genderFilter" class="form-label">Gender</label>
                <select id="genderFilter" v-model="additionalFilters.gender" class="form-select">
                  <option value="">All Genders</option>
                  <option v-for="gender in availableGenders" :key="gender" :value="gender">{{ gender }}</option>
                </select>
              </div>

              <!-- Organization Filter -->
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

              <!-- User Class Filter (Conditional) -->
              <div class="col-md-2" v-if="isUserClassFilterActive">
                <label for="userClassFilter" class="form-label">User Class</label>
                <select id="userClassFilter" v-model="additionalFilters.userClass" class="form-select">
                  <option value="">All User Classes</option>
                  <option v-for="userClass in availableUserClassesForOrganization" :key="userClass" :value="userClass">
                    {{ userClass }}
                  </option>
                </select>
              </div>

              <!-- Employment Filter -->
              <div class="col-md-2">
                <label for="employmentFilter" class="form-label">Employment</label>
                <select id="employmentFilter" v-model="additionalFilters.employment" class="form-select">
                  <option value="">All Employment</option>
                  <option v-for="emp in availableEmployment" :key="emp" :value="emp">{{ emp }}</option>
                </select>
              </div>
            </div>

            <!-- Report Display -->
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
import MHMonitorTable from './MonitorTable.vue'
import ChartComponent from './ChartComponent.vue'

// Props with validation
const props = defineProps({
  filteredData: {
    type: Array,
    required: true,
    default: () => []
  },
  activeFiltersList: {
    type: Array,
    required: true,
    default: () => []
  }
});

// Data options configuration with improved descriptions
const dataOptions = [
  {
    label: 'Screening',
    value: 'screening',
    description: 'View screening status and statistics'
  },
  {
    label: 'Counseling',
    value: 'counseling',
    description: 'View counseling status and progress'
  },
  {
    label: 'Assessment Status',
    value: 'assessment_status',
    description: 'View assessment completion status'
  },
  {
    label: 'Referral',
    value: 'referred',
    description: 'View referral statistics'
  },
  {
    label: 'Follow-up',
    value: 'follow_up',
    description: 'View follow-up status'
  },
  {
    label: 'All',
    value: 'all',
    description: 'View complete dataset'
  }
];

// Reactive state with better initial values
const selectedOption = ref('');
const showReport = ref(false);
const organizationSearch = ref('');
const showOrganizationDropdown = ref(false);
const filteredOrganizations = ref([]);

// Additional filters state with validation
const additionalFilters = ref({
  year: '',
  gender: '',
  organization: '',
  employment: '',
  userClass: ''
});

// Improved computed properties with better null handling
const availableYears = computed(() => {
  const years = new Set(props.filteredData
    .map(item => item.date ? new Date(item.date).getFullYear() : null)
    .filter(year => year !== null && !isNaN(year)));
  return Array.from(years).sort((a, b) => b - a);
});

const availableGenders = computed(() => {
  const genders = new Set(props.filteredData
    .map(item => {
      const gender = item.user?.gender;
      return gender ? gender.trim() : null;
    })
    .filter(Boolean));
  return Array.from(genders);
});

const availableOrganizations = computed(() => {
  const organizations = new Set(props.filteredData
    .map(item => {
      const orgName = item.user?.agency_details?.agency?.agency_name;
      return orgName ? orgName.trim() : null;
    })
    .filter(Boolean));
  return Array.from(organizations).sort();
});

const availableEmployment = computed(() => {
  const roles = new Set(props.filteredData
    .map(item => {
      const role = item.user?.role;
      return role ? role.trim() : null;
    })
    .filter(Boolean));
  return Array.from(roles).sort();
});

// Improved organization type check
const isUserClassFilterActive = computed(() => {
  const org = (additionalFilters.value.organization || '').toLowerCase();
  return org.includes('school') ||
    org.includes('education') ||
    org.includes('college') ||
    org.includes('institute');
});

const availableUserClassesForOrganization = computed(() => {
  if (!additionalFilters.value.organization) return [];

  const classes = new Set(props.filteredData
    .filter(item =>
      item.user?.agency_details?.agency?.agency_name === additionalFilters.value.organization)
    .map(item => {
      const userClass = item.user?.agency_details?.user_class;
      return userClass ? userClass.trim() : null;
    })
    .filter(Boolean));
  return Array.from(classes).sort((a, b) => {
    // Custom sorting for class levels
    const numA = parseInt(a);
    const numB = parseInt(b);
    if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
    return a.localeCompare(b);
  });
});

// Improved data filtering with validation
const finalFilteredData = computed(() => {
  return props.filteredData.filter(item => {
    try {
      const itemYear = item.date ? new Date(item.date).getFullYear() : null;
      const itemGender = item.user?.gender?.trim();
      const itemOrg = item.user?.agency_details?.agency?.agency_name?.trim();
      const itemClass = item.user?.agency_details?.user_class?.trim();
      const itemRole = item.user?.role?.trim();

      const yearMatch = !additionalFilters.value.year ||
        (itemYear && itemYear === parseInt(additionalFilters.value.year));
      const genderMatch = !additionalFilters.value.gender ||
        (itemGender && itemGender === additionalFilters.value.gender);
      const orgMatch = !additionalFilters.value.organization ||
        (itemOrg && itemOrg === additionalFilters.value.organization);
      const classMatch = !isUserClassFilterActive.value ||
        !additionalFilters.value.userClass ||
        (itemClass && itemClass === additionalFilters.value.userClass);
      const employmentMatch = !additionalFilters.value.employment ||
        (itemRole && itemRole === additionalFilters.value.employment);

      return yearMatch && genderMatch && orgMatch && classMatch && employmentMatch;
    } catch (error) {
      console.error('Error filtering item:', error, item);
      return false;
    }
  });
});

// Enhanced chart data processing
const processedChartData = computed(() => {
  if (!selectedOption.value || selectedOption.value === 'all') {
    return {};
  }

  try {
    const result = {
      [selectedOption.value]: {
        male: {},
        female: {},
        other: {} // Added to handle potential non-binary or undefined gender
      }
    };

    finalFilteredData.value.forEach(item => {
      const value = getItemValue(item, selectedOption.value);
      const gender = item.user?.gender?.toLowerCase()?.trim() || 'other';

      if (gender === 'male' || gender === 'female') {
        result[selectedOption.value][gender][value] =
          (result[selectedOption.value][gender][value] || 0) + 1;
      } else {
        result[selectedOption.value].other[value] =
          (result[selectedOption.value].other[value] || 0) + 1;
      }
    });

    return result;
  } catch (error) {
    console.error('Error processing chart data:', error);
    return {};
  }
});

// Improved helper function with better error handling and default values
const getItemValue = (item, option) => {
  try {
    switch (option) {
      case 'screening':
        return item.screening_data !== null &&
          item.screening_data !== undefined &&
          item.screening_data !== "Data not available"
          ? 'Screened'
          : 'Not Screened';
      case 'counseling':
        return item.counseling || 'Not Started';
      case 'assessment_status':
        return item.assessment_status || 'Not Available';
      case 'referred':
        return item.referred || 'Not Referred';
      case 'follow_up':
        return item.follow_up || 'No Follow-up';
      default:
        return 'Not Available';
    }
  } catch (error) {
    console.error('Error getting item value:', error, item, option);
    return 'Error';
  }
};

// Methods with improved error handling
const handleCheckboxChange = (value) => {
  try {
    selectedOption.value = value;
    showReport.value = false;
  } catch (error) {
    console.error('Error handling checkbox change:', error);
  }
};

const generateReport = () => {
  try {
    showReport.value = true;
  } catch (error) {
    console.error('Error generating report:', error);
    showReport.value = false;
  }
};

const filterOrganizations = () => {
  try {
    const searchTerm = organizationSearch.value.toLowerCase().trim();
    filteredOrganizations.value = availableOrganizations.value
      .filter(org => org.toLowerCase().includes(searchTerm));
  } catch (error) {
    console.error('Error filtering organizations:', error);
    filteredOrganizations.value = [];
  }
};

const selectOrganization = (org) => {
  try {
    organizationSearch.value = org;
    additionalFilters.value.organization = org;
    showOrganizationDropdown.value = false;
    additionalFilters.value.userClass = ''; // Reset user class when organization changes
  } catch (error) {
    console.error('Error selecting organization:', error);
  }
};

// Enhanced click outside handler with error boundary
const handleClickOutside = (event) => {
  try {
    if (!event.target.closest('.searchable-dropdown')) {
      showOrganizationDropdown.value = false;
    }
  } catch (error) {
    console.error('Error handling click outside:', error);
    showOrganizationDropdown.value = false;
  }
};

// Lifecycle hooks with cleanup
onMounted(() => {
  try {
    document.addEventListener('click', handleClickOutside);
  } catch (error) {
    console.error('Error in onMounted:', error);
  }
});

onUnmounted(() => {
  try {
    document.removeEventListener('click', handleClickOutside);
  } catch (error) {
    console.error('Error in onUnmounted:', error);
  }
});

// Watchers with improved validation
watch(additionalFilters, (newVal, oldVal) => {
  try {
    if (showReport.value && selectedOption.value !== 'all') {
      const hasChanges = Object.keys(newVal).some(key => newVal[key] !== oldVal[key]);
      if (hasChanges) {
        console.log('Filters updated:', newVal);
      }
    }
  } catch (error) {
    console.error('Error in additionalFilters watcher:', error);
  }
}, { deep: true });

watch(() => additionalFilters.value.organization, (newValue) => {
  try {
    organizationSearch.value = newValue || '';
  } catch (error) {
    console.error('Error in organization watcher:', error);
  }
});

watch(organizationSearch, (newValue) => {
  try {
    additionalFilters.value.organization = newValue || '';
  } catch (error) {
    console.error('Error in organizationSearch watcher:', error);
  }
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