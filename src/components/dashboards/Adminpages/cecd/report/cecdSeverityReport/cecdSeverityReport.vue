<template>
  <div class="severity-graphs-container">
    <div class="filters-section">
      <h3 class="filters-title">Filters</h3>
      <div class="filters-grid">
        <div class="filter-item">
          <label for="yearFilter" class="filter-label">Year</label>
          <select id="yearFilter" v-model="filters.year" class="filter-select">
            <option value="">All Years</option>
            <option v-for="year in availableYears" :key="year" :value="year">{{ year }}</option>
          </select>
        </div>
        <div class="filter-item">
          <label for="genderFilter" class="filter-label">Gender</label>
          <select id="genderFilter" v-model="filters.gender" class="filter-select">
            <option value="">All Genders</option>
            <option v-for="gender in availableGenders" :key="gender" :value="gender">{{ gender }}</option>
          </select>
        </div>
        <div class="filter-item">
          <label for="organizationFilter" class="filter-label">Organization</label>
          <select id="organizationFilter" v-model="filters.organization" class="filter-select">
            <option value="">All Organizations</option>
            <option v-for="org in availableOrganizations" :key="org" :value="org">{{ org }}</option>
          </select>
        </div>
        <div class="filter-item">
          <label for="employmentFilter" class="filter-label">Employment</label>
          <select id="employmentFilter" v-model="filters.employment" class="filter-select">
            <option value="">All Employment</option>
            <option v-for="emp in availableEmployment" :key="emp" :value="emp">{{ emp }}</option>
          </select>
        </div>
        <div class="filter-item">
          <label for="userClassFilter" class="filter-label">User Class</label>
          <select id="userClassFilter" v-model="filters.userClass" class="filter-select">
            <option value="">All User Classes</option>
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
import { ref, computed, watch } from 'vue';
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
  organization: '',
  employment: '',
  userClass: ''
});

const availableYears = computed(() => {
  if (!props.filteredData) return [];
  const years = new Set(props.filteredData.map(item => {
    const date = item.service_and_treatment?.date;
    return date ? new Date(date).getFullYear() : null;
  }).filter(Boolean));
  return Array.from(years).sort();
});

const availableGenders = computed(() => {
  if (!props.filteredData) return [];
  const genders = new Set(props.filteredData.map(item => item.user?.fields?.gender).filter(Boolean));
  return Array.from(genders).sort();
});

const availableOrganizations = computed(() => {
  if (!props.filteredData) return [];
  const orgs = new Set(props.filteredData.map(item => item.agency_name).filter(Boolean));
  return Array.from(orgs).sort();
});

const availableEmployment = computed(() => {
  if (!props.filteredData) return [];
  const employment = new Set(props.filteredData.map(item => item.user_agency?.fields?.user_role_agency).filter(Boolean));
  return Array.from(employment).sort();
});

const availableUserClasses = computed(() => {
  if (!props.filteredData) return [];
  const userClasses = new Set(props.filteredData.map(item => item.user_agency?.fields?.user_class).filter(Boolean));
  return Array.from(userClasses).sort();
});

const filteredDataComputed = computed(() => {
  if (!props.filteredData) return [];
  return props.filteredData.filter(item => {
    const itemYear = item.service_and_treatment?.date ? new Date(item.service_and_treatment.date).getFullYear() : null;
    return (
      (filters.value.year === '' || itemYear === parseInt(filters.value.year)) &&
      (filters.value.gender === '' || item.user?.fields?.gender === filters.value.gender) &&
      (filters.value.organization === '' || item.agency_name === filters.value.organization) &&
      (filters.value.employment === '' || item.user_agency?.fields?.user_role_agency === filters.value.employment) &&
      (filters.value.userClass === '' || item.user_agency?.fields?.user_class === filters.value.userClass)
    );
  });
});

watch(() => props.filteredData, (newValue) => {
  if (newValue && newValue.length > 0) {
    isDataLoaded.value = true;
  }
}, { immediate: true });

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

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.filter-item {
  display: flex;
  flex-direction: column;
}

.filter-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #4a5568;
  margin-bottom: 5px;
}

.filter-select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  background-color: white;
  font-size: 0.9rem;
  color: #4a5568;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.filter-select:focus {
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

@media (max-width: 768px) {
  .filters-grid {
    grid-template-columns: 1fr;
  }
}

.loading-message {
  text-align: center;
  font-size: 1.2rem;
  color: #4a5568;
  margin-top: 20px;
}
</style>