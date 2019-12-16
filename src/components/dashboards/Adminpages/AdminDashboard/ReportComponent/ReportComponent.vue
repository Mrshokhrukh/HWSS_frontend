<template>
    <div class="filter-configurator">
        <Panel :toggleable="true" :collapsed="false" class="card filter-panel">
            <template #header>
                <div class="filter-header d-flex justify-content-between align-items-center">
                    <div class="d-flex align-items-center gap-3">
                        <i class="pi pi-filter"></i>
                        <h4 class="m-0">Configure Data Filters</h4>
                    </div>
                    <div class="filter-badges" v-if="hasFilters">
                        <span class="badge bg-light text-dark">{{ activeFilterCount }} active</span>
                    </div>
                </div>
            </template>

            <div class="filter-content p-4">
                <form @submit.prevent="applyFilters" class="primary-filters">
                    <!-- Report Selection -->
                    <div class="mb-3">
                        <label class="form-label">Report Type</label>
                        <Dropdown v-model="selectedReport" :options="availableReportTypes" optionLabel="name"
                            class="w-100" placeholder="Select Report Type" :filter="true" :showClear="true">
                            <template #value="slotProps">
                                <div class="d-flex align-items-center">
                                    <i class="pi pi-file me-2"></i>
                                    <span>{{ slotProps.value?.name || 'Select Report Type' }}</span>
                                </div>
                            </template>
                        </Dropdown>
                    </div>

                    <div class="row g-3">
                        <!-- Organization and Agency -->
                        <div class="col-md-6 col-lg-4">
                            <div class="mb-3">
                                <label class="form-label">Organization</label>
                                <Dropdown v-model="filters.organization" :options="organizations" optionLabel="name"
                                    class="w-100" placeholder="Select Organization" @change="handleOrganizationChange"
                                    :filter="true" :showClear="true">
                                    <template #value="slotProps">
                                        <div class="d-flex align-items-center">
                                            <i class="pi pi-briefcase me-2"></i>
                                            <span>{{ slotProps.value?.name || 'Select Organization' }}</span>
                                        </div>
                                    </template>
                                </Dropdown>
                            </div>
                        </div>

                        <div class="col-md-6 col-lg-4">
                            <div class="mb-3">
                                <label class="form-label">Agency</label>
                                <Dropdown v-model="filters.agency" :options="filteredAgencies" optionLabel="name"
                                    class="w-100" placeholder="Select Agency" :disabled="!filters.organization"
                                    :filter="true" :showClear="true">
                                    <template #value="slotProps">
                                        <div class="d-flex align-items-center">
                                            <i class="pi pi-sitemap me-2"></i>
                                            <span>{{ slotProps.value?.name || 'Select Agency' }}</span>
                                        </div>
                                    </template>
                                </Dropdown>
                            </div>
                        </div>

                        <!-- Class Level (Conditional) -->
                        <div class="col-md-6 col-lg-4"
                            v-if="filters.organization?.code === 'SCHOOL' || filters.organization?.code === 'CLUSTER'">
                            <div class="mb-3">
                                <label class="form-label">Class Level</label>
                                <MultiSelect v-model="filters.classLevel" :options="schoolClasses" optionLabel="name"
                                    class="w-100" placeholder="Select Classes" :filter="true" display="chip" />
                            </div>
                        </div>

                        <!-- Location Section -->
                        <div class="col-md-6 col-lg-4">
                            <div class="mb-3">
                                <label class="form-label">Region</label>
                                <Dropdown v-model="filters.region" :options="regions" optionLabel="name" class="w-100"
                                    placeholder="Select Region" @change="handleRegionChange" :filter="true"
                                    :showClear="true">
                                    <template #value="slotProps">
                                        <div class="d-flex align-items-center">
                                            <i class="pi pi-map-marker me-2"></i>
                                            <span>{{ slotProps.value?.name || 'Select Region' }}</span>
                                        </div>
                                    </template>
                                </Dropdown>
                            </div>
                        </div>

                        <div class="col-md-6 col-lg-4">
                            <div class="mb-3">
                                <label class="form-label">Dzongkhag</label>
                                <Dropdown v-model="filters.dzongkhag" :options="availableDzongkhags" optionLabel="name"
                                    class="w-100" placeholder="Select Dzongkhag" :disabled="!filters.region"
                                    :filter="true" :showClear="true">
                                    <template #value="slotProps">
                                        <div class="d-flex align-items-center">
                                            <i class="pi pi-building me-2"></i>
                                            <span>{{ slotProps.value?.name || 'Select Dzongkhag' }}</span>
                                        </div>
                                    </template>
                                </Dropdown>
                            </div>
                        </div>
                    </div>

                    <!-- Demographic Filters -->
                    <div class="row g-3 mt-2">
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label class="form-label">Age Group</label>
                                <MultiSelect v-model="filters.ageGroups" :options="ageGroups" optionLabel="name"
                                    placeholder="Select Age Groups" class="w-100" :filter="true" display="chip" />
                            </div>
                        </div>

                        <div class="col-md-6">
                            <div class="mb-3">
                                <label class="form-label">Gender</label>
                                <MultiSelect v-model="filters.gender" :options="genderOptions" optionLabel="name"
                                    placeholder="Select Gender" class="w-100" :filter="true" display="chip" />
                            </div>
                        </div>
                    </div>

                    <!-- Year Filter -->
                    <div class="row g-3 mt-2">
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label class="form-label">Year</label>
                                <Dropdown v-model="filters.year" :options="availableYears" optionLabel="name"
                                    class="w-100" placeholder="Select Year" :filter="true" :showClear="true">
                                    <template #value="slotProps">
                                        <div class="d-flex align-items-center">
                                            <i class="pi pi-calendar me-2"></i>
                                            <span>{{ slotProps.value?.name || 'Select Year' }}</span>
                                        </div>
                                    </template>
                                </Dropdown>
                            </div>
                        </div>
                    </div>

                    <!-- Active Filters Display -->
                    <div v-if="hasFilters" class="active-filters mt-4 p-3 bg-primary bg-opacity-10 rounded">
                        <div class="d-flex align-items-center mb-2">
                            <i class="pi pi-check-circle me-2"></i>
                            <h6 class="mb-0">Active Filters</h6>
                        </div>
                        <div class="d-flex flex-wrap gap-2">
                            <Chip v-for="filter in activeFiltersList" :key="filter.id" :label="filter.label"
                                class="filter-chip" removable @remove="removeFilter(filter.id)" />
                        </div>
                    </div>

                    <!-- Action Buttons -->
                    <div class="d-flex justify-content-end gap-2 mt-4">
                        <Button label="Reset" icon="pi pi-refresh" class="btn btn-secondary" outlined
                            @click="resetFilters" :disabled="!hasFilters" />
                        <Button label="Apply Filters" icon="pi pi-check" class="btn btn-primary" @click="applyFilters"
                            :disabled="!canApplyFilters" :loading="isLoading" />
                    </div>
                </form>
            </div>
        </Panel>

        <!-- Reports Display -->
        <div v-if="showReport" class="report-container mt-4">
            <MonitorReport v-if="showMonitorReport" :filteredData="processedData"
                :activeFiltersList="activeFiltersList" />
            <CaseStatusReport v-if="showCaseStatusReport" :filteredData="processedData"
                :activeFiltersList="activeFiltersList" />
            <SeverityReport v-if="showSeverityReport" :filteredData="processedData"
                :activeFiltersList="activeFiltersList" />
            <SchoolEnvReport v-if="showSchoolEnvironmentReport" :filteredData="processedData"
                :activeFiltersList="activeFiltersList" />
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch, inject, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';

