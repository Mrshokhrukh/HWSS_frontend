<template>
  <div class="dashboard-container">
    <!-- Enhanced Filter Panel -->
    <Panel :toggleable="true" :collapsed="false" class="filter-panel">
      <template #header>
        <div class="filter-header">
          <div class="d-flex align-items-center gap-3">
            <i class="pi pi-filter text-white"></i>
            <h4 class="m-0">Configure Data Filters</h4>
          </div>
          <div class="filter-badges" v-if="hasActiveFilters">
            <span class="filter-count">{{ activeFilterCount }} active</span>
          </div>
        </div>
      </template>

      <div class="filter-content">
        <!-- Primary Filters -->
        <form @submit.prevent="applyFilters" class="primary-filters">
          <div class="filter-grid">
            <!-- Year Filter -->
            <div class="filter-item">
              <label class="filter-label">Year</label>
              <Dropdown v-model="filters.year" :options="availableYears" optionLabel="name" placeholder="Select Year"
                class="w-full" :filter="true" :showClear="true">
                <template #value="slotProps">
                  <div class="dropdown-value">
                    <i class="pi pi-calendar mr-2"></i>
                    <span>{{ slotProps.value?.name || 'Select Year' }}</span>
                  </div>
                </template>
              </Dropdown>
            </div>
            <!-- Region Selection -->
            <div class="filter-item">
              <label class="filter-label">Region</label>
              <Dropdown v-model="filters.region" :options="regions" optionLabel="name" placeholder="Select Region"
                class="w-full" @change="handleRegionChange" :filter="true" :showClear="true">
                <template #value="slotProps">
                  <div class="dropdown-value">
                    <i class="pi pi-map-marker mr-2"></i>
                    <span>{{ slotProps.value?.name || 'Select Region' }}</span>
                  </div>
                </template>
              </Dropdown>
            </div>

            <!-- Dzongkhag Selection -->
            <div class="filter-item">
              <label class="filter-label">Dzongkhag</label>
              <Dropdown v-model="filters.dzongkhag" :options="availableDzongkhags" optionLabel="name"
                placeholder="Select Dzongkhag" class="w-full" :disabled="!filters.region" :filter="true"
                :showClear="true">
                <template #value="slotProps">
                  <div class="dropdown-value">
                    <i class="pi pi-building mr-2"></i>
                    <span>{{ slotProps.value?.name || 'Select Dzongkhag' }}</span>
                  </div>
                </template>
              </Dropdown>
            </div>

            <!-- Organization Selection -->
            <div class="filter-item">
              <label class="filter-label">Organization</label>
              <Dropdown v-model="filters.organization" :options="organizations" optionLabel="name"
                placeholder="Select Organization" class="w-full" @change="handleOrganizationChange" :filter="true"
                :showClear="true">
                <template #value="slotProps">
                  <div class="dropdown-value">
                    <i class="pi pi-briefcase mr-2"></i>
                    <span>{{ slotProps.value?.name || 'Select Organization' }}</span>
                  </div>
                </template>
              </Dropdown>
            </div>

            <!-- Agency Selection -->
            <div class="filter-item">
              <label class="filter-label">Agency</label>
              <Dropdown v-model="filters.agency" :options="filteredAgencies" optionLabel="name"
                placeholder="Select Agency" class="w-full" :disabled="!filters.organization" :filter="true"
                :showClear="true">
                <template #value="slotProps">
                  <div class="dropdown-value">
                    <i class="pi pi-home mr-2"></i>
                    <span>{{ slotProps.value?.name || 'Select Agency' }}</span>
                  </div>
                </template>
              </Dropdown>
            </div>
          </div>

          <!-- Active Agency Selection (only visible for cluster) -->
          <div class="filter-item" v-if="filters.organization?.code === 'CLUSTER' && filters.agency">
            <label class="filter-label">Active Agency</label>
            <Dropdown v-model="filters.activeAgency" :options="availableActiveAgencies" optionLabel="name"
              placeholder="Select Active Agency" class="w-full" :filter="true" :showClear="true">
              <template #value="slotProps">
                <div class="dropdown-value">
                  <i class="pi pi-building mr-2"></i>
                  <span>{{ slotProps.value?.name || 'Select Active Agency' }}</span>
                </div>
              </template>
            </Dropdown>
          </div>

          <!-- Additional Filters -->
          <div class="filter-grid mt-4">
            <!-- Age Group Filter -->
            <div class="filter-item">
              <label class="filter-label">Age Group</label>
              <MultiSelect v-model="filters.ageGroups" :options="ageGroups" optionLabel="name"
                placeholder="Select Age Groups" class="w-full" :filter="true" display="chip">
                <template #value="slotProps">
                  <div class="multiselect-value">
                    <span v-if="slotProps.value.length === 0">Select Age Groups</span>
                    <Chip v-for="item in slotProps.value" :key="item.code" :label="item.name" class="mr-1" />
                  </div>
                </template>
              </MultiSelect>
            </div>

            <!-- Class/Grade Filter -->
            <div class="filter-item" v-if="filters.organization?.code === 'SCHOOL'">
              <label class="filter-label">Class/Grade</label>
              <MultiSelect v-model="filters.classes" :options="schoolClasses" optionLabel="name"
                placeholder="Select Classes" class="w-full" :filter="true" display="chip">
                <template #value="slotProps">
                  <div class="multiselect-value">
                    <span v-if="slotProps.value.length === 0">Select Classes</span>
                    <Chip v-for="item in slotProps.value" :key="item.code" :label="item.name" class="mr-1" />
                  </div>
                </template>
              </MultiSelect>
            </div>

            <!-- Status Filters -->
            <div class="filter-item">
              <label class="filter-label">Current Status</label>
              <Dropdown v-model="filters.currentStatus" :options="statusTypes" optionLabel="name"
                placeholder="Select Status Type" class="w-full" :filter="true" :showClear="true">
                <template #value="slotProps">
                  <div class="dropdown-value">
                    <i class="pi pi-chart-bar mr-2"></i>
                    <span>{{ slotProps.value?.name || 'Select Status Type' }}</span>
                  </div>
                </template>
              </Dropdown>
            </div>

            <div class="filter-item">
              <label class="filter-label">Status Value</label>
              <Dropdown v-model="filters.statusValue" :options="currentStatusValues" optionLabel="name"
                placeholder="Select Status" class="w-full" :disabled="!filters.currentStatus" :filter="true"
                :showClear="true">
                <template #value="slotProps">
                  <div class="dropdown-value">
                    <i class="pi pi-tag mr-2"></i>
                    <span>{{ slotProps.value?.name || 'Select Status' }}</span>
                  </div>
                </template>
              </Dropdown>
            </div>
          </div>

          <!-- Active Filters Display -->
          <div v-if="hasActiveFilters" class="active-filters-section">
            <div class="active-filters-header">
              <i class="pi pi-check-circle mr-2"></i>
              <h6 class="m-0">Active Filters</h6>
            </div>
            <div class="active-filters-content">
              <Chip v-for="filter in activeFilters" :key="filter.key" :label="filter.label" class="filter-chip"
                removable @remove="removeFilter(filter.key)" />
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="filter-actions">
            <Button label="Reset Filters" icon="pi pi-refresh" severity="secondary" outlined @click="resetFilters" />
            <Button label="Apply Filters" icon="pi pi-check" severity="primary" @click="applyFilters"
              :loading="isLoading" />
          </div>
        </form>
      </div>
    </Panel>

    <!-- Results Section -->
    <div v-if="showResults" class="results-section">
      <div v-if="isLoading" class="loading-overlay">
        <ProgressSpinner />
      </div>

      <!-- Enhanced Summary Cards -->
      <div class="summary-grid">
        <div v-for="metric in summaryMetrics" :key="metric.label" class="summary-card">
          <div class="summary-content">
            <div class="summary-header">
              <h6>{{ metric.label }}</h6>
              <i
                :class="['trend-icon', metric.trend > 0 ? 'pi pi-arrow-up text-success' : 'pi pi-arrow-down text-danger']"></i>
            </div>
            <h3 class="summary-value">{{ metric.value }}</h3>
            <small :class="['trend-value', metric.trend > 0 ? 'text-success' : 'text-danger']">
              {{ Math.abs(metric.trend) }}% from previous period
            </small>
          </div>
        </div>
      </div>

      <!-- Visualization Components -->
      <div class="visualization-grid">
        <div class="map-container">
          <RNDmap :filtered-data="filteredData" />
        </div>
        <div class="chart-container">
          <RndDataDisplay :filtered-data="filteredData" />
        </div>
        <div class="table-container">
          <RnDChartTables :filtered-data="filteredData" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, inject, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import Dropdown from 'primevue/dropdown';
