<template>
  <div class="dashboard-container">
    <div class="p-d-flex p-flex-column">
      <div class="p-mb-2">
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
            <form @submit.prevent="applyFilters" class="primary-filters">
              <div class="filter-grid">
                <div class="filter-item">
                  <label class="filter-label">Year</label>
                  <Dropdown v-model="filters.year" :options="availableYears" optionLabel="name"
                    placeholder="Select Year" class="w-full" :filter="true" :showClear="true">
                    <template #value="slotProps">
                      <div class="dropdown-value">
                        <i class="pi pi-calendar mr-2"></i>
                        <span>{{ slotProps.value?.name || 'Select Year' }}</span>
                      </div>
                    </template>
                  </Dropdown>
                </div>
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

              <div class="filter-item mt-4" v-if="filters.organization?.code === 'CLUSTER' && filters.agency">
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

              <div class="filter-grid mt-4">
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
              </div>

              <div class="status-filters-container">
                <div class="status-filters-header">
                  <i class="pi pi-sliders-h"></i>
                  <h6>Status Filters</h6>
                </div>
                <div class="status-grid">
                  <div class="filter-item">
                    <label class="filter-label">
                      <i class="pi pi-check-circle"></i>
                      Assessment Status
                    </label>
                    <Dropdown v-model="filters.statusValue" :options="statusTypes" optionLabel="name"
                      placeholder="Select Assessment Status" class="w-full" :filter="true" :showClear="true">
                    </Dropdown>
                  </div>

                  <div class="filter-item">
                    <label class="filter-label">
                      <i class="pi pi-folder"></i>
                      Case Status
                    </label>
                    <Dropdown v-model="filters.caseStatus" :options="caseStatusTypes" optionLabel="name"
                      placeholder="Select Case Status" class="w-full" :filter="true" :showClear="true">
                    </Dropdown>
                  </div>

                  <div class="filter-item">
                    <label class="filter-label">
                      <i class="pi pi-users"></i>
                      Counseling Status
                    </label>
                    <Dropdown v-model="filters.counselingStatus" :options="counselingStatusTypes" optionLabel="name"
                      placeholder="Select Counseling Status" class="w-full" :filter="true" :showClear="true">
                    </Dropdown>
                  </div>

                  <div class="filter-item">
                    <label class="filter-label">
                      <i class="pi pi-clock"></i>
                      Follow Up Status
                    </label>
                    <Dropdown v-model="filters.followUpStatus" :options="followUpStatusTypes" optionLabel="name"
                      placeholder="Select Follow Up Status" class="w-full" :filter="true" :showClear="true">
                    </Dropdown>
                  </div>
                </div>
              </div>

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

              <div class="filter-actions">
                <Button label="Reset Filters" icon="pi pi-refresh" severity="secondary" outlined
                  @click="resetFilters" />
                <Button label="Apply Filters" icon="pi pi-check" severity="primary" @click="applyFilters"
                  :loading="isLoading" />
              </div>
            </form>
          </div>
        </Panel>
      </div>
      <SummaryMetrics :filtered-data="filteredData" />
      <div class="p-mb-2">
        <TabView>
          <TabPanel header="Overview">
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
          </TabPanel>
          <TabPanel header="Analysis">
            <AnalysisTab :filtered-data="filteredData" />
          </TabPanel>
          <TabPanel header="Demographics">
            <DemographicsTab :filtered-data="filteredData" />
          </TabPanel>
          <TabPanel header="Assessment Results">
            <AssessmentResultsTab :filtered-data="filteredData" />
          </TabPanel>
          <TabPanel header="Substance Use Risk">
            <SubstanceUseRisktab :filtered-data="filteredData" />
          </TabPanel>
          <TabPanel header="Advanced Analytics">
            <AdvancedAnalyticsTab :filtered-data="filteredData" />
          </TabPanel>
          <TabPanel header="Treatment Tracking">
            <TreatmentTrackingTab :filtered-data="filteredData" />
          </TabPanel>
          <TabPanel header="Data Export & Reporting">
            <DataExportReportingtab :filtered-data="filteredData" />
          </TabPanel>
        </TabView>
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
// import ProgressSpinner from 'primevue/progressspinner'; // Removed as it's not used currently
import RndDataDisplay from './RndDataDisplay.vue';
import RnDChartTables from './RnDChartTables.vue';
import RNDmap from './overview/RNDmap.vue';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
// import Card from 'primevue/card'; // Removed as it's used in SummaryMetrics.vue
import AnalysisTab from './AnalysisTab.vue'
import DemographicsTab from './DemographicsTab.vue';
import AssessmentResultsTab from './AssessmentResultsTab.vue';
import SubstanceUseRisktab from './SubstanceUseRisktab.vue';
import AdvancedAnalyticsTab from './AdvancedAnalyticsTab.vue';
import TreatmentTrackingTab from './TreatmentTrackingTab.vue';
import DataExportReportingtab from './DataExport&Reportingtab.vue';
import SummaryMetrics from './SummaryMetrics.vue'; // Import the SummaryMetrics component

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
  activeAgency: null,
  caseStatus: null,
  counselingStatus: null,
  followUpStatus: null,
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
  { code: 'UNDER_10', name: 'Under 10 years' },
  { code: '10_19', name: '10-19 years' },
  { code: '20_24', name: '20-24 years' },
  { code: '25_60', name: '25-60 years' },
  { code: 'OVER_60', name: 'Over 60 years' }
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
  { code: 'Conducted', name: 'Conducted' },
  { code: 'Not Conducted', name: 'Not Conducted' }
];

