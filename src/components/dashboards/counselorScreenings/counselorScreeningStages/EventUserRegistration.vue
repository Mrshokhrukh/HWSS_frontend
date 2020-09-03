<template>
  <div>
    <div class="bg-white p-4">
      <div class="mb-3 text-center">
        <h4 class="mb-3">Description</h4>
        <h6 class="hwss-primary">*** This tool is for Event Screening Only ***</h6>
      </div>
      <form @submit.prevent="submitForm" :disabled="isFormDeactivated">
        <div class="px-5">
          <!-- Client Details Section -->
          <div class="mb-4 p-3">
            <h4 class="mb-3">Client Details</h4>
            <div class="row">
              <div class="col-md-4 mb-3">
                <label for="CID" class="form-label">CID / Student Code / Work Permit</label>
                <input type="text" class="form-control hwss-primary" id="CID" v-model="CID" />
              </div>

              <div class="col-md-4 mb-3">
                <label for="clientFullName" class="form-label">Full Name</label>
                <input
                  type="text"
                  class="form-control hwss-primary"
                  id="clientFullName"
                  v-model="clientFullName"
                  required
                />
              </div>
              <div class="col-md-4 mb-3">
                <label for="DOB" class="form-label">Date of Birth</label>
                <input
                  type="date"
                  class="form-control hwss-primary"
                  id="DOB"
                  v-model="DOB"
                  required
                />
              </div>
              <div class="col-md-4 mb-3">
                <label for="age" class="form-label">Age</label>
                <input
                  type="text"
                  class="form-control hwss-primary"
                  id="age"
                  :value="calculatedAge"
                  readonly
                  disabled
                />
              </div>
              <div class="col-md-4 mb-3">
                <label for="gender" class="form-label">Sex</label>
                <select class="form-select hwss-primary" id="gender" v-model="gender" required>
                  <option value="" disabled selected>Select Sex</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div v-if="showParentalStatus" class="col-md-4 mb-3">
                <label for="parentalStatus" class="form-label">Parental Status</label>
                <select
                  class="form-select hwss-primary"
                  id="parentalStatus"
                  v-model="parentalStatus"
                  required
                >
                  <option value="" disabled selected>Select Parental Status</option>
                  <option value="Married">Married</option>
                  <option value="Divorce">Divorce</option>
                  <option value="Single Parent">Single Parent</option>
                  <option value="One Deceased">One Deceased</option>
                </select>
              </div>
              <div class="col-md-4 mb-3">
                <label for="currentAddress" class="form-label">Current Address</label>
                <textarea
                  class="form-control hwss-primary"
                  id="currentAddress"
                  v-model="currentAddress"
                  rows="3"
                  required
                ></textarea>
              </div>
              <div class="col-md-4 mb-3">
                <label for="dzongkhag" class="form-label">Dzongkhag</label>
                <select
                  class="form-select hwss-primary"
                  id="dzongkhag"
                  v-model="dzongkhag"
                  required
                >
                  <option value="" disabled selected>Select Dzongkhag</option>
                  <!-- Dynamically generate options for all 20 dzongkhags of Bhutan -->
                  <option v-for="dzongkhag in dzongkhags" :key="dzongkhag" :value="dzongkhag">
                    {{ dzongkhag }}
                  </option>
                </select>
              </div>
              <div class="col-md-4 mb-3">
                <label for="phoneNumber" class="form-label">Phone Number</label>
                <input
                  type="tel"
                  class="form-control hwss-primary"
                  id="phoneNumber"
                  v-model="phoneNumber"
                  required
                  maxlength="8"
                />
              </div>
              <div class="col-md-4 mb-3">
                <label for="email" class="form-label">Email address (Optional)</label>
                <input type="email" class="form-control hwss-primary" id="email" v-model="email" />
              </div>
            </div>
          </div>
        </div>
      </form>
      <!-- Button Section -->
      <div class="d-flex justify-content-end">
        <button
          type="button"
          class="btn hwss-btn"
          :disabled="!isProceedButtonActive"
          @click="proceedToSelectTools"
        >
          Proceed to Select Tools <i class="fas fa-arrow-right"></i>
        </button>
      </div>
    </div>
    <div ref="swalDialog"></div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import apiClient from '@/apiClient'
import Swal from 'sweetalert2'
import endpoints from '@/api'

const emit = defineEmits(['proceedToSelectTools'])

const CID = ref('')
const clientFullName = ref('')
const DOB = ref('')
const gender = ref('')
const parentalStatus = ref('')
const currentAddress = ref('')
const phoneNumber = ref('')
const email = ref('')
const dzongkhag = ref('')

const dzongkhags = [
  'Bumthang',
  'Chhukha',
  'Dagana',
  'Gasa',
  'Haa',
  'Lhuentse',
  'Mongar',
  'Paro',
  'Pemagatshel',
  'Punakha',
  'Samdrup Jongkhar',
  'Samtse',
  'Sarpang',
  'Thimphu',
  'Trashigang',
  'Trashiyangtse',
  'Trongsa',
  'Tsirang',
  'Wangdue Phodrang',
  'Zhemgang'
]

const getCounselorName = JSON.parse(localStorage.getItem('userDetailsStore'))
const userRole = ref(getCounselorName?.user?.role || '')

const showParentalStatus = computed(() => {
  return userRole.value !== 'clinical_counselor'
})

const isProceedButtonActive = computed(() => {
  return (
    clientFullName.value !== '' &&
    DOB.value !== '' &&
    gender.value !== '' &&
    (showParentalStatus.value ? parentalStatus.value !== '' : true) &&
    currentAddress.value !== '' &&
    dzongkhag.value !== '' &&
    phoneNumber.value !== ''
  )
})