import MultiSelect from 'primevue/multiselect';
import Button from 'primevue/button';
import Chip from 'primevue/chip';
import Panel from 'primevue/panel';
import ProgressSpinner from 'primevue/progressspinner';
import RndDataDisplay from './RndDataDisplay.vue';
import RnDChartTables from './RnDChartTables.vue';
import RNDmap from './overview/RNDmap.vue';

// Inject the provided data
const serviceAndTreatmentData = inject('serviceAndTreatmentData');
const toast = useToast();

// State Management
const isFilterExpanded = ref(true);
const isLoading = ref(false);
const showResults = ref(false);

// Filter state
const filters = reactive({
  region: null,
  dzongkhag: null,
  organization: null,
  agency: null,
  ageGroups: [],
  classes: [],
  currentStatus: null,
  statusValue: null,
  year: null,
  activeAgency: null
});

// Computed property for available years
const availableYears = computed(() => {
  if (!serviceAndTreatmentData.value) return [];

  // Get unique years from screening_data submission_dates
  const years = new Set(
    serviceAndTreatmentData.value
      .filter(item => item.screening_data?.submission_date)
      .map(item => new Date(item.screening_data.submission_date).getFullYear())
  );

  return Array.from(years)
    .sort((a, b) => b - a) // Sort in descending order
    .map(year => ({
      code: year.toString(),
      name: year.toString()
    }));
});

