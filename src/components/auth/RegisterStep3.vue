<template>
    <div class="d-flex justify-content-center align-items-center min-vh-100 bg-light">
        <div class="container my-5">
            <div class="row justify-content-center">
                <div class="col-md-8">
                    <div class="card shadow-lg rounded-lg overflow-hidden">
                        <div class="card-body p-5">
                            <div class="text-center mb-4">
                                <h1 class="display-4 text-primary fw-bold">Sign Up</h1>
                                <p class="lead text-secondary">Agency Based User</p>
                            </div>

                            <div class="progress mb-4" style="height: 8px;">
                                <div class="progress-bar bg-primary" role="progressbar"
                                    :style="{ width: progressBarWidth }" aria-valuenow="0" aria-valuemin="0"
                                    aria-valuemax="100"></div>
                            </div>

                            <div class="d-flex justify-content-between align-items-center mb-5">
                                <div class="step-circle" :class="{ 'active': currentStep >= 1 }"
                                    @click="handleProgressBarClick(1)">1</div>
                                <div class="step-circle" :class="{ 'active': currentStep >= 2 }"
                                    @click="handleProgressBarClick(2)">2</div>
                                <div class="step-circle" :class="{ 'active': currentStep >= 3 }"
                                    @click="handleProgressBarClick(3)">3</div>
                            </div>

                            <div v-if="currentStep === 1">
                                <h5 class="mb-4 text-primary">1. Fetch Details</h5>
                                <!-- Add content for step 1 here -->
                            </div>

                            <div v-if="currentStep === 2">
                                <h5 class="mb-4 text-primary">2. User Details</h5>
                                <p class="text-muted mb-4">Agree to the Details</p>

                                <form @submit.prevent="submitForm">
                                    <div class="mb-3">
                                        <input type="text" id="fullName" :value="fullName" placeholder="Full Name"
                                            class="form-control bg-light" readonly disabled>
                                    </div>

                                    <div class="row mb-3">
                                        <div class="col-md-6">
                                            <input type="text" id="phoneNumber" placeholder="Phone Number"
                                                :value="userData.mob_number" class="form-control bg-light" readonly
                                                disabled>
                                        </div>
                                        <div class="col-md-6">
                                            <input type="email" id="email" placeholder="Email" v-model="regEmail"
                                                class="form-control"
                                                :class="{ 'is-invalid': !isValidEmail && !detailsConfirmed }" required
                                                :disabled="detailsConfirmed" :readonly="detailsConfirmed">
                                            <div v-if="!isValidEmail && !detailsConfirmed" class="invalid-feedback">
                                                Please enter a valid email address.
                                            </div>
                                        </div>
                                    </div>

                                    <div class="row mb-3">
                                        <div class="col-md-6">
                                            <input type="text" id="nationality" placeholder="Nationality"
                                                :value="userData.nationality" class="form-control bg-light" readonly
                                                disabled>
                                        </div>
                                        <div class="col-md-6">
                                            <input type="text" id="gender" placeholder="Gender" :value="userData.gender"
                                                class="form-control bg-light" readonly disabled>
                                        </div>
                                    </div>

                                    <div class="d-flex justify-content-between mt-4">
                                        <button type="button" @click="confirmDetails(true)"
                                            class="btn btn-primary flex-grow-1 me-2"
                                            :disabled="!isValidEmail || detailsConfirmed">True</button>
                                        <button type="button" @click="confirmDetails(false)"
                                            class="btn btn-outline-primary flex-grow-1" :disabled="detailsConfirmed">Not
                                            True</button>
                                    </div>
                                </form>

                                <div v-if="detailsConfirmed" class="mt-5">
                                    <div class="mb-3">
                                        <label for="agency" class="form-label">Select Your Agency:</label>
                                        <select id="agency" v-model="selectedAgency" class="form-select">
                                            <option value="" disabled>Select Your Agency</option>
                                            <option value="EMIS">EMIS</option>
                                            <option value="RCSC">RCSC</option>
                                        </select>
                                    </div>

                                    <div v-if="selectedAgency === 'EMIS'" class="mb-3">
                                        <label class="form-label">Select any of the Identifier:</label>
                                        <div class="d-flex">
                                            <div class="form-check me-3">
                                                <input type="radio" id="studentCode" value="Student Code"
                                                    v-model="selectedParameter" class="form-check-input">
                                                <label for="studentCode" class="form-check-label">Student Code</label>
                                            </div>
                                            <div class="form-check">
                                                <input type="radio" id="employeeID" value="Employee ID"
                                                    v-model="selectedParameter" class="form-check-input">
                                                <label for="employeeID" class="form-check-label">Employee ID</label>
                                            </div>
                                        </div>
                                    </div>

                                    <div v-if="selectedParameter === 'Student Code'" class="mb-3">
                                        <label for="dob" class="form-label">Your Date of Birth as per your school
                                            records:</label>
                                        <div class="row g-2">
                                            <div class="col">
                                                <select v-model="formData.selectedMonth" class="form-select">
                                                    <option v-for="month in months" :key="month.value"
                                                        :value="month.value">
                                                        {{ month.label }}
                                                    </option>
                                                </select>
                                            </div>
                                            <div class="col">
                                                <select v-model="formData.selectedDate" class="form-select">
                                                    <option v-for="date in dates" :key="date.value" :value="date.value">
                                                        {{ date.label }}
                                                    </option>
                                                </select>
                                            </div>
                                            <div class="col">
                                                <select v-model="formData.selectedYear" class="form-select">
                                                    <option v-for="year in years" :key="year" :value="year">{{ year }}
                                                    </option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div v-else-if="selectedAgency === 'RCSC'" class="mb-3">
                                        <label class="form-label">Select any of the Identifier:</label>
                                        <div class="form-check">
                                            <input type="radio" id="citizenID" value="Citizen ID"
                                                v-model="selectedParameter" class="form-check-input">
                                            <label for="citizenID" class="form-check-label">Citizen ID</label>
                                        </div>
                                    </div>

                                    <div v-if="selectedParameter && selectedParameter !== 'Student Code'" class="mb-3">
                                        <label :for="selectedParameter" class="form-label">Enter {{ selectedParameter
                                            }}:</label>
                                        <input :type="selectedParameter === 'Citizen ID' ? 'text' : 'number'"
                                            :id="selectedParameter" v-model="parameterValue" class="form-control">
                                    </div>

                                    <div v-if="selectedParameter === 'Student Code'" class="mb-3">
                                        <label for="studentCodeInput" class="form-label">Enter Student Code:</label>
                                        <input type="text" id="studentCodeInput" :value="formattedStudentCode"
                                            @input="formatStudentCode" class="form-control" maxlength="16">
                                    </div>

                                    <button type="button" @click="proceed"
                                        class="btn btn-primary w-100 mt-3">Next</button>
                                </div>
                            </div>

                            <div v-if="currentStep === 3">
                                <h5 class="mb-4 text-primary">3. Login Info</h5>
                                <!-- Add content for step 3 here -->
                            </div>

                            <div class="text-center mt-4">
                                <p class="mb-0">Already Have an Account? <router-link to="/login"
                                        class="text-primary fw-bold">Sign In</router-link></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import endpoints from '@/api';
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2';

