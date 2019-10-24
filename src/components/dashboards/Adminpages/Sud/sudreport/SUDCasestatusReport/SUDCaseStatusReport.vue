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
              <div class="col-md-2">
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
                  <option v-for="userClass in availableUserClasses" :key="userClass" :value="userClass">{{ userClass }}
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
              <SUDCST_Table :filteredData="finalFilteredData" />
            </div>
            <SUDCaseStatusGraph v-else :chartData="processedChartData" :chartOptions="['Male', 'Female', 'Other']" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import SUDCaseStatusGraph from './SUDCaseStatusGraph.vue';
import SUDCST_Table from './SUDCSR_Table.vue';

const props = defineProps({
  filteredData: {
    type: Array,
    required: true
  }
});

const dataOptions = [
  { label: 'Case Ongoing', value: 'ongoing' },
  { label: 'Case Closed', value: 'closed' },
  { label: 'Case Discontinued', value: 'discontinued' },
  { label: 'All', value: 'all' }
];

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
  const genders = new Set(props.filteredData.map(item => item.user?.gender).filter(Boolean));
  return Array.from(genders);
});

const availableOrganizations = computed(() => {
  const orgs = new Set(props.filteredData.map(item =>
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

const finalFilteredData = computed(() => {
  return props.filteredData.filter(item => {
    const itemYear = item.date ? new Date(item.date).getFullYear() : null;
    const agencyDetails = item.user?.agency_details;

    return (
      (additionalFilters.value.year === '' || itemYear === parseInt(additionalFilters.value.year)) &&
      (additionalFilters.value.gender === '' || item.user?.gender === additionalFilters.value.gender) &&
      (additionalFilters.value.organization === '' || agencyDetails?.agency?.agency_name === additionalFilters.value.organization) &&
      (additionalFilters.value.userClass === '' || agencyDetails?.user_class === additionalFilters.value.userClass) &&
      (additionalFilters.value.employment === '' || agencyDetails?.user_role_agency === additionalFilters.value.employment)
    );
  });
});

const processedChartData = computed(() => {
  const result = {};

  if (selectedOption.value && selectedOption.value !== 'all') {
    result[selectedOption.value] = {
      Male: 0,
      Female: 0,
      Other: 0
    };

    finalFilteredData.value.forEach((item) => {
      const status = item.case_status || 'NA';
      const gender = item.user?.gender || 'Other';

      if (
        (selectedOption.value === 'ongoing' && status === 'On Going') ||
        (selectedOption.value === 'closed' && status === 'Case Closed') ||
        (selectedOption.value === 'discontinued' && status === 'Case Discontinued')
      ) {
        result[selectedOption.value][gender] = (result[selectedOption.value][gender] || 0) + 1;
      }
    });
  }

  return result;
});

const handleCheckboxChange = (value) => {
  selectedOption.value = value;
  showReport.value = false;
};

const generateReport = () => {
  showReport.value = true;
};

watch(additionalFilters, () => {
  if (showReport.value && selectedOption.value !== 'all') {
    // The chart will be updated automatically due to the reactivity of processedChartData
  }
}, { deep: true });
</script>