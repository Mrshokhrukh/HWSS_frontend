<template>
    <div class="screening-form-container">
        <!-- Header Section -->
        <div class="form-header">
            <h3 class="title">Description</h3>
            <div class="warning-badge">
                *** This tool is for Case Screening Only ***
            </div>
        </div>

        <form @submit.prevent="submitForm" :disabled="isFormDeactivated">
            <!-- Case Details Section -->
            <div class="form-section">
                <div class="section-header">
                    <h4>Case Details</h4>
                    <div class="section-divider"></div>
                </div>

                <div class="form-grid">
                    <div class="form-group full-width">
                        <label for="caseName">Case Name (Presenting Issue)</label>
                        <input type="text" id="caseName" v-model="caseName" required>
                    </div>

                    <div class="form-group">
                        <label for="purpose">Purpose</label>
                        <select id="purpose" v-model="purpose" required>
                            <option value="" disabled selected>Select Purpose</option>
                            <option value="assessment">Assessment</option>
                            <option value="intervention">Intervention</option>
                            <option value="follow_up">Follow up</option>
                            <option value="termination">Termination</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="dzongkhag">Dzongkhag</label>
                        <select id="dzongkhag" v-model="dzongkhag" required>
                            <option value="" disabled selected>Select Dzongkhag</option>
                            <option v-for="dzongkhag in dzongkhags" :key="dzongkhag" :value="dzongkhag">
                                {{ dzongkhag }}
                            </option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="userScreenedToday">User Screened Today</label>
                        <input type="text" id="userScreenedToday" v-model="userScreenedToday" readonly disabled>
                    </div>
                </div>
            </div>

            <!-- Client Details Section -->
            <div class="form-section">
                <div class="section-header">
                    <h4>Client Details</h4>
                    <p class="section-subtitle">Ensure all details are correct</p>
                    <div class="section-divider"></div>
                </div>

                <div class="form-grid pb-4">
                    <div class="form-group">
                        <label for="CID">CID / Student Code / Work Permit</label>
                        <input type="text" id="CID" v-model="CID" required>
                    </div>

                    <div class="form-group">
                        <label for="clientFullName">Full Name</label>
                        <input type="text" id="clientFullName" v-model="clientFullName" required>
                    </div>

                    <div class="form-group">
                        <label for="DOB">Date of Birth</label>
                        <input type="date" id="DOB" v-model="DOB" required>
                    </div>

                    <div class="form-group">
                        <label for="age">Age</label>
                        <input type="text" id="age" :value="calculatedAge" readonly disabled>
                    </div>

                    <div class="form-group">
                        <label for="gender">Sex</label>
                        <select id="gender" v-model="gender" required>
                            <option value="" disabled selected>Select Sex</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                        </select>
                    </div>

                    <div v-if="showParentalStatus" class="form-group">
                        <label for="parentalStatus">Parental Status</label>
                        <select id="parentalStatus" v-model="parentalStatus" required>
                            <option value="" disabled selected>Select Parental Status</option>
                            <option value="Married">Married</option>
                            <option value="Divorce">Divorce</option>
                            <option value="Single Parent">Single Parent</option>
                            <option value="One Deceased">One Deceased</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="currentAddress">Current Address</label>
                        <textarea id="currentAddress" v-model="currentAddress" rows="3" required></textarea>
                    </div>

                    <div class="form-group">
                        <label for="phoneNumber">Phone Number</label>
                        <input type="tel" id="phoneNumber" v-model="phoneNumber" required maxlength="8">
                    </div>

                    <div class="form-group">
                        <label for="email">Email Address</label>
                        <input type="email" id="email" v-model="email" required>
                    </div>
                </div>
            </div>
        </form>

        <!-- Button Section -->
        <div class="form-actions">
            <button type="button" class="proceed-button" :disabled="!isProceedButtonActive"
                @click="proceedToSelectTools">
                Proceed to Select Tools
                <i class="fas fa-arrow-right"></i>
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import axios from 'axios';
import Swal from 'sweetalert2';
import endpoints from '@/api';
import { getUserScreenedData, setUserScreenedData } from '@/indexedDBHelper';