// Constants and Options
const regions = [
  { code: 'WESTERN', name: 'Western' },
  { code: 'CENTRAL', name: 'Central' },
  { code: 'EASTERN', name: 'Eastern' }
];

const organizations = [
  { code: 'EVENT_BASED', name: 'Event Based' },
  { code: 'CASE_BASED', name: 'Case Based' },
  { code: 'CLUSTER', name: 'Cluster' }
];

const clusterTypes = [
  { code: 'GYALSUNG', name: 'Gyalsung' },
  { code: 'SCHOOL', name: 'School' }
];

const ageGroups = [
  { code: '13-15', name: '13-15 years' },
  { code: '16-18', name: '16-18 years' },
  { code: '19-21', name: '19-21 years' },
  { code: '22-24', name: '22-24 years' },
  { code: '25+', name: '25+ years' }
];

const schoolClasses = [
  { code: 'PP', name: 'Pre-Primary' },
  { code: '1', name: 'Class 1' },
  { code: '2', name: 'Class 2' },
  { code: '3', name: 'Class 3' },
  { code: '4', name: 'Class 4' },
  { code: '5', name: 'Class 5' },
  { code: '6', name: 'Class 6' },
  { code: '7', name: 'Class 7' },
  { code: '8', name: 'Class 8' },
  { code: '9', name: 'Class 9' },
  { code: '10', name: 'Class 10' },
  { code: '11', name: 'Class 11' },
  { code: '12', name: 'Class 12' }
];


const statusTypes = [
  { code: 'MENTAL_HEALTH', name: 'Mental Health Status' },
  { code: 'REFERRAL', name: 'Referral Status' },
  { code: 'CURRENT', name: 'Current Status' }
];

