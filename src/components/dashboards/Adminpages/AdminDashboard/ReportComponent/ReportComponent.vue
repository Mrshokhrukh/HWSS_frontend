<template>
    <div class="filter-configurator">
        <div class="config-card">
            <!-- Header -->
            <div class="config-header">
                <h2 class="header-title">Data Configuration</h2>
                <div class="quick-actions">
                    <p-button icon="pi pi-refresh" class="p-button-rounded p-button-text" @click="resetFilters"
                        :disabled="!hasFilters" />
                </div>
            </div>

            <!-- Filter Content -->
            <div class="filter-content">
                <div class="main-filters">
                    <!-- Report Type -->
                    <div class="filter-group">
                        <label>Report Type</label>
                        <p-dropdown v-model="selectedReport" :options="reportTypes" optionLabel="label" class="w-full"
                            placeholder="Select Report Type" />
                    </div>

                    <!-- Agency Type -->
                    <div class="filter-group">
                        <label>Agency Type</label>
                        <p-dropdown v-model="filters.agencyType" :options="agencyTypes" class="w-full"
                            placeholder="Select Agency Type" @change="handleAgencyTypeChange" />
                    </div>

                    <template v-if="filters.agencyType === 'SCHOOL'">
                        <div class="filter-group">
                            <label>Class Level</label>
                            <p-dropdown v-model="filters.classLevel" :options="classLevels" class="w-full"
                                placeholder="Select Class" />
                        </div>
                    </template>

                    <!-- Location Section -->
                    <div class="filter-section">
                        <h3 class="section-title">Location</h3>
                        <div class="filter-group-row">
                            <p-dropdown v-model="filters.region" :options="regions" class="w-full" placeholder="Region"
                                @change="handleRegionChange" />
                            <p-dropdown v-model="filters.dzongkhag" :options="availableDzongkhags" class="w-full"
                                placeholder="Dzongkhag" :disabled="!filters.region" />
                        </div>
                    </div>
                </div>

                <!-- Additional Filters -->
                <div class="additional-filters">
                    <div class="filter-section">
                        <h3 class="section-title">Demographics</h3>
                        <div class="filter-group">
                            <label>Age Group</label>
                            <p-multi-select v-model="filters.ageGroups" :options="ageGroupOptions" class="w-full"
                                placeholder="Select Age Groups" display="chip" />
                        </div>

                        <div class="filter-group">
                            <label>Gender</label>
                            <p-multi-select v-model="filters.gender" :options="genderOptions" class="w-full"
                                placeholder="Select Gender" display="chip" />
                        </div>
                    </div>

                    <!-- Date Range Section -->
                    <div class="filter-section">
                        <h3 class="section-title">Date Range</h3>
                        <p-calendar v-model="dateRange" selectionMode="range" class="w-full"
                            placeholder="Select Date Range" />
                    </div>
                </div>
            </div>

            <!-- Active Filters Display -->
            <div v-if="hasFilters" class="active-filters">
                <div class="filter-chips">
                    <p-chip v-for="filter in activeFiltersList" :key="filter.id" :label="filter.label" removable
                        @remove="removeFilter(filter.id)" />
                </div>
            </div>

            <!-- Action Buttons -->
            <div class="filter-actions">
                <p-button label="Reset" severity="secondary" @click="resetFilters" :disabled="!hasFilters" />
                <p-button label="Apply Filters" @click="applyFilters" :disabled="!canApplyFilters" />
            </div>
        </div>

        <!-- Reports Display -->
        <div v-if="showReport" class="report-container">
            <MonitorReport v-if="showMonitorReport" :filteredData="processedData"
                :activeFiltersList="activeFiltersList" />
            <CaseStatusReport v-if="showCaseStatusReport" :filteredData="processedData"
                :activeFiltersList="activeFiltersList" />
            <SeverityReport v-if="showSeverityReport" :filteredData="processedData"
                :activeFiltersList="activeFiltersList" />
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import MonitorReport from './MonitorReport/MonitorReport.vue';
import CaseStatusReport from './CaseStatusReport/CaseStatusReport.vue';
import SeverityReport from './SeverityReport/SeverityReport.vue';

const props = defineProps({
    serviceData: {
        type: Array,
        required: true,
        default: () => []
    }
});

const toast = useToast();

