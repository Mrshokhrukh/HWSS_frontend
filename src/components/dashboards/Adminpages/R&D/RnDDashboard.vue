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
              <option v-for="agency in uniqueAgencies" :key="agency" :value="agency">{{ agency }}</option>
            </select>
          </div>
          <div class="col-md-3 mb-3">
            <label for="institute" class="form-label">Institute/Org</label>
            <select id="institute" v-model="primaryFilters.institute" class="form-select">
              <option value="">Select Institute/Org</option>
              <option v-for="institute in uniqueAgencies" :key="institute" :value="institute">{{ institute }}</option>
            </select>
          </div>
        </div>
        <div class="row">
          <div class="col-12">
            <button type="submit" class="btn btn-primary">GENERATE</button>
          </div>
        </div>
      </form>
    </div>

    <!-- Secondary filters -->
    <div v-if="showSecondaryFilters" class="second-filter-form mb-4">
      <div class="card">
        <div class="card-body">
          <div class="row align-items-center">
            <div class="col-md-3 mb-2 mb-md-0">
              <input type="text" v-model="secondaryFilters.searchQuery" class="form-control" placeholder="Search...">
            </div>
            <div class="col-md-3 mb-2 mb-md-0">
              <select v-model="secondaryFilters.currentStatus" class="form-select">
                <option value="">Current Status</option>
                <option value="Mental Health Status">Mental Health Status</option>
                <option value="Referral Status">Referral Status</option>
                <option value="Current Status">Current Status</option>
              </select>
            </div>
            <div class="col-md-3 mb-2 mb-md-0">
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
            <div class="col-md-3 mb-2 mb-md-0">
              <select v-model="secondaryFilters.sortBy" class="form-select">
                <option value="">Sort By</option>
                <option value="name">Name</option>
                <option value="date">Date</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Display all components -->
    <div v-if="showSecondaryFilters">
      <div class="mb-4">
        <h5>Data Display</h5>
        <RndDataDisplay :filtered-data="finalFilteredData" />
      </div>
      
      <!-- <div class="mb-4">
        <h5>Graph</h5>
        <RnDGraph :filtered-data="finalFilteredData" />
      </div> -->
      
      <div class="mb-4">
        <h5>Tables</h5>
        <RnDChartTables :filtered-data="finalFilteredData" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import RndDataDisplay from './RndDataDisplay.vue';
// import RnDGraph from './RnDGraph.vue';
import RnDChartTables from './RnDChartTables.vue';

const reportData = ref([]);
const primaryFilteredData = ref([]);
const showSecondaryFilters = ref(false);

onMounted(() => {
  const storedData = sessionStorage.getItem('reportData');
  if (storedData) {
    reportData.value = JSON.parse(storedData);
  }
});

const primaryFilters = reactive({
  region: '',
  dzongkhag: '',
  agency: '',
  institute: ''
});

const secondaryFilters = reactive({
  searchQuery: '',
  currentStatus: '',
  selectStatus: '',
  sortBy: ''
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
  return primaryFilters.region ? dzongkhags[primaryFilters.region] : [];
});

const updateDzongkhags = () => {
  primaryFilters.dzongkhag = '';
};

const uniqueAgencies = computed(() => {
  return [...new Set(reportData.value.map(item => item.agency_name))].filter(Boolean);
});

const applyPrimaryFilters = () => {
  primaryFilteredData.value = reportData.value.filter((item) => {
    const itemDzongkhag = item.user?.fields?.perm_add_dzongkhag;
    const itemRegion = getDzongkhagRegion(itemDzongkhag);
    let match = true;

    if (primaryFilters.region) match = match && itemRegion === primaryFilters.region;
    if (primaryFilters.dzongkhag) match = match && itemDzongkhag === primaryFilters.dzongkhag;
    if (primaryFilters.agency) match = match && item.agency_name === primaryFilters.agency;
    if (primaryFilters.institute) match = match && item.agency_name === primaryFilters.institute;

    return match;
  });

  showSecondaryFilters.value = true;
};

const finalFilteredData = computed(() => {
  let filtered = primaryFilteredData.value.filter((item) => {
    let match = true;
    
    if (secondaryFilters.searchQuery) {
      const searchLower = secondaryFilters.searchQuery.toLowerCase();
      match = match && (
        item.user?.fields?.first_name?.toLowerCase().includes(searchLower) ||
        item.user?.fields?.last_name?.toLowerCase().includes(searchLower) ||
        item.user?.fields?.username?.toLowerCase().includes(searchLower)
      );
    }
    
    if (secondaryFilters.currentStatus && secondaryFilters.selectStatus) {
      switch (secondaryFilters.currentStatus) {
        case 'Mental Health Status':
          match = match && item.service_and_treatment?.case_status === secondaryFilters.selectStatus;
          break;
        case 'Referral Status':
          match = match && item.service_and_treatment?.referred === secondaryFilters.selectStatus;
          break;
        case 'Current Status':
          match = match && item.service_and_treatment?.counseling === secondaryFilters.selectStatus;
          break;
      }
    }
    
    return match;
  });

  if (secondaryFilters.sortBy) {
    filtered.sort((a, b) => {
      if (secondaryFilters.sortBy === 'name') {
        return (a.user?.fields?.first_name || '').localeCompare(b.user?.fields?.first_name || '');
      } else if (secondaryFilters.sortBy === 'date') {
        return new Date(b.service_and_treatment?.date || 0) - new Date(a.service_and_treatment?.date || 0);
      }
      return 0;
    });
  }

  return filtered;
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
</style>