// Computed Properties
const availableDzongkhags = computed(() => {
  if (!filters.region || !filters.region.code) return [];

  const dzongkhagsByRegion = {
    WESTERN: ['Thimphu', 'Paro', 'Haa', 'Punakha', 'Gasa', 'Chhukha', 'Samtse', 'Thimphu Thromde', 'Phuentshogling Thromde'],
    CENTRAL: ['Bumthang', 'Dagana', 'Sarpang', 'Trongsa', 'Tsirang', 'Wangdue', 'Zhemgang'],
    EASTERN: ['Lhuentse', 'Mongar', 'Pemagatshel', 'Samdrup Jongkhar', 'Trashigang', 'Samdrup Jongkhar Thromde', 'Trashi Yangtse']
  };

  return dzongkhagsByRegion[filters.region.code].map(name => ({
    code: name.toUpperCase(),
    name
  }));
});


const filteredAgencies = computed(() => {
  if (!serviceAndTreatmentData.value || !filters.organization) return [];

  switch (filters.organization.code) {
    case 'EVENT_BASED':
      return Array.from(new Set(
        serviceAndTreatmentData.value
          .filter(item => item.screening_data?.event)
          .map(item => ({
            code: `Event ${item.screening_data.event}`,
            name: `Event ${item.screening_data.event}`
          }))
      ));

    case 'CASE_BASED':
      const caseAgencies = new Set();
      serviceAndTreatmentData.value
        .filter(item => item.screening_data?.case)
        .forEach(item => {
          if (item.user?.active_agency?.agency_name) {
            caseAgencies.add(item.user.active_agency.agency_name);
          }
        });
      return Array.from(caseAgencies).map(name => ({
        code: name,
        name
      }));

    case 'CLUSTER':
      // Just return school/gyalsung options
      return clusterTypes;

    default:
      return [];
  }
});

// Add a new computed property for school agencies
const availableActiveAgencies = computed(() => {
  if (!filters.organization?.code === 'CLUSTER' || !filters.agency) return [];

  const uniqueAgencies = new Set();

  // Only process items that don't have event or case in screening_data
  serviceAndTreatmentData.value
    .filter(item => !item.screening_data?.event && !item.screening_data?.case)
    .forEach(item => {
      const agencyName = item.user?.active_agency?.agency_name;
      if (agencyName) {
        const lowerAgencyName = agencyName.toLowerCase();
        if (filters.agency.code === 'SCHOOL' && lowerAgencyName.includes('school')) {
          uniqueAgencies.add(agencyName);
        } else if (filters.agency.code === 'GYALSUNG' && lowerAgencyName.includes('gyalsung')) {
          uniqueAgencies.add(agencyName);
        }
      }
    });

  return Array.from(uniqueAgencies).map(name => ({
    code: name,
    name
  }));
});

const currentStatusValues = computed(() => {
  if (!filters.currentStatus) return [];

  const statusMap = {
    MENTAL_HEALTH: [
      { code: 'WAITING', name: 'Waiting/Pending' },
      { code: 'IN_PROGRESS', name: 'In Progress' },
      { code: 'COMPLETED', name: 'Completed' }
    ],
    REFERRAL: [
      { code: 'NOT_REFERRED', name: 'Not Referred' },
      { code: 'REFERRED', name: 'Referred' },
      { code: 'IN_PROGRESS', name: 'In Progress' }
    ],
    CURRENT: [
      { code: 'ACTIVE', name: 'Active' },
      { code: 'INACTIVE', name: 'Inactive' },
      { code: 'DISCONTINUED', name: 'Discontinued' }
    ]
  };

  return statusMap[filters.currentStatus.code] || [];
});

const hasActiveFilters = computed(() => {
  return Object.values(filters).some(value =>
    value !== null &&
    (Array.isArray(value) ? value.length > 0 : true)
  );
});

const activeFilterCount = computed(() => {
  return Object.values(filters).filter(value =>
    value !== null &&
    (Array.isArray(value) ? value.length > 0 : true)
  ).length;
});

