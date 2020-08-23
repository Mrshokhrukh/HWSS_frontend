<template>
  <div class="d-flex justify-content-center align-items-center mt-5" >
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-md-8">
          <div class="card mb-5 p-3">
            <div class="logo-container position-absolute top-0 end-0 mt-3 me-3">
              <button
                class="card custom-btn d-flex flex-row justify-content-center align-items-center p-2"
                @click.prevent="showNDILoginAlert"
              >
                <img src="@/assets/images/NDILogo.png" alt="NDI Logo" class="ndi-logo" />
                <a href="#" class="text-white font-weight-bold ms-2">Use Bhutan NDI</a>
              </button>
            </div>
            <div class="text-center mt-3">
              <h1 class="display-4" style="color: #2b656f; font-weight: bold">Sign Up</h1>
              <p class="lead" style="color: #2b656f; font-weight: bold">Agency Based User</p>
            </div>
            <br />
            <div
              class="progress-bar"
              role="progressbar"
              :style="{ width: progressBarWidth }"
              aria-valuenow="0"
              aria-valuemin="0"
              aria-valuemax="100"
              @click="handleProgressBarClick(1)"
            ></div>
            <div class="step-container d-flex justify-content-between align-items-center px-5">
              <div class="step-circle" @click="handleProgressBarClick(1)">1</div>
              <hr class="flex-grow-1 mx-2" />
              <div class="step-circle bg-light text-dark" @click="handleProgressBarClick(2)">2</div>
              <hr class="flex-grow-1 mx-2" />
              <div class="step-circle bg-light text-dark" @click="handleProgressBarClick(3)">3</div>
            </div>
            <div class="container">
              <div class="card-body text-start form">
                <form @submit.prevent="fetchCitizenDetails">
                  <h5 class="mb-2 text-muted">
                    <span class="rounded-number p-3">1</span> Fetch User Details
                  </h5>
                  <small class="text-muted mb-5">Select any Identifier </small>

                  <div class="form-group mb-3">
                    <div
                      class="form-check form-check-inline"
                      v-for="identifier in identifiers"
                      :key="identifier.value"
                    >
                      <input
                        class="form-check-input"
                        type="radio"
                        :id="identifier.id"
                        :value="identifier.value"
                        v-model="formData.selectedIdentifier"
                      />
                      <label class="form-check-label text-muted" :for="identifier.id">
                        {{ identifier.label }}
                      </label>
                    </div>
                  </div>

                  <div v-if="formData.selectedIdentifier === 'cid'" class="form-group mb-4">
                    <!-- CID-specific fields -->
                    <small for="cid" class="text-muted">Enter your CID/SRP Number:</small>
                    <input
                      type="text"
                      id="cid"
                      v-model="formData.cid"
                      class="form-control bg-transparent border-dark"
                      maxlength="11"
                      @input="validateCID"
                    />
                    <small v-if="state.cidError" class="text-danger">{{ state.cidError }}</small>

                    <!-- Date pickers for month, date, and year wrapped in a row -->
                    <div class="form-group mt-3">
                      <small for="dob" class="text-muted">Date of Birth in your CID:</small>
                      <div class="row">
                        <!-- Month -->
                        <div class="col">
                          <label for="dobMonth" class="form-label text-muted mb-0">Month:</label>
                          <select
                            id="dobMonth"
                            class="form-select bg-transparent border-dark"
                            v-model="formData.selectedMonth"
                          >
                            <option v-for="month in months" :key="month.value" :value="month.value">
                              {{ month.label }}
                            </option>
                          </select>
                        </div>
                        <!-- Date -->
                        <div class="col">
                          <label for="dobDate" class="form-label text-muted mb-0">Date:</label>
                          <select
                            id="dobDate"
                            class="form-select bg-transparent border-dark"
                            v-model="formData.selectedDate"
                          >
                            <option v-for="date in dates" :key="date.value" :value="date.value">
                              {{ date.label }}
                            </option>
                          </select>
                        </div>
                        <!-- Year -->
                        <div class="col">
                          <label for="dobYear" class="form-label text-muted mb-0">Year:</label>
                          <select
                            id="dobYear"
                            class="form-select bg-transparent border-dark"
                            v-model="formData.selectedYear"
                          >
                            <option v-for="year in years" :key="year" :value="year">
                              {{ year }}
                            </option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div v-if="formData.selectedIdentifier === 'casefile'" class="form-group mt-4">
                    <!-- Improved Display message or prompt for Case File -->
                    <div class="alert alert-info" role="alert">
                      <h4 class="alert-heading">
                        Important Notice: for any Other Documents other than Citizenship ID Card!
                      </h4>
                      <p>
                        Please contact The PEMA directly to proceed with your registration. Ensure
                        you provide the following details:
                      </p>
                      <hr />
                      <div class="ms-4">
                        <p class="mb-1">Required Details:</p>
                        <div class="ps-3">
                          <div>
                            <i class="fas fa-check-circle text-success text-capitalize"></i>
                            Document Number (Case file Number / Student Code / Work permit /
                            others...)
                          </div>
                          <div><i class="fas fa-check-circle text-success"></i> Nationality</div>
                          <div><i class="fas fa-check-circle text-success"></i> First Name</div>
                          <div>
                            <i class="fas fa-check-circle text-success"></i> Middle Name (if any)
                          </div>
                          <div><i class="fas fa-check-circle text-success"></i> Last Name</div>
                          <div><i class="fas fa-check-circle text-success"></i> Date of Birth</div>
                          <div><i class="fas fa-check-circle text-success"></i> Sex</div>
                          <div>
                            <i class="fas fa-check-circle text-success"></i> Email Address (If Any)
                          </div>
                          <div><i class="fas fa-check-circle text-success"></i> Mobile Number</div>
                          <div>
                            <i class="fas fa-check-circle text-success"></i> Permanent Address
                            (Village, Gewog, Dzongkhag)
                          </div>
                          <div>
                            <i class="fas fa-check-circle text-success"></i> Current School or
                            Working Agency
                          </div>
                          <div>
                            <i class="fas fa-check-circle text-success"></i> Current Class and
                            Section (If Student)
                          </div>
                        </div>
                      </div>
                      <p class="mt-3">Your cooperation is highly appreciated.</p>
                    </div>
                  </div>

                  <div v-if="formData.selectedIdentifier === 'passport'" class="form-group">
                    <!-- Display input fields for Passport -->
                    <div class="row">
                      <!-- Passport and Nationality -->
                      <div class="col-md-6">
                        <label for="passport" class="form-label text-muted"
                          >Foreign Passport Number:</label
                        >
                        <input
                          type="text"
                          id="passport"
                          v-model="formData.passport"
                          class="form-control bg-transparent border-dark"
                        />
                      </div>
                      <div class="col-md-6">
                        <label for="nationality" class="form-label text-muted">Nationality:</label>
                        <input
                          type="text"
                          id="nationality"
                          v-model="formData.nationality"
                          class="form-control bg-transparent border-dark"
                        />
                      </div>
                    </div>

                    <div class="row">
                      <!-- Personal Details -->
                      <div class="col-md-4">
                        <label for="first_name" class="form-label text-muted">First Name:</label>
                        <input
                          type="text"
                          id="first_name"
                          v-model="formData.first_name"
                          class="form-control bg-transparent border-dark"
                        />
                      </div>
                      <div class="col-md-4">
                        <label for="middle_name" class="form-label text-muted">Middle Name:</label>
                        <input
                          type="text"
                          id="middle_name"
                          v-model="formData.middle_name"
                          class="form-control bg-transparent border-dark"
                        />
                      </div>
                      <div class="col-md-4">
                        <label for="last_name" class="form-label text-muted">Last Name:</label>
                        <input
                          type="text"
                          id="last_name"
                          v-model="formData.last_name"
                          class="form-control bg-transparent border-dark"
                        />
                      </div>
                    </div>

                    <div class="row">
                      <!-- Additional Details -->
                      <div class="col-md-4">
                        <label for="date_of_birth" class="form-label text-muted"
                          >Date of Birth:</label
                        >
                        <input
                          type="date"
                          id="date_of_birth"
                          v-model="formData.date_of_birth"
                          class="form-control bg-transparent border-dark"
                        />
                      </div>
                      <div class="col-md-4">
                        <label for="gender" class="form-label text-muted">Sex:</label>
                        <select
                          id="gender"
                          v-model="formData.gender"
                          class="form-select bg-transparent border-dark"
                        >
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                        </select>
                      </div>
                      <div class="col-md-4">
                        <label for="mob_number" class="form-label text-muted">Mobile Number:</label>
                        <input
                          type="text"
                          id="mob_number"
                          v-model="formData.mob_number"
                          class="form-control bg-transparent border-dark"
                          maxlength="15"
                          @input="validateMobileNumber"
                        />
                        <small v-if="state.mobileError" class="text-danger">{{ state.mobileError }}</small>
                      </div>
                    </div>

                    <div class="row">
                      <!-- Address -->
                      <div class="col-md-4">
                        <label for="perm_add_village" class="form-label text-muted"
                          >Permanent Address Village:</label
                        >
                        <input
                          type="text"
                          id="perm_add_village"
                          v-model="formData.perm_add_village"
                          class="form-control bg-transparent border-dark"
                        />
                      </div>
                      <div class="col-md-4">
                        <label for="perm_add_gewog" class="form-label text-muted"
                          >Permanent Address Gewog:</label
                        >
                        <input
                          type="text"
                          id="perm_add_gewog"
                          v-model="formData.perm_add_gewog"
                          class="form-control bg-transparent border-dark"
                        />
                      </div>
                      <div class="col-md-4">
                        <label for="perm_add_dzongkhag" class="form-label text-muted"
                          >Permanent Address Dzongkhag:</label
                        >
                        <input
                          type="text"
                          id="perm_add_dzongkhag"
                          v-model="formData.perm_add_dzongkhag"
                          class="form-control bg-transparent border-dark"
                        />
                      </div>
                    </div>
                  </div>
                  <button type="submit" class="btn btn-primary reg-btn my-3">Next</button>
                </form>
              </div>
            </div>
            <div class="container">
              <div class="card mt-3 form">
                <div class="card-body text-muted">
                  <h5 class="mb-4">2. User Details</h5>
                </div>
              </div>
            </div>

            <div class="container">
              <div class="card mt-3 form">
                <div class="card-body text-muted">
                  <h5 class="mb-4">3. Login Info</h5>
                </div>
              </div>
            </div>

            <div
              v-if="showLoadingOverlay"
              class="loading-overlay"
              style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1050;
              "
            >
              <div class="spinner-border text-light" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>

            <div
              v-if="showSuccessMessage"
              class="modal"
              style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: white;
                padding: 20px;
                border-radius: 5px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                z-index: 1050;
              "
            >
              <div class="modal-body">
                Registration successful! <button @click="showSuccessMessage = false">Close</button>
              </div>
            </div>

            <div
              v-if="showFailedMessage"
              class="modal"
              style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: white;
                padding: 20px;
                border-radius: 5px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                z-index: 1050;
              "
            >
              <div class="modal-body">
                Registration failed. Please try again.
                <button @click="showFailedMessage = false">Close</button>
              </div>
            </div>

            <div class="text-center my-5">
              Already Have an Account?
              <router-link to="/login" style="color: #2b656f; font-weight: bold"
                >Sign In</router-link
              >
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Loading, Success, and Failed Modals/Overlays can be inserted here if they should be fullscreen -->
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import axios from 'axios'
import endpoints from '@/api'
import Swal from 'sweetalert2'

