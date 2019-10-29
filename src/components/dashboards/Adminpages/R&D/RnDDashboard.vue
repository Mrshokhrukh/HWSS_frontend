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
              <option v-for="institute in filteredInstitutes" :key="institute" :value="institute">{{ institute }}
              </option>
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

    <!-- Display components -->
    <div v-if="showResults" class="mt-4">
      <div class="mt-4">
        <RNDmap :filtered-data="finalFilteredData" />
      </div>

      <div class="mt-4">
        <h5>Data Display</h5>
        <RndDataDisplay :filtered-data="finalFilteredData" />
      </div>

      <div class="mt-4">
        <RnDChartTables :filtered-data="finalFilteredData" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, inject } from 'vue';
import RndDataDisplay from './RndDataDisplay.vue';
import RnDChartTables from './RnDChartTables.vue';
import RNDmap from './overview/RNDmap.vue';

// Inject the provided data
const serviceAndTreatmentData = inject('serviceAndTreatmentData');

const primaryFilteredData = ref([]);
const showSecondaryFilters = ref(false);
const showResults = ref(false);

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

const regions = ['Western', 'Central', 'Eastern'];

const dzongkhags = {
  Western: ['Thimphu', 'Paro', 'Haa', 'Punakha', 'Gasa', 'Chhukha', 'Samtse', 'Phuentsholing Thromde', 'Thimphu Thromde'],
  Central: ['Bumthang', 'Dagana', 'Sarpang', 'Trongsa', 'Tsirang', 'Wangdue Phodrang', 'Zhemgang', 'Gelephu Thromde'],
  Eastern: ['Lhuentse', 'Mongar', 'Pemagatshel', 'Samdrup Jongkhar', 'Samdrup Jongkhar Thromde', 'Trashiyangtse', 'Trashigang']
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
  if (!serviceAndTreatmentData.value) return [];

  let agencies = serviceAndTreatmentData.value
    .map(item => item.user?.agency_details?.agency?.agency_name || '')
    .filter(Boolean);

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
      return [...new Set(agencies)];
  }
});

const applyPrimaryFilters = () => {
  primaryFilteredData.value = serviceAndTreatmentData.value.filter((item) => {
    const itemDzongkhag = item.user?.fields?.perm_add_dzongkhag || '';
    const itemRegion = getDzongkhagRegion(itemDzongkhag);
    const itemAgency = (item.user?.agency_details?.agency?.agency_name || '').toLowerCase();
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

    if (primaryFilters.institute) {
      match = match && item.user?.agency_details?.agency?.agency_name === primaryFilters.institute;
    }

    return match;
  });

  showSecondaryFilters.value = true;
  showResults.value = false;
};

const finalFilteredData = computed(() => {
  if (!primaryFilteredData.value) return [];

  return primaryFilteredData.value.filter((item) => {
    let match = true;

    if (secondaryFilters.currentStatus && secondaryFilters.selectStatus) {
      switch (secondaryFilters.currentStatus) {
        case 'Mental Health Status':
          match = match && item.case_status === secondaryFilters.selectStatus;
          break;
        case 'Referral Status':
          match = match && item.referred === secondaryFilters.selectStatus;
          break;
        case 'Current Status':
          match = match && item.counseling === secondaryFilters.selectStatus;
          break;
      }
    }

    return match;
  });
});

const generateResults = () => {
  showResults.value = true;
};
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
</style>