const activeFilters = computed(() => {
  const active = [];

  if (filters.region) active.push({ key: 'region', label: `Region: ${filters.region.name}` });
  if (filters.dzongkhag) active.push({ key: 'dzongkhag', label: `Dzongkhag: ${filters.dzongkhag.name}` });
  if (filters.organization) active.push({ key: 'organization', label: `Organization: ${filters.organization.name}` });
  if (filters.activeAgency) {
    active.push({
      key: 'activeAgency',
      label: `Active Agency: ${filters.activeAgency.name}`
    });
  }
  if (filters.ageGroups.length) {
    active.push({
      key: 'ageGroups',
      label: `Age Groups: ${filters.ageGroups.map(g => g.name).join(', ')}`
    });
  }
  if (filters.classes.length) {
    active.push({
      key: 'classes',
      label: `Classes: ${filters.classes.map(c => c.name).join(', ')}`
    });
  }
  if (filters.currentStatus && filters.statusValue) {
    active.push({
      key: 'status',
      label: `${filters.currentStatus.name}: ${filters.statusValue.name}`
    });
  }
  if (filters.year) {
    active.push({
      key: 'year',
      label: `Screening Year: ${filters.year.name}`
    });
  }

  return active;
});

const handleRegionChange = () => {
  filters.dzongkhag = null;
};

const handleOrganizationChange = () => {
  filters.agency = null;
  filters.activeAgency = null;
  filters.classes = [];
};

const calculateAge = (dateOfBirth) => {
  const dob = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }

  return age;
};

const getAgeGroup = (age) => {
  if (age < 13) return null;
  if (age <= 15) return '13-15';
  if (age <= 18) return '16-18';
  if (age <= 21) return '19-21';
  if (age <= 24) return '22-24';
  return '25+';
};

const resetFilters = () => {
  Object.keys(filters).forEach(key => {
    filters[key] = Array.isArray(filters[key]) ? [] : null;
  });
  showResults.value = false;
};

const removeFilter = (filterKey) => {
  if (Array.isArray(filters[filterKey])) {
    filters[filterKey] = [];
  } else {
    filters[filterKey] = null;
  }

  // Handle dependent fields
  if (filterKey === 'region') {
    filters.dzongkhag = null;
  } else if (filterKey === 'organization') {
    filters.agency = null;
    filters.activeAgency = null;
    filters.classes = [];
  } else if (filterKey === 'agency') {
    filters.activeAgency = null;
  } else if (filterKey === 'currentStatus') {
    filters.statusValue = null;
  }
};