const router = useRouter();

const props = defineProps({
  userData: Object,
});

const fullName = computed(() => {
  const { first_name, middle_name, last_name } = props.userData;
  return `${first_name} ${middle_name} ${last_name}`.trim();
});

const emit = defineEmits(['go-to-next-step', 'go-to-prev-step']);

const detailsConfirmed = ref(false);
const selectedAgency = ref('');
const selectedParameter = ref('');
const parameterValue = ref('');
const regEmail = ref('');
const formData = ref({
  selectedMonth: '',
  selectedDate: '',
  selectedYear: ''
});

const currentStep = ref(2);  // Assuming we're on step 2

const progressBarWidth = computed(() => {
  return `${(currentStep.value / 3) * 100}%`;
});

const months = [
  { value: '01', label: 'January' },
  { value: '02', label: 'February' },
  { value: '03', label: 'March' },
  { value: '04', label: 'April' },
  { value: '05', label: 'May' },
  { value: '06', label: 'June' },
  { value: '07', label: 'July' },
  { value: '08', label: 'August' },
  { value: '09', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
];

const dates = Array.from({ length: 31 }, (_, i) => ({ value: String(i + 1).padStart(2, '0'), label: String(i + 1) }));
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

const isValidEmail = computed(() => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regEmail.value && emailRegex.test(regEmail.value) && !detailsConfirmed.value;
});

const confirmDetails = async (isTrue) => {
  if (isTrue) {
    const result = await Swal.fire({
      title: 'Are you sure the information is true?',
      text: "The details cannot be edited after confirmation.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#0d6efd',
      cancelButtonColor: '#dc3545',
      confirmButtonText: 'Yes, confirm'
    });

    if (result.isConfirmed) {
      detailsConfirmed.value = true;
      const userData = JSON.parse(sessionStorage.getItem('user_data')) || {};
      userData.email = regEmail.value;
      sessionStorage.setItem('user_data', JSON.stringify(userData));
      
      // Make API call here
      try {
        const response = await axios.post(endpoints.confirmUserDetails, {
          email: regEmail.value,
          // Add any other necessary data
        });
        
        if (response.data.success) {
          Swal.fire('Confirmed', 'Your details have been confirmed.', 'success');
        } else {
          throw new Error('API call failed');
        }
      } catch (error) {
        console.error('Error confirming details:', error);
        Swal.fire('Error', 'An error occurred while confirming your details. Please try again.', 'error');
        detailsConfirmed.value = false;
      }
    }
  } else {
    const result = await Swal.fire({
      title: 'Please verify your details again.',
      text: "",
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#0d6efd',
      cancelButtonColor: '#dc3545',
      confirmButtonText: 'Verify'
    });

    if (result.isConfirmed) {
      emit('go-to-prev-step', 'step-two');
    }
  }
};

