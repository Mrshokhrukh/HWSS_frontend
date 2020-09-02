<template>
    <div class="screening-form-container">
        <!-- Loading Overlay -->
        <div v-if="isLoading" class="loading-overlay">
            <div class="loading-content">
                <div class="spinner"></div>
                <p class="loading-text">Processing your request...</p>
                <p class="loading-subtext">Please wait while we create your event screening.</p>
            </div>
        </div>

        <!-- Header Section -->
        <div class="form-header">
            <h3 class="title">Description</h3>
            <div class="warning-badge">
                *** This tool is for Event Screening Only ***
            </div>
        </div>

        <form @submit.prevent="submitForm">
            <!-- Event Details Section -->
            <div class="form-section">
                <div class="section-header">
                    <h4>Event Details</h4>
                    <div class="section-divider"></div>
                </div>

                <div class="form-grid">
                    <div class="form-group full-width">
                        <label for="eventName">Event Name</label>
                        <input type="text" id="eventName" v-model="eventName" required>
                    </div>

                    <div class="form-group full-width">
                        <label for="text">Purpose</label>
                        <textarea id="text" v-model="purpose" rows="3" required></textarea>
                    </div>

                    <div class="form-group">
                        <label for="location">Location</label>
                        <input type="text" id="location" v-model="location" required>
                    </div>

                    <div class="form-group">
                        <label for="dzongkhag">Dzongkhag</label>
                        <select id="dzongkhag" v-model="dzongkhag" required>
                            <option value="" disabled selected>Select Dzongkhag</option>
                            <option v-for="dzongkhag in dzongkhags" :key="dzongkhag" :value="dzongkhag">{{ dzongkhag }}
                            </option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="startDate">Start Date</label>
                        <input type="date" id="startDate" v-model="startDate" :min="today" required>
                    </div>

                    <div class="form-group">
                        <label for="endDate">End Date</label>
                        <input type="date" id="endDate" v-model="endDate" :min="startDate" required>
                    </div>

                    <div class="form-group">
                        <label for="duration">Duration (Days)</label>
                        <input type="text" id="duration" v-model="duration" readonly>
                    </div>

                    <div class="form-group">
                        <label for="totalUsers">Total Users to be Screened</label>
                        <input type="number" id="totalUsers" v-model="totalUsers" required>
                    </div>
                </div>
            </div>

            <!-- Tools Selection Section -->
            <div class="form-section">
                <div class="section-header">
                    <h4>Select Tools to be used</h4>
                </div>

                <div class="tools-selection">
                    <div class="tool-option" :class="{ 'selected': selectedTool === 'All Tools' }">
                        <input type="radio" name="selectedTool" id="allToolsRadio" value="All Tools"
                            v-model="selectedTool">
                        <label for="allToolsRadio">
                            <i class="fas fa-layer-group"></i>
                            <span>All Tools</span>
                            <small>Both SUD and Mental Health Tools</small>
                        </label>
                    </div>

                    <div class="tool-option" :class="{ 'selected': selectedTool === 'SUD Tools' }">
                        <input type="radio" name="selectedTool" id="sudToolsRadio" value="SUD Tools"
                            v-model="selectedTool">
                        <label for="sudToolsRadio">
                            <i class="fas fa-pills"></i>
                            <span>SUD Tools</span>
                            <small>ASSIST Screening</small>
                        </label>
                    </div>

                    <div class="tool-option" :class="{ 'selected': selectedTool === 'Mental Health Tools' }">
                        <input type="radio" name="selectedTool" id="mentalHealthToolsRadio" value="Mental Health Tools"
                            v-model="selectedTool">
                        <label for="mentalHealthToolsRadio">
                            <i class="fas fa-brain"></i>
                            <span>Mental Health Tools</span>
                            <small>GAD, PHQ, ACE</small>
                        </label>
                    </div>
                </div>
            </div>
        </form>

        <!-- Button Section -->
        <div class="form-actions">
            <button type="button" class="proceed-button" @click="proceed" :disabled="isLoading">
                <span v-if="!isLoading">Register Event <i class="fas fa-arrow-right"></i></span>
                <span v-else>Processing...</span>
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import axios from 'axios';
import Swal from 'sweetalert2';
import endpoints from '@/api';
import { useRouter } from 'vue-router';

const router = useRouter();
const isLoading = ref(false);

const emit = defineEmits(['proceedToEventSelectTools', 'goBack', 'logEmit']);

const eventName = ref('');
const purpose = ref('');
const location = ref('');
const dzongkhag = ref('');
const startDate = ref('');
const endDate = ref('');
const duration = ref('');
const totalUsers = ref('');
const today = new Date().toISOString().split('T')[0];
const userDetails = JSON.parse(localStorage.getItem('userDetailsStore'));
const counselorName = ref(`${userDetails.user.firstName} ${userDetails.user.lastName}`);
const eventStatus = ref('');
const selectedTool = ref('');
const counselorId = userDetails.user.id;