// Filter Options
const reportTypes = [
    { label: 'Monitor Report', value: 'monitor' },
    { label: 'Case Study Report', value: 'case-study' },
    { label: 'Severity Report', value: 'severity' }
];
const agencyTypes = ['GYALSUNG', 'SCHOOL', 'RCSC'];
const classLevels = ['PP', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
const ageGroupOptions = ['5-10', '11-15', '16-20', '21-25', '26-30', '31-35', '36+'];
const genderOptions = ['Male', 'Female'];
const regions = ['Western', 'Central', 'Eastern'];
const dzongkhagMapping = {
    Western: ['Thimphu', 'Paro', 'Haa', 'Punakha', 'Gasa', 'Chukha', 'Samtse'],
    Central: ['Bumthang', 'Dagana', 'Sarpang', 'Trongsa', 'Tsirang', 'Wangdue'],
    Eastern: ['Lhuentse', 'Mongar', 'Pemagatshel', 'Samdrup Jongkhar', 'Trashigang']
};

// State
const loading = ref(false);
const selectedReport = ref(null);
const dateRange = ref(null);
const filters = ref({
    agencyType: null,
    classLevel: null,
    region: null,
    dzongkhag: null,
    ageGroups: [],
    gender: []
});
const showReport = ref(false);
const processedData = ref(props.serviceData);

// Computed properties for reports
const showMonitorReport = computed(() => selectedReport.value?.value === 'monitor');
const showCaseStatusReport = computed(() => selectedReport.value?.value === 'case-study');
const showSeverityReport = computed(() => selectedReport.value?.value === 'severity');

// Computed properties for filters
const availableDzongkhags = computed(() =>
    filters.value.region ? dzongkhagMapping[filters.value.region] : []
);

const hasFilters = computed(() =>
    selectedReport.value ||
    filters.value.region ||
    filters.value.dzongkhag ||
    filters.value.ageGroups.length ||
    filters.value.gender.length ||
    dateRange.value
);

const canApplyFilters = computed(() => selectedReport.value !== null);

// Active filters list
const activeFiltersList = computed(() => {
    const list = [];
    if (selectedReport.value) {
        list.push({ id: 'report', label: `Report: ${selectedReport.value.label}` });
    }
    if (filters.value.agencyType) {
        list.push({ id: 'agencyType', label: `Agency Type: ${filters.value.agencyType}` });
    }
    if (filters.value.classLevel) {
        list.push({ id: 'classLevel', label: `Class Level: ${filters.value.classLevel}` });
    }
    if (filters.value.region) {
        list.push({ id: 'region', label: `Region: ${filters.value.region}` });
    }
    if (filters.value.dzongkhag) {
        list.push({ id: 'dzongkhag', label: `Dzongkhag: ${filters.value.dzongkhag}` });
    }
    if (filters.value.ageGroups.length) {
        list.push({ id: 'ageGroups', label: `Age Groups: ${filters.value.ageGroups.join(', ')}` });
    }
    if (filters.value.gender.length) {
        list.push({ id: 'gender', label: `Gender: ${filters.value.gender.join(', ')}` });
    }
    if (dateRange.value) {
        const formatDate = date => date.toLocaleDateString();
        list.push({
            id: 'dateRange',
            label: `Date Range: ${formatDate(dateRange.value[0])} - ${formatDate(dateRange.value[1])}`
        });
    }
    return list;
});

// Methods
const applyFilters = () => {
    try {
        showReport.value = false;
        processedData.value = filterData(props.serviceData);
        showReport.value = true;
        toast.add({
            severity: 'success',
            summary: 'Success',
            detail: `Filtered data: ${processedData.value.length} records`,
            life: 3000
        });
    } catch (error) {
        console.error('Filter error:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error applying filters',
            life: 3000
        });
    }
};

