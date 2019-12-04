<template>
    <div class="dashboard-container p-4">
        <!-- Core Dashboard Components -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <!-- Conditional rendering of SUD Dashboard/Current Status (Now First) -->
            <sud-dashboard-chart v-if="userRole === 'sud_admin'" :userData="userData"
                :serviceData="serviceAndTreatmentData" class="mt-4" />
            <current-status-component v-else :userData="userData" :serviceData="serviceAndTreatmentData" class="mt-4" />

            <!-- Table Total Screening Component (Now Second) -->
            <table-total-screening-component :userData="userData" :serviceData="serviceAndTreatmentData" class="mt-4" />

            <!-- Substance Risk Component (Now Third) -->
            <SUDSubstanceRiskcomponent :userData="userData" :serviceData="serviceAndTreatmentData" class="mt-4" />
        </div>

        <!-- Dynamic Role-Specific Components -->
        <div v-if="additionalComponents.length" class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <component v-for="(Component, index) in additionalComponents" :key="index" :is="Component"
                :userData="userData" :serviceData="serviceAndTreatmentData" />
        </div>
    </div>
</template>

<script setup>
import { computed, inject } from 'vue'
import CurrentStatusComponent from './dashboardcomponents/CurrentStatusComponent.vue'
import TableTotalScreeningComponent from './dashboardcomponents/TableTotalScreeningComponent.vue'
import ChartComponent from './dashboardcomponents/ChartComponent.vue'
import SudDashboardChart from './dashboardcomponents/SUDdashboardChart.vue'
import SUDSubstanceRiskcomponent from './dashboardcomponents/SUDSubstanceRiskcomponent.vue';

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

// Inject the service and treatment data provided by the parent
const serviceAndTreatmentData = inject('serviceAndTreatmentData', [])

// Get user role from userData
const userRole = computed(() => {
    const userDetails = localStorage.getItem('userDetailsStore')
    if (userDetails) {
        return JSON.parse(userDetails)?.user?.role || ''
    }
    return ''
})

// Get additional components from role config
const additionalComponents = computed(() => {
    return props.roleConfig?.dashboard?.additionalComponents || []
})
console.log("daa for sud",serviceAndTreatmentData)
</script>