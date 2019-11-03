<template>
    <div class="event-management mt-4">
        <!-- Main Container -->
        <div class="main-container ">
            <!-- Header Section with enhanced gradient effect -->
            <div class="header-section">
                <h2 class="gradient-title">Event Management</h2>
                <p class="header-subtitle">Review &amp; Manage Upcoming Event Screenings</p>
            </div>

            <!-- Enhanced Stats Cards -->
            <div class="stats-grid">
                <div class="stats-card">
                    <div class="stats-content">
                        <div>
                            <p class="stats-label">Total Events</p>
                            <p class="stats-value">{{ totalEventsCount }}</p>
                        </div>
                        <div class="stats-icon stats-icon-primary">
                            <i class="fas fa-calendar-alt"></i>
                        </div>
                    </div>
                </div>

                <div class="stats-card">
                    <div class="stats-content">
                        <div>
                            <p class="stats-label">Pending Review</p>
                            <p class="stats-value">{{ pendingEventsCount }}</p>
                        </div>
                        <div class="stats-icon stats-icon-warning">
                            <i class="fas fa-clock"></i>
                        </div>
                    </div>
                </div>

                <div class="stats-card">
                    <div class="stats-content">
                        <div>
                            <p class="stats-label">Approved</p>
                            <p class="stats-value">{{ approvedEventsCount }}</p>
                        </div>
                        <div class="stats-icon stats-icon-success">
                            <i class="fas fa-check-circle"></i>
                        </div>
                    </div>
                </div>

                <div class="stats-card">
                    <div class="stats-content">
                        <div>
                            <p class="stats-label">Rejected</p>
                            <p class="stats-value">{{ rejectedEventsCount }}</p>
                        </div>
                        <div class="stats-icon stats-icon-danger">
                            <i class="fas fa-times-circle"></i>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Enhanced Content Card -->
            <div class="content-card">
                <!-- Controls with improved styling -->
                <div class="controls-section">
                    <div class="controls-container">
                        <div class="search-controls">
                            <div class="search-input-container">
                                <input v-model="filters['global'].value" type="text" placeholder="Search events..."
                                    class="search-input" />
                                <i class="fas fa-search search-icon"></i>
                            </div>
                            <button @click="clearFilter" class="btn-filter">
                                <i class="fas fa-filter"></i>
                                Clear Filters
                            </button>
                        </div>
                        <button @click="exportData" class="btn-export d-none">
                            <i class="fas fa-file-export"></i>
                            Export Data
                        </button>
                    </div>
                </div>

                <!-- Enhanced DataTable -->
                <DataTable v-model:filters="filters" :value="pendingEvents" :paginator="true" :rows="10"
                    :rowsPerPageOptions="[5, 10, 20]" dataKey="id" :loading="loading" class="custom-table" stripedRows
                    responsiveLayout="scroll">
                    <!-- Enhanced Date Column -->
                    <Column field="start_date" header="Start Date" :sortable="true">
                        <template #body="{ data }">
                            <div class="date-cell">
                                <div>
                                    <div class="date-primary">{{ formatDate(data.start_date) }}</div>
                                </div>
                            </div>
                        </template>
                    </Column>

                    <!-- Enhanced Event Details Column -->
                    <Column field="event_name" header="Event Details" :sortable="true">
                        <template #body="{ data }">
                            <div class="event-details">
                                <div class="event-name">{{ data.event_name }}</div>
                                <div class="status-badges mt-3">
                                    <span class="status-badge" :class="'status-' + data.approval_status">
                                        {{ data.approval_status.charAt(0).toUpperCase() + data.approval_status.slice(1)
                                        }}
                                    </span>
                                </div>
                            </div>
                        </template>
                    </Column>

                    <!-- Tools Column -->
                    <Column field="selected_tool" header="Tools" :sortable="true">
                        <template #body="{ data }">
                            <span class="tool-pill">
                                {{ data.selected_tool }}
                            </span>
                        </template>
                    </Column>

                    <!-- Duration Column -->
                    <Column field="duration" header="Duration" :sortable="true">
                        <template #body="{ data }">
                            <div class="duration-cell">
                                <span class="duration-text">{{ formatDuration(data.duration) }}</span>
                            </div>
                        </template>
                    </Column>

                    <!-- Counselor Column -->
                    <Column field="counselor" header="Counselor" :sortable="true">
                        <template #body="{ data }">
                            <div class="counselor-cell">
                                <div>
                                    <div class="counselor-name">{{ data.counselor }}</div>
                                </div>
                            </div>
                        </template>
                    </Column>

                    <!-- Actions Column -->
                    <Column header="Actions">
                        <template #body="{ data }">
                            <div class="action-buttons">
                                <button @click="openDialogue(data)" class="btn-export">
                                    <i class="fas fa-clipboard-check"></i>
                                    Review
                                </button>
                            </div>
                        </template>
                    </Column>

                    <!-- Empty State -->
                    <template #empty>
                        <div class="empty-state">
                            <div class="empty-icon">
                                <i class="fas fa-folder-open"></i>
                            </div>
                            <h3 class="empty-title">No Events Found</h3>
                            <p class="empty-message">There are no pending events to review at this time.</p>
                        </div>
                    </template>

                    <!-- Loading State -->
                    <template #loading>
                        <div class="loading-state">
                            <div class="loading-icon">
                                <i class="fas fa-circle-notch fa-spin"></i>
                            </div>
                            <h3 class="loading-title">Loading Events</h3>
                            <p class="loading-message">Please wait while we fetch the latest events...</p>
                        </div>
                    </template>
                </DataTable>
            </div>
        </div>

        <!-- Event Details Dialog -->
        <Dialog v-model:visible="visible" :modal="true" class="enhanced-dialog">
            <template #header>
                <div class="dialog-header">
                    <h3 class="dialog-title">Event Review Details</h3>
                    <span class="event-id">ID: #{{ eventData.id }}</span>
                </div>
            </template>

            <div class="dialog-content">
                <!-- Event Info Cards -->
                <div class="info-grid">
                    <div class="info-card">
                        <div class="info-header">
                            <i class="fas fa-calendar"></i>
                            <label>Event Details</label>
                        </div>
                        <h4 class="info-title">{{ eventData.event_name }}</h4>
                        <p class="info-subtitle">{{ eventData.location }}</p>
                    </div>

                    <div class="info-card">
                        <div class="info-header">
                            <i class="fas fa-clock"></i>
                            <label>Duration & Tools</label>
                        </div>
                        <h4 class="info-title">{{ formatDuration(eventData.duration) }}</h4>
                        <p class="info-subtitle">{{ eventData.selected_tool }}</p>
                    </div>
                </div>

                <!-- Purpose -->
                <div class="purpose-section">
                    <div class="info-header">
                        <i class="fas fa-bullseye"></i>
                        <label>Event Purpose</label>
                    </div>
                    <p class="purpose-text">{{ eventData.event_purpose }}</p>
                </div>

                <!-- Actions -->
                <div class="dialog-actions">
                    <button @click="acceptEvent(eventData)" class="btn-approve">
                        <i class="fas fa-check"></i>
                        Approve Event
                    </button>
                    <button @click="showRejectPopup(eventData)" class="btn-reject">
                        <i class="fas fa-times"></i>
                        Reject Event
                    </button>
                </div>
            </div>
        </Dialog>

        <!-- Reject Dialog -->
        <Dialog v-model:visible="showPopup" :modal="true" class="enhanced-reject-dialog">
            <template #header>
                <h3 class="dialog-title">Rejection Feedback</h3>
            </template>

            <div class="dialog-content">
                <div class="form-group">
                    <div class="info-header">
                        <i class="fas fa-exclamation-circle"></i>
                        <label>Reason for Rejection</label>
                    </div>
                    <select v-model="rejectReason" class="form-select">
                        <option value="">Select a reason...</option>
                        <option value="incomplete">Incomplete Information</option>
                        <option value="invalid">Invalid Request</option>
                        <option value="scheduling">Scheduling Conflict</option>
                        <option value="resources">Resource Unavailability</option>
                        <option value="other">Other</option>
                    </select>
                </div>

                <div class="form-group">
                    <div class="info-header">
                        <i class="fas fa-comment-dots"></i>
                        <label>Detailed Explanation</label>
                    </div>
                    <textarea v-model="rejectComment" rows="4" class="form-textarea"
                        placeholder="Please provide detailed feedback for rejection..."></textarea>
                </div>

                <div class="dialog-actions">
                    <button @click="closePopup" class="btn-cancel">
                        <i class="fas fa-times"></i>
                        Cancel
                    </button>
                    <button @click="rejectEvent" :disabled="!rejectReason || !rejectComment.trim()" class="btn-reject"
                        :class="{ 'btn-disabled': !rejectReason || !rejectComment.trim() }">
                        <i class="fas fa-paper-plane"></i>
                        Submit Rejection
                    </button>
                </div>
            </div>
        </Dialog>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { FilterMatchMode } from 'primevue/api';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Dialog from 'primevue/dialog';
