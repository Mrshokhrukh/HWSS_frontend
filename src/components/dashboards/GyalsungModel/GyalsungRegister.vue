<template>
  <div class="screening-form-container">
    <div class="form-header">
      <h3 class="title">Gyalsung Entrant Registration</h3>
      <div class="warning-badge">*** Please use a valid 11-digit CID# for lookup ***</div>
    </div>

    <div class="form-section">
      <div class="section-header">
        <h4>CID Lookup</h4>
        <div class="section-divider"></div>
      </div>
      <label for="cid-input" class="form-label">Entrant CID#:</label>
      <div class="lookup-wrapper">
        <input
          id="cid-input"
          v-model="cid"
          type="text"
          placeholder="Enter 11-digit CID"
          :class="{ 'is-invalid': cidError }"
          @input="validateCid"
          maxlength="11"
        />
        <button class="lookup-button" @click="lookup">
          <span v-if="!loading">Search</span>
          <span v-else>Searching...</span>
        </button>
      </div>
      <div v-if="cidError" class="error-text">
        {{ cidError }}
      </div>
      <small class="help-text">Enter CID and click Search to auto-fill details.</small>
    </div>

    <div class="form-section">
      <div class="section-header">
        <h4>Entrant Details</h4>
        <p class="section-subtitle">Ensure all details are correct before registering.</p>
        <div class="section-divider"></div>
      </div>
      <div class="form-grid">
        <div class="form-group">
          <label>First Name:</label>
          <input v-model="form.first_name" readonly />
        </div>
        <div class="form-group">
          <label>Middle Name:</label>
          <input v-model="form.middle_name" readonly />
        </div>
        <div class="form-group">
          <label>Last Name:</label>
          <input v-model="form.last_name" readonly />
        </div>

        <div class="form-group">
          <label>Date Of Birth:</label>
          <input v-model="form.date_of_birth" type="date" readonly />
        </div>
        <div class="form-group">
          <label>Gender:</label>
          <select v-model="form.gender" disabled>
            <option value="">Select</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div class="form-group">
          <label>Personal Contact#</label>
          <input v-model="form.mob_number" />
        </div>

        <div class="form-group">
          <label>Guardian Contact#</label>
          <input v-model="form.guardian_contact" />
        </div>
        <div class="form-group">
          <label>Appointment Date</label>
          <input v-model="form.appointment_date" type="date" />
        </div>
        <div class="form-group">
          <label>Hospital Name</label>
          <input v-model="form.hospital" />
        </div>
        <div class="form-group">
          <label>Dzongkhag</label>
          <input v-model="form.dzongkhag" readonly />
        </div>
      </div>
    </div>

    <div class="form-actions">
      <button
        type="button"
        class="proceed-button"
        @click="registerUser"
        :disabled="submitting || !userFound"
      >
        <span v-if="!submitting">REGISTER</span>
        <span v-else>Registering...</span>
        <i class="fas fa-arrow-right"></i>
      </button>
    </div>

    <div
      class="modal fade"
      id="successModal"
      tabindex="-1"
      ref="successModal"
      data-bs-backdrop="static"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-body text-center p-5">
            <div class="success-icon mb-4">
              <i class="fas fa-check-circle"></i>
            </div>
            <h4 class="success-title mb-4">Entrant Registered Successfully</h4>
            <button type="button" class="btn btn-start-screening" @click="startScreening">
              Start Screening
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const submitting = ref(false)
const successModal = ref(null)
const cidError = ref('')
const userFound = ref(false)

const router = useRouter()
const cid = ref('')
const loading = ref(false)

const form = ref({
  first_name: '',
  middle_name: '',
  last_name: '',
  date_of_birth: '',
  gender: '',
  mob_number: '',
  guardian_contact: '',
  appointment_date: '',
  hospital: '',
  dzongkhag: ''
})

// Mock user data based on your JSON
const mockUsers = ref([
  {
    id: 6,
    username: 'sezylub',
    is_staff: false,
    is_active: true,
    is_gyalsung: true,
    identity_number: '12203000121',
    nationality: 'Bhutanese',
    first_name: 'Rashme',
    middle_name: null,
    last_name: 'Gurung',
    date_of_birth: '1984-05-14',
    gender: 'Female',
    email: 'rashmegurung123@druksmart.com',
    mob_number: '17648107',
    father_name: null,
    mother_name: null,
    perm_add_village: 'Dugphey(Dubey)',
    perm_add_gewog: 'Norgaygang/Bara',
    perm_add_dzongkhag: 'Samtse',
    profile_picture: null,
    academy_code: null,
    date_joined: '2024-02-17T12:37:23.854000+06:00',
    role: 'student',
    active_agency: null,
    active_agency_details: {
      agency_name: null,
      agency_code: null,
      agency_parent: null
    },
    gyalsung_status: 'registered',
    registration_method: 'gyalsung_registration'
  }
])

const validateCid = () => {
  const cidValue = cid.value.trim()

  if (!cidValue) {
    cidError.value = ''
    userFound.value = false;
    return
  }

  if (!/^\d+$/.test(cidValue)) {
    cidError.value = 'CID must contain only numbers'
    userFound.value = false;
    return
  }

  if (cidValue.length !== 11) {
    cidError.value = 'CID must be exactly 11 digits'
    userFound.value = false;
    return
  }

  cidError.value = ''
}