const filteredData = computed(() => {
  if (!serviceAndTreatmentData.value) {
    console.log('No service and treatment data available');
    return [];
  }

  return serviceAndTreatmentData.value.filter(item => {
    let match = true;

    // Region and Dzongkhag filtering
    if (filters.region) {
      // Get dzongkhag from all possible locations
      const itemDzongkhag =
        item.user?.ps_add_dzongkhag ||
        item.user?.perm_add_dzongkhag ||
        item.screening_data?.ps_add_dzongkhag ||
        item.user?.agency_details?.agency?.present_dzongkhag ||
        item.user?.active_agency?.present_dzongkhag;

      // If no dzongkhag found, exclude from results
      if (!itemDzongkhag) {
        console.log('No dzongkhag found for item:', item.id);
        return false;
      }

      // Check region match
      const dzongkhagRegion = getDzongkhagRegion(itemDzongkhag);
      console.log('Item dzongkhag:', itemDzongkhag, 'Region:', dzongkhagRegion);

      match = match && dzongkhagRegion === filters.region.code;

      // Check dzongkhag match if dzongkhag filter is applied
      if (filters.dzongkhag) {
        const normalizedItemDzongkhag = itemDzongkhag.toUpperCase().trim();
        const normalizedFilterDzongkhag = filters.dzongkhag.code.trim();

        console.log('Comparing dzongkhag:', {
          item: normalizedItemDzongkhag,
          filter: normalizedFilterDzongkhag,
          match: normalizedItemDzongkhag === normalizedFilterDzongkhag
        });

        match = match && normalizedItemDzongkhag === normalizedFilterDzongkhag;
      }
    }

    // Organization and Agency filtering
    if (filters.organization) {
      switch (filters.organization.code) {
        case 'EVENT_BASED':
          match = match && !!item.screening_data?.event;
          if (filters.agency) {
            match = match && `Event ${item.screening_data.event}` === filters.agency.code;
          }
          break;

        case 'CASE_BASED':
          match = match && !!item.screening_data?.case;
          if (filters.agency) {
            match = match && item.user?.active_agency?.agency_name === filters.agency.code;
          }
          break;

        case 'CLUSTER':
          // First check - no event or case for cluster screenings
          match = match && !item.screening_data?.event && !item.screening_data?.case;

          if (filters.agency?.code === 'SCHOOL') {
            const agencyName = (item.user?.active_agency?.agency_name || '').toLowerCase();
            const agencyDetailsName = (item.user?.agency_details?.agency?.agency_name || '').toLowerCase();

            // Check if either active_agency or agency_details contains 'school'
            match = match && (
              agencyName.includes('school') ||
              agencyDetailsName.includes('school')
            );

            // If specific school is selected in Active Agency dropdown
            if (filters.activeAgency) {
              match = match && item.user?.active_agency?.agency_name === filters.activeAgency.code;
            }
          } else if (filters.agency?.code === 'GYALSUNG') {
            const agencyName = (item.user?.active_agency?.agency_name || '').toLowerCase();
            const agencyDetailsName = (item.user?.agency_details?.agency?.agency_name || '').toLowerCase();

            match = match && (
              agencyName.includes('gyalsung') ||
              agencyDetailsName.includes('gyalsung')
            );

            if (filters.activeAgency) {
              match = match && item.user?.active_agency?.agency_name === filters.activeAgency.code;
            }
          }
          break;
      }
    }

    // Age Group filtering
    if (filters.ageGroups.length > 0) {
      const age = calculateAge(item.user?.date_of_birth);
      const ageGroup = getAgeGroup(age);
      match = match && filters.ageGroups.some(group => group.code === ageGroup);
    }

    // Class/Grade filtering (for schools)
    if (filters.organization?.code === 'SCHOOL' && filters.classes.length > 0) {
      const userClass = item.user?.agency_details?.user_class;
      match = match && filters.classes.some(cls => cls.code === userClass);
    }

    // Status filtering
    if (filters.currentStatus && filters.statusValue) {
      switch (filters.currentStatus.code) {
        case 'MENTAL_HEALTH':
          match = match && item.case_status === filters.statusValue.code;
          break;
        case 'REFERRAL':
          match = match && item.referred === filters.statusValue.code;
          break;
        case 'CURRENT':
          match = match && item.counseling === filters.statusValue.code;
          break;
      }
    }
    // Year filtering based on screening_data submission_date
    if (filters.year && item.screening_data?.submission_date) {
      const submissionYear = new Date(item.screening_data.submission_date).getFullYear();
      match = match && submissionYear.toString() === filters.year.code;
    }

    return match;
  });
});

const summaryMetrics = computed(() => {
  const data = filteredData.value;
  const totalCases = data.length;
  const previousPeriodCases = 0;

  return [
    {
      label: 'Total Cases',
      value: totalCases,
      trend: ((totalCases - previousPeriodCases) / previousPeriodCases * 100) || 0
    },
    {
      label: 'High Risk Cases',
      value: data.filter(item => item.screening_data?.phq_interpretation === 'Severe' ||
        item.screening_data?.gad_interpretation === 'Severe').length,
      trend: 5.2 // Calculate actual trend
    },
    {
      label: 'Active Referrals',
      value: data.filter(item => item.referred === 'REFERRED').length,
      trend: -2.1 // Calculate actual trend
    },
    {
      label: 'Completed Cases',
      value: data.filter(item => item.case_status === 'COMPLETED').length,
      trend: 8.4 // Calculate actual trend
    }
  ];
});

