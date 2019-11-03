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
                  <select id="userClassFilter" v-model="additionalFilters.userClass" class="form-select">
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
                <MHCaseTable :filteredData="finalFilteredData" />
              </div>
              <CSChartComponent v-else :chartData="processedChartData" :chartOptions="chartOptions" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import MHCaseTable from './CaseTableReport.vue';
import CSChartComponent from './CSchartComponent.vue';

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

// Computed properties for filter options
const availableYears = computed(() => {
  const years = new Set(props.filteredData.map(item => {
    const date = item.date;
    return date ? new Date(date).getFullYear() : null;
  }).filter(Boolean));
  return Array.from(years).sort();
});

const availableGenders = computed(() => {
  const genders = new Set(props.filteredData.map(item =>
    item.user?.gender
  ).filter(Boolean));
  return Array.from(genders);
});

const availableOrganizations = computed(() => {
  const orgs = new Set(props.filteredData.map(item =>
    item.user?.active_agency?.agency_name ||
    item.user?.agency_details?.agency?.agency_name
  ).filter(Boolean));
  return Array.from(orgs);
});

const availableUserClasses = computed(() => {
  const userClasses = new Set(props.filteredData.map(item =>
    item.user?.agency_details?.user_class
  ).filter(Boolean));
  return Array.from(userClasses);
});

const availableEmployment = computed(() => {
  const employment = new Set(props.filteredData.map(item =>
    item.user?.agency_details?.user_role_agency
  ).filter(Boolean));
  return Array.from(employment);
});

// Filtered data based on additional filters
const finalFilteredData = computed(() => {
  return props.filteredData.filter(item => {
    const itemYear = item.date
      ? new Date(item.date).getFullYear()
      : null;

    const organization = item.user?.active_agency?.agency_name ||
      item.user?.agency_details?.agency?.agency_name;

    return (
      (!additionalFilters.value.year || itemYear === parseInt(additionalFilters.value.year)) &&
      (!additionalFilters.value.gender || item.user?.gender === additionalFilters.value.gender) &&
      (!additionalFilters.value.organization || organization === additionalFilters.value.organization) &&
      (!additionalFilters.value.userClass || item.user?.agency_details?.user_class === additionalFilters.value.userClass) &&
      (!additionalFilters.value.employment || item.user?.agency_details?.user_role_agency === additionalFilters.value.employment)
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
      const gender = item.user?.gender || 'Other';

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