const clearForm = () => {
  form.value = {
    first_name: '',
    middle_name: '',
    last_name: '',
    date_of_birth: '',
    gender: '',
    mob_number: '',
    guardian_contact: '',
    appointment_date: '',
    hospital: '',
    dzongkhag: ''
  };
};

const lookup = async () => {
  validateCid();
  if (!cid.value || cidError.value) {
      clearForm();
      userFound.value = false;
      return;
  }
  loading.value = true
  userFound.value = false
  clearForm();

  try {
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const userData = mockUsers.value.find(
      (user) => user.identity_number === cid.value
    )

    if (userData) {
      form.value.first_name = userData.first_name || ''
      form.value.middle_name = userData.middle_name || ''
      form.value.last_name = userData.last_name || ''
      form.value.date_of_birth = userData.date_of_birth || ''
      form.value.gender = userData.gender || ''
      form.value.mob_number = userData.mob_number || ''
      form.value.dzongkhag = userData.perm_add_dzongkhag || ''
      userFound.value = true
    } else {
      alert('User not found with this CID. Please enter details manually.')
      userFound.value = false // Although it enables the form, the register button remains disabled
    }
  } catch (error) {
    console.error('CID lookup failed', error)
    alert('Error searching for user. Please try again.')
    userFound.value = false
  } finally {
    loading.value = false
  }
}

const registerUser = async () => {
  if (!cid.value || cidError.value || !userFound.value) {
    alert('Please enter a valid CID and successfully find a user first.')
    return
  }

  submitting.value = true
  try {
    localStorage.setItem('ClientUserIdCaseBase', JSON.stringify([cid.value]))
    const modal = new bootstrap.Modal(successModal.value)
    modal.show()
  } catch (error) {
    console.error('Registration failed:', error)
    alert(`Registration failed: ${error.message}. Please try again.`)
  } finally {
    submitting.value = false
  }
}

const startScreening = () => {

const startScreening = () => {
  const modal = bootstrap.Modal.getInstance(successModal.value)
  modal.hide()

  localStorage.setItem('isGyalsungFlow', 'true')

  if (cid.value) {
    localStorage.setItem('gyalsungUserCID', cid.value)
    localStorage.setItem('gyalsungUserData', JSON.stringify(form.value))
  }

  router.push('/GyalsungModel/GyalsungScreening')
}

onMounted(() => {
 
})
</script>

<style scoped>
.screening-form-container {
  background: linear-gradient(135deg, #e6f3f5, #f0f7f8);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(43, 101, 111, 0.08);
  font-family: sans-serif;
}

.form-header {
  text-align: center;
  margin-bottom: 2rem;
}

.title {
  color: #2b656f;
  font-weight: 600;
  margin-bottom: 1rem;
}

.warning-badge {
  display: inline-block;
  background: rgba(43, 101, 111, 0.1);
  color: #2b656f;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 500;
}

/* Form Sections */
.form-section {
  background: rgba(255, 255, 255, 0.7);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  border: 1px solid rgba(43, 101, 111, 0.1);
  box-shadow: 0 2px 10px rgba(43, 101, 111, 0.05);
  transition: all 0.3s ease;
}
.form-section:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(43, 101, 111, 0.08);
}

.section-header {
  margin-bottom: 1.5rem;
}

.section-header h4 {
  color: #2b656f;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.section-subtitle {
  color: #1d4851;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  opacity: 0.8;
}

.section-divider {
  height: 2px;
  background: linear-gradient(to right, rgba(43, 101, 111, 0.2), transparent);
  margin-top: 0.5rem;
}

/* Form Grid & Groups */
.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.form-group {
  position: relative;
}

label, .form-label {
  display: block;
  color: #1d4851;
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
  color: #1d4851;
  font-size: 1rem;
  transition: all 0.3s ease;
}

input:focus,
select:focus,
textarea:focus {
  outline: none;
  border-color: #2b656f;
  box-shadow: 0 0 0 3px rgba(43, 101, 111, 0.1);
}

input:hover,
select:hover,
textarea:hover {
  border-color: rgba(43, 101, 111, 0.4);
}

input:read-only, input:disabled, select:disabled {
  background-color: #f0f3f4;
  cursor: not-allowed;
  opacity: 0.7;
}

select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%232B656F' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.5rem center;
  background-size: 1.5em;
  padding-right: 2.5rem;
}
.lookup-wrapper {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}
.lookup-wrapper input {
  flex-grow: 1;
}
.lookup-button {
  background-color: #2b656f;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease;
  white-space: nowrap;
}
.lookup-button:hover {
  background-color: #1d4851;
}
.error-text {
  color: #d9534f;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}
.help-text {
  color: #555;
  font-size: 0.8rem;
  margin-top: 0.5rem;
  display: block;
}
input.is-invalid {
    border-color: #d9534f;
}

/* Action Buttons */
.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 2rem;
}

.proceed-button {
  background: linear-gradient(135deg, #2b656f 0%, #1d4851 100%);
  color: white;
  border: none;
  border-radius: 25px;
  padding: 0.75rem 1.5rem;
  font-weight: 500;
  font-size: 1rem;
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
.modal-content {
  border: none;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.success-icon {
  color: #28a745;
  font-size: 4rem;
}

.success-title {
  color: #222;
  font-weight: 600;
}

.btn-start-screening {
  background-color: #2b656f;
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  font-weight: 600;
  border-radius: 8px;
  font-size: 1rem;
  transition: background-color 0.3s ease;
}

.btn-start-screening:hover {
  background-color: #1d4851;
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