<!-- TableTotalScreeningComponent.vue -->
<template>
    <div class="screening-container">
        <h3 class="screening-title">Screening Data</h3>

        <!-- Loading State -->
        <div v-if="isLoading" class="d-flex justify-content-center align-items-center p-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="alert alert-danger m-4">
            {{ error }}
        </div>

        <!-- Tables -->
        <div v-else class="screening-tables">
            <!-- Total Screened Table -->
            <div class="screening-table">
                <h5 class="table-title">Total Screened</h5>
                <DataTable :value="table1Data" :paginator="false" class="p-datatable-sm" resizableColumns
                    columnResizeMode="expand" :scrollable="true" scrollHeight="400px" responsiveLayout="scroll">
                    <Column field="header" header="" :headerStyle="headerStyle" :bodyStyle="bodyStyle" />
                    <Column field="male" header="Male" :headerStyle="headerStyle" :bodyStyle="bodyStyle" />
                    <Column field="female" header="Female" :headerStyle="headerStyle" :bodyStyle="bodyStyle" />
                </DataTable>
            </div>

            <!-- Weekly Screened Table -->
            <div class="screening-table">
                <h5 class="table-title">Weekly Screened</h5>
                <DataTable :value="table2Data" :paginator="false" class="p-datatable-sm" resizableColumns
                    columnResizeMode="expand" :scrollable="true" scrollHeight="400px" responsiveLayout="scroll">
                    <Column field="header" header="" :headerStyle="headerStyle" :bodyStyle="bodyStyle" />
                    <Column field="male" header="Male" :headerStyle="headerStyle" :bodyStyle="bodyStyle" />
                    <Column field="female" header="Female" :headerStyle="headerStyle" :bodyStyle="bodyStyle" />
                </DataTable>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';

const props = defineProps({
    serviceData: {
        type: Array,
        required: true,
        default: () => []
    }
});

const isLoading = ref(true);
const error = ref(null);

// Improved screening data validation
const hasScreeningData = (item) => {
    // Check for event_substance_risks
    if (Array.isArray(item.event_substance_risks) && item.event_substance_risks.length > 0) {
        return true;
    }

    // Check for case_substance_risks
    if (Array.isArray(item.case_substance_risks) && item.case_substance_risks.length > 0) {
        return true;
    }

    // Check for screening_data
    if (item.screening_data) {
        // Check if it's an object with data
        if (typeof item.screening_data === 'object' && item.screening_data !== null) {
            return true;
        }
        // Handle case where screening_data is a string "Data not available"
        if (item.screening_data === "Data not available") {
            return false;
        }
    }

    return false;
};

const getGender = (item) => {
    if (!item.user) return null;

    const userGender = item.user.gender?.toLowerCase();
    if (userGender === 'male' || userGender === 'female') return userGender;

    return null;
};

const isWithinLastWeek = (dateStr) => {
    try {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        oneWeekAgo.setHours(0, 0, 0, 0);

        const itemDate = new Date(dateStr);
        itemDate.setHours(0, 0, 0, 0);

        return !isNaN(itemDate.getTime()) && itemDate >= oneWeekAgo;
    } catch {
        return false;
    }
};

const genderCounts = computed(() => {
    try {
        if (!Array.isArray(props.serviceData)) return { male: 0, female: 0 };

        return props.serviceData.reduce((acc, item) => {
            if (hasScreeningData(item)) {
                const gender = getGender(item);
                if (gender === 'male') acc.male++;
                if (gender === 'female') acc.female++;
            }
            return acc;
        }, { male: 0, female: 0 });
    } catch (err) {
        console.error('Error calculating gender counts:', err);
        error.value = 'Error processing screening data';
        return { male: 0, female: 0 };
    }
});

const weeklyGenderCounts = computed(() => {
    try {
        if (!Array.isArray(props.serviceData)) return { male: 0, female: 0 };

        return props.serviceData.reduce((acc, item) => {
            if (hasScreeningData(item) && isWithinLastWeek(item.date)) {
                const gender = getGender(item);
                if (gender === 'male') acc.male++;
                if (gender === 'female') acc.female++;
            }
            return acc;
        }, { male: 0, female: 0 });
    } catch (err) {
        console.error('Error calculating weekly counts:', err);
        error.value = 'Error processing weekly data';
        return { male: 0, female: 0 };
    }
});

const table1Data = computed(() => [
    {
        header: 'Total New Entry',
        male: genderCounts.value.male,
        female: genderCounts.value.female
    },
    {
        header: 'Total Old Entry',
        male: 0,
        female: 0
    },
    {
        header: 'Total Screened',
        male: genderCounts.value.male,
        female: genderCounts.value.female
    }
]);

const table2Data = computed(() => [
    {
        header: 'Total New Entry',
        male: weeklyGenderCounts.value.male,
        female: weeklyGenderCounts.value.female
    },
    {
        header: 'Total Old Entry',
        male: 0,
        female: 0
    },
    {
        header: 'Total Screened',
        male: weeklyGenderCounts.value.male,
        female: weeklyGenderCounts.value.female
    }
]);

// Styles
const headerStyle = {
    'background-color': '#2B656F',
    'color': 'white',
    'font-weight': 'bold',
    'text-align': 'center',
    'padding': '1rem'
};

const bodyStyle = {
    'text-align': 'center',
    'padding': '0.75rem'
};

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
});
</script>

<style scoped>
.screening-container {
    background: linear-gradient(135deg, #e6f3f5, #f0f7f8);
    border-radius: 20px;
    padding: 2rem;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.screening-title {
    font-size: 2rem;
    font-weight: 700;
    color: #2B656F;
    text-align: center;
    margin-bottom: 2rem;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
}

.screening-tables {
    display: flex;
    gap: 2rem;
    justify-content: space-between;
}

.screening-table {
    flex: 1;
    background: white;
    border-radius: 15px;
    overflow: hidden;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
}

.screening-table:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.table-title {
    font-size: 1.2rem;
    font-weight: 600;
    color: white;
    text-align: center;
    padding: 1rem;
    background: linear-gradient(135deg, #2B656F 0%, #1D4851 100%);
    margin: 0;
}

:deep(.p-datatable) {
    border-radius: 0 0 15px 15px;
}

:deep(.p-datatable .p-datatable-thead > tr > th) {
    background-color: #2B656F;
    color: white;
}

:deep(.p-datatable .p-datatable-tbody > tr:nth-child(even)) {
    background-color: #f8f9fa;
}

:deep(.p-datatable .p-datatable-tbody > tr:hover) {
    background-color: #e9ecef;
}

:deep(.p-datatable .p-datatable-tbody > tr:last-child) {
    font-weight: bold;
    background-color: #e6f3f5;
}

@media (max-width: 768px) {
    .screening-title {
        font-size: 1.5rem;
    }

    .screening-tables {
        flex-direction: column;
    }

    .screening-table {
        margin-bottom: 2rem;
    }
}
</style>