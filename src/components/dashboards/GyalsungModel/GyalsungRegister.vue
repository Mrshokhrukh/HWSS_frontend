<template>
  <div class="container-fluid bg-color pt-3">
    <div class="row mb-3">
      <div class="col-12">
        <div class="card p-4 shadow-sm">
          <label class="form-label fw-semibold">Entrant CID#:</label>
          <div class="d-flex gap-2">
            <input
              v-model="cid"
              type="text"
              class="form-control form-control-lg"
              placeholder="Enter CID"
              :class="{ 'is-invalid': cidError }"
              @input="validateCid"
              maxlength="11"
            />
            <button class="btn btn-primary btn-lg" @click="lookup" :disabled="loading">
              <span v-if="!loading">Search</span>
              <span v-else>Searching...</span>
            </button>
          </div>
          <div v-if="cidError" class="invalid-feedback d-block">
            {{ cidError }}
          </div>
          <small class="text-muted mt-2 d-block"
            >Enter 11-digit CID and click Search to auto-fill details.</small
          >
        </div>
      </div>
    </div>

    <div class="row">
      <div class="col-12">
        <div class="card p-4 shadow-sm teal-panel">
          <div class="row g-4">
            <div class="col-md-4">
              <label class="form-label">First Name:</label>
              <input v-model="form.first_name" class="form-control" readonly />
            </div>
            <div class="col-md-4">
              <label class="form-label">Middle Name:</label>
              <input v-model="form.middle_name" class="form-control" readonly />
            </div>
            <div class="col-md-4">
              <label class="form-label">Last Name:</label>
              <input v-model="form.last_name" class="form-control" readonly />
            </div>

            <div class="col-md-4">
              <label class="form-label">Date Of Birth:</label>
              <input v-model="form.date_of_birth" type="date" class="form-control" readonly />
            </div>
            <div class="col-md-4">
              <label class="form-label">Gender:</label>
              <select v-model="form.gender" class="form-select" disabled>
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div class="col-md-4">
              <label class="form-label">Personal Contact#</label>
              <input v-model="form.mob_number" class="form-control" />
            </div>

            <div class="col-md-4">
              <label class="form-label">Guardian Contact#</label>
              <input v-model="form.guardian_contact" class="form-control" readonly />
            </div>
            <div class="col-md-4">
              <label class="form-label">Appointment Date</label>
              <input v-model="form.appointment_date" type="date" class="form-control" readonly />
            </div>
            <div class="col-md-4">
              <label class="form-label">Hospital Name</label>
              <input v-model="form.hospital" class="form-control" readonly />
            </div>

            <div class="col-md-4">
              <label class="form-label">Dzongkhag</label>
              <input v-model="form.dzongkhag" class="form-control" readonly />
            </div>
            <div class="col-md-4">
              <label class="form-label">Academy</label>
              <input v-model="form.academy" class="form-control" readonly />
            </div>
            <div class="col-md-4">
              <label class="form-label">Personal Number</label>
              <input v-model="form.personal_number" class="form-control" readonly />
            </div>
          </div>

          <div class="d-flex justify-content-end mt-4">
            <button
              class="btn btn-success btn-lg"
              @click="registerUser"
              :disabled="submitting || !userFound"
            >
              <span v-if="!submitting">REGISTER</span>
              <span v-else>Registering...</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- SUCCESS MODAL -->
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import endpoints from '@/api'
import { Modal } from 'bootstrap' // Import Bootstrap Modal

const submitting = ref(false);
const successModal = ref(null);
const cidError = ref('');
const userFound = ref(false);

const router = useRouter();
const cid = ref('');
const loading = ref(false);

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
  dzongkhag: '',
  academy: '',
  personal_number: ''
})

const validateCid = () => {
  const cidValue = cid.value.trim()

  if (!cidValue) {
    cidError.value = ''
    return
  }

  if (!/^\d+$/.test(cidValue)) {
    cidError.value = 'CID must contain only numbers'
  } else if (cidValue.length !== 11) {
    cidError.value = 'CID must be exactly 11 digits'
  } else {
    cidError.value = ''
  }
}

const lookup = async () => {
  if (!cid.value || cidError.value) return
  loading.value = true
  userFound.value = false

  try {
    const response = await fetch(endpoints.getGyalsungUserData, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ cid: cid.value })
    })

    if (!response.ok) {
      throw new Error('Failed to fetch user data')
    }

    const userData = await response.json()

    if (userData) {
      const formatDate = (dateString) => {
        if (!dateString) return ''
        const parts = dateString.split('/')
        if (parts.length === 3) {
          return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`
        }
        return dateString
      }

      form.value.first_name = userData.first_name || ''
      form.value.middle_name = userData.middle_name || ''
      form.value.last_name = userData.last_name || ''
      form.value.date_of_birth = formatDate(userData.date_of_birth) || ''
      form.value.gender = userData.gender || ''
      form.value.mob_number = userData.mob_number || ''
      form.value.guardian_contact = userData.guard_contact_number || ''
      form.value.appointment_date = formatDate(userData.appointment_date) || ''
      form.value.hospital = userData.hospital_name || ''
      form.value.dzongkhag = userData.hospital_dzongkhag || ''
      form.value.academy = userData.academy || ''
      form.value.personal_number = userData.personal_number || ''

      userFound.value = true
    } else {
      alert('User not found with this CID. Please enter details manually.')
      userFound.value = false
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
    alert('Please enter a valid CID and search for a user first')
    return
  }

  submitting.value = true
  try {
    const requestData = {
      cid: cid.value
    }

    const token = localStorage.getItem('authToken')

    if (!token) {
      alert('Authentication error. The counselor is not logged in or the session has expired.')
      submitting.value = false
      return
    }

    console.log('Sending registration request:', requestData)


    const response = await fetch(endpoints.registerGyalsungUser, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData)
    })
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error(
          'Authentication failed. Your session may have expired. Please log out and log in again.'
        )
      }
      const errorText = await response.text()
      console.error('Server response:', errorText)
      throw new Error(`Failed to register user: ${response.status} ${response.statusText}`)
    }
    
    const result = await response.json()
    console.log('Registration successful:', result)
    
    // Store the CID for screening
    localStorage.setItem('ClientUserIdCaseBase', JSON.stringify([cid.value]))
    
    // Show success modal using imported Modal
    const modal = new Modal(successModal.value)
    modal.show()
  } catch (error) {
    console.error('Registration failed:', error);
    alert(`Registration failed: ${error.message}. Please try again.`);
  } finally {
    submitting.value = false;
  }
}

const startScreening = () => {
  const modal = Modal.getInstance(successModal.value);
  modal.hide();

  // Set flag to indicate we're in Gyalsung flow
  localStorage.setItem('isGyalsungFlow', 'true')
  
  // Store the user data for screening
  if (cid.value) {
    localStorage.setItem('gyalsungUserCID', cid.value);
    localStorage.setItem('gyalsungUserData', JSON.stringify(form.value));
  }
  
  // Navigate to gyalsung screening page
  router.push('/GyalsungModel/GyalsungScreening')
}


</script>

<style scoped>
.screening-form-container {
  background: linear-gradient(135deg, #e6f3f5, #f0f7f8);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(43, 101, 111, 0.08);
  font-family: sans-serif;
  max-width: 1200px;
  margin: 2rem auto;
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

label,
.form-label {
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

input:read-only,
input:disabled,
select:disabled {
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