// console.log(counselorName.value);
const submitForm = async () => {
    try {
        isLoading.value = true;
        const eventData = {
            event_name: eventName.value,
            event_purpose: purpose.value,
            location: location.value,
            start_date: startDate.value,
            end_date: endDate.value,
            duration: duration.value,
            counselor: counselorName.value,
            total_users: totalUsers.value,
            selected_tool: selectedTool.value,
            created_by: counselorId
        };

        const createResponse = await axios.post(endpoints.createEventScreening, eventData);

        if (createResponse.status === 201) {
            Swal.fire({
                title: 'Event Screening Created',
                text: 'Proceeding to tool selection.',
                icon: 'success',
                timer: 1000,
                showConfirmButton: false
            });
        }
    } catch (error) {
        console.error('Error:', error);
        Swal.fire({
            title: 'Error',
            text: 'Failed to create event screening.',
            icon: 'error'
        });
    } finally {
        isLoading.value = false;
    }
};

const fetchEventStatus = async () => {
    try {
        const response = await axios.get(endpoints.getEventInfo(counselorId));

        if (response.status === 200) {
            const eventData = response.data;

            // Normalize dates to compare just the date part
            const currentDate = new Date();
            currentDate.setHours(0, 0, 0, 0);
            const eventStartDate = new Date(eventData.start_date);
            eventStartDate.setHours(0, 0, 0, 0);
            const eventEndDate = new Date(eventData.end_date);
            eventEndDate.setHours(0, 0, 0, 0);

            // Check if eventId is already saved in localStorage
            const savedEventId = localStorage.getItem('eventId');
            if (!savedEventId || savedEventId !== eventData.eventId.toString()) {
                localStorage.setItem('eventId', eventData.eventId);
            }

            if (eventData.approval_status === 'pending') {
                let message = 'The admin has not yet approved your event screening request.';
                if (currentDate > eventEndDate) {
                    message += ' This event has already ended and cannot be approved.';
                } else if (currentDate > eventStartDate) {
                    message += ' This event has already started and cannot be approved.';
                }
                Swal.fire({
                    title: 'Event Screening Pending',
                    text: message,
                    icon: 'warning'
                }).then(() => {
                    router.push('/counselor-dashboard');
                });
            } else if (eventData.approval_status === 'approved') {
                if (currentDate > eventEndDate) {
                    Swal.fire({
                        title: 'Event Expired',
                        text: 'This event has already ended and is no longer valid.',
                        icon: 'error'
                    }).then(() => {
                        router.push('/counselor-dashboard');
                    });
                    return;
                }

                if (currentDate < eventStartDate) {
                    Swal.fire({
                        title: 'Event Approved',
                        text: `Screening can only begin on the event start date: ${eventData.start_date}.`,
                        icon: 'info'
                    }).then(() => {
                        router.push('/counselor-dashboard');
                    });
                    return;
                }

                // Event is approved and ready for screening (today or in progress)
                const selectedTools = eventData.selected_tool;
                localStorage.setItem('approvedSelectedTools', JSON.stringify(selectedTools));

                Swal.fire({
                    title: 'Event Screening Approved',
                    text: 'Proceeding to tool selection.',
                    icon: 'success',
                    timer: 1000,
                    showConfirmButton: false
                });
                setTimeout(() => {
                    emit('proceedToUserSelectionTools');
                }, 500);
            } else {
                // Handle other statuses like 'rejected' if necessary
                eventStatus.value = eventData.approval_status;
            }
        }
    } catch (error) {
        console.error('Error fetching event status:', error);
    }
};

onMounted(() => {
    fetchEventStatus();
});

const proceed = async () => {
    try {
        isLoading.value = true;
        const todayDate = new Date(today).setHours(0, 0, 0, 0);
        const selectedStartDate = new Date(startDate.value).setHours(0, 0, 0, 0);
        const selectedEndDate = new Date(endDate.value).setHours(0, 0, 0, 0);

        // Validation checks
        if (selectedStartDate < todayDate) {
            Swal.fire({
                title: 'Invalid Date',
                text: 'The event start date cannot be earlier than today.',
                icon: 'error'
            });
            return;
        }

        if (selectedEndDate < selectedStartDate) {
            Swal.fire({
                title: 'Invalid Date Range',
                text: 'The end date cannot be earlier than the start date.',
                icon: 'error'
            });
            return;
        }

        await submitForm();
        
        Swal.fire({
            title: 'Event Screening Created',
            text: 'Proceeding to tool selection.',
            icon: 'success',
            showConfirmButton: true
        }).then((result) => {
            if (result.isConfirmed) {
                router.push('/counselor-dashboard');
            }
        });
    } catch (error) {
        console.error('Error submitting form:', error);
        Swal.fire({
            title: 'Error',
            text: 'Failed to create event screening.',
            icon: 'error'
        });
    } finally {
        isLoading.value = false;
    }
};