const caseStatusTypes = [
  { code: 'On Going', name: 'On Going' },
  { code: 'Case Closed', name: 'Case Closed' },
  { code: 'Case Discontinued', name: 'Case Discontinued' }
];

const counselingStatusTypes = [
  { code: 'Availed', name: 'Availed' },
  { code: 'Not Required', name: 'Not Required' },
  { code: 'Waiting List', name: 'Waiting List' }
];

const followUpStatusTypes = [
  { code: 'Treatment Completed', name: 'Treatment Completed' },
  { code: 'Undergoing Treatment', name: 'Undergoing Treatment' },
  { code: 'Completed Counselling Sessions', name: 'Completed Counselling Sessions' },
  { code: 'Unwilling to Undergo Treatment', name: 'Unwilling to Undergo Treatment' },
  { code: 'Undergone Rehabilitation', name: 'Undergone Rehabilitation' },
  { code: 'Undergoing Rehabilitation', name: 'Undergoing Rehabilitation' },
  { code: 'Hospital-based Outpatient SUD Treatment and Care (Primary Phase)', name: 'Hospital-based Outpatient SUD Treatment and Care (Primary Phase)' },
  { code: 'Hospital-based Outpatient SUD Treatment and Care (Continuing Care)', name: 'Hospital-based Outpatient SUD Treatment and Care (Continuing Care)' },
  { code: 'School-based SUD Treatment and Care', name: 'School-based SUD Treatment and Care' },
  { code: 'Institution-based SUD Treatment and Care', name: 'Institution-based SUD Treatment and Care' },
  { code: 'Follow-up Drug Test Conducted', name: 'Follow-up Drug Test Conducted' },
  { code: 'Detention-based SUD Treatment and Care', name: 'Detention-based SUD Treatment and Care' }
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
    ASSESSMENT: [
      { code: 'Conducted', name: 'Conducted' },
      { code: 'Not Conducted', name: 'Not Conducted' },
      { code: 'Conducted', name: 'Conducted' },
      { code: 'Not Conducted', name: 'Not Conducted' }
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
    if (filters.currentStatus.code === 'ASSESSMENT') {
      active.push({
        key: 'status',
        label: `Assessment Status: ${filters.statusValue.name}`
      });
    }
    if (filters.currentStatus.code === 'ASSESSMENT') {
      active.push({
        key: 'status',
        label: `Assessment Status: ${filters.statusValue.name}`
      });
    }
  }
  if (filters.year) {
    active.push({
      key: 'year',
      label: `Screening Year: ${filters.year.name}`
    });
  }
  if (filters.caseStatus) {
    active.push({
      key: 'caseStatus',
      label: `Case Status: ${filters.caseStatus.name}`
    });
  }

  if (filters.counselingStatus) {
    active.push({
      key: 'counselingStatus',
      label: `Counseling Status: ${filters.counselingStatus.name}`
    });
  }

  if (filters.followUpStatus) {
    active.push({
      key: 'followUpStatus',
      label: `Follow Up Status: ${filters.followUpStatus.name}`
    });
  }
  if (filters.caseStatus) {
    active.push({
      key: 'caseStatus',
      label: `Case Status: ${filters.caseStatus.name}`
    });
  }

  if (filters.counselingStatus) {
    active.push({
      key: 'counselingStatus',
      label: `Counseling Status: ${filters.counselingStatus.name}`
    });
  }

  if (filters.followUpStatus) {
    active.push({
      key: 'followUpStatus',
      label: `Follow Up Status: ${filters.followUpStatus.name}`
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
  if (age < 10) return 'UNDER_10';
  if (age >= 10 && age <= 19) return '10_19';
  if (age >= 20 && age <= 24) return '20_24';
  if (age >= 25 && age <= 60) return '25_60';
  if (age > 60) return 'OVER_60';
  return null;
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
//pre process data
function preprocessData(data) {
  return data.map(item => ({
    ...item,
    referralDate: new Date(item.date), // Convert date strings to Date objects
    assessmentCompleted: item.assessment_status === 'Conducted',
    referralTime: calculateReferralTime(item), // Function to calculate referral time
    treatmentDuration: calculateTreatmentDuration(item), //Function to calculate treatment duration
    age: calculateAge(item.user?.date_of_birth), //Calculate age from date of birth
    gender: item.user.gender,
    // ... Add other relevant fields here ...
  }));
}

const filteredData = computed(() => {
  if (!serviceAndTreatmentData.value) {
    console.log('No service and treatment data available');
    return [];
  }
  const preprocessedData = preprocessData(serviceAndTreatmentData.value);

  return preprocessedData.filter(item => {
    let match = true;

    // Region and Dzongkhag filtering
    if (filters.region) {
      const itemDzongkhag =
        item.user?.ps_add_dzongkhag ||
        item.user?.perm_add_dzongkhag ||
        item.screening_data?.ps_add_dzongkhag ||
        item.user?.agency_details?.agency?.present_dzongkhag ||
        item.user?.active_agency?.present_dzongkhag;

      if (!itemDzongkhag) {
        console.log('No dzongkhag found for item:', item.id);
        return false;
      }

      const dzongkhagRegion = getDzongkhagRegion(itemDzongkhag);
      console.log('Item dzongkhag:', itemDzongkhag, 'Region:', dzongkhagRegion);

      match = match && dzongkhagRegion === filters.region.code;

      if (filters.dzongkhag) {
        const normalizedItemDzongkhag = itemDzongkhag.toUpperCase().trim();
        const normalizedFilterDzongkhag = filters.dzongkhag.code.trim();

        console.log('Comparing dzongkhag:', {
          item: normalizedItemDzongkhag,
          filter: normalizedFilterDzongkhag,
          match: normalizedItemDzongkhag === normalizedFilterDzongkhag,
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
          match = match && !item.screening_data?.event && !item.screening_data?.case;

          if (filters.agency?.code === 'SCHOOL') {
            const agencyName = (item.user?.active_agency?.agency_name || '').toLowerCase();
            const agencyDetailsName = (item.user?.agency_details?.agency?.agency_name || '').toLowerCase();

            match = match && (
              agencyName.includes('school') ||
              agencyDetailsName.includes('school')
            );

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
    if (filters.statusValue) {
      match = match && item.assessment_status === filters.statusValue.code;
      console.log('Assessment Status match:', {
        expected: filters.statusValue.code,
        actual: item.assessment_status,
        matches: item.assessment_status === filters.statusValue.code,
      });
    }

    if (filters.caseStatus) {
      match = match && item.case_status === filters.caseStatus.code;
    }

    // Year filtering based on screening_data submission_date
    if (filters.year && item.screening_data?.submission_date) {
      const submissionYear = new Date(item.screening_data.submission_date).getFullYear();
      match = match && submissionYear.toString() === filters.year.code;
    }

    // Counseling and Follow-up Status filtering
    if (filters.counselingStatus) {
      match = match && item.counseling === filters.counselingStatus.code;
    }

    if (filters.followUpStatus) {
      match = match && item.follow_up === filters.followUpStatus.code;
    }

    return match;
  });
});

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

// Function to calculate referral time (in days)
function calculateReferralTime(item) {
  if (!item.referral_instance || !item.screening_data?.submission_date) return null;
  const referralDate = new Date(item.referral_instance.date);
  const assessmentDate = new Date(item.screening_data.submission_date);
  const timeDifference = assessmentDate.getTime() - referralDate.getTime();
  return Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
}

// Function to calculate treatment duration (in days)
function calculateTreatmentDuration(item) {
  if (!item.follow_up || !item.screening_data?.submission_date) return null;
  const assessmentDate = new Date(item.screening_data.submission_date);
  const treatmentEndDate = new Date(); // Placeholder - replace with actual treatment end date from your data
  const timeDifference = treatmentEndDate.getTime() - assessmentDate.getTime();
  return Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
}

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
  color: #fff;
  color: #fff;
  margin-bottom: 0.25rem;
  background: #2B5B65;
  padding: 1.25rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
  border: 1px solid rgba(43, 101, 111, 0.1);
  display: flex;
  align-items: center;
}

.filter-label i {
  color: rgb(255, 255, 255);
}

.status-filters-container {
  background: rgba(43, 101, 111, 0.02);
  border-radius: 12px;
  padding: 1.5rem;
  margin-top: 1.5rem;
  border: 1px solid rgba(43, 101, 111, 0.1);
}

.status-filters-header {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(43, 101, 111, 0.1);
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.status-filters-header h6 {
  margin: 0;
  color: #2B656F;
  font-size: 1rem;
  font-weight: 600;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.25rem;
}

/* Enhanced dropdown styling for status filters */
.status-filters-container :deep(.p-dropdown) {
  background: white;
  border-width: 1px;
  transition: all 0.2s ease;
}

/*
.status-filters-container :deep(.p-dropdown:hover) {
  border-color: #2B656F;
  transform: translateY(-1px);
}
*/
.status-filters-container :deep(.p-dropdown.p-focus) {
  box-shadow: 0 0 0 2px rgba(43, 101, 111, 0.15);
}

/* Fancy separator for status section */
.status-section-separator {
  height: 1px;
  background: linear-gradient(90deg,
      rgba(43, 101, 111, 0) 0%,
      rgba(43, 101, 111, 0.2) 50%,
      rgba(43, 101, 111, 0) 100%);
  margin: 2rem 0;
}

/* .filter-item:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-color: rgba(43, 101, 111, 0.2);
  background: #2B5B65;
  padding: 1.25rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
  border: 1px solid rgba(43, 101, 111, 0.1);
  display: flex;
  align-items: center;
} */

.filter-label i {
  color: rgb(255, 255, 255);
}

.status-filters-container {
  background: rgba(43, 101, 111, 0.02);
  border-radius: 12px;
  padding: 1.5rem;
  margin-top: 1.5rem;
  border: 1px solid rgba(43, 101, 111, 0.1);
}

.status-filters-header {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(43, 101, 111, 0.1);
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.status-filters-header h6 {
  margin: 0;
  color: #2B656F;
  font-size: 1rem;
  font-weight: 600;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.25rem;
}

/* Enhanced dropdown styling for status filters */
.status-filters-container :deep(.p-dropdown) {
  background: white;
  border-width: 1px;
  transition: all 0.2s ease;
}

.status-filters-container :deep(.p-dropdown:hover) {
  border-color: #2B656F;
  transform: translateY(-1px);
}

.status-filters-container :deep(.p-dropdown.p-focus) {
  box-shadow: 0 0 0 2px rgba(43, 101, 111, 0.15);
}

/* Fancy separator for status section */
.status-section-separator {
  height: 1px;
  background: linear-gradient(90deg,
      rgba(43, 101, 111, 0) 0%,
      rgba(43, 101, 111, 0.2) 50%,
      rgba(43, 101, 111, 0) 100%);
  margin: 2rem 0;
}

/* .filter-item:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-color: rgba(43, 101, 111, 0.2);
} */

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

.p-d-flex.p-jc-center.p-mb-2 {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  width: 100%;
  margin-bottom: 1rem;
}

/* Update Card styles */
.p-d-flex.p-jc-center.p-mb-2 :deep(.p-card) {
  flex: 0 0 calc(20% - 0.8rem);
  /* 20% width for 5 cards per row */
  min-width: 200px;
  background: linear-gradient(135deg, #2b656f 0%, #1d4851 100%);
  border-radius: 12px;
  transition: transform 0.2s ease;
  margin-bottom: 1rem;
}

/* Card content styling */
.p-d-flex.p-jc-center.p-mb-2 :deep(.p-card .p-card-content) {
  padding: 1rem;
  color: white;
}

.p-d-flex.p-jc-center.p-mb-2 :deep(.p-card .p-card-title) {
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.9rem;
  margin: 0;
  padding: 0;
}

.p-d-flex.p-jc-center.p-mb-2 :deep(.p-card h6) {
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  font-size: 0.9rem;
  font-weight: 500;
}

.p-d-flex.p-jc-center.p-mb-2 :deep(.p-card h3) {
  color: white;
  font-size: 2rem;
  font-weight: 600;
  margin: 0.5rem 0;
}

/* Card hover effect */
.p-d-flex.p-jc-center.p-mb-2 :deep(.p-card:hover) {
  transform: translateY(-2px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
}

/* Update responsive breakpoints for cards */
@media (max-width: 1400px) {
  .p-d-flex.p-jc-center.p-mb-2 :deep(.p-card) {
    flex: 0 0 calc(25% - 0.8rem);
    /* 4 cards per row */
  }
}

@media (max-width: 1200px) {
  .p-d-flex.p-jc-center.p-mb-2 :deep(.p-card) {
    flex: 0 0 calc(33.33% - 0.8rem);
    /* 3 cards per row */
  }
}

@media (max-width: 768px) {
  .p-d-flex.p-jc-center.p-mb-2 :deep(.p-card) {
    flex: 0 0 calc(50% - 0.8rem);
    /* 2 cards per row */
  }
}

@media (max-width: 480px) {
  .p-d-flex.p-jc-center.p-mb-2 :deep(.p-card) {
    flex: 0 0 100%;
    /* 1 card per row */
  }
}

/* Update trend value styles */
.trend-value {
  display: block;
  margin-top: 0.5rem;
  font-size: 0.8rem;
  color: white;
}

.text-success {
  color: #4caf50 !important;
}

.text-danger {
  color: #f44336 !important;
}



.summary-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
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

/* Add these styles to your existing <style scoped> section */

/* TabView customization */
:deep(.p-tabview) {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

:deep(.p-tabview .p-tabview-nav) {
  background: linear-gradient(135deg, #2B656F 0%, #1D4851 100%);
  border: none;
  border-radius: 12px 12px 0 0;
  padding: 0.5rem 1rem 0 1rem;
}

:deep(.p-tabview .p-tabview-nav li) {
  margin-right: 4px;
}

:deep(.p-tabview .p-tabview-nav li .p-tabview-nav-link) {
  background: transparent;
  border: none;
  border-radius: 8px 8px 0 0;
  padding: 1rem 1.5rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
  transition: all 0.2s ease;
}

:deep(.p-tabview .p-tabview-nav li:not(.p-highlight):not(.p-disabled):hover .p-tabview-nav-link) {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
}

:deep(.p-tabview .p-tabview-nav li.p-highlight .p-tabview-nav-link) {
  background: white;
  border: none;
  color: #2B656F;
}

:deep(.p-tabview .p-tabview-panels) {
  padding: 2rem;
  background: white;
  border-radius: 0 0 12px 12px;
}

:deep(.p-tabview .p-tabview-nav li .p-tabview-nav-link:focus) {
  box-shadow: none;
  outline: none;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  :deep(.p-tabview .p-tabview-nav li .p-tabview-nav-link) {
    padding: 0.75rem 1rem;
  }

  :deep(.p-tabview .p-tabview-panels) {
    padding: 1rem;
  }
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