const formData = ref({
  selectedIdentifier: '',
  cid: '',
  casefile: '',
  passport: '',
  selectedMonth: '',
  selectedDate: '',
  selectedYear: '',
  date_of_birth: '',
  gender: '',
  mob_number: ''
})

const identifiers = [
  { id: 'cidRadio', value: 'cid', label: 'Citizenship ID Card' },
  { id: 'casefileRadio', value: 'casefile', label: 'Other Documents' }
  // { id: 'passportRadio', value: 'passport', label: 'Foreign Passport/Work Permit' },
]

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
  { value: '12', label: 'December' }
]

const showLoadingOverlay = ref(false)
const showSuccessMessage = ref(false)
const showFailedMessage = ref(false)
const state = reactive({
  cidError: '',
  mobileError: ''
})

const cleanMobileNumber = (mobileNumber) => {
  if (!mobileNumber) return ''
  
  // Remove any non-digit characters
  const cleaned = mobileNumber.replace(/\D/g, '')
  
  // Truncate to 15 digits if longer
  return cleaned.length > 15 ? cleaned.substring(0, 15) : cleaned
}

const validateCID = () => {
  const cidPattern = /^\d+$/

  if (formData.value.cid.length > 11) {
    formData.value.cid = formData.value.cid.slice(0, 11)
  }

  if (!cidPattern.test(formData.value.cid)) {
    state.cidError = 'Please enter only numbers for CID.'
  } else if (parseInt(formData.value.cid) > 49999999999) {
    state.cidError = 'Invalid CID entered. Please enter a valid CID.'
  } else {
    state.cidError = ''
  }
}