import axios from 'axios';
import endpoints from '@/api';
import Swal from "sweetalert2";

const eventData = ref({});
const visible = ref(false);
const showPopup = ref(false);
const rejectReason = ref('');
const rejectComment = ref('');
const monitorData = ref([]);
const loading = ref(true);

const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

const totalEventsCount = computed(() => monitorData.value.length);

const pendingEventsCount = computed(() =>
    monitorData.value.filter(e => e.approval_status === 'pending').length
);

const approvedEventsCount = computed(() =>
    monitorData.value.filter(e => e.approval_status === 'approved').length
);

const rejectedEventsCount = computed(() =>
    monitorData.value.filter(e => e.approval_status === 'rejected').length
);


// Only show pending events
const pendingEvents = computed(() => {
    return monitorData.value.filter(event => event.approval_status === 'pending');
});

const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

const formatDuration = (duration) => {
    return duration === 1 ? '1 day' : `${duration} days`;
};

const clearFilter = () => {
    filters.value.global.value = null;
};

const fetchReportData = async () => {
    try {
        loading.value = true;
        const response = await axios.get(endpoints.getEventScreeningList);
        if (response.data && Array.isArray(response.data)) {
            monitorData.value = response.data;
        }
    } catch (error) {
        console.error('Failed to fetch data:', error);
        monitorData.value = [];
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to fetch event data. Please try again later.',
            confirmButtonClass: 'bg-gradient-to-r from-[#2B656F] to-[#1D4851]'
        });
    } finally {
        loading.value = false;
    }
};

