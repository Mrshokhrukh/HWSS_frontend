<template>
    <div class="card shadow-sm">
        <!-- Table Section -->
        <DataTable v-model:filters="filters" :value="filteredData" paginator :rows="10" :rowsPerPageOptions="[10, 20, 50]"
            dataKey="id" filterDisplay="row" :loading="loading"
            :globalFilterFields="['event_name', 'selected_tool', 'duration', 'approval_status']" stripedRows
            responsiveLayout="scroll" class="p-4">
            <!-- Table Header with Search and Filter -->
            <template #header>
                <div class="d-flex justify-content-between align-items-center flex-wrap gap-3">
                    <Button type="button" icon="fa-solid fa-filter-circle-xmark" class="hwss-btn p-button-outlined"
                        label="Clear Filters" @click="clearFilter()" />
                    <div class="p-input-icon-left">
                        <i class="fa-solid fa-magnifying-glass"></i>
                        <InputText v-model="filters['global'].value" placeholder="Search events..."
                            class="p-inputtext-sm" />
                    </div>
                </div>
            </template>

            <!-- Empty State -->
            <template #empty>
                <div class="text-center p-4">
                    <i class="fa-solid fa-folder-open text-muted mb-3" style="font-size: 2rem;"></i>
                    <p class="mb-0">No events found</p>
                </div>
            </template>

            <!-- Loading State -->
            <template #loading>
                <div class="text-center p-4">
                    <i class="fa-solid fa-spinner fa-spin me-2"></i>
                    Loading events...
                </div>
            </template>

            <!-- Table Columns -->
            <Column field="start_date" header="Date" :sortable="true" style="min-width: 120px">
                <template #body="{ data }">
                    {{ formatDate(data.start_date) }}
                </template>
            </Column>

            <Column field="event_name" header="Event Name" :sortable="true" style="min-width: 200px" />

            <Column field="selected_tool" header="Tools Used" :sortable="true" style="min-width: 150px" />

            <Column field="duration" header="Duration" :sortable="true" style="min-width: 100px">
                <template #body="{ data }">
                    {{ data.duration }} days
                </template>
            </Column>

            <Column header="Status" :sortable="true" style="min-width: 120px">
                <template #body="{ data }">
                    <Badge :class="{
                        'p-badge-success': data.approval_status === 'approved',
                        'p-badge-danger': data.approval_status === 'rejected',
                        'p-badge-warning': data.approval_status === 'ended'
                    }" :value="capitalize(data.approval_status)" @click="showEventDetails(data)"
                        class="cursor-pointer hover:opacity-80 transition-opacity" />
                </template>
            </Column>
        </DataTable>

        <!-- Details Modal -->
        <Dialog v-model:visible="showPopup" :modal="true" :style="{ width: '90%', maxWidth: '700px' }"
            :dismissableMask="true" :closeOnEscape="true">
            <template #header>
                <h4 class="modal-title m-0">Event Details</h4>
            </template>

            <div v-if="selectedEvent" class="event-details p-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <!-- Basic Details -->
                    <div class="detail-group">
                        <h6 class="hwss-primary mb-2">Event Information</h6>
                        <div class="detail-item">
                            <span class="label">Event Name:</span>
                            <span class="value">{{ selectedEvent.event_name }}</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">Submitted By:</span>
                            <span class="value">{{ selectedEvent.submitted_by }}</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">Working Agency:</span>
                            <span class="value">{{ selectedEvent.working_agency }}</span>
                        </div>
                    </div>

                    <!-- Location Details -->
                    <div class="detail-group">
                        <h6 class="hwss-primary mb-2">Location Details</h6>
                        <div class="detail-item">
                            <span class="label">Location:</span>
                            <span class="value">{{ selectedEvent.location }}</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">Dzongkhag:</span>
                            <span class="value">{{ selectedEvent.dzongkhag }}</span>
                        </div>
                    </div>

                    <!-- Dates and Duration -->
                    <div class="detail-group">
                        <h6 class="hwss-primary mb-2">Timeline</h6>
                        <div class="detail-item">
                            <span class="label">Start Date:</span>
                            <span class="value">{{ formatDate(selectedEvent.start_date) }}</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">End Date:</span>
                            <span class="value">{{ formatDate(selectedEvent.end_date) }}</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">Duration:</span>
                            <span class="value">{{ selectedEvent.duration }} days</span>
                        </div>
                    </div>

                    <!-- Tools and Screening -->
                    <div class="detail-group">
                        <h6 class="hwss-primary mb-2">Screening Details</h6>
                        <div class="detail-item">
                            <span class="label">Tools Used:</span>
                            <span class="value">{{ selectedEvent.selected_tool }}</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">Users to Screen:</span>
                            <span class="value">{{ selectedEvent.users_to_screen }}</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">Status:</span>
                            <Badge :class="{
                                'p-badge-success': selectedEvent.approval_status === 'approved',
                                'p-badge-danger': selectedEvent.approval_status === 'rejected',
                                'p-badge-warning': selectedEvent.approval_status === 'ended'
                            }" :value="capitalize(selectedEvent.approval_status)" />
                        </div>
                    </div>
                </div>

                <!-- Purpose Section -->
                <div class="mt-4">
                    <h6 class="hwss-primary mb-2">Purpose</h6>
                    <div class="purpose-box p-3 bg-gray-50 rounded">
                        {{ selectedEvent.purpose || eventPurpose }}
                    </div>
                </div>
            </div>

            <template #footer>
                <div class="flex justify-end">
                    <Button label="Close" class="hwss-btn p-button-outlined" @click="closePopup" />
                </div>
            </template>
        </Dialog>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { FilterMatchMode } from 'primevue/api';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Badge from 'primevue/badge';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Dialog from 'primevue/dialog';