// Component imports
import Panel from 'primevue/panel';
import Dropdown from 'primevue/dropdown';
import MultiSelect from 'primevue/multiselect';
import Button from 'primevue/button';
import Calendar from 'primevue/calendar';
import Chip from 'primevue/chip';

// Report components
import MonitorReport from './MonitorReport/MonitorReport.vue';
import CaseStatusReport from './CaseStatusReport/CaseStatusReport.vue';
import SeverityReport from './SeverityReport/SeverityReport.vue';
import SchoolEnvReport from './SchoolEnvReport/SchoolEnvReport.vue';

const toast = useToast();
const serviceAndTreatmentData = inject('serviceAndTreatmentData');

// Constants
const regions = [
    { code: 'WESTERN', name: 'Western Region' },
    { code: 'CENTRAL', name: 'Central Region' },
    { code: 'EASTERN', name: 'Eastern Region' }
];

const organizations = [
    { code: 'EVENT_BASED', name: 'Event Based' },
    { code: 'CASE_BASED', name: 'Case Based' },
    { code: 'CLUSTER', name: 'Cluster' },
    { code: 'SCHOOL', name: 'School' }
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

const ageGroups = [
    { code: 'UNDER_10', name: 'Under 10 years' },
    { code: '10_19', name: '10-19 years' },
    { code: '20_24', name: '20-24 years' },
    { code: '25_60', name: '25-60 years' },
    { code: 'OVER_60', name: 'Over 60 years' }
];

const genderOptions = [
    { code: 'MALE', name: 'Male' },
    { code: 'FEMALE', name: 'Female' }
];

// State Management
const selectedReport = ref(null);
const dateRange = ref(null);
const isLoading = ref(false);
const showReport = ref(false);
const processedData = ref([]);

const filters = ref({
    organization: null,
    agency: null,
    classLevel: [],
    region: null,
    dzongkhag: null,
    ageGroups: [],
    gender: [],
    year: null,
});

// Available Report Types based on user role
const availableReportTypes = computed(() => {
    const baseReports = [
        { code: 'MONITOR', name: 'Monitor Report' },
        { code: 'CASE_STATUS', name: 'Case Status Report' },
        { code: 'SEVERITY', name: 'Severity Report' }
    ];

    const userRole = JSON.parse(localStorage.getItem('userDetailsStore'))?.user?.role;

    if (userRole === 'cecd_admin') {
        return [...baseReports, { code: 'SCHOOL_ENV', name: 'School Environment Report' }];
    }

    return baseReports;
});

// Computed Properties
const hasFilters = computed(() => {
    return Object.values(filters.value).some(value => {
        if (Array.isArray(value)) {
            return value.length > 0;
        }
        return value !== null;
    }) || selectedReport.value !== null;
});

const activeFilterCount = computed(() => {
    let count = 0;

    if (selectedReport.value) count++;

    Object.values(filters.value).forEach(value => {
        if (Array.isArray(value) && value.length > 0) count++;
        else if (value !== null) count++;
    });

    return count;
});

const availableDzongkhags = computed(() => {
    if (!filters.value.region) return [];

    const dzongkhagsByRegion = {
        WESTERN: [
            'Thimphu', 'Paro', 'Haa', 'Punakha', 'Gasa', 'Chhukha', 'Samtse',
            'Thimphu Thromde', 'Phuentshogling Thromde'
        ],
        CENTRAL: [
            'Bumthang', 'Dagana', 'Sarpang', 'Trongsa', 'Tsirang', 'Wangdue', 'Zhemgang'
        ],
        EASTERN: [
            'Lhuentse', 'Mongar', 'Pemagatshel', 'Samdrup Jongkhar', 'Trashigang',
            'Samdrup Jongkhar Thromde', 'Trashi Yangtse'
        ]
    };

    return dzongkhagsByRegion[filters.value.region.code].map(name => ({
        code: name.toUpperCase(),
        name
    }));
});

const activeFiltersList = computed(() => {
    const list = [];

    if (selectedReport.value) {
        list.push({
            id: 'report',
            label: `Report: ${selectedReport.value.name}`
        });
    }

    if (filters.value.organization) {
        list.push({
            id: 'organization',
            label: `Organization: ${filters.value.organization.name}`
        });
    }

    if (filters.value.agency) {
        list.push({
            id: 'agency',
            label: `Agency: ${filters.value.agency.name}`
        });
    }

    if (filters.value.classLevel.length) {
        list.push({
            id: 'classLevel',
            label: `Classes: ${filters.value.classLevel.map(c => c.name).join(', ')}`
        });
    }

    if (filters.value.region) {
        list.push({
            id: 'region',
            label: `Region: ${filters.value.region.name}`
        });
    }

    if (filters.value.dzongkhag) {
        list.push({
            id: 'dzongkhag',
            label: `Dzongkhag: ${filters.value.dzongkhag.name}`
        });
    }

    if (filters.value.ageGroups.length) {
        list.push({
            id: 'ageGroups',
            label: `Age Groups: ${filters.value.ageGroups.map(g => g.name).join(', ')}`
        });
    }

    if (filters.value.gender.length) {
        list.push({
            id: 'gender',
            label: `Gender: ${filters.value.gender.map(g => g.name).join(', ')}`
        });
    }

    if (filters.value.year) {
        list.push({
            id: 'year',
            label: `Year: ${filters.value.year.name}`
        });
    }

    return list;
});

const showMonitorReport = computed(() => selectedReport.value?.code === 'MONITOR');
const showCaseStatusReport = computed(() => selectedReport.value?.code === 'CASE_STATUS');
const showSeverityReport = computed(() => selectedReport.value?.code === 'SEVERITY');
const showSchoolEnvironmentReport = computed(() => selectedReport.value?.code === 'SCHOOL_ENV');

const canApplyFilters = computed(() => selectedReport.value !== null);

// New computed property for filtering agencies
const filteredAgencies = computed(() => {
    if (!serviceAndTreatmentData.value || !filters.value.organization) return [];

    switch (filters.value.organization.code) {
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
        case 'SCHOOL':
            const uniqueAgencies = new Set();
            serviceAndTreatmentData.value.forEach(item => {
                const agencyName = item.user?.active_agency?.agency_name;
                if (agencyName) {
                    uniqueAgencies.add(agencyName);
                }
            });
            return Array.from(uniqueAgencies).map(name => ({
                code: name,
                name
            }));

        default:
            return [];
    }
});

// New computed property for available years
const availableYears = computed(() => {
    if (!serviceAndTreatmentData.value) return [];

    const years = new Set();
    serviceAndTreatmentData.value.forEach(item => {
        const date = new Date(item.date);
        if (!isNaN(date.getFullYear())) {
            years.add(date.getFullYear());
        }
    });

    return Array.from(years).sort((a, b) => b - a).map(year => ({
        code: year.toString(),
        name: year.toString()
    }));
});

// Methods
const handleOrganizationChange = () => {
    // Reset dependent filters
    filters.value.agency = null;
    filters.value.classLevel = [];
    if (filters.value.organization?.code !== 'SCHOOL') {
        filters.value.classLevel = [];
    }
};

const handleRegionChange = () => {
    filters.value.dzongkhag = null;
};

const handleAgencyTypeChange = () => {
    filters.value.classLevel = [];
    filters.value.agency = null;
    if (filters.value.agencyType !== 'SCHOOL') {
        filters.value.classLevel = [];
    }
};

const removeFilter = (filterId) => {
    switch (filterId) {
        case 'report':
            selectedReport.value = null;
            break;
        case 'organization':
            filters.value.organization = null;
            break;
        case 'agency':
            filters.value.agency = null;
            break;
        case 'classLevel':
            filters.value.classLevel = [];
            break;
        case 'region':
            filters.value.region = null;
            filters.value.dzongkhag = null;
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
        case 'year':
            filters.value.year = null;
            break;
    }
};

const resetFilters = () => {
    selectedReport.value = null;
    dateRange.value = null;
    filters.value = {
        agencyType: null,
        classLevel: [],
        region: null,
        dzongkhag: null,
        ageGroups: [],
        gender: [],
        year: null
    };
    showReport.value = false;
};

const applyFilters = async () => {
    isLoading.value = true;
    showReport.value = false;

    // Directly use the computed property for filtering
    processedData.value = filteredData.value;

    showReport.value = true;
    toast.add({
        severity: 'success',
        summary: 'Filters Applied',
        detail: `Found ${processedData.value.length} matching records`,
        life: 3000
    });

    isLoading.value = false;
};

// Helper Functions
const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null;
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
    if (age === null) return null;
    if (age < 10) return 'UNDER_10';
    if (age <= 19) return '10_19';
    if (age <= 24) return '20_24';
    if (age <= 60) return '25_60';
    return 'OVER_60';
};

