<template>
    <div class="screening-container">
        <div class="screening-header">
            <h3 class="screening-title">Screening Data</h3>
            <div class="screening-subtitle">Overview of total and weekly screening statistics</div>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="loading-state">
            <div class="spinner-wrapper">
                <div class="spinner"></div>
                <p>Loading screening data...</p>
            </div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="error-state">
            <div class="error-content">
                <i class="bi bi-exclamation-circle"></i>
                <p>{{ error }}</p>
            </div>
        </div>

        <!-- Tables -->
        <div v-else class="screening-tables">
            <!-- Total Screened Table -->
            <div class="screening-table">
                <div class="table-header">
                    <h5 class="table-title">
                        <i class="bi bi-people-fill me-2"></i>
                        Total Screened
                    </h5>
                    <div class="total-badge">
                        Total: [{{ getTotalScreened(table1Data) }}]
                    </div>
                </div>
                <DataTable :value="table1Data" :paginator="false" class="p-datatable-sm custom-table" resizableColumns
                    columnResizeMode="expand" :scrollable="true" scrollHeight="400px" responsiveLayout="scroll"
                    @row-click="handleRowClick">
                    <Column field="header" header="">
                        <template #body="slotProps">
                            <div class="row-header">{{ slotProps.data.header }}</div>
                        </template>
                    </Column>
                    <Column field="male" header="Male">
                        <template #body="slotProps">
                            <div class="gender-count male">
                                <i class="bi bi-gender-male"></i>
                                [{{ slotProps.data.male }}]
                            </div>
                        </template>
                    </Column>
                    <Column field="female" header="Female">
                        <template #body="slotProps">
                            <div class="gender-count female">
                                <i class="bi bi-gender-female"></i>
                                [{{ slotProps.data.female }}]
                            </div>
                        </template>
                    </Column>
                </DataTable>
            </div>

            <!-- Weekly Screened Table -->
            <div class="screening-table">
                <div class="table-header">
                    <h5 class="table-title">
                        <i class="bi bi-calendar-week me-2"></i>
                        Weekly Screened
                    </h5>
                    <div class="total-badge">
                        Total: [{{ getTotalScreened(table2Data) }}]
                    </div>
                </div>
                <DataTable :value="table2Data" :paginator="false" class="p-datatable-sm custom-table" resizableColumns
                    columnResizeMode="expand" :scrollable="true" scrollHeight="400px" responsiveLayout="scroll"
                    @row-click="handleRowClick">
                    <Column field="header" header="">
                        <template #body="slotProps">
                            <div class="row-header">{{ slotProps.data.header }}</div>
                        </template>
                    </Column>
                    <Column field="male" header="Male">
                        <template #body="slotProps">
                            <div class="gender-count male">
                                <i class="bi bi-gender-male"></i>
                                [{{ slotProps.data.male }}]
                            </div>
                        </template>
                    </Column>
                    <Column field="female" header="Female">
                        <template #body="slotProps">
                            <div class="gender-count female">
                                <i class="bi bi-gender-female"></i>
                                [{{ slotProps.data.female }}]
                            </div>
                        </template>
                    </Column>
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

const getTotalScreened = (data) => {
    const lastRow = data[data.length - 1];
    return lastRow.male + lastRow.female;
};

const handleRowClick = (event) => {
    const row = event.data;
    if (row.header === 'Total Screened') {
        event.originalEvent.target.closest('tr').classList.add('highlight-pulse');
        setTimeout(() => {
            event.originalEvent.target.closest('tr').classList.remove('highlight-pulse');
        }, 1000);
    }
};

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
    box-shadow: 0 10px 30px rgba(43, 101, 111, 0.1);
}

.screening-header {
    text-align: center;
    margin-bottom: 2.5rem;
}

.screening-title {
    font-size: 2rem;
    font-weight: 700;
    color: #2B656F;
    margin-bottom: 0.5rem;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
}

.screening-subtitle {
    color: #5a8f99;
    font-size: 1rem;
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
    box-shadow: 0 5px 15px rgba(43, 101, 111, 0.08);
    transition: all 0.3s ease;
}

.table-header {
    background: linear-gradient(135deg, #2B656F 0%, #1D4851 100%);
    padding: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.table-title {
    color: white;
    margin: 0;
    font-size: 1.2rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.total-badge {
    background: rgba(255, 255, 255, 0.2);
    padding: 0.4rem 0.8rem;
    border-radius: 20px;
    color: white;
    font-size: 0.9rem;
    font-weight: 500;
}

.gender-count {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    font-weight: 500;
}

.gender-count.male {
    color: #275C65;
}

.gender-count.female {
    color: #8AC2AF;
}

.row-header {
    font-weight: 500;
    color: #2B656F;
}

/* Loading State */
.loading-state {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 200px;
}

.spinner-wrapper {
    text-align: center;
}

.spinner {
    border: 3px solid #f3f3f3;
    border-top: 3px solid #2B656F;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
}

/* Error State */
.error-state {
    background: #fff1f0;
    padding: 2rem;
    border-radius: 10px;
    text-align: center;
}

.error-content {
    color: #ff4d4f;
}

/* DataTable Customizations */
:deep(.custom-table) {
    border-radius: 0 0 15px 15px;
}

:deep(.p-datatable .p-datatable-thead > tr > th) {
    background-color: #f8f9fa;
    color: #2B656F;
    font-weight: 600;
    padding: 1rem;
}

:deep(.p-datatable .p-datatable-tbody > tr) {
    transition: all 0.2s ease;
}

:deep(.p-datatable .p-datatable-tbody > tr:hover) {
    background-color: #f0f7f8;
    cursor: pointer;
}

:deep(.p-datatable .p-datatable-tbody > tr:last-child) {
    background-color: #e6f3f5;
    font-weight: bold;
}

.highlight-pulse {
    animation: pulse 1s;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

@keyframes pulse {
    0% {
        background-color: #e6f3f5;
    }

    50% {
        background-color: #c5e0e5;
    }

    100% {
        background-color: #e6f3f5;
    }
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

    .table-header {
        flex-direction: column;
        gap: 0.5rem;
        text-align: center;
    }
}
</style>