const emit = defineEmits(['proceedToSelectTools']);

const CID = ref('');
const clientFullName = ref('');
const DOB = ref('');
const gender = ref('');
const parentalStatus = ref('');
const currentAddress = ref('');
const phoneNumber = ref('');
const email = ref('');
const dzongkhag = ref('');
const maxUsersPerDay = ref(10);
const caseName = ref('');
const purpose = ref('');
const dzongkhags = [
    'Bumthang', 'Chhukha', 'Dagana', 'Gasa', 'Haa', 'Lhuentse', 'Mongar', 'Paro', 'Pemagatshel', 'Punakha',
    'Samdrup Jongkhar', 'Samtse', 'Sarpang', 'Thimphu', 'Trashigang', 'Trashiyangtse', 'Trongsa', 'Tsirang', 'Wangdue Phodrang', 'Zhemgang'
];

const userDetailsStore = JSON.parse(localStorage.getItem('userDetailsStore'));
const userRole = ref(userDetailsStore?.user?.role || '');
const userId = userDetailsStore ? userDetailsStore.user.id : null;

const showParentalStatus = computed(() => {
    return userRole.value !== 'clinical_counselor';
});

const calculatedAge = computed(() => {
    if (!DOB.value) return '';
    const birthDate = new Date(DOB.value);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    let ageGroup;
    if (age < 14) {
        ageGroup = 'Below 14';
    } else if (age >= 14 && age <= 17) {
        ageGroup = '15 to 17';
    } else {
        ageGroup = 'Above 18';
    }
    sessionStorage.setItem('clientAgeGroup', ageGroup);

    return age;
});

// Helper function to get first and last names
const getFirstAndLastName = () => {
    const nameParts = clientFullName.value.trim().split(' ').filter(Boolean);
    let firstName = '';
    let lastName = '';

    if (nameParts.length === 1) {
        firstName = nameParts[0];
        lastName = nameParts[0][0]; // Initial of first name
    } else if (nameParts.length >= 2) {
        firstName = nameParts[0];
        lastName = nameParts[nameParts.length - 1];
    }

    return { firstName, lastName };
};

let retryCounter = 0; 

const generateBaseEmail = (dob) => {
    const { firstName, lastName } = getFirstAndLastName();
    const yearOfBirth = dob.slice(2, 4); // Last two digits of birth year
    const currentYear = new Date().getFullYear().toString().slice(-2); // Last two digits of current year
    const formattedFirstName = firstName.toLowerCase().replace(/[^a-z]/g, '');
    const formattedLastName = lastName.toLowerCase().replace(/[^a-z]/g, '');
    return `${formattedFirstName}_${formattedLastName}${yearOfBirth}${currentYear}@email.com`;
};

const generateUniqueEmail = (dob) => {
    const { firstName, lastName } = getFirstAndLastName();
    const baseEmail = generateBaseEmail(dob);

    if (retryCounter === 0) return baseEmail;

    const variations = [
        `${firstName[0]}${lastName}${dob.slice(2, 4)}`, // First initial + last name + birth year
        `${firstName}${lastName[0]}${dob.slice(2, 4)}`, // First name + last initial + birth year
        `${lastName}${dob.slice(2, 4)}${retryCounter}`, // Last name + birth year + counter
    ];

    const variation = variations[retryCounter % variations.length];
    return `${variation.toLowerCase()}@email.com`;
};

const userScreenedToday = ref(0);

const resetIfNewDay = async () => {
    const today = new Date().toLocaleDateString();
    const userData = await getUserScreenedData(userId);

    if (!userData || userData.screeningDate !== today) {
        // Reset the count to 0 and update the date
        await setUserScreenedData(userId, {
            count: 0,
            screeningDate: today,
        });
        userScreenedToday.value = 0;
    } else {
        userScreenedToday.value = userData.count;
    }
};