const loading = ref(false);

const storedApiCID = localStorage.getItem('userCID');

onMounted(() => {
  parameterValue.value = storedApiCID || '';
});

const formattedStudentCode = computed(() => {
  return parameterValue.value.replace(/[^0-9]/g, '')
    .replace(/(\d{3})(\d{5})(\d{2})(\d{4})/, '$1.$2.$3.$4');
});

function formatStudentCode(event) {
  const input = event.target.value.replace(/[^0-9]/g, '');
  parameterValue.value = input.substr(0, 3)
    + (input.length > 3 ? '.' : '')
    + input.substr(3, 5)
    + (input.length > 8 ? '.' : '')
    + input.substr(8, 2)
    + (input.length > 10 ? '.' : '')
    + input.substr(10);
}

const proceed = async () => {
  loading.value = true;
  let apiURL;

  switch (selectedAgency.value) {
    case 'RCSC':
      if (selectedParameter.value === 'Citizen ID') {
        apiURL = `${endpoints.getRcscDetails}${parameterValue.value}/${regEmail.value}/`;
      }
      break;
    case 'EMIS':
      if (selectedParameter.value === 'Student Code') {
        const dob = `${formData.value.selectedYear}-${formData.value.selectedMonth}-${formData.value.selectedDate}`;
        apiURL = `${endpoints.getEmisStudent}${parameterValue.value}/${dob}/${regEmail.value}/`;
      } else if (selectedParameter.value === 'Employee ID') {
        apiURL = `${endpoints.getEmisEmployee}${parameterValue.value}/${regEmail.value}/`;
      }
      break;
    default:
      console.error('Invalid agency selected');
      loading.value = false;
      return;
  }

    try {
        if (!apiURL) {
      throw new Error('API URL is undefined');
    }

    const response = await axios.get(apiURL);

    if (response.data && Object.keys(response.data.agency_data).length === 0 && Object.keys(response.data.user_agency_data).length === 0) {
      await Swal.fire('No Data Found', 'No data was found for the given information.', 'warning');
    } else if (response.data && response.data.agency_data && response.data.user_agency_data) {
      sessionStorage.setItem('agencyData', JSON.stringify(response.data.agency_data));
      sessionStorage.setItem('userAgencyData', JSON.stringify(response.data.user_agency_data));

      let userData = JSON.parse(sessionStorage.getItem('user_data') || '{}');
      userData.role = response.data.user_agency_data.user_role_agency;
      sessionStorage.setItem('user_data', JSON.stringify(userData));

      await Swal.fire('Success', 'Your information has been verified successfully.', 'success');
      emit('go-to-next-step', 'step-four');
    } else if (response.data.error) {
      await Swal.fire('Error', response.data.error, 'error');
    } else {
      await Swal.fire('Warning', 'An unexpected response was received.', 'warning');
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    await Swal.fire('Error', 'An error occurred while fetching data. Please try again.', 'error');
    router.push('/register');
  } finally {
    loading.value = false;
  }
};

const handleProgressBarClick = (step) => {
  if (step <= currentStep.value) {
    currentStep.value = step;
  }
};

// Add any additional helper functions or computed properties here

</script>

<style scoped>
.card {
  border: none;
  transition: all 0.3s;
}

.card:hover {
  transform: translateY(-5px);
}

.step-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #e9ecef;
  color: #6c757d;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  transition: all 0.3s;
  cursor: pointer;
}

.step-circle.active {
  background-color: #0d6efd;
  color: white;
}

.form-control, .form-select {
  border: 1px solid #ced4da;
  border-radius: 0.25rem;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.form-control:focus, .form-select:focus {
  border-color: #86b7fe;
  outline: 0;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

.btn-primary {
  background-color: #0d6efd;
  border-color: #0d6efd;
  transition: all 0.3s;
}

.btn-primary:hover {
  background-color: #0b5ed7;
  border-color: #0a58ca;
}

.btn-outline-primary {
  color: #0d6efd;
  border-color: #0d6efd;
  transition: all 0.3s;
}

.btn-outline-primary:hover {
  color: #fff;
  background-color: #0d6efd;
  border-color: #0d6efd;
}

.text-primary {
  color: #0d6efd !important;
}

.progress {
  height: 8px;
  background-color: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar {
  background-color: #0d6efd;
  transition: width 0.6s ease;
}
</style>