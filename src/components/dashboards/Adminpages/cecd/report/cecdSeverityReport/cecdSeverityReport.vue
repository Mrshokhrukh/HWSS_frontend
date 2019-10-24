<template>
  <div class="severity-graphs-container">
    <div class="filters-section">
      <h3 class="filters-title">Filters</h3>
      <div class="row mb-3">
        <div class="col-md-2">
          <label for="yearFilter" class="form-label">Year</label>
          <select id="yearFilter" v-model="filters.year" class="form-select">
            <option value="">All Years</option>
            <option v-for="year in availableYears" :key="year" :value="year">{{ year }}</option>
          </select>
        </div>

        <div class="col-md-2">
          <label for="genderFilter" class="form-label">Gender</label>
          <select id="genderFilter" v-model="filters.gender" class="form-select">
            <option value="">All Genders</option>
            <option v-for="gender in availableGenders" :key="gender" :value="gender">{{ gender }}</option>
          </select>
        </div>

        <div class="col-md-3">
          <label for="agencyFilter" class="form-label">Agency</label>
          <div class="searchable-dropdown">
            <input type="text" id="agencyFilter" class="form-control" v-model="agencySearch"
              placeholder="Search agency..." @input="filterAgencies" @focus="showAgencyDropdown = true" />
            <ul class="dropdown-menu" :class="{ show: showAgencyDropdown && filteredAgencies.length }">
              <li v-for="agency in filteredAgencies" :key="agency">
                <a class="dropdown-item" href="#" @click.prevent="selectAgency(agency)">{{ agency }}</a>
              </li>
            </ul>
          </div>
        </div>

        <div class="col-md-2">
          <label for="roleFilter" class="form-label">Role</label>
          <select id="roleFilter" v-model="filters.role" class="form-select">
            <option value="">All Roles</option>
            <option v-for="role in availableRoles" :key="role" :value="role">{{ formatRole(role) }}</option>
          </select>
        </div>

        <div class="col-md-2" v-if="isSchoolAgency">
          <label for="userClassFilter" class="form-label">Class</label>
          <select id="userClassFilter" v-model="filters.userClass" class="form-select">
            <option value="">All Classes</option>
            <option v-for="userClass in availableUserClasses" :key="userClass" :value="userClass">{{ userClass }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <div v-if="isDataLoaded" class="graph-section">
      <cecdSeverityGraph :filteredData='filteredDataComputed' />
    </div>
    <div v-if="isDataLoaded" class="graph-section">
      <cecdSUDSeverityGraph :filteredData='filteredDataComputed' />
    </div>
    <div v-else class="loading-message">
      Loading data...
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import cecdSeverityGraph from './cecdSeverityGraph.vue'
import cecdSUDSeverityGraph from './cecdSUDSeverityGraph.vue'

const props = defineProps({
  filteredData: {
    type: Array,
    required: true
  }
});

const isDataLoaded = ref(false);
const filters = ref({
  year: '',
  gender: '',
  role: '',
  userClass: ''
});

// Agency search functionality
const agencySearch = ref('');
const showAgencyDropdown = ref(false);
const filteredAgencies = ref([]);

// Format role for display
function formatRole(role) {
  if (!role) return '';
  return role.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

// Available Years
const availableYears = computed(() => {
  if (!props.filteredData) return [];
  const years = new Set(props.filteredData.map(item => {
    const date = item.date;
    return date ? new Date(date).getFullYear() : null;
  }).filter(Boolean));
  return Array.from(years).sort((a, b) => b - a);
});

// Available Genders
const availableGenders = computed(() => {
  if (!props.filteredData) return [];
  const genders = new Set(props.filteredData.map(item =>
    item.user?.gender
  ).filter(Boolean));
  return Array.from(genders).sort();
});

// Available Roles
const availableRoles = computed(() => {
  if (!props.filteredData) return [];
  const roles = new Set(props.filteredData.map(item =>
    item.user?.role
  ).filter(Boolean));
  return Array.from(roles).sort();
});

// Available Agencies
const availableAgencies = computed(() => {
  if (!props.filteredData) return [];
  const agencies = new Set(props.filteredData.map(item =>
    item.user?.active_agency?.agency_name
  ).filter(Boolean));
  return Array.from(agencies).sort();
});

// Check if agency is a school
const isSchoolAgency = computed(() => {
  const agency = filters.value.agency?.toLowerCase() || '';
  return agency.includes('school') || agency.includes('education');
});

// Available Classes
const availableUserClasses = computed(() => {
  if (!filters.value.agency) return [];
  const classes = new Set(props.filteredData
    .filter(item => item.user?.active_agency?.agency_name === filters.value.agency)
    .map(item => item.user?.agency_details?.user_class)
    .filter(Boolean));
  return Array.from(classes).sort((a, b) => Number(a) - Number(b));
});

// Filtered Data
const filteredDataComputed = computed(() => {
  if (!props.filteredData) return [];

  return props.filteredData.filter(item => {
    const itemYear = item.date ? new Date(item.date).getFullYear() : null;

    const matchesYear = !filters.value.year || itemYear === parseInt(filters.value.year);
    const matchesGender = !filters.value.gender || item.user?.gender === filters.value.gender;
    const matchesRole = !filters.value.role || item.user?.role === filters.value.role;
    const matchesAgency = !filters.value.agency || item.user?.active_agency?.agency_name === filters.value.agency;
    const matchesClass = !isSchoolAgency.value || !filters.value.userClass ||
      item.user?.agency_details?.user_class === filters.value.userClass;

    return matchesYear && matchesGender && matchesRole && matchesAgency && matchesClass;
  });
});

// Agency search handlers
function filterAgencies() {
  filteredAgencies.value = availableAgencies.value.filter(agency =>
    agency.toLowerCase().includes(agencySearch.value.toLowerCase())
  );
}

function selectAgency(agency) {
  agencySearch.value = agency;
  filters.value.agency = agency;
  showAgencyDropdown.value = false;
  filters.value.userClass = ''; // Reset class when agency changes
}

// Click outside handler
function handleClickOutside(event) {
  if (!event.target.closest('.searchable-dropdown')) {
    showAgencyDropdown.value = false;
  }
}

// Lifecycle hooks
onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

// Watch for data changes
watch(() => props.filteredData, (newValue) => {
  if (newValue && newValue.length > 0) {
    isDataLoaded.value = true;
  } else {
    isDataLoaded.value = false;
  }
}, { immediate: true });

// Sync agency search with filter
watch(() => filters.value.agency, (newValue) => {
  agencySearch.value = newValue;
});

watch(agencySearch, (newValue) => {
  filters.value.agency = newValue;
});
</script>

<style scoped>
.severity-graphs-container {
  max-width: 100%;
  margin: 0 auto;
  padding: 2px;
  font-family: Arial, sans-serif;
}

.filters-section {
  background-color: #ffffff;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.filters-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: #2c6975;
  margin-bottom: 20px;
}

.form-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #4a5568;
  margin-bottom: 5px;
}

.form-select,
.form-control {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  background-color: white;
  font-size: 0.9rem;
  color: #4a5568;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-select:focus,
.form-control:focus {
  outline: none;
  border-color: #2c6975;
  box-shadow: 0 0 0 3px rgba(44, 105, 117, 0.2);
}

.graph-section {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.searchable-dropdown {
  position: relative;
}

.dropdown-menu {
  width: 100%;
  max-height: 200px;
  overflow-y: auto;
}

.dropdown-menu.show {
  display: block;
}

.loading-message {
  text-align: center;
  font-size: 1.2rem;
  color: #4a5568;
  margin-top: 20px;
}
</style>