const validateMobileNumber = () => {
  const mobileNumber = formData.value.mob_number || ''
  const cleanedNumber = cleanMobileNumber(mobileNumber)
  
  // Update the form data with cleaned number
  if (mobileNumber !== cleanedNumber) {
    formData.value.mob_number = cleanedNumber
  }
  
  const mobilePattern = /^[0-9]{10,15}$/
  
  // If mobile number is empty, clear the error
  if (!cleanedNumber.trim()) {
    state.mobileError = ''
    return
  }
  
  if (!mobilePattern.test(cleanedNumber)) {
    state.mobileError = 'Please enter a valid mobile number (10-15 digits).'
  } else {
    state.mobileError = ''
  }
}

const dates = Array.from({ length: 31 }, (_, i) => ({
  value: String(i + 1).padStart(2, '0'),
  label: String(i + 1)
}))
const currentYear = new Date().getFullYear()
const years = Array.from({ length: 100 }, (_, i) => currentYear - i)

const emit = defineEmits(['go-to-next-step'])

const fetchCitizenDetails = async () => {
  if (formData.value.selectedIdentifier === 'cid') {
            if (
          !formData.value.selectedMonth ||
          !formData.value.selectedDate ||
          !formData.value.selectedYear ||
          state.cidError !== '' ||
          (formData.value.mob_number && formData.value.mob_number.trim() && state.mobileError !== '')
        ) {
          Swal.fire('Error', 'Please fill in all required fields and fix any validation errors.', 'error')
          return
        }
    try {
      showLoadingOverlay.value = true
      const csrfToken = getCSRFToken()
      const headers = { 'X-CSRFToken': csrfToken }
     
      const response = await axios.get(`${endpoints.getCitizenDetails}${formData.value.cid}/`, {
        headers
      });

      if (response.data) {
        const citizenDetails = response.data
        localStorage.setItem('userCID', citizenDetails.cid)
        const formattedMonth = formData.value.selectedMonth.padStart(2, '0');
        const formattedDate = formData.value.selectedDate.padStart(2, '0');
        const enteredDOB = `${formattedDate}/${formattedMonth}/${formData.value.selectedYear}`
        const apiDOB = citizenDetails.dob
        if (enteredDOB === apiDOB) {
          const usernameSuffix =
            citizenDetails.firstName.toLowerCase() + formattedMonth + formattedDate
          // Validate and truncate mobile number from API
          const mobileNumber = citizenDetails.mobileNumber || ''
          const validatedMobileNumber = mobileNumber.length > 15 ? mobileNumber.substring(0, 15) : mobileNumber
          
          // Show warning if mobile number was truncated
          if (mobileNumber.length > 15) {
            Swal.fire({
              title: 'Mobile Number Truncated',
              text: `The mobile number from your CID (${mobileNumber}) was longer than 15 digits and has been truncated to ${validatedMobileNumber} for database compatibility.`,
              icon: 'warning',
              confirmButtonText: 'OK'
            })
          }
          
          const mappedData = {
            identity_number: citizenDetails.cid,
            first_name: citizenDetails.firstName,
            middle_name: citizenDetails.middleName || '',
            last_name: citizenDetails.lastName,
            date_of_birth: formatDOB(citizenDetails.dob),
            gender: mapGender(citizenDetails.gender),
            mob_number: cleanMobileNumber(validatedMobileNumber),
            perm_add_village: citizenDetails.villageName,
            perm_add_gewog: citizenDetails.gewogName,
            perm_add_dzongkhag: citizenDetails.dzongkhagName,
            nationality: mapNationality(citizenDetails.country),
            father_name: citizenDetails.fatherName,
            mother_name: citizenDetails.motherName,
            parent_occupation: citizenDetails.occupation,
            ps_add_village: citizenDetails.villageName,
            ps_add_gewog: citizenDetails.gewogName,
            ps_add_dzongkhag: citizenDetails.dzongkhagName,
            username: usernameSuffix
          }
          sessionStorage.setItem('user_data', JSON.stringify(mappedData))
          showSuccessMessage.value = true
          moveToStep3(mappedData)
        } else {
          Swal.fire(
            'Error',
            'Entered date of birth does not match with the records under your CID. Please re-enter your details correctly.',
            'error'
          )
        }
      } else {
        Swal.fire('Error', 'Citizen details not found', 'error')
      }
    } catch (error) {
      showFailedMessage.value = true
      console.error('An error occurred during fetching details', error)
    } finally {
      showLoadingOverlay.value = false
    }
  } else if (formData.value.selectedIdentifier === 'casefile') {
    Swal.fire('Information', 'Contact PEMA directly for Case File registration.', 'info')
  } else if (formData.value.selectedIdentifier === 'passport') {
    Swal.fire({
      title: 'Confirmation',
      text: 'Confirm that all relevant fields for Passport registration have been filled out. Would you like to continue to the next step?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#2B656F',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, continue'
    }).then((result) => {
      if (result.isConfirmed) {
        // Validate mobile number before proceeding
        const mobileNumberToValidate = formData.value.mob_number || ''
        if (mobileNumberToValidate.trim() && state.mobileError !== '') {
          Swal.fire('Error', 'Please fix the mobile number validation error before proceeding.', 'error')
          return
        }
        
        // Validate and truncate mobile number
        const mobileNumber = formData.value.mob_number || ''
        const validatedMobileNumber = mobileNumber.length > 15 ? mobileNumber.substring(0, 15) : mobileNumber
        
        const mappedData = {
          identity_number: formData.value.passport,
          first_name: formData.value.first_name,
          middle_name: formData.value.middle_name || '',
          last_name: formData.value.last_name || '',
          date_of_birth: formData.value.date_of_birth,
          gender: formData.value.gender,
          mob_number: cleanMobileNumber(validatedMobileNumber),
          perm_add_village: formData.value.perm_add_village,
          perm_add_gewog: formData.value.perm_add_gewog,
          perm_add_dzongkhag: formData.value.perm_add_dzongkhag,
          nationality: formData.value.nationality
        }
        sessionStorage.setItem('user_data', JSON.stringify(mappedData))
        showSuccessMessage.value = true
        moveToStep3(mappedData)
      }
    })
  }
}

