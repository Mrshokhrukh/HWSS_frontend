<!-- CurrentStatusComponent.vue -->
<template>
    <div class="status-container">
        <h3 class="status-title">Current Status in Bhutan</h3>

        <!-- Loading State -->
        <div v-if="isLoading" class="d-flex justify-content-center align-items-center loading-container">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="alert alert-danger text-center">
            {{ error }}
        </div>

        <!-- Data Display -->
        <div v-else class="status-cards">
            <div v-for="(status, index) in statuses" :key="index" class="status-card">
                <div class="card-content">
                    <div class="card-icon">
                        <span class="material-symbols-outlined">{{ status.iconClass }}</span>
                    </div>
                    <div class="card-info">
                        <h4 class="card-title">{{ status.title }}</h4>
                        <p class="card-count">{{ formatNumber(status.count) }}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';

// Define props properly to receive data from parent
const props = defineProps({
    userData: {
        type: Object,
        required: true
    },
    serviceData: {
        type: Array,
        required: true,
        default: () => []
    }
});

// State management
const isLoading = ref(true);
const error = ref(null);

// Helper function for number formatting
const formatNumber = (num) => {
    if (!num && num !== 0) return '0';
    if (num >= 1000000000) return (num / 1000000000).toFixed(2) + 'B';
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(2) + 'K';
    return num.toString();
};

// Computed properties using props.serviceData
const totalOngoingCase = computed(() =>
    props.serviceData?.filter(item =>
        item?.case_status?.toLowerCase() === "on going"
    )?.length || 0
);

const totalClosedCase = computed(() =>
    props.serviceData?.filter(item =>
        item?.case_status?.toLowerCase() === "case closed"
    )?.length || 0
);

const totalDiscontinueCase = computed(() =>
    props.serviceData?.filter(item =>
        item?.case_status?.toLowerCase() === "case discontinue"
    )?.length || 0
);

const statuses = computed(() => [
    {
        title: 'Total Case Ongoing',
        iconClass: 'description',
        count: totalOngoingCase.value,
        variant: 'primary'
    },
    {
        title: 'Total Case Discontinue',
        iconClass: 'credit_card_off',
        count: totalDiscontinueCase.value,
        variant: 'warning'
    },
    {
        title: 'Total Case Closed',
        iconClass: 'fact_check',
        count: totalClosedCase.value,
        variant: 'success'
    }
]);

// Watch for data changes
watch(() => props.serviceData, (newData) => {
    if (!newData || !Array.isArray(newData)) {
        error.value = 'Invalid data format received';
    } else {
        error.value = null;
    }
    isLoading.value = false;
}, { immediate: true });

// Lifecycle hooks
onMounted(() => {
    setTimeout(() => {
        isLoading.value = false;
    }, 500);

    console.log('jedha', props.serviceData)
});

</script>

<style scoped>
.status-container {
    padding: 2rem;
    background: linear-gradient(135deg, #e6f3f5, #f0f7f8);
    border-radius: 20px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.loading-container {
    height: 200px;
}

.status-title {
    font-size: 2rem;
    font-weight: 700;
    color: #2B656F;
    text-align: center;
    margin-bottom: 2rem;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
}

.status-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
    padding: 1rem;
}

.status-card {
    padding: 1.5rem;
    border-radius: 15px;
    background: linear-gradient(135deg, #2B656F 0%, #1D4851 100%);
    transition: all 0.3s ease;
    color: white;
}

.card-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
}

.card-icon {
    margin-bottom: 1rem;
}

.card-icon .material-symbols-outlined {
    font-size: 3rem;
}

.card-title {
    font-size: 1.2rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
}

.card-count {
    font-size: 2.5rem;
    font-weight: 700;
    margin: 0;
}

.status-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
}

/* Responsive Adjustments */
@media (max-width: 768px) {
    .status-container {
        padding: 1rem;
    }

    .status-title {
        font-size: 1.5rem;
    }

    .status-cards {
        grid-template-columns: 1fr;
    }

    .card-count {
        font-size: 2rem;
    }
}
</style>