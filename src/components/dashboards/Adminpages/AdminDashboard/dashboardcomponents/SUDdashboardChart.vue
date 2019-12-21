<template>
    <div class="treatment-dashboard">
        <!-- Header Section -->
        <div class="p-4 hwss-bg my-rounded">
            <div class="mb-4 text-center">
                <h3 class="text-white fw-semibold mb-2">{{ title || 'SUD Treatment Overview' }}</h3>
                <p class="text-white small">{{ subtitle || 'Real-time status of patient treatment phases' }}</p>
            </div>

            <!-- Loading State -->
            <div v-if="loadingState === 'loading'" class="d-flex justify-content-center py-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>

            <div v-else-if="loadingState === 'timeout'" class="empty-state">
                <i class="bi bi-clock fs-1 text-muted mb-3"></i>
                <p class="text-muted">Request timeout. Please try again.</p>
            </div>

            <!-- Stats Grid -->
            <div v-else class="row g-4">
                <div v-for="(stat, index) in processedStats" :key="index" class="col-md-6 col-lg-4">
                    <div :class="['stat-card', stat.variant]">
                        <div class="card-body position-relative">
                            <div class="icon-wrapper">
                                <i :class="['bi', stat.icon]"></i>
                            </div>
                            <div class="stat-content">
                                <h6 class="stat-title fw-medium">{{ stat.title }}</h6>
                                <div class="stat-value">{{ formatNumber(stat.value) }}</div>
                                <div v-if="stat.trend !== undefined"
                                    :class="['stat-trend', stat.trend >= 0 ? 'positive' : 'negative']">
                                    <i :class="['bi', stat.trend >= 0 ? 'bi-arrow-up' : 'bi-arrow-down']"></i>
                                    {{ Math.abs(stat.trend) }}%
                                </div>
                                <p class="stat-subtitle">{{ stat.subtitle }}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
  
<script setup>
import { ref, computed, onMounted, inject, watchEffect, onBeforeUnmount } from 'vue';

// Props
const props = defineProps({
    title: String,
    subtitle: String,
    customStats: {
        type: Array,
        default: () => []
    }
});

// Injections and Refs
const treatmentData = inject('serviceAndTreatmentData');
const loadingState = ref('loading');
const stats = ref({});
const previousStats = ref({}); // Store historical data

// Computed
const processedStats = computed(() => {
    if (props.customStats.length > 0) return props.customStats;

    return [
        {
            title: 'Primary Phase',
            value: stats.value.primaryPhase || 0,
            trend: stats.value.primaryPhase === 0 ? undefined : roundTrend(calculateTrend('primaryPhase')),
            icon: 'bi-clipboard-pulse',
            variant: 'primary',
            subtitle: 'Active patients'
        },
        {
            title: 'Continuing Care',
            value: stats.value.continuingCare || 0,
            trend: stats.value.continuingCare === 0 ? undefined : roundTrend(calculateTrend('continuingCare')),
            icon: 'bi-heart-pulse',
            variant: 'accent',
            subtitle: 'Ongoing treatments'
        },
        {
            title: 'Rehabilitation',
            value: stats.value.rehabilitation || 0,
            trend: stats.value.rehabilitation === 0 ? undefined : roundTrend(calculateTrend('rehabilitation')),
            icon: 'bi-shield-check',
            variant: 'neutral',
            subtitle: 'In rehabilitation'
        },
        {
            title: 'Completed',
            value: stats.value.completed || 0,
            trend: stats.value.completed === 0 ? undefined : roundTrend(calculateTrend('completed')),
            icon: 'bi-check-circle',
            variant: 'success',
            subtitle: 'Successfully completed'
        },
        {
            title: 'Non-compliance',
            value: stats.value.nonCompliance || 0,
            trend: stats.value.nonCompliance === 0 ? undefined : roundTrend(calculateTrend('nonCompliance')),
            icon: 'bi-exclamation-triangle',
            variant: 'warning',
            subtitle: 'Requiring attention'
        }
    ];
});

// Utilities
function formatNumber(value) {
    return new Intl.NumberFormat().format(value);
}