const submitForm = async () => {
  if (!showParentalStatus.value) {
    parentalStatus.value = 'None'
  }

  try {
    const username = await makeUserName()
    const getCounselorName = JSON.parse(localStorage.getItem('userDetailsStore'))

    if (getCounselorName && getCounselorName.user) {
      const userAgency = getCounselorName.agency?.agencyName || 'Unknown Agency'
      const userAgencyCode = getCounselorName.agency?.agencyCode || 'Unknown Code'

      let fallbackEmail =
        email.value && email.value.trim() !== '' ? email.value : generateBaseEmail(DOB.value)

      const formData = {
        userData: {
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
          dzongkhag: dzongkhag.value
        },
        userAgencyData: {
          agency: userAgencyCode
        },
        agencyData: {
          agency_code: userAgencyCode,
          agency_name: userAgency
        }
      }

      const response = await apiClient.post(endpoints.registerCounselorEventUser, formData)

      const userId = response.data.userId
      localStorage.setItem('ClientUserIdEventBase', userId)
      return response.data
    } else {
      throw new Error('User details not found in localStorage')
    }
  } catch (error) {
    console.error('Error submitting form:', error)

    if (error.response && error.response.data) {
      if (error.response.data.error.includes('duplicate key value violates unique constraint')) {
        retryCounter++
        if (retryCounter > 5) {
          Swal.fire({
            icon: 'error',
            title: 'Too Many Attempts',
            text: 'We were unable to generate a unique email address. Please contact support.'
          })
          throw new Error('Too many retries for email generation')
        }

        const newEmail = generateUniqueEmail(DOB.value)

        const confirmRetry = await Swal.fire({
          icon: 'info',
          title: retryCounter === 1 ? 'Email Auto-Generated' : 'Duplicate Email Detected',
          text:
            retryCounter === 1
              ? `You didn't provide an email. We generated one: ${newEmail}. Do you want to use it?`
              : `The generated email already exists. Retry with this email: ${newEmail}?`,
          showCancelButton: true,
          confirmButtonText: 'Proceed',
          cancelButtonText: 'Cancel'
        })

        if (confirmRetry.isConfirmed) {
          email.value = newEmail // Update email in the form model
          return submitForm() // Retry with the new email
        } else {
          throw new Error('User canceled retry')
        }
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Submission Error',
          text: error.response.data.error || 'An unknown error occurred.'
        })
      }
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Network or Server Error',
        text: 'Please check your internet connection or contact support.'
      })
    }

    throw error
  }
}

const getFirstAndLastName = () => {
  const nameParts = clientFullName.value.trim().split(' ').filter(Boolean)
  let firstName = ''
  let lastName = ''

  if (nameParts.length === 1) {
    firstName = nameParts[0]
    lastName = nameParts[0][0] // Initial of first name
  } else if (nameParts.length >= 2) {
    firstName = nameParts[0]
    lastName = nameParts[nameParts.length - 1]
  }

  return { firstName, lastName }
}

const generateBaseEmail = (dob) => {
  const { firstName, lastName } = getFirstAndLastName()
  const yearOfBirth = dob.slice(2, 4) // Last two digits of birth year
  const currentYear = new Date().getFullYear().toString().slice(-2) // Last two digits of current year
  const formattedFirstName = firstName.toLowerCase().replace(/[^a-z]/g, '')
  const formattedLastName = lastName.toLowerCase().replace(/[^a-z]/g, '')
  return `${formattedFirstName}_${formattedLastName}${yearOfBirth}${currentYear}@email.com`
}

let retryCounter = 0 // To limit retries and avoid infinite loops

const generateUniqueEmail = (dob) => {
  const { firstName, lastName } = getFirstAndLastName()
  const baseEmail = generateBaseEmail(dob)

  if (retryCounter === 0) return baseEmail

  const variations = [
    `${firstName[0]}${lastName}${dob.slice(2, 4)}`, // First initial + last name + birth year
    `${firstName}${lastName[0]}${dob.slice(2, 4)}`, // First name + last initial + birth year
    `${lastName}${dob.slice(2, 4)}${retryCounter}` // Last name + birth year + counter
  ]

  const variation = variations[retryCounter % variations.length]
  return `${variation.toLowerCase()}@email.com`
}

const calculatedAge = computed(() => {
  if (!DOB.value) return ''
  const birthDate = new Date(DOB.value)
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }

  let ageGroup
  if (age < 14) {
    ageGroup = 'Below 14'
  } else if (age >= 14 && age <= 17) {
    ageGroup = '15 to 17'
  } else {
    ageGroup = 'Above 18'
  }
  sessionStorage.setItem('clientAgeGroup', ageGroup)

  return age
})

const makeUserName = () => {
  return new Promise((resolve) => {
    const { firstName, lastName } = getFirstAndLastName()
    const dob = DOB.value
    const yearOfBirth = dob.slice(2, 4) // Last two digits of birth year

    let usernameBase = `${firstName.toLowerCase()}_${lastName.toLowerCase()}${yearOfBirth}`

    if (retryCounter > 0) {
      usernameBase += retryCounter // Append retryCounter to ensure uniqueness
    }

    resolve(usernameBase.replace(/[^a-z0-9_]/g, '')) // Remove special characters
  })
}

const proceedToSelectTools = async () => {
  try {
    const responseData = await submitForm()
    if (responseData) {
      emit('proceedToEventSelectTools')
    } else {
      // Handle case where form submission failed
      console.error('Form submission failed')
    }
  } catch (error) {
    console.error('Error submitting form:', error)
  }
}

watch(DOB, (newValue) => {
  if (newValue) {
    calculatedAge.value
  }
})
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