import axios from 'axios';
import endpoints from '@/api';

// State
const eventPurpose = ref('Mental health screening serves as a proactive measure for early detection and intervention for mental health disorders. It aims to identify individuals who are experiencing symptoms or are at risk of developing mental health conditions. By doing so, it facilitates timely access to treatment.');
const monitorData = ref([]);
const selectedEvent = ref(null);
const loading = ref(true);
const showPopup = ref(false);
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

// Computed
const filteredData = computed(() => {
    return monitorData.value?.filter(item => {
        if (!filters.value.global.value) return true;

        const searchTerm = filters.value.global.value.toLowerCase();
        return Object.keys(item).some(key => {
            const value = item[key];
            if (value === null || value === undefined) return false;
            return value.toString().toLowerCase().includes(searchTerm);
        });
    });
});

// Methods
const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
};

const capitalize = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const clearFilter = () => {
    filters.value = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS }
    };
};

const showEventDetails = (eventData) => {
    selectedEvent.value = eventData;
    showPopup.value = true;
};

const closePopup = () => {
    showPopup.value = false;
    selectedEvent.value = null;
};

const fetchReportData = async () => {
    try {
        loading.value = true;
        const response = await axios.get(endpoints.getEventScreeningList);
        if (response.data && Array.isArray(response.data)) {
            monitorData.value = response.data;
        } else {
            throw new Error('Invalid data format');
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        monitorData.value = [];
    } finally {
        loading.value = false;
    }
};

// Lifecycle
onMounted(() => {
    fetchReportData();
});
</script>

<style scoped>
.card {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.modal-title {
    color: #2B656F;
    font-weight: 600;
}

.detail-group {
    background: #fff;
    padding: 1rem;
    border-radius: 6px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.detail-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
    padding: 0.5rem 0;
    border-bottom: 1px solid #f0f0f0;
}

.detail-item:last-child {
    border-bottom: none;
    margin-bottom: 0;
}

.label {
    color: #666;
    font-size: 0.9rem;
}

.value {
    color: #333;
    font-weight: 500;
}

.purpose-box {
    border: 1px solid #e0e0e0;
    line-height: 1.6;
}

.hwss-primary {
    color: #2B656F;
    font-weight: 600;
    margin: 0;
}

.cursor-pointer {
    cursor: pointer;
}

/* Responsive adjustments */
@media (max-width: 768px) {
    .detail-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.25rem;
    }

    .label {
        font-weight: 600;
    }
}

:deep(.p-datatable) {
    font-size: 0.95rem;
}

:deep(.p-datatable .p-datatable-header) {
    background: transparent;
    border: none;
}

:deep(.p-datatable .p-datatable-thead > tr > th) {
    background: #f8f9fa;
    color: #2B656F;
    font-weight: 600;
}

:deep(.p-badge) {
    padding: 0rem 0.75rem;
    font-size: 0.85rem;
}

:deep(.p-dialog-header) {
    border-bottom: 1px solid #e0e0e0;
}

:deep(.p-dialog-footer) {
    border-top: 1px solid #e0e0e0;
}
</style>