const openDialogue = (data) => {
    eventData.value = data;
    visible.value = true;
};

const showRejectPopup = (data) => {
    eventData.value = data;
    showPopup.value = true;
};

const closePopup = () => {
    showPopup.value = false;
    rejectReason.value = '';
    rejectComment.value = '';
};

const acceptEvent = async (data) => {
    try {
        await axios.post(endpoints.updateEventScreeningList, {
            event_id: data.id,
            approval_status: "approved"
        });

        Swal.fire({
            icon: 'success',
            title: 'Event Approved',
            text: 'The event has been successfully approved.',
            showConfirmButton: false,
            timer: 2000,
            customClass: {
                popup: 'rounded-xl',
                title: 'text-[#2B656F]'
            }
        });

        visible.value = false;
        fetchReportData();
    } catch (error) {
        console.error('Error approving event:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to approve event. Please try again.',
            confirmButtonClass: 'bg-gradient-to-r from-[#2B656F] to-[#1D4851]'
        });
    }
};

const rejectEvent = async () => {
    if (!rejectReason.value || !rejectComment.value.trim()) {
        return;
    }

    try {
        await axios.post(endpoints.updateEventScreeningList, {
            event_id: eventData.value.id,
            approval_status: "rejected",
            rejection_reason: rejectComment.value,
            rejection_category: rejectReason.value
        });

        Swal.fire({
            icon: 'info',
            title: 'Event Rejected',
            text: 'The event has been rejected with feedback.',
            showConfirmButton: false,
            timer: 2000,
            customClass: {
                popup: 'rounded-xl'
            }
        });

        closePopup();
        visible.value = false;
        fetchReportData();
    } catch (error) {
        console.error('Error rejecting event:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to reject event. Please try again.',
            confirmButtonClass: 'bg-gradient-to-r from-[#2B656F] to-[#1D4851]'
        });
    }
};

