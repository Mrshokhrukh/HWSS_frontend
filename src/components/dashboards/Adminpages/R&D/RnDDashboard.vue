<template>
  <div class="filter-container">
    <!-- Primary filters -->
    <div class="filter-form mb-4">
      <h4 class="mb-3">FILTERS</h4>
      <form @submit.prevent="applyPrimaryFilters" class="filter-form-container">
        <div class="row">
          <div class="col-md-3 mb-3">
            <label for="region" class="form-label">Region</label>
            <select id="region" v-model="primaryFilters.region" class="form-select" @change="updateDzongkhags">
              <option value="">Select Region</option>
              <option v-for="region in regions" :key="region" :value="region">{{ region }}</option>
            </select>
          </div>
          <div class="col-md-3 mb-3">
            <label for="dzongkhag" class="form-label">Dzongkhag</label>
            <select id="dzongkhag" v-model="primaryFilters.dzongkhag" class="form-select">
              <option value="">Select Dzongkhag</option>
              <option v-for="dzongkhag in availableDzongkhags" :key="dzongkhag" :value="dzongkhag">
                {{ dzongkhag }}
              </option>
            </select>
          </div>
          <div class="col-md-3 mb-3">
            <label for="agency" class="form-label">Agency</label>
            <select id="agency" v-model="primaryFilters.agency" class="form-select">
              <option value="">Select Agency</option>
              <option value="School">School</option>
              <option value="Gyalsuung">Gyalsuung</option>
              <option value="RCSC">RCSC</option>
            </select>
          </div>
          <div class="col-md-3 mb-3">
            <label for="institute" class="form-label">Institute/Org</label>
            <select id="institute" v-model="primaryFilters.institute" class="form-select">
              <option value="">Select Institute/Org</option>
              <option v-for="institute in filteredInstitutes" :key="institute" :value="institute">{{ institute }}</option>
            </select>
          </div>
        </div>
        <div class="row">
          <div class="col-12">
            <button type="submit" class="btn btn-primary">Configure</button>
          </div>
        </div>
      </form>
    </div>

    <!-- Secondary filters -->
    <div v-if="showSecondaryFilters" class="second-filter-form mb-4">
      <div class="row">
        <div class="col-md-4 mb-2 mb-md-0">
          <select v-model="secondaryFilters.currentStatus" class="form-select">
            <option value="">Current Status</option>
            <option value="Mental Health Status">Mental Health Status</option>
            <option value="Referral Status">Referral Status</option>
            <option value="Current Status">Current Status</option>
          </select>
        </div>
        <div class="col-md-4 mb-2 mb-md-0">
          <select v-model="secondaryFilters.selectStatus" class="form-select">
            <option value="">Select Status</option>
            <option value="Waiting/Pending">Waiting/Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Inactive">Inactive</option>
            <option value="Ended">Ended</option>
            <option value="Discontinued">Discontinued</option>
          </select>
        </div>
      </div>
      <div class="row mt-3">
        <div class="col-12">
          <button @click="generateResults" class="btn btn-primary">Generate</button>
        </div>
      </div>
    </div>

    <!-- Display all components -->
     <!-- Tabs and content area -->
     <div v-if="showResults" class="results-container mt-4">
      <ul class="nav nav-tabs" id="resultTabs" role="tablist">
        <li class="nav-item" role="presentation">
          <button class="nav-link active" id="overview-tab" data-bs-toggle="tab" data-bs-target="#overview" type="button" role="tab" aria-controls="overview" aria-selected="true">Overview</button>
        </li>
        <li class="nav-item" role="presentation">
          <button class="nav-link" id="charts-tab" data-bs-toggle="tab" data-bs-target="#charts" type="button" role="tab" aria-controls="charts" aria-selected="false">Charts</button>
        </li>
        <li class="nav-item" role="presentation">
          <button class="nav-link" id="tables-tab" data-bs-toggle="tab" data-bs-target="#tables" type="button" role="tab" aria-controls="tables" aria-selected="false">Tables</button>
        </li>
      </ul>
      <div class="tab-content" id="resultTabsContent">
        <div class="tab-pane fade show active" id="overview" role="tabpanel" aria-labelledby="overview-tab">
          <div class="mt-4">
            <h5>Data Display</h5>
            <RndDataDisplay :filtered-data="finalFilteredData" />
          </div>
          
          <div class="mt-4">
            <h5>Tables</h5>
            <RnDChartTables :filtered-data="finalFilteredData" />
          </div>
        </div>
        <div class="tab-pane fade" id="charts" role="tabpanel" aria-labelledby="charts-tab">
          <div class="mt-4">
            <h5>Charts</h5>
            <!-- Add your chart components here -->
            <p>Chart visualizations will be displayed here.</p>
            <RNDmap/>
            <RnDage :data="ageGenderData" />
          </div>
        </div>
        <div class="tab-pane fade" id="tables" role="tabpanel" aria-labelledby="tables-tab">
          <div class="mt-4">
            <h5>Detailed Tables</h5>
            <!-- Add your detailed table components here -->
            <p>Detailed data tables will be displayed here.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import RndDataDisplay from './RndDataDisplay.vue';
import RnDChartTables from './RnDChartTables.vue';
import RNDmap from './secondtab/RNDmap.vue';
import RnDage from './secondtab/RnDage.vue';

const reportData = ref([]);
const primaryFilteredData = ref([]);
const showSecondaryFilters = ref(false);
const showResults = ref(false);

