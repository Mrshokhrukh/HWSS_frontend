<template>
    <div class="bg-white p-4">
        <div class="mb-3 text-center">
            <h4 class="mb-3">Description</h4>
            <h6 class="hwss-primary">*** This tool is for Event Screening Only ***</h6>
        </div>
        <form @submit.prevent="submitForm">
            <div class="px-5">
                <!-- Event Details Section -->
                <div class="mb-4 p-3">
                    <h4 class="mb-3">Event Details</h4>
                    <div class="row">
                        <div class="col-md-12 mb-3">
                            <label for="eventName" class="form-label">Event Name</label>
                            <input type="text" class="form-control hwss-primary w-50" id="eventName" v-model="eventName"
                                required>
                        </div>
                        <div class="col-md-12 mb-3">
                            <label for="text" class="form-label">Purpose</label>
                            <textarea type="text" class="form-control hwss-primary" id="text" v-model="purpose"
                                required>
                                </textarea>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="location" class="form-label">Location</label>
                            <input type="text" class="form-control hwss-primary" id="location" v-model="location"
                                required>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="dzongkhag" class="form-label">Dzongkhag</label>
                            <select class="form-select hwss-primary" id="dzongkhag" v-model="dzongkhag" required>
                                <option value="" disabled selected>Select Dzongkhag</option>
                                <option v-for="dzongkhag in dzongkhags" :key="dzongkhag" :value="dzongkhag">{{ dzongkhag
                                    }}
                                </option>
                            </select>
                        </div>
                        <div class="col-md-4 mb-3">
                            <label for="startDate" class="form-label">Start Date</label>
                            <input type="date" class="form-control hwss-primary" id="startDate" v-model="startDate"
                                :min="today" required>
                        </div>
                        <div class="col-md-4 mb-3">
                            <label for="endDate" class="form-label">End Date</label>
                            <input type="date" class="form-control hwss-primary" id="endDate" v-model="endDate"
                                :min="startDate" required>
                        </div>
                        <div class="col-md-4 mb-3">
                            <label for="duration" class="form-label">Duration (Days)</label>
                            <input type="text" class="form-control hwss-primary" id="duration" v-model="duration"
                                readonly>
                        </div>
                        <div class="col-md-4 mb-3">
                            <label for="totalUsers" class="form-label">Total Users to be Screened</label>
                            <input type="number" class="form-control hwss-primary" id="totalUsers" v-model="totalUsers"
                                required>
                        </div>
                    </div>
                </div>
            </div>
        </form>
        <!-- Button Section -->
        <div class="d-flex justify-content-end">
            <button type="button" class="btn hwss-btn" @click="proceed">
                Proceed to Select Tools <i class="fas fa-arrow-right"></i>
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

console.log(counselorName.value);

const submitForm = async () => {
    try {
        const eventData = {
            event_name: eventName.value,
            event_purpose: purpose.value,
            location: location.value,
            start_date: startDate.value,
            end_date: endDate.value,
            duration: duration.value,
            counselor: counselorName.value,
            total_users: totalUsers.value
        };

        const createResponse = await axios.post(endpoints.createEventScreening, eventData);

        // Handle successful response
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
    }
};

const fetchEventStatus = async () => {
    try {
        const response = await axios.get(endpoints.getEventInfo(counselorName.value));

        if (response.status === 200) {
            const eventData = response.data;
            if (eventData.approval_status === 'pending') {
                Swal.fire({
                    title: 'Event Screening Pending',
                    text: 'The admin has not yet approved your event screening request.',
                    icon: 'warning'
                }).then(() => {
                    router.push('/counselor-dashboard'); 
                });
            } else if (eventData.approval_status === 'approved') {
                Swal.fire({
                    title: 'Event Screening Ongoing',
                    text: 'Proceeding to tool selection.',
                    icon: 'success',
                    timer: 1000,
                    showConfirmButton: false
                });
                setTimeout(() => {
                    emit('proceedToEventSelectTools');
                }, 1000);
            } else {
                eventStatus.value = eventData.approval_status;
            }
        }
    } catch (error) {
        console.error('Error:', error);
    }
};

onMounted(() => {
    fetchEventStatus();
});

const proceed = async () => {
    try {
        await submitForm(); 
        window.location.reload();
    } catch (error) {
        console.error('Error submitting form:', error);
    }
};

// eslint-disable-next-line no-unused-vars
watch(endDate, (newValue, oldValue) => {
    // Calculate duration when end date changes
    const start = new Date(startDate.value);
    const end = new Date(newValue);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    duration.value = diffDays;
});

// Optionally, you can also fetch dzongkhags on component mount
const dzongkhags = [
    'Bumthang', 'Chhukha', 'Dagana', 'Gasa', 'Haa', 'Lhuntse', 'Mongar', 'Paro', 'Pemagatshel', 'Punakha',
    'Samdrup Jongkhar', 'Samtse', 'Sarpang', 'Thimphu', 'Trashigang', 'Trashiyangtse', 'Trongsa', 'Tsirang', 'Wangdue Phodrang', 'Zhemgang'
];
</script>

<style scoped>
input,
select,
textarea {
    border-radius: 10px;
    border: 1px solid #c9c9c9;
    padding: 0.5rem;
}


.hwss-btn {
    border-radius: 50px;
}
</style>