onMounted(() => {
    fetchReportData();
});
</script>

<style scoped>
/* Base Styles */
.event-management {
    padding: 1rem;
}

.main-container {
    max-width: 1400px;
    margin: 0 auto;
}

/* Enhanced Header Styles */
.header-section {
    margin-bottom: 2rem;
}

.gradient-title {
    font-size: 2.5rem;
    font-weight: 700;
    background: linear-gradient(135deg, #2B656F 0%, #1D4851 100%);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    margin-bottom: 0.5rem;
}

.header-subtitle {
    color: #6c757d;
    font-size: 1.1rem;
}

/* Enhanced Stats Cards */
.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
}

.stats-card {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stats-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.stats-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.stats-label {
    color: #6c757d;
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
}

.stats-value {
    font-size: 1.8rem;
    font-weight: 700;
    color: #2B656F;
}

.stats-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
}

/* Icon Background Colors */
.stats-icon-primary {
    background: rgba(43, 101, 111, 0.1);
    color: #2B656F;
}

.stats-icon-warning {
    background: rgba(255, 193, 7, 0.1);
    color: #ffc107;
}

.stats-icon-success {
    background: rgba(40, 167, 69, 0.1);
    color: #28a745;
}

.stats-icon-danger {
    background: rgba(220, 53, 69, 0.1);
    color: #dc3545;
}

/* Enhanced Content Card */
.content-card {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

/* Enhanced Controls Section */
.controls-section {
    margin-bottom: 1.5rem;
}

.controls-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
}

.search-controls {
    display: flex;
    gap: 1rem;
    align-items: center;
}

.search-input-container {
    position: relative;
}

.search-input {
    padding: 0.75rem 1rem 0.75rem 2.5rem;
    border: 1px solid #dee2e6;
    border-radius: 8px;
    width: 300px;
    transition: all 0.2s ease;
}

.search-input:focus {
    outline: none;
    border-color: #2B656F;
    box-shadow: 0 0 0 3px rgba(43, 101, 111, 0.1);
}

.search-icon {
    position: absolute;
    left: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    color: #6c757d;
}

/* Enhanced Buttons */
.btn-filter,
.btn-export {
    padding: 0.75rem 1.25rem;
    border-radius: 8px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.2s ease;
}

.btn-filter {
    background-color: #f8f9fa;
    border: 1px solid #dee2e6;
    color: #495057;
}

.btn-export,
.btn-approve,
.btn-review {
    background: linear-gradient(135deg, #2B656F 0%, #1D4851 100%);
    color: white;
    border: none;
}

.btn-filter:hover,
.btn-export:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Enhanced Status Badges */
.status-badge {
    padding: 0.35rem 0.75rem;
    border-radius: 6px;
    font-size: 0.85rem;
    font-weight: 500;
}

.status-pending {
    background-color: rgba(255, 193, 7, 0.1);
    color: #ffc107;
}

.status-approved {
    background-color: rgba(40, 167, 69, 0.1);
    color: #28a745;
}

.status-rejected {
    background-color: rgba(220, 53, 69, 0.1);
    color: #dc3545;
}

/* Enhanced Table Styles */
.custom-table {
    border-radius: 8px;
    overflow: hidden;
}

:deep(.p-datatable-header) {
    background: transparent;
    border: none;
    padding: 1rem;
}

:deep(.p-datatable-thead > tr > th) {
    background: #f8f9fa;
    border-bottom: 2px solid #dee2e6;
    color: #495057;
    font-weight: 600;
    padding: 1rem;
}

:deep(.p-datatable-tbody > tr) {
    transition: background-color 0.2s ease;
}

:deep(.p-datatable-tbody > tr:hover) {
    background-color: rgba(43, 101, 111, 0.05);
}

/* Enhanced Dialog Base Styles */
.enhanced-dialog,
.enhanced-reject-dialog {
    --modal-radius: 16px;
    max-width: 600px;
    margin: 0 auto;
}

/* Dialog Header */
.enhanced-dialog :deep(.p-dialog-header),
.enhanced-reject-dialog :deep(.p-dialog-header) {
    background: linear-gradient(135deg, #2B656F 0%, #1D4851 100%);
    padding: 1.5rem 2rem;
    border-radius: var(--modal-radius) var(--modal-radius) 0 0;
    border: none;
}

.dialog-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
}

.dialog-title {
    color: white;
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0;
}

.event-id {
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.9rem;
    padding: 0.4rem 0.8rem;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 6px;
}

/* Dialog Content */
.enhanced-dialog :deep(.p-dialog-content),
.enhanced-reject-dialog :deep(.p-dialog-content) {
    padding: 2rem;
    border-radius: 0 0 var(--modal-radius) var(--modal-radius);
    background: white;
}

/* Info Grid */
.info-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
    margin-bottom: 2rem;
}

