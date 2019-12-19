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
                        <Button label="Reset" icon="pi pi-refresh" class="p-button-outlined" @click="resetFilters"
                            :disabled="!hasFilters" />
                        <Button label="Apply Filters" icon="pi pi-check" class="p-button-primary" @click="applyFilters"
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



const toast = useToast();
const serviceAndTreatmentData = inject('serviceAndTreatmentData');

// Constants (No changes needed here)
const regions = [
    { code: 'WESTERN', name: 'Western Region' },
    { code: 'CENTRAL', name: 'Central Region' },
    { code: 'EASTERN', name: 'Eastern Region' }
];

const organizations = [
    { code: 'EVENT_BASED', name: 'Event Based' },
    { code: 'CASE_BASED', name: 'Case Based' },
    { code: 'CLUSTER', name: 'Cluster' },
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

    try {
        const userDetails = JSON.parse(localStorage.getItem('userDetailsStore'));
        const userRole = userDetails?.user?.role;

        if (userRole === 'cecd_admin') {
            return [...baseReports, { code: 'SCHOOL_ENV', name: 'School Environment Report' }];
        }
    } catch (error) {
        console.error("Error parsing userDetails from localStorage:", error);
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

    return dzongkhagsByRegion[filters.value.region.code]?.map(name => ({
        code: name.toUpperCase(),
        name
    })) || [];
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

    if (filters.value.classLevel?.length) {
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

    if (filters.value.ageGroups?.length) {
        list.push({
            id: 'ageGroups',
            label: `Age Groups: ${filters.value.ageGroups.map(g => g.name).join(', ')}`
        });
    }

    if (filters.value.gender?.length) {
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
        case 'EVENT_BASED': {
            // Use a Set to avoid duplicate event names
            const uniqueEventNames = new Set();
            serviceAndTreatmentData.value
                .filter(item => item.screening_data?.event)
                .forEach(item => {
                    uniqueEventNames.add(item.screening_data.event.event_name);
                });

            // Convert the Set back to an array of objects for the dropdown
            return Array.from(uniqueEventNames).map(name => ({
                code: name, // Use the event name as the code
                name: name   // Use the event name for display
            }));
        }
        case 'CASE_BASED': {
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
        }
        case 'CLUSTER': {
            const uniqueAgencies = new Set();
            serviceAndTreatmentData.value.forEach(item => {
                const agencyName = item.user?.active_agency?.agency_name;
                // Only add agency names that include "SCHOOL"
                if (agencyName && agencyName.toUpperCase().includes('SCHOOL')) {
                    uniqueAgencies.add(agencyName);
                }
            });
            return Array.from(uniqueAgencies).map(name => ({
                code: name,
                name: name
            }));
        }
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
    if (filters.value.organization?.code !== 'SCHOOL' && filters.value.organization?.code !== 'CLUSTER') {
        filters.value.classLevel = [];
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
        default:
            console.warn(`Unknown filter ID: ${filterId}`);
    }
};

const resetFilters = () => {
    selectedReport.value = null;
    dateRange.value = null;
    filters.value = {
        organization: null,
        agency: null,
        classLevel: [],
        region: null,
        dzongkhag: null,
        ageGroups: [],
        gender: [],
        year: null,
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
    try {
        const dob = new Date(dateOfBirth);
        if (isNaN(dob.getTime())) return null;

        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
            age--;
        }
        return age;
    } catch (error) {
        console.error("Error calculating age:", error);
        return null;
    }
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
    if (!dzongkhag) return null;

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
        // Get the agency_name directly without converting to uppercase
        const activeAgencyName = user.active_agency?.agency_name || '';

        // Filter by year
        if (filters.value.year && item.date) {
            const itemYear = new Date(item.date).getFullYear();
            matches = matches && itemYear === parseInt(filters.value.year.code);
        }

        // Filter by organization
        if (filters.value.organization) {
            switch (filters.value.organization.code) {
                case 'EVENT_BASED':
                    matches = matches && !!item.screening_data?.event;
                    // Further filter by selected agency (event_name)
                    if (filters.value.agency) {
                        matches = matches && item.screening_data.event.event_name === filters.value.agency.name; // Compare with name
                    }
                    break;
                case 'CASE_BASED':
                    matches = matches && !!item.screening_data?.case;
                    if (filters.value.agency) {
                        // Compare activeAgencyName with the selected agency's name
                        matches = matches && activeAgencyName === filters.value.agency.name;
                    }
                    break;
                case 'CLUSTER':
                    matches = matches && !item.screening_data?.event && !item.screening_data?.case;
                    if (filters.value.agency) {
                        matches = matches && activeAgencyName.toUpperCase().includes(filters.value.agency.name.toUpperCase());
                    }
                    break;
                default:
                    matches = false;
                    break;
            }
        }

        // Filter by agency (for non-EVENT_BASED) 
        // Only apply this filter if organization is NOT 'EVENT_BASED'
        if (filters.value.agency && filters.value.organization.code !== 'EVENT_BASED') {
            matches = matches && activeAgencyName.toUpperCase() === filters.value.agency.code.toUpperCase();
        }

        // Filter by class level for schools
        if (filters.value.classLevel?.length > 0 && (filters.value.organization?.code === 'SCHOOL' || filters.value.organization?.code === 'CLUSTER')) {
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
        if (filters.value.ageGroups?.length > 0) {
            const age = calculateAge(user.date_of_birth);
            const ageGroup = getAgeGroup(age);
            matches = matches && filters.value.ageGroups.some(group => {
                if (ageGroup === null) return false;
                return group.code === ageGroup;
            });
        }

        // Filter by gender
        if (filters.value.gender?.length > 0) {
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
/* 1. Foundation */
.filter-configurator {
    font-family: Arial, sans-serif;
    /* Specify your desired font-family */
}

/* 2. Layout System */
.filter-panel {
    border: none;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    /* Example shadow - adjust as needed */
}

.filter-header {
    background-color: #fff;
    /* Example - set to your desired color */
    padding: 0.75rem 1.25rem;
    border-bottom: 1px solid #e9ecef;
    /* Bootstrap's default border color */
}

.filter-header h4 {
    font-weight: 600;
    /* Semi-bold per your design doc */
}

.filter-content {
    padding: 1rem;
}

.row {
    --bs-gutter-x: 1rem;
    /* Adjust as needed */
    --bs-gutter-y: 1rem;
    /* Adjust as needed */
}

/* 3. Component Architecture */
/* Card Structure is mostly handled by PrimeVue's Panel and Bootstrap classes */

/* 4. Typography */
.form-label {
    font-weight: 500;
    /* Medium weight for labels */
    margin-bottom: 0.5rem;
}

/* 5. Colors */
.hwss-primary {
    color: #2F4858;
    /* Replace with your brand's primary color */
}

.bg-light {
    background-color: #f8f9fa;
    /* Bootstrap's light background */
}

/* 6. Icons */
/* Assuming you're using PrimeIcons */
.pi {
    font-size: 1rem;
    /* Adjust as needed */
    margin-right: 0.5rem;
}

/* 7. Cards */
/* Already covered by Panel and Bootstrap classes */

/* 8. Forms */
.p-dropdown,
.p-multiselect {
    width: 100%;
    border: 1px solid #ced4da;
    /* Bootstrap's default border color */
    border-radius: 0.25rem;
    background-color: #fff;
}

.p-dropdown:hover,
.p-multiselect:hover {
    border-color: #2F4858;
    /* Your primary color on hover */
}

.p-dropdown:focus,
.p-multiselect:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(47, 72, 88, 0.25);
    /* Example focus shadow */
    border-color: #2F4858;
}

.p-dropdown .p-dropdown-label,
.p-multiselect .p-multiselect-label {
    padding: 0.5rem 0.75rem;
}

.p-dropdown .p-dropdown-trigger,
.p-multiselect .p-multiselect-trigger {
    background-color: transparent;
    color: #495057;
    /* Bootstrap's default color */
}

.p-multiselect .p-multiselect-item {
    padding: 0.5rem 1rem;
}

.p-multiselect .p-multiselect-item:hover {
    background-color: rgba(47, 72, 88, 0.05);
    /* Light background on hover */
}

.p-multiselect .p-multiselect-item.p-highlight {
    background-color: rgba(47, 72, 88, 0.1);
    /* Slightly darker on highlight */
    color: #2F4858;
    /* Primary color */
}

.p-multiselect-panel .p-multiselect-header {
    padding: 0.5rem;
}

.p-multiselect-panel .p-multiselect-filter-container {
    padding-bottom: 0.5rem;
}

.p-multiselect-panel .p-multiselect-filter-container .p-inputtext {
    padding: 0.5rem;
    border-radius: 0.25rem;
}

/* 9. Interactive Elements */
.p-button {
    padding: 0.5rem 1rem;
    border-radius: 0.25rem;
}

.p-button-primary {
    background-color: #2F4858;
    /* Your primary color */
    border-color: #2F4858;
}

.p-button-primary:hover {
    background-color: #1D3540;
    /* Darker shade on hover */
    border-color: #1D3540;
}

.p-button-outlined {
    background-color: transparent;
    color: #2F4858;
    border: 1px solid #2F4858;
}

.p-button-outlined:hover {
    background-color: rgba(47, 72, 88, 0.05);
    /* Light background on hover */
}

.p-button .pi {
    margin-right: 0.5rem;
}

/* 10. States */
/* Loading State - handled by the :loading prop on p-button */
/* Active Filters Display */
.active-filters {
    border-radius: 0.25rem;
}

.filter-chip {
    background-color: #fff;
    border: 1px solid #2F4858;
    color: #2F4858;
    padding: 0.25rem 0.5rem;
    border-radius: 0.2rem;
    margin-right: 0.5rem;
    margin-bottom: 0.5rem;
}

.filter-chip .p-chip-remove-icon {
    margin-left: 0.25rem;
}

/* 11. Spacing */
.mb-3 {
    margin-bottom: 1rem;
}

.mt-2 {
    margin-top: 0.5rem;
}

.mt-4 {
    margin-top: 1.5rem;
}

.p-3 {
    padding: 1rem;
}

.gap-2 {
    gap: 0.5rem;
}

.gap-3 {
    gap: 1rem;
}

/* 12. Utilities */
/* Most utilities are handled by Bootstrap classes directly in the template */

/* Responsive Design */
@media (max-width: 768px) {

    /* Adjust column sizes for smaller screens */
    .col-md-6 {
        flex: 0 0 100%;
        max-width: 100%;
    }

    /* Adjust form elements for smaller screens */
    .p-dropdown,
    .p-multiselect {
        font-size: 0.9rem;
    }
}
</style>