function getCSRFToken() {
  const name = 'csrftoken'
  const value = '; ' + document.cookie
  const parts = value.split('; ' + name + '=')

  if (parts.length === 2) {
    return parts.pop().split(';').shift()
  }

  return null
}

function formatDOB(dob) {
  return dob.split('/').reverse().join('-')
}

function mapGender(gender) {
  return gender === 'F' ? 'Female' : 'Male'
}
function mapNationality(country) {
  if (!country || country.trim() === '') {
    return 'Bhutanese'
  }
  return country
}

const moveToStep3 = (citizenDetails) => {
  sessionStorage.setItem('user_data', JSON.stringify(citizenDetails))
  emit('go-to-next-step', 'step-three', citizenDetails)
}

const showNDILoginAlert = () => {
  Swal.fire({
    title: 'Coming Soon!',
    text: 'Login with NDI feature is coming soon. Stay tuned!',
    icon: 'info',
    confirmButtonColor: '#2B656F'
  })
}
</script>

<style scoped>
.rounded-number {
  background-color: #2b656f;
  color: #fff;
  height: 1rem;
  width: 1rem;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.reg-btn {
  background-color: #2b656f !important;
  width: 100%;
}

.text-muted {
  color: #2b656f !important;
}

.form-check-input {
  background-color: #2b656f !important;
}

.form-check-label {
  color: #2b656f !important;
}

.form {
  background-color: #2b656f24;
}

.step-line {
  border: none;
  height: 2px;
  background-color: #2b656f;
  /* Set your desired color */
}

.step-container {
  position: relative;
  text-align: center;
  transform: translateY(-43%);
}

.step-circle {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: #2b656f;
  border: 2px solid #2b656f;
  color: white;
  line-height: 30px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
  cursor: pointer;
  /* Added cursor pointer */
}

.custom-btn {
  background-color: #68b2a0;
  color: white;
  font-size: inherit;
  border: none;
  border-radius: 50px;
  cursor: pointer;
}

.form-group .row {
  margin-bottom: 20px;
  /* Increased spacing between rows */
}

.form-control,
.form-select {
  border-radius: 0.375rem;
  /* Rounded corners for inputs and selects */
  border: 1px solid #ced4da;
  /* Consistent border styling */
  padding: 0.5rem 0.75rem;
  /* Adjusted padding for better text visibility */
}

.form-label {
  margin-bottom: 0.5rem;
  /* Reduced space between label and input */
  font-weight: 600;
  /* Slightly bolder labels for better readability */
}

/* Optional: Add a subtle shadow to input fields for depth */
.form-control,
.form-select {
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease-in-out;
}

.form-control:focus,
.form-select:focus {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  /* Enhanced focus state */
}

/* input[type="radio"] {
    accent-color: #2B656F;
    scale: 1.2;
} */
</style>