// Define a function to reset the userScreenedToday counter
const resetUserScreenedToday = () => {
    localStorage.setItem(`userScreenedToday_${userId}`, JSON.stringify({
        count: 0,
        lastUpdated: Date.now()
    }));
};

// Check if the userScreenedToday data is stored in local storage, if not, initialize it
if (!localStorage.getItem(`userScreenedToday_${userId}`)) {
    resetUserScreenedToday();
}

// Watch for changes in userScreenedToday and update local storage accordingly
watch(userScreenedToday, (newValue) => {
    localStorage.setItem(`userScreenedToday_${userId}`, JSON.stringify({
        count: newValue,
        lastUpdated: Date.now()
    }));
});

// Define a computed property to check if all fields are filled
const isAllFieldsFilled = computed(() => {
    return (
        caseName.value !== '' &&
        purpose.value !== '' &&
        dzongkhag.value !== '' &&
        clientFullName.value !== '' &&
        DOB.value !== '' &&
        gender.value !== '' &&
        (showParentalStatus.value ? parentalStatus.value !== '' : true) &&
        currentAddress.value !== '' &&
        phoneNumber.value !== ''
    );
});

// Define a computed property to check if userScreenedToday is 10 or less
const isUserScreenedTodayValid = computed(() => {
    return userScreenedToday.value <= 10;
});

// Define a computed property to check if the form should be deactivated
const isFormDeactivated = computed(() => {
    return userScreenedToday.value >= 10;
});

// Combine conditions to determine if the "Proceed to Select Tools" button should be active
const isProceedButtonActive = computed(() => {
    return (
        isAllFieldsFilled.value && // Check if all form fields are filled
        isUserScreenedTodayValid.value && // Check if the daily screening limit has not been reached
        !isFormDeactivated.value // Check if the form is not deactivated
    );
});

// Define a function to display Swal alert when the limit is reached
const showAlert = () => {
    Swal.fire({
        icon: 'warning',
        title: 'Daily Limit Reached',
        text: 'You have reached the maximum limit for screening today.',
        showConfirmButton: true,
    });
};

const submitForm = async () => {
    if (!showParentalStatus.value) {
        parentalStatus.value = "None"; // Default value for clinical counselors
    }
    try {
        const username = await makeUserName();
        const userDetails = JSON.parse(localStorage.getItem('userDetailsStore'));

        if (userDetails && userDetails.user) {
            const getCounselorName = userDetails;
            const userAgency = userDetails.agency?.agencyName || 'Unknown Agency';
            const userAgencyCode = userDetails.agency?.agencyCode || 'Unknown Code';

            let fallbackEmail = email.value && email.value.trim() !== ''
                ? email.value
                : generateBaseEmail(DOB.value);

            const formData = {
                userData: {
                    caseName: caseName.value,
                    purpose: purpose.value,
                    dzongkhag: dzongkhag.value,
                    userScreenedToday: userScreenedToday.value,
                    username: username,
                    CID: CID.value,
                    clientFullName: clientFullName.value,
                    DOB: DOB.value,
                    gender: gender.value,
                    parentalStatus: parentalStatus.value,
                    currentAddress: currentAddress.value,
                    phoneNumber: phoneNumber.value,
                    email: fallbackEmail,
                    counselorName: `${getCounselorName.user.firstName} ${getCounselorName.user.lastName}`,
                },
                userAgencyData: {
                    agency: userAgency,
                },
                agencyData: {
                    agency_code: userAgencyCode,
                    agency_name: userAgency
                },
            };

            // Send a submit request to the endpoint
            const response = await axios.post(endpoints.registerCounselorCaseUser, formData);

            const userId = response.data.userId;
            localStorage.setItem('ClientUserIdCaseBase', userId);
            return response.data;
        } else {
            throw new Error('User details not found in localStorage');
        }
    } catch (error) {
        console.error('Error submitting form:', error);

        if (error.response && error.response.data) {
            if (error.response.data.error.includes('duplicate key value violates unique constraint')) {
                retryCounter++;
                if (retryCounter > 5) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Too Many Attempts',
                        text: 'We were unable to generate a unique email address. Please contact support.',
                    });
                    throw new Error('Too many retries for email generation');
                }

                const newEmail = generateUniqueEmail(DOB.value);

                const confirmRetry = await Swal.fire({
                    icon: 'info',
                    title: retryCounter === 1
                        ? 'Email Auto-Generated'
                        : 'Duplicate Email Detected',
                    text: retryCounter === 1
                        ? `You didn't provide an email. We generated one: ${newEmail}. Do you want to use it?`
                        : `The generated email already exists. Retry with this email: ${newEmail}?`,
                    showCancelButton: true,
                    confirmButtonText: 'Proceed',
                    cancelButtonText: 'Cancel',
                });

                if (confirmRetry.isConfirmed) {
                    email.value = newEmail; // Update email in the form model
                    return submitForm(); // Retry with the new email
                } else {
                    throw new Error('User canceled retry');
                }
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Submission Error',
                    text: error.response.data.error || 'An unknown error occurred.',
                });
            }
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Network or Server Error',
                text: 'Please check your internet connection or contact support.',
            });
        }

        throw error;
    }
};