const applyFilters = async () => {
  try {
    isLoading.value = true;
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    showResults.value = true;

    toast.add({
      severity: 'success',
      summary: 'Filters Applied',
      detail: `Successfully filtered data with ${activeFilterCount.value} criteria`,
      life: 3000
    });
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to apply filters. Please try again.',
      life: 3000
    });
  } finally {
    isLoading.value = false;
  }
};

// Helper function to get region from dzongkhag
const getDzongkhagRegion = (dzongkhag) => {
  const regionMap = {
    WESTERN: ['THIMPHU', 'PARO', 'HAA', 'PUNAKHA', 'GASA', 'Chhukha', 'SAMTSE',
      'THIMPHU THROMDE', 'PHUENTSHOGLING THROMDE'],
    CENTRAL: ['BUMTHANG', 'DAGANA', 'SARPANG', 'TRONGSA', 'TSIRANG', 'WANGDUE', 'ZHEMGANG'],
    EASTERN: ['LHUENTSE', 'MONGAR', 'PEMAGATSHEL', 'SAMDRUP JONGKHAR', 'TRASHIGANG',
      'SAMDRUP JONGKHAR THROMDE', 'TRASHI YANGTSE']
  };

  for (const [region, dzongkhags] of Object.entries(regionMap)) {
    if (dzongkhags.includes(dzongkhag?.toUpperCase())) {
      return region;
    }
  }
  return null;
};

// Lifecycle hooks
onMounted(() => {
  // Initialize any required data or state
  isFilterExpanded.value = true;
});
</script>

<style scoped>
.dashboard-container {
  background-color: var(--surface-ground);
  min-height: 100vh;
  padding: 2rem;
}

.filter-panel {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
}

