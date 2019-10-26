<template>
  <div class="case-status-container">
    <div class="row g-0">
      <div class="col-md-2 p-2">
        <div class="card h-100">
          <div class="card-body">
            <p class="card-text">Data Set</p>
            <div v-for="(option, index) in dataOptions" :key="index" class="form-check text-start">
              <input class="form-check-input" type="radio" :value="option.value" :id="'radio' + index"
                v-model="selectedOption" />
              <label class="form-check-label" :for="'radio' + index">
                {{ option.label }}
              </label>
            </div>
            <button @click="generateReport" class="btn btn-primary mt-3" :disabled="!selectedOption">
              Generate
            </button>
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
                  <select id="organizationFilter" v-model="additionalFilters.organization" class="form-select">
                    <option value="">All Organizations</option>
                    <option v-for="org in availableOrganizations" :key="org" :value="org">{{ org }}</option>
                  </select>
                </div>
                <div class="col-md-2">
                  <label for="userClassFilter" class="form-label">User Class</label>
                  <select id="userClassFilter" v-model="additionalFilters.userClass" class="form-select"
                    :disabled="!isUserClassAvailable">
                    <option value="">All User Classes</option>
                    <option v-for="userClass in availableUserClasses" :key="userClass" :value="userClass">
                      {{ userClass }}
                    </option>
                  </select>
                </div>
                <div class="col-md-3">
                  <label for="employmentFilter" class="form-label">Employment</label>
                  <select id="employmentFilter" v-model="additionalFilters.employment" class="form-select">
                    <option value="">All Employment</option>
                    <option v-for="emp in availableEmployment" :key="emp" :value="emp">{{ emp }}</option>
                  </select>
                </div>
              </div>

              <!-- Display area for report content -->
              <div v-if="selectedOption === 'all'" class="showtable">
                <cecdCasereportTable :filteredData="finalFilteredData" />
              </div>
              <cecdChartComponent v-else :chartData="processedChartData" :chartOptions="chartOptions" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import cecdCasereportTable from './cecdCasereportTable.vue'
import cecdChartComponent from './cecdChartComponent.vue'

const props = defineProps({
  filteredData: {
    type: Array,
    required: true,
    default: () => []
  }
});

const dataOptions = [
  { label: 'Case Ongoing', value: 'ongoing' },
  { label: 'Case Closed', value: 'closed' },
  { label: 'Case Discontinued', value: 'discontinued' },
  { label: 'All', value: 'all' }
];

const chartOptions = ['Male', 'Female', 'Other'];

// State
const selectedOption = ref('');
const showReport = ref(false);
const additionalFilters = ref({
  year: '',
  gender: '',
  organization: '',
  employment: '',
  userClass: ''
});

// Helper function to check if screening data is valid
const hasValidScreeningData = (item) => {
  return item?.screening_data &&
    typeof item.screening_data === 'object' &&
    item.screening_data !== "Data not available";
};

// Helper function to get organization name
const getOrganizationName = (item) => {
  return item?.user?.active_agency?.agency_name ||
    item?.user?.agency_details?.agency?.agency_name ||
    (item?.screening_data && typeof item.screening_data === 'object' ?
      item.screening_data.prev_school : null);
};

// Helper function to get gender
const getGender = (item) => {
  const userGender = item?.user?.gender;
  const screeningGender = hasValidScreeningData(item) ? item.screening_data.gender : null;

  if (userGender) return userGender;
  if (screeningGender === 'M') return 'Male';
  if (screeningGender === 'F') return 'Female';
  return 'Other';
};

// Computed properties for filter options
const availableYears = computed(() => {
  const years = new Set(props.filteredData
    .map(item => item.date ? new Date(item.date).getFullYear() : null)
    .filter(Boolean));
  return Array.from(years).sort();
});

const availableGenders = computed(() => {
  const genders = new Set(props.filteredData
    .map(item => getGender(item))
    .filter(Boolean));
  return Array.from(genders);
});

const availableOrganizations = computed(() => {
  const orgs = new Set(props.filteredData
    .map(item => getOrganizationName(item))
    .filter(Boolean));
  return Array.from(orgs).sort();
});

const isUserClassAvailable = computed(() => {
  const selectedOrg = additionalFilters.value.organization?.toLowerCase() || '';
  return selectedOrg.includes('school') || selectedOrg.includes('education');
});

const availableUserClasses = computed(() => {
  if (!isUserClassAvailable.value) return [];

  const classes = new Set(props.filteredData
    .filter(item => getOrganizationName(item) === additionalFilters.value.organization)
    .map(item => item?.user?.agency_details?.user_class)
    .filter(Boolean));
  return Array.from(classes).sort();
});

const availableEmployment = computed(() => {
  const roles = new Set(props.filteredData
    .map(item =>
      item?.user?.agency_details?.user_role_agency ||
      item?.user?.role ||
      (hasValidScreeningData(item) && item.screening_data?.academy_code ? 'student' : null)
    )
    .filter(Boolean));
  return Array.from(roles).sort();
});

// Filtered data based on additional filters
const finalFilteredData = computed(() => {
  return props.filteredData.filter(item => {
    const itemYear = item.date ? new Date(item.date).getFullYear() : null;
    const gender = getGender(item);
    const organization = getOrganizationName(item);
    const userClass = item?.user?.agency_details?.user_class;
    const employment = item?.user?.agency_details?.user_role_agency ||
      item?.user?.role ||
      (hasValidScreeningData(item) && item.screening_data?.academy_code ? 'student' : null);

    return (
      (!additionalFilters.value.year || itemYear === parseInt(additionalFilters.value.year)) &&
      (!additionalFilters.value.gender || gender === additionalFilters.value.gender) &&
      (!additionalFilters.value.organization || organization === additionalFilters.value.organization) &&
      (!additionalFilters.value.userClass || userClass === additionalFilters.value.userClass) &&
      (!additionalFilters.value.employment || employment === additionalFilters.value.employment)
    );
  });
});

// Process data for chart visualization
const processedChartData = computed(() => {
  const result = {};

  if (selectedOption.value && selectedOption.value !== 'all') {
    result[selectedOption.value] = {
      Male: 0,
      Female: 0,
      Other: 0
    };

    finalFilteredData.value.forEach((item) => {
      const status = item.case_status;
      const gender = getGender(item);

      const statusMapping = {
        ongoing: 'On Going',
        closed: 'Case Closed',
        discontinued: 'Case Discontinued'
      };

      if (status === statusMapping[selectedOption.value]) {
        result[selectedOption.value][gender] = (result[selectedOption.value][gender] || 0) + 1;
      }
    });
  }

  return result;
});

// Methods
const generateReport = () => {
  showReport.value = true;
};

// Watch for filter changes
watch([additionalFilters, selectedOption], () => {
  if (showReport.value) {
    // Report will update automatically due to computed properties
  }
}, { deep: true });
</script>

<style scoped>
.case-status-container {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.btn-primary {
  background-color: #2C6975;
  border-color: #2C6975;
}

.btn-primary:hover {
  background-color: #1e4f59;
  border-color: #1e4f59;
}

.btn-primary:disabled {
  background-color: #cccccc;
  border-color: #cccccc;
}

.form-select {
  border-color: #e0e0e0;
}

.form-select:focus {
  border-color: #2C6975;
  box-shadow: 0 0 0 0.2rem rgba(44, 105, 117, 0.25);
}
</style>