const makeUserName = () => {
    return new Promise((resolve) => {
        const { firstName, lastName } = getFirstAndLastName();
        const dob = DOB.value;
        const yearOfBirth = dob.slice(2, 4); // Last two digits of birth year

        let usernameBase = `${firstName.toLowerCase()}_${lastName.toLowerCase()}${yearOfBirth}`;

        if (retryCounter > 0) {
            usernameBase += retryCounter; // Append retryCounter to ensure uniqueness
        }

        resolve(usernameBase.replace(/[^a-z0-9_]/g, '')); // Remove special characters
    });
};

watch(DOB, (newValue) => {
    if (newValue) {
        calculatedAge.value;
    }
});

const proceedToSelectTools = async () => {
    try {
        const responseData = await submitForm();
        if (responseData) {
            emit('proceedToSelectTools');
        } else {
            console.error('Form submission failed');
        }
    } catch (error) {
        console.error('Error submitting form:', error);
    }
};

const disableFormFields = () => {
    const form = document.querySelector('form');
    const inputFields = form.querySelectorAll('input, select, textarea, button');
    inputFields.forEach((field) => {
        field.disabled = true;
    });
};

watch(isFormDeactivated, (newValue) => {
    if (newValue) {
        disableFormFields();
    }
});

onMounted(async () => {
    await resetIfNewDay();
    if (userScreenedToday.value >= maxUsersPerDay.value) {
        showAlert();
        disableFormFields();
    }
});

</script>

<style scoped>
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

.section-subtitle {
    color: #1D4851;
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
    opacity: 0.8;
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

label {
    display: block;
    color: #1D4851;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
    font-weight: 500;
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

input:hover,
select:hover,
textarea:hover {
    border-color: rgba(43, 101, 111, 0.4);
}

input:disabled {
    background: #f5f5f5;
    color: #666;
    cursor: not-allowed;
}

select {
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%232B656F' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 0.5rem center;
    background-size: 1.5em;
    padding-right: 2.5rem;
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

/* Placeholder styling */
::placeholder {
    color: rgba(29, 72, 81, 0.5);
}

/* Additional hover effects for form sections */
.form-section:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 15px rgba(43, 101, 111, 0.08);
}

@media (max-width: 768px) {
    .screening-form-container {
        padding: 1rem;
    }

    .form-grid {
        grid-template-columns: 1fr;
    }

    .form-section {
        padding: 1rem;
    }
}
</style>