const getDzongkhagRegion = (dzongkhag) => {
    const regionMap = {
        WESTERN: ['THIMPHU', 'PARO', 'HAA', 'PUNAKHA', 'GASA', 'CHHUKHA', 'SAMTSE', 'THIMPHU THROMDE', 'PHUENTSHOGLING THROMDE'],
        CENTRAL: ['BUMTHANG', 'DAGANA', 'SARPANG', 'TRONGSA', 'TSIRANG', 'WANGDUE', 'ZHEMGANG'],
        EASTERN: ['LHUENTSE', 'MONGAR', 'PEMAGATSHEL', 'SAMDRUP JONGKHAR', 'TRASHIGANG', 'SAMDRUP JONGKHAR THROMDE', 'TRASHI YANGTSE']
    };
    const upperDzongkhag = dzongkhag.toUpperCase();
    for (const [region, dzongkhags] of Object.entries(regionMap)) {
        if (dzongkhags.includes(upperDzongkhag)) {
            return region;
        }
    }
    return null;
};

// Computed property for filtered data
const filteredData = computed(() => {
    if (!serviceAndTreatmentData.value) {
        console.log('No service and treatment data available');
        return [];
    }

    return serviceAndTreatmentData.value.filter(item => {
        let matches = true;
        const user = item.user || {};
        const agencyDetails = user.agency_details || {};
        const agency = agencyDetails.agency || {};
        const activeAgencyName = user.active_agency?.agency_name?.toUpperCase() || '';

        // Filter by year
        if (filters.value.year && item.date) {
            const itemYear = new Date(item.date).getFullYear();
            matches = matches && itemYear === parseInt(filters.value.year.code);
        }

        // Filter by organization
        if (filters.value.organization) {
            switch (filters.value.organization.code) {
                case 'EVENT_BASED':
                    matches = matches && item.screening_data?.event;
                    break;
                case 'CASE_BASED':
                    matches = matches && item.screening_data?.case;
                    break;
                case 'CLUSTER':
                    matches = matches && !item.screening_data?.event && !item.screening_data?.case;
                    if (filters.value.agency) {
                        matches = matches && activeAgencyName === filters.value.agency.code;
                    }
                    break;
                case 'SCHOOL':
                    matches = matches && activeAgencyName.includes('SCHOOL');
                    if (filters.value.agency) {
                        matches = matches && activeAgencyName === filters.value.agency.code;
                    }
                    break;
                default:
                    matches = false;
                    break;
            }
        }

        // Filter by agency
        if (filters.value.agency) {
            matches = matches && activeAgencyName === filters.value.agency.code;
        }

        // Filter by class level for schools
        if (filters.value.classLevel.length > 0 && activeAgencyName.includes('SCHOOL')) {
            const userClass = agencyDetails.user_class?.toUpperCase();
            matches = matches && filters.value.classLevel.some(cls => cls.code.toUpperCase() === userClass);
        }

        // Filter by region and dzongkhag
        if (filters.value.region) {
            const itemDzongkhag = agency.present_dzongkhag;
            if (itemDzongkhag) {
                matches = matches && getDzongkhagRegion(itemDzongkhag) === filters.value.region.code;

                if (filters.value.dzongkhag) {
                    matches = matches && itemDzongkhag.toUpperCase() === filters.value.dzongkhag.code;
                }
            } else {
                matches = false;
            }
        }

        // Filter by age groups
        if (filters.value.ageGroups.length > 0) {
            const age = calculateAge(user.date_of_birth);
            matches = matches && filters.value.ageGroups.some(group => {
                const range = group.code.split('_');
                const min = range[0] === 'UNDER' ? 0 : parseInt(range[0]);
                const max = range[1] === 'OVER' ? Infinity : parseInt(range[1]);
                return age >= min && age <= max;
            });
        }

        // Filter by gender
        if (filters.value.gender.length > 0) {
            matches = matches && filters.value.gender.some(g => g.code === user.gender?.toUpperCase());
        }

        return matches;
    });
});