const ageGenderData = ref({
  '0-14': { male: 50, female: 45 },
  '15-24': { male: 100, female: 120 },
  '25-34': { male: 150, female: 160 },
  '35-44': { male: 120, female: 130 },
  '45-54': { male: 80, female: 90 },
  '55-64': { male: 60, female: 70 },
  '65+': { male: 40, female: 50 }
});

const loadReportData = () => {
  const storedData = sessionStorage.getItem('reportData');
  if (storedData) {
    reportData.value = JSON.parse(storedData);
    
    // Check if this is the first load after login
    const hasReloaded = localStorage.getItem('hasReloaded');
    if (!hasReloaded) {
      // Set the flag in localStorage
      localStorage.setItem('hasReloaded', 'true');
      // Reload the page
      window.location.reload();
    }
  }
};

onMounted(() => {
  loadReportData();
});

// Watch for changes in sessionStorage
window.addEventListener('storage', (event) => {
  if (event.key === 'reportData') {
    loadReportData();
  }
});

const primaryFilters = reactive({
  region: '',
  dzongkhag: '',
  agency: '',
  institute: ''
});

const secondaryFilters = reactive({
  currentStatus: '',
  selectStatus: ''
});

const regions = ['Western', 'Central', 'Eastern', 'Southern'];

const dzongkhags = {
  Western: ['Thimphu', 'Paro', 'Haa', 'Punakha', 'Gasa', 'Wangdue Phodrang'],
  Central: ['Trongsa', 'Bumthang', 'Zhemgang', 'Tsirang', 'Dagana', 'Sarpang'],
  Eastern: ['Mongar', 'Trashigang', 'Trashi Yangtse', 'Lhuentse', 'Pema Gatshel', 'Samdrup Jongkhar'],
  Southern: ['Chukha', 'Samtse', 'Dagana', 'Tsirang']
};

const getDzongkhagRegion = (dzongkhag) => {
  for (const [region, dzongkhagList] of Object.entries(dzongkhags)) {
    if (dzongkhagList.includes(dzongkhag)) {
      return region;
    }
  }
  return null;
};

const availableDzongkhags = computed(() => {
  return primaryFilters.region ? dzongkhags[primaryFilters.region] || [] : [];
});

const updateDzongkhags = () => {
  primaryFilters.dzongkhag = '';
};

const filteredInstitutes = computed(() => {
  let agencies = reportData.value.map(item => item.agency_name || '').filter(Boolean);
  
  switch (primaryFilters.agency) {
    case 'School':
      return agencies.filter(agency => agency.toLowerCase().includes('school'));
    case 'Gyalsuung':
      return agencies.filter(agency => agency.toLowerCase().includes('gyalsung'));
    case 'RCSC':
      return agencies.filter(agency => 
        !agency.toLowerCase().includes('school') &&
        !agency.toLowerCase().includes('gyalsung') &&
        !agency.toLowerCase().includes('eventbased') &&
        !agency.toLowerCase().includes('case_based')
      );
    default:
      return agencies;
  }
});

const applyPrimaryFilters = () => {
  primaryFilteredData.value = reportData.value.filter((item) => {
    const itemDzongkhag = item.user?.fields?.perm_add_dzongkhag || '';
    const itemRegion = getDzongkhagRegion(itemDzongkhag);
    const itemAgency = (item.agency_name || '').toLowerCase();
    let match = true;

    if (primaryFilters.region) match = match && itemRegion === primaryFilters.region;
    if (primaryFilters.dzongkhag) match = match && itemDzongkhag === primaryFilters.dzongkhag;
    
    if (primaryFilters.agency) {
      switch (primaryFilters.agency) {
        case 'School':
          match = match && itemAgency.includes('school');
          break;
        case 'Gyalsuung':
          match = match && itemAgency.includes('gyalsung');
          break;
        case 'RCSC':
          match = match && !itemAgency.includes('school') && 
                           !itemAgency.includes('gyalsung') && 
                           !itemAgency.includes('eventbased') && 
                           !itemAgency.includes('case_based');
          break;
      }
    }
    
    if (primaryFilters.institute) match = match && item.agency_name === primaryFilters.institute;

    return match;
  });

  showSecondaryFilters.value = true;
  showResults.value = false;
};

const generateResults = () => {
  showResults.value = true;
};

const finalFilteredData = computed(() => {
  return primaryFilteredData.value.filter((item) => {
    let match = true;
    
    if (secondaryFilters.currentStatus && secondaryFilters.selectStatus) {
      const serviceAndTreatment = item.service_and_treatment || {};
      switch (secondaryFilters.currentStatus) {
        case 'Mental Health Status':
          match = match && serviceAndTreatment.case_status === secondaryFilters.selectStatus;
          break;
        case 'Referral Status':
          match = match && serviceAndTreatment.referred === secondaryFilters.selectStatus;
          break;
        case 'Current Status':
          match = match && serviceAndTreatment.counseling === secondaryFilters.selectStatus;
          break;
      }
    }
    
    return match;
  });
});
</script>

<style scoped>
.filter-container {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-label {
  font-weight: bold;
}

.btn-primary {
  background-color: #007bff;
  border-color: #007bff;
}

.btn-primary:hover {
  background-color: #0056b3;
  border-color: #0056b3;
}

.second-filter-form {
  margin-top: 20px;
}

.results-container {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.nav-tabs .nav-link {
  color: #08919b;
}

.nav-tabs .nav-link.active {
  color: #074042;
}
</style>