function roundTrend(value) {
    return Number(value.toFixed(2));
}

function calculateTrend(metric) {
    const previousValue = previousStats.value[metric] || 0;
    const currentValue = stats.value[metric] || 0;


    if(previousValue === 0) return 0; // if no previous value, return a default of 0.

    const trend = ((currentValue - previousValue) / previousValue) * 100;
    return trend;
}

// Data Processing
function calculateStats(data) {
    if (!data) {
        stats.value = {};
        return;
    }

    const newStats = {
        primaryPhase: 0,
        continuingCare: 0,
        rehabilitation: 0,
        completed: 0,
        nonCompliance: 0
    };

    const statusMap = {
       'hospital-based outpatient sud treatment and care (primary phase)': 'primaryPhase',
        'hospital-based outpatient sud treatment and care (continuing care)': 'continuingCare',
        'undergoing rehabilitation': 'rehabilitation',
        'treatment completed': 'completed',
        'unwilling to undergo treatment': 'nonCompliance'
    };

    data.forEach(item => {
        // Safely extract follow-up information
        let followUp = null;
        if(item && typeof item === 'object'){
             followUp = item?.follow_up?.trim()?.toLowerCase();
        }

        for (const key in statusMap) {
           if(key.toLowerCase() === followUp){
                newStats[statusMap[key]]++;
                break;
           }
        }

    });
    
    // update prev stats
    previousStats.value = {...stats.value};
    stats.value = newStats;
}

// Lifecycle
let timeoutId = null;

onMounted(() => {
    loadingState.value = 'loading';
    timeoutId = setTimeout(() => {
        if (loadingState.value === 'loading') {
            loadingState.value = 'timeout';
        }
    }, 10000);

    try {
        if (treatmentData.value !== undefined) {
            calculateStats(treatmentData.value);
        } else {
            calculateStats([]); // Initialize stats with empty array if no data available
        }
        loadingState.value = 'complete';
    } catch (err) {
        console.error('Error processing data:', err);
    } finally {
        clearTimeout(timeoutId);
    }
});

onBeforeUnmount(() => {
    clearTimeout(timeoutId);
});
</script>
  
<style scoped>
.my-rounded {
    border-radius: 20px;
}

.treatment-dashboard {
    background-color: var(--bs-gray-100);
    padding: 20px 0;
}

.dashboard-title {
    color: var(--bs-gray-900);
}

.empty-state {
    text-align: center;
    padding: 3rem 0;
}

.empty-state i {
    display: block;
    margin-bottom: 1rem;
}

.stat-card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    height: 100%;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    overflow: hidden;
}

.stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.icon-wrapper {
    position: absolute;
    top: 1.25rem;
    right: 1.25rem;
    width: 40px;
    height: 40px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #2B656F 0%, #1D4851 100%);
    opacity: 0.9;
}

.icon-wrapper i {
    color: white;
    font-size: 1.25rem;
}

.stat-content {
    padding-top: 2rem;
}

.stat-title {
    font-size: 0.875rem;
    color: var(--bs-gray-600);
    margin-bottom: 0.5rem;
}

.stat-value {
    font-size: 1.75rem;
    font-weight: 600;
    color: var(--bs-gray-900);
    margin-bottom: 0.5rem;
}

.stat-trend {
    font-size: 0.875rem;
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.25rem;
}

.stat-trend.positive {
    color: var(--bs-success);
}

.stat-trend.negative {
    color: var(--bs-danger);
}

.stat-subtitle {
    font-size: 0.875rem;
    color: var(--bs-gray-600);
    margin-bottom: 0;
}

/* Card Variants */
.stat-card.primary .card-body {
    border-left: 3px solid #2B656F;
}

.stat-card.accent .card-body {
    border-left: 3px solid #1D4851;
}

.stat-card.neutral .card-body {
    border-left: 3px solid var(--bs-gray-500);
}

.stat-card.success .card-body {
    border-left: 3px solid var(--bs-success);
}

.stat-card.warning .card-body {
    border-left: 3px solid var(--bs-warning);
}
</style>