// Watchers
watch([selectedReport, filters, dateRange], () => {
    showReport.value = false;
}, { deep: true });

watch(serviceAndTreatmentData, (newData) => {
    processedData.value = newData;
}, { immediate: true });

onMounted(() => {
    // Initialize processedData.value with serviceAndTreatmentData.value
    if (serviceAndTreatmentData.value) {
        processedData.value = serviceAndTreatmentData.value;
    }
});
</script>

<style scoped>
/* Main Container */
.filter-configurator {
    max-width: 1320px;
    margin: 0 auto;
    padding: 1.5rem;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

/* Header Styling */
.filter-header {
    padding: 1rem 1.5rem;
    background-color: #2F4858 !important;
    color: white;
    border-radius: 8px;
    margin-bottom: 1.5rem;
}

.filter-header h4 {
    font-size: 1.25rem;
    font-weight: 500;
}

/* Label Styling */
.form-label {
    color: #2F4858;
    font-weight: 500;
    margin-bottom: 0.5rem;
    font-size: 0.95rem;
}

/* Dropdown Styling */
:deep(.p-dropdown),
:deep(.p-multiselect),
:deep(.p-calendar) {
    width: 100%;
    background: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 6px;
}

:deep(.p-dropdown:not(.p-disabled):hover),
:deep(.p-multiselect:not(.p-disabled):hover) {
    border-color: #2F4858;
}

:deep(.p-dropdown.p-focus),
:deep(.p-multiselect.p-focus) {
    border-color: #2F4858;
    box-shadow: 0 0 0 2px rgba(47, 72, 88, 0.1);
}

:deep(.p-dropdown-panel),
:deep(.p-multiselect-panel) {
    border: 1px solid #e9ecef;
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Status Filters Section */
.status-filters {
    background: #f8f9fa;
    border-radius: 8px;
    padding: 1.5rem;
    margin: 1.5rem 0;
}

.status-filters-header {
    color: #2F4858;
    font-weight: 500;
    margin-bottom: 1.25rem;
}

.status-filters-header h6 {
    font-size: 1rem;
}

/* Active Filters */
.active-filters {
    background: rgba(47, 72, 88, 0.05);
    border-radius: 8px;
    padding: 1rem;
}

.filter-chip {
    background: white;
    border: 1px solid #2F4858;
    color: #2F4858;
    padding: 0.25rem 0.75rem;
    border-radius: 4px;
}

/* Buttons */
:deep(.p-button) {
    border-radius: 6px;
    padding: 0.5rem 1rem;
    font-weight: 500;
}

:deep(.p-button.btn-secondary) {
    background: transparent;
    border: 1px solid #2F4858;
    color: #2F4858;
}

:deep(.p-button.btn-secondary:hover) {
    background: rgba(47, 72, 88, 0.1);
}

:deep(.p-button.btn-primary) {
    background: #2F4858;
    border: 1px solid #2F4858;
}

:deep(.p-button.btn-primary:hover) {
    background: #243845;
}

/* Grid Layout */
.row {
    margin: -0.5rem;
}

.col,
[class*="col-"] {
    padding: 0.5rem;
}

/* Form Groups */
.mb-3 {
    margin-bottom: 1rem;
}

/* Custom spacing for sections */
.form-section {
    margin-bottom: 2rem;
}

/* Specific Component Overrides */
:deep(.p-dropdown-item),
:deep(.p-multiselect-item) {
    padding: 0.5rem 1rem;
    color: #2F4858;
}

:deep(.p-dropdown-item:hover),
:deep(.p-multiselect-item:hover) {
    background: rgba(47, 72, 88, 0.05);
}

/* Responsive Design */
@media (max-width: 768px) {
    .filter-configurator {
        padding: 1rem;
    }

    .status-filters {
        padding: 1rem;
    }

    .d-flex.justify-content-end {
        flex-direction: column;
        gap: 0.5rem;
    }

    .d-flex.justify-content-end button {
        width: 100%;
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
.filter-chip,
.visualization-grid>div {
    animation: fadeIn 0.3s ease-out forwards;
}

/* Enhanced dropdown icons */
:deep(.p-dropdown-trigger),
:deep(.p-multiselect-trigger) {
    width: 3rem;
    background: rgba(43, 101, 111, 0.05);
    border-radius: 0 6px 6px 0;
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

/* Additional styles from the second code example */
.filter-content {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    /* Make columns responsive */
    gap: 1.5rem;
}

.filter-group-row {
    display: flex;
    gap: 1rem;
}

/* Responsive adjustments for smaller screens */
@media (max-width: 768px) {
    .filter-content {
        grid-template-columns: 1fr;
        /* Stack columns on small screens */
    }

    .filter-group-row {
        flex-direction: column;
        /* Stack row items on small screens */
    }
}

/* Dropdown, MultiSelect, and Calendar specific overrides */
:deep(.p-dropdown),
:deep(.p-multiselect),
:deep(.p-calendar) {
    width: 100%;
    background: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 6px;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

:deep(.p-dropdown:not(.p-disabled):hover),
:deep(.p-multiselect:not(.p-disabled):hover),
:deep(.p-calendar:not(.p-disabled):hover) {
    border-color: #2F4858;
}

:deep(.p-dropdown.p-focus),
:deep(.p-multiselect.p-focus),
:deep(.p-calendar.p-focus) {
    border-color: #2F4858;
    box-shadow: 0 0 0 2px rgba(47, 72, 88, 0.1);
}

:deep(.p-dropdown-panel),
:deep(.p-multiselect-panel) {
    border: 1px solid #e9ecef;
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    background: white;
}

:deep(.p-dropdown-item),
:deep(.p-multiselect-item) {
    padding: 0.75rem 1rem;
    color: #2F4858;
    transition: background-color 0.2s ease, color 0.2s ease;
}

:deep(.p-dropdown-item:hover),
:deep(.p-multiselect-item:hover) {
    background: rgba(47, 72, 88, 0.05);
}

:deep(.p-dropdown-item.p-highlight),
:deep(.p-multiselect-item.p-highlight) {
    background: rgba(47, 72, 88, 0.1);
    color: #2F4858;
}

/* Calendar specific styles */
:deep(.p-calendar .p-inputtext) {
    width: 100%;
    border: none;
}

:deep(.p-calendar-w-btn .p-inputtext) {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
}

:deep(.p-calendar .p-datepicker) {
    border: 1px solid #e9ecef;
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    background: white;
}

:deep(.p-calendar .p-monthpicker .p-monthpicker-month),
:deep(.p-calendar .p-yearpicker .p-yearpicker-year) {
    color: #2F4858;
    transition: background-color 0.2s ease, color 0.2s ease;
}

:deep(.p-calendar .p-monthpicker .p-monthpicker-month:hover),
:deep(.p-calendar .p-yearpicker .p-yearpicker-year:hover) {
    background: rgba(47, 72, 88, 0.05);
}

/* Custom styling for p-calendar */
:deep(.p-calendar) {
    width: 100%;
}

:deep(.p-calendar .p-inputtext) {
    width: 100%;
    border: none;
    background: transparent;
    padding: 0.75rem 1rem;
}

:deep(.p-calendar .p-datepicker) {
    width: 24rem;
}
</style>