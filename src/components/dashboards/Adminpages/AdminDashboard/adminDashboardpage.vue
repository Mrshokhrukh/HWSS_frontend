<template>
    <div class="dashboard-container p-4">
        <!-- Core Dashboard Components -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <!-- Conditional rendering of SUD Dashboard/Current Status -->
            <sud-dashboard-chart v-if="userRole === 'sud_admin'" :userData="userData" :serviceData="filteredSUDData"
                class="mt-4" />
            <current-status-component v-else :userData="userData" :serviceData="serviceAndTreatmentData" class="mt-4" />

            <!-- Table Total Screening Component -->
            <table-total-screening-component :userData="userData"
                :serviceData="isSUDUser ? filteredSUDData : serviceAndTreatmentData" class="mt-4" />

            <!-- Conditional Risk Component -->
            <component :is="isSUDUser ? SUDSubstanceRiskcomponent : ChartComponent" :userData="userData"
                :serviceData="isSUDUser ? filteredSUDData : serviceAndTreatmentData" class="mt-4" />
        </div>

        <!-- Dynamic Role-Specific Components -->
        <div v-if="additionalComponents.length" class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <component v-for="(Component, index) in additionalComponents" :key="index" :is="Component"
                :userData="userData" :serviceData="isSUDUser ? filteredSUDData : serviceAndTreatmentData" />
        </div>
    </div>
</template>

<script setup>
import { computed, inject } from 'vue'
import CurrentStatusComponent from './dashboardcomponents/CurrentStatusComponent.vue'
import TableTotalScreeningComponent from './dashboardcomponents/TableTotalScreeningComponent.vue'
import ChartComponent from './dashboardcomponents/ChartComponent.vue'
import SudDashboardChart from './dashboardcomponents/SUDdashboardChart.vue'
import SUDSubstanceRiskcomponent from './dashboardcomponents/SUDSubstanceRiskcomponent.vue'

const props = defineProps({
    userData: {
        type: Object,
        required: true
    },
    roleConfig: {
        type: Object,
        required: true
    }
})

const serviceAndTreatmentData = inject('serviceAndTreatmentData', [])

// Get user role from userData
const userRole = computed(() => {
    const userDetails = localStorage.getItem('userDetailsStore')
    if (userDetails) {
        return JSON.parse(userDetails)?.user?.role || ''
    }
    return ''
})

// Check if user is SUD related
const isSUDUser = computed(() => {
    return ['sud_admin', 'sud_counselor', 'sud'].includes(userRole.value)
})

// Get additional components from role config
const additionalComponents = computed(() => {
    return props.roleConfig?.dashboard?.additionalComponents || []
})

const checkRiskData = (riskData) => {
    return Array.isArray(riskData) &&
        riskData.some(data =>
            data.risk_flag &&
            data.risk_flag !== 'none' &&
            (!data.measurement || data.measurement > 0) // Include if measurement doesn't exist or is greater than 0
        );
}

// Updated filtered SUD data computed property
const filteredSUDData = computed(() => {
    if (!serviceAndTreatmentData.value) return []

    return serviceAndTreatmentData.value.filter(item => {
        if (typeof item.screening_data === 'string') {
            return false;
        }

        // Case 1: Check assist_data inside screening_data (cluster tests)
        const hasAssistData = item.screening_data?.assist_data &&
            checkRiskData(item.screening_data.assist_data);

        // Case 2: Check event_substance_risks at root level
        const hasEventRisks = item.event_substance_risks &&
            checkRiskData(item.event_substance_risks);

        // Case 3: Check case_substance_risks at root level
        const hasCaseRisks = item.case_substance_risks &&
            checkRiskData(item.case_substance_risks);

        return hasAssistData || hasEventRisks || hasCaseRisks;
    })
})
</script>