.filter-panel :deep(.p-panel-header) {
  background: linear-gradient(135deg, #2B656F 0%, #1D4851 100%);
  color: white;
  border-radius: 12px 12px 0 0;
  padding: 1.25rem;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.filter-count {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
}

.filter-content {
  padding: 2rem;
  background: white;
  border-radius: 0 0 12px 12px;
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-label {
  font-weight: 500;
  color: var(--text-color-secondary);
  margin-bottom: 0.25rem;
}

.dropdown-value {
  display: flex;
  align-items: center;
}

.multiselect-value {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.active-filters-section {
  margin-top: 2rem;
  padding: 1.5rem;
  background: rgba(43, 101, 111, 0.05);
  border-radius: 12px;
}

.active-filters-header {
  display: flex;
  align-items: center;
  color: #2B656F;
  margin-bottom: 1rem;
}

.active-filters-content {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.filter-chip {
  background: white;
  border: 1px solid rgba(43, 101, 111, 0.2);
}

.filter-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--surface-border);
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.summary-card {
  background: linear-gradient(135deg, #2B656F 0%, #1D4851 100%);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease;
  color: white;
}

.summary-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
}

.summary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.summary-header h6 {
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  font-size: 0.9rem;
  font-weight: 500;
}

.summary-value {
  font-size: 2rem;
  font-weight: 600;
  margin: 0.5rem 0;
  color: #fff;
}

.trend-value {
  display: block;
  margin-top: 0.5rem;
}

.visualization-grid {
  display: grid;
  gap: 1.5rem;
  /* Create a layout with map on top, chart and table below */
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto auto;
  grid-template-areas:
    "map"
    "chart"
    "table";
}

.map-container {
  grid-area: map;
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.chart-container {
  grid-area: chart;
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.table-container {
  grid-area: table;
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

@media (max-width: 768px) {
  .dashboard-container {
    padding: 1rem;
  }

  .filter-grid {
    grid-template-columns: 1fr;
  }

  .summary-grid {
    grid-template-columns: 1fr;
  }
}

/* PrimeVue component customization */
:deep(.p-dropdown),
:deep(.p-multiselect) {
  border-radius: 8px;
}

:deep(.p-dropdown:not(.p-disabled):hover),
:deep(.p-multiselect:not(.p-disabled):hover) {
  border-color: #2B656F;
}

:deep(.p-dropdown.p-focus),
:deep(.p-multiselect.p-focus) {
  border-color: #2B656F;
  box-shadow: 0 0 0 2px rgba(43, 101, 111, 0.1);
}

:deep(.p-dropdown-panel),
:deep(.p-multiselect-panel) {
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

:deep(.p-dropdown-item),
:deep(.p-multiselect-item) {
  padding: 0.75rem 1rem;
  transition: all 0.2s ease;
}

:deep(.p-dropdown-item:hover),
:deep(.p-multiselect-item:hover) {
  background: rgba(43, 101, 111, 0.05);
}

:deep(.p-dropdown-item.p-highlight),
:deep(.p-multiselect-item.p-highlight) {
  background: rgba(43, 101, 111, 0.1);
  color: #2B656F;
}

/* Button customization */
:deep(.p-button) {
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  transition: all 0.2s ease;
}

:deep(.p-button.p-button-outlined) {
  border: 2px solid;
}

:deep(.p-button.p-button-outlined:hover) {
  background: rgba(43, 101, 111, 0.05);
}

:deep(.p-button.p-button-primary) {
  background: linear-gradient(135deg, #2B656F 0%, #1D4851 100%);
  border: none;
}

:deep(.p-button.p-button-primary:hover) {
  background: linear-gradient(135deg, #1D4851 0%, #2B656F 100%);
  transform: translateY(-1px);
}

/* Chip customization */
:deep(.p-chip) {
  border-radius: 20px;
  padding: 0.5rem 1rem;
  background: rgba(43, 101, 111, 0.1);
  color: #2B656F;
}

:deep(.p-chip .p-chip-remove-icon) {
  margin-left: 0.5rem;
}

/* Progress Spinner customization */
:deep(.p-progress-spinner) {
  width: 50px;
  height: 50px;
}

:deep(.p-progress-spinner-circle) {
  stroke: #2B656F;
  stroke-width: 4;
}

/* Panel content animations */
.filter-content {
  transition: all 0.3s ease-in-out;
}

/* Loading overlay enhancement */
.loading-overlay {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(4px);
}

/* Visualization containers enhancement */
.visualization-grid {
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

.map-container,
.chart-container,
.table-container {
  transition: all 0.3s ease;
  overflow: hidden;
}

.map-container:hover,
.chart-container:hover,
.table-container:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

/* Enhanced scrollbars */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #2B656F;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #1D4851;
}

/* Filter badges enhancement */
.filter-badges {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.filter-count {
  font-weight: 500;
  letter-spacing: 0.5px;
}

/* Animation keyframes */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Apply animations */
.summary-card,
.filter-chip,
.visualization-grid>div {
  animation: fadeIn 0.3s ease-out forwards;
}

/* Enhance active filters section */
.active-filters-section {
  position: relative;
  overflow: hidden;
}

.active-filters-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(135deg, #2B656F 0%, #1D4851 100%);
  border-radius: 4px 4px 0 0;
}

/* Enhanced dropdown icons */
:deep(.p-dropdown-trigger),
:deep(.p-multiselect-trigger) {
  width: 3rem;
  background: rgba(43, 101, 111, 0.05);
  border-radius: 0 8px 8px 0;
  transition: all 0.2s ease;
}

:deep(.p-dropdown:hover .p-dropdown-trigger),
:deep(.p-multiselect:hover .p-multiselect-trigger) {
  background: rgba(43, 101, 111, 0.1);
}

/* Responsive enhancements */
@media (max-width: 1024px) {
  .visualization-grid {
    grid-template-columns: 1fr;
    grid-template-areas:
      "map"
      "chart"
      "table";
  }

  .summary-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }
}

@media (max-width: 640px) {
  .dashboard-container {
    padding: 1rem;
  }

  .filter-actions {
    flex-direction: column;
  }

  .filter-actions .p-button {
    width: 100%;
  }

  .summary-card {
    padding: 1rem;
  }
}

/* Print styles */
@media print {
  .dashboard-container {
    padding: 0;
  }

  .filter-panel {
    display: none;
  }

  .summary-grid,
  .visualization-grid {
    gap: 1rem;
  }
}
</style>