const filterData = (data) => {
    return data.filter(item => {
        let matches = true;

        // Handle potentially null user data
        const user = item.user || item.screening_data || {};
        const agencyDetails = user.agency_details || {};
        const agency = agencyDetails.agency || {};

        // Apply agency type filter
        if (filters.value.agencyType) {
            const itemAgencyType = agencyDetails.user_role_agency;
            matches = matches && itemAgencyType === filters.value.agencyType.toLowerCase();
        }

        // Apply class level filter for schools
        if (filters.value.agencyType === 'SCHOOL' && filters.value.classLevel) {
            matches = matches && agencyDetails.user_class === filters.value.classLevel;
        }

        // Apply location filters
        if (filters.value.region) {
            // Map dzongkhag to region based on dzongkhagMapping
            const dzongkhag = agency.present_dzongkhag;
            const belongsToRegion = Object.entries(dzongkhagMapping).some(([region, dzongkhags]) => {
                return region === filters.value.region && dzongkhags.includes(dzongkhag);
            });
            matches = matches && belongsToRegion;
        }
        
        if (filters.value.dzongkhag) {
            matches = matches && agency.present_dzongkhag === filters.value.dzongkhag;
        }

        // Apply demographic filters
        if (filters.value.gender.length) {
            const itemGender = user.gender || user.gender;
            matches = matches && filters.value.gender.includes(itemGender);
        }

        // Apply age group filter
        if (filters.value.ageGroups.length) {
            const dob = user.date_of_birth || user.dob;
            if (dob) {
                const age = calculateAge(dob);
                matches = matches && filters.value.ageGroups.some(range => isInAgeRange(age, range));
            }
        }

        // Apply date range filter
        if (dateRange.value && dateRange.value.length === 2) {
            const itemDate = new Date(item.date);
            matches = matches &&
                itemDate >= dateRange.value[0] &&
                itemDate <= dateRange.value[1];
        }

        return matches;
    });
};

const resetFilters = () => {
    selectedReport.value = null;
    dateRange.value = null;
    filters.value = {
        agencyType: null,
        classLevel: null,
        region: null,
        dzongkhag: null,
        ageGroups: [],
        gender: []
    };
    showReport.value = false;
};

const handleAgencyTypeChange = () => {
    if (filters.value.agencyType !== 'SCHOOL') {
        filters.value.classLevel = null;
    }
};

const handleRegionChange = () => {
    filters.value.dzongkhag = null;
};

const removeFilter = (filterId) => {
    switch (filterId) {
        case 'report':
            selectedReport.value = null;
            break;
        case 'agencyType':
            filters.value.agencyType = null;
            break;
        case 'classLevel':
            filters.value.classLevel = null;
            break;
        case 'region':
            filters.value.region = null;
            break;
        case 'dzongkhag':
            filters.value.dzongkhag = null;
            break;
        case 'ageGroups':
            filters.value.ageGroups = [];
            break;
        case 'gender':
            filters.value.gender = [];
            break;
        case 'dateRange':
            dateRange.value = null;
            break;
    }
};

// Helper functions
const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null;
    
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    
    // Check for invalid date
    if (isNaN(birthDate.getTime())) return null;
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    
    return age;
};

const isInAgeRange = (age, range) => {
    if (age === null) return false;
    
    const [min, max] = range.split('-');
    if (max === '+') {
        return age >= parseInt(min);
    }
    return age >= parseInt(min) && age <= parseInt(max);
};

// Watch for changes
watch([selectedReport, filters, dateRange], () => {
    showReport.value = false;
}, { deep: true });

// Watch for props changes
watch(() => props.serviceData, (newData) => {
    processedData.value = newData;
}, { immediate: true });
</script>

<style scoped>
.filter-configurator {
    padding: 1.5rem;
}

.config-card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    overflow: hidden;
}

.config-header {
    background: linear-gradient(135deg, #2B656F 0%, #1D4851 100%);
    padding: 1.25rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.header-title {
    color: white;
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0;
}

.filter-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    padding: 1.5rem;
}

.filter-group {
    margin-bottom: 1.25rem;
}

.filter-group label {
    display: block;
    font-size: 0.875rem;
    font-weight: 500;
    color: #4B5563;
    margin-bottom: 0.5rem;
}

.section-title {
    font-size: 1rem;
    font-weight: 600;
    color: #374151;
    margin-bottom: 1rem;
}

.filter-group-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
}

.active-filters {
    padding: 1rem 1.5rem;
    background: #F9FAFB;
    border-top: 1px solid #E5E7EB;
}

.filter-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.filter-actions {
    padding: 1rem 1.5rem;
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    border-top: 1px solid #E5E7EB;
}

/* PrimeVue Component Overrides */
:deep(.p-dropdown),
:deep(.p-multiselect),
:deep(.p-calendar) {
    width: 100%;
}

:deep(.p-dropdown-item),
:deep(.p-multiselect-item) {
    padding: 0.75rem 1rem;
}

:deep(.p-chip) {
    background: #EEF2FF;
    color: #4F46E5;
}

/* Loading State */
.loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
}
</style>