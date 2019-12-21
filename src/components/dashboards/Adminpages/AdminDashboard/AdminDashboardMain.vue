<template>
    <div class="card admin-card p-4 mb-3 h-100 w-100">
        <div v-if="isValidRole">
            <component :is="currentComponent" :userData="userData" :roleConfig="roleConfig"
                @data-updated="handleDataUpdate" />
        </div>
    </div>
    <footer class="footer">
        <div class="container text-center my-4">
            <p>&copy; {{ currentYear }} {{ websiteName }}. All rights reserved.</p>
        </div>
    </footer>
</template>

<script setup>
import { computed, ref, onMounted, provide } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import endpoints from '@/api';

// Import the unified components
import DashboardView from './adminDashboardpage.vue';
import ApprovalView from './approval/ApprovalView.vue';
import ReportView from './ReportComponent/ReportComponent.vue';
import HelpView from './HelpView.vue';
import SettingsView from './setting/SettingsView.vue';

const route = useRoute();
const newServiceAndTreatment = ref([]);

// Updated role configuration with dashboard component settings
const roleConfig = {
    mh_admin: {
        dashboard: {
            component: DashboardView,
            additionalComponents: ['DashboardCurrentStatus', 'TableTotalScreening', 'ChartComponent']
        },
        approval: { component: ApprovalView },
        report: { component: ReportView },
        help: { component: HelpView },
        settings: { component: SettingsView },
        dataFilter: (data) => data
    },
    sud_admin: {
        dashboard: {
            component: DashboardView,
            additionalComponents: ['SudTotalScreening', 'SUDSubstanceRiskcomponent'],
            riskComponent: 'SUDSubstanceRiskcomponent'
        },
        approval: { component: ApprovalView },
        report: { component: ReportView },
        help: { component: HelpView },
        settings: { component: SettingsView },
        dataFilter: (data) => data
    },
    aaa_admin: {
        dashboard: {
            component: DashboardView,
            riskComponent: 'ChartComponent'
        },
        report: { component: ReportView },
        help: { component: HelpView },
        settings: { component: SettingsView },
        dataFilter: (data, agencyName) => data.filter(item => {
            const itemAgencyName = item.user?.active_agency?.agency_name?.toLowerCase() || '';
            return itemAgencyName === agencyName;
        })
    },
    cecd_admin: {
        dashboard: {
            component: DashboardView,
            riskComponent: 'ChartComponent'
        },
        report: { component: ReportView },
        help: { component: HelpView },
        settings: { component: SettingsView },
        dataFilter: (data) => data.filter(item => {
            const itemAgencyName = item.user?.active_agency?.agency_name?.toLowerCase() || '';
            return itemAgencyName.includes('school');
        })
    },
    rd_admin: {
        dashboard: {
            component: DashboardView,
            riskComponent: 'ChartComponent'
        },
        help: { component: HelpView },
        settings: { component: SettingsView },
        dataFilter: (data) => data
    }
};

// Provide the risk component type to child components
const getRiskComponentType = computed(() => {
    const role = userRole.value;
    return roleConfig[role]?.dashboard?.riskComponent || 'ChartComponent';
});

provide('riskComponentType', getRiskComponentType);
provide('serviceAndTreatmentData', newServiceAndTreatment);

// Rest of your existing code...
const userRole = computed(() => {
    const savedUserRole = JSON.parse(localStorage.getItem('userDetailsStore'));
    return savedUserRole?.user?.role || '';
});

const isValidRole = computed(() => Object.prototype.hasOwnProperty.call(roleConfig, userRole.value));

const currentYear = new Date().getFullYear();
const websiteName = "The PEMA HWSS";

const currentComponent = computed(() => {
    const path = route.path;
    const role = userRole.value;

    if (!roleConfig[role]) return null;

    if (path === '/admin-dashboard') {
        return roleConfig[role].dashboard?.component;
    } else if (path === '/admin-dashboard/admin-approval') {
        return roleConfig[role].approval?.component;
    } else if (path === '/admin-dashboard/admin-report') {
        return roleConfig[role].report?.component;
    } else if (path === '/admin-dashboard/admin-help') {
        return roleConfig[role].help?.component;
    } else if (path === '/admin-dashboard/admin-settings') {
        return roleConfig[role].settings?.component;
    }

    return null;
});

// Your existing functions...
const userDetailsInLocal = () => {
    const userDetails = JSON.parse(localStorage.getItem('userDetailsStore'));
    if (userDetails) {
        const agencyName = userDetails.agency ? userDetails.agency.agencyName?.toLowerCase() : null;
        const roleName = userDetails.user ? userDetails.user.role : null;
        return { agencyName, roleName };
    }
    return { agencyName: null, roleName: null };
};

const fetchServiceAndTreatmentData = async () => {
    try {
        const { agencyName: userAgencyName, roleName: userRole } = userDetailsInLocal();
        const serviceResponse = await axios.get(endpoints.getServiceAndTreatmentList);

        if (serviceResponse.data && roleConfig[userRole]) {
            let filteredData = serviceResponse.data;

            // First apply the role-based filter
            filteredData = roleConfig[userRole].dataFilter(filteredData, userAgencyName);

            // Additional SUD-specific filtering
            if (userRole === 'sud_admin') {

                filteredData = filteredData.filter(item => {
                    // Case 1: Check assist_data inside screening_data (cluster tests)
                    const hasAssistData = item.screening_data?.assist_data &&
                        Array.isArray(item.screening_data.assist_data) &&
                        item.screening_data.assist_data.some(data =>
                            data.risk_flag &&
                            data.risk_flag !== 'none' &&
                            data.measurement > 0
                        );

                    // Case 2: Check event_substance_risks
                    const hasEventRisks = item.event_substance_risks &&
                        Array.isArray(item.event_substance_risks) &&
                        item.event_substance_risks.some(risk =>
                            risk.risk_flag &&
                            risk.risk_flag !== 'none'
                        );

                    // Case 3: Check case_substance_risks
                    const hasCaseRisks = item.case_substance_risks &&
                        Array.isArray(item.case_substance_risks) &&
                        item.case_substance_risks.some(risk =>
                            risk.risk_flag &&
                            risk.risk_flag !== 'none'
                        );

                    const shouldInclude = hasAssistData || hasEventRisks || hasCaseRisks;

                    return shouldInclude;
                });
            }

            newServiceAndTreatment.value = filteredData;
        }
    } catch (error) {
        console.error('Error fetching service and treatment data:', error);
        newServiceAndTreatment.value = [];
    }
};

onMounted(() => {
    fetchServiceAndTreatmentData();
});
</script>

<style>
.admin-card {
    background: linear-gradient(135deg, #d3e2e4 0%, #b3c7c9 50%, #8fa8ac 100%);
}

.header {
    height: 8rem;
}

.footer {
    margin-top: auto;
}
</style>