.info-card {
    background: #f8f9fa;
    padding: 1.5rem;
    border-radius: 12px;
    border: 1px solid #e9ecef;
}

.info-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
    color: #6c757d;
}

.info-header i {
    font-size: 1.1rem;
    color: #2B656F;
}

.info-header label {
    font-size: 0.9rem;
    font-weight: 500;
}

.info-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #2B656F;
    margin: 0 0 0.5rem 0;
}

.info-subtitle {
    color: #6c757d;
    font-size: 0.9rem;
    margin: 0;
}

/* Purpose Section */
.purpose-section {
    background: #f8f9fa;
    padding: 1.5rem;
    border-radius: 12px;
    border: 1px solid #e9ecef;
    margin-bottom: 2rem;
}

.purpose-text {
    margin: 0;
    line-height: 1.6;
    color: #495057;
}

/* Form Elements in Reject Dialog */
.form-group {
    margin-bottom: 1.5rem;
}

.form-select {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #dee2e6;
    border-radius: 8px;
    margin-top: 0.5rem;
    color: #495057;
    transition: all 0.2s ease;
}

.form-select:focus {
    outline: none;
    border-color: #2B656F;
    box-shadow: 0 0 0 3px rgba(43, 101, 111, 0.1);
}

.form-textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #dee2e6;
    border-radius: 8px;
    margin-top: 0.5rem;
    resize: vertical;
    min-height: 120px;
    color: #495057;
    transition: all 0.2s ease;
}

.form-textarea:focus {
    outline: none;
    border-color: #2B656F;
    box-shadow: 0 0 0 3px rgba(43, 101, 111, 0.1);
}

/* Dialog Actions */
.dialog-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 2rem;
}

.btn-approve,
.btn-reject,
.btn-cancel {
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.2s ease;
}

.btn-approve {
    background: linear-gradient(135deg, #2B656F 0%, #1D4851 100%);
    color: white;
    border: none;
}

.btn-reject {
    background: #dc3545;
    color: white;
    border: none;
}

.btn-cancel {
    background: #f8f9fa;
    color: #495057;
    border: 1px solid #dee2e6;
}

.btn-disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.btn-approve:hover,
.btn-reject:hover:not(.btn-disabled),
.btn-cancel:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.tool-pill {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    border-radius: 12px;
    background-color: #e0f7e9;
    color: #2b6b4f;
    font-size: 0.85rem;
    font-weight: 600;
    text-align: center;
}

/* Responsive Adjustments */
@media (max-width: 640px) {
    .info-grid {
        grid-template-columns: 1fr;
    }

    .dialog-actions {
        flex-direction: column;
    }

    .btn-approve,
    .btn-reject,
    .btn-cancel {
        width: 100%;
        justify-content: center;
    }

    .enhanced-dialog,
    .enhanced-reject-dialog {
        margin: 1rem;
    }
}

/* Responsive Design */
@media (max-width: 768px) {
    .stats-grid {
        grid-template-columns: 1fr;
    }

    .search-input {
        width: 100%;
    }

    .controls-container {
        flex-direction: column;
        align-items: stretch;
    }
}
</style>