// eslint-disable-next-line no-unused-vars
watch(endDate, (newValue, oldValue) => {
    // Calculate duration when end date changes
    const start = new Date(startDate.value);
    const end = new Date(newValue);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    duration.value = diffDays;
});

// Optionally, you can also fetch dzongkhags on component mount
const dzongkhags = [
    'Bumthang', 'Chhukha', 'Dagana', 'Gasa', 'Haa', 'Lhuentse', 'Mongar', 'Paro', 'Pemagatshel', 'Punakha',
    'Samdrup Jongkhar', 'Samtse', 'Sarpang', 'Thimphu', 'Trashigang', 'Trashiyangtse', 'Trongsa', 'Tsirang', 'Wangdue Phodrang', 'Zhemgang'
];
</script>

<style scoped>
.loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.loading-content {
    background: white;
    padding: 2rem;
    border-radius: 1rem;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    text-align: center;
}

.spinner {
    width: 50px;
    height: 50px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #2B656F;
    border-radius: 50%;
    margin: 0 auto 1rem;
    animation: spin 1s linear infinite;
}

.loading-text {
    color: #2B656F;
    font-size: 1.2rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
}

.loading-subtext {
    color: #666;
    font-size: 0.9rem;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

/* Update your existing proceed-button styles */
.proceed-button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
}
/* Reusing the style from the previous component */
.screening-form-container {
    background: linear-gradient(135deg, #e6f3f5, #f0f7f8);
    border-radius: 16px;
    padding: 2rem;
    box-shadow: 0 4px 20px rgba(43, 101, 111, 0.08);
}

.form-header {
    text-align: center;
    margin-bottom: 2rem;
}

.title {
    color: #2B656F;
    font-weight: 600;
    margin-bottom: 1rem;
}

.warning-badge {
    display: inline-block;
    background: rgba(43, 101, 111, 0.1);
    color: #2B656F;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    font-weight: 500;
}

.form-section {
    background: rgba(255, 255, 255, 0.7);
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 2rem;
    border: 1px solid rgba(43, 101, 111, 0.1);
    box-shadow: 0 2px 10px rgba(43, 101, 111, 0.05);
}

.section-header {
    margin-bottom: 1.5rem;
}

.section-header h4 {
    color: #2B656F;
    font-weight: 600;
    margin-bottom: 0.5rem;
}

.section-divider {
    height: 2px;
    background: linear-gradient(to right, rgba(43, 101, 111, 0.2), transparent);
    margin-top: 0.5rem;
}

.form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
}

.form-group {
    position: relative;
}

.form-group.full-width {
    grid-column: 1 / -1;
}

input,
select,
textarea {
    width: 100%;
    background: white;
    border: 1px solid rgba(43, 101, 111, 0.2);
    border-radius: 8px;
    padding: 0.75rem;
    color: #1D4851;
    transition: all 0.3s ease;
}

input:focus,
select:focus,
textarea:focus {
    outline: none;
    border-color: #2B656F;
    box-shadow: 0 0 0 3px rgba(43, 101, 111, 0.1);
}

input:disabled {
    background: #f5f5f5;
    color: #666;
    cursor: not-allowed;
}

.tools-selection {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 1rem;
}

.tool-option {
    flex: 1;
    min-width: 200px;
    background: #ffffff;
    border: 2px solid #e9ecef;
    border-radius: 12px;
    overflow: hidden;
    transition: all 0.3s ease;
}

.tool-option:hover {
    transform: translateY(-3px);
    box-shadow: 0 5px 15px rgba(43, 101, 111, 0.1);
}

.tool-option.selected {
    border-color: #2B656F;
    box-shadow: 0 5px 15px rgba(43, 101, 111, 0.2);
}

.tool-option input[type="radio"] {
    display: none;
}

.tool-option label {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1.5rem;
    cursor: pointer;
    height: 100%;
}

.tool-option i {
    font-size: 2rem;
    color: #2B656F;
    margin-bottom: 0.5rem;
}

.tool-option span {
    font-weight: 600;
    color: #1D4851;
    margin-bottom: 0.3rem;
}

.tool-option small {
    color: #6c757d;
    text-align: center;
}


.form-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 2rem;
}

.proceed-button {
    background: linear-gradient(135deg, #2B656F 0%, #1D4851 100%);
    color: white;
    border: none;
    border-radius: 25px;
    padding: 0.75rem 1.5rem;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.3s ease;
    cursor: pointer;
}

.proceed-button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(43, 101, 111, 0.2);
}

.proceed-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}
</style>