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
              <button
                class="btn btn-primary btn-lg"
                @click="lookup"
                
              >
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
                <input v-model="form.first_name" class="form-control" />
              </div>
              <div class="col-md-4">
                <label class="form-label">Middle Name:</label>
                <input v-model="form.middle_name" class="form-control" />
              </div>
              <div class="col-md-4">
                <label class="form-label">Last Name:</label>
                <input v-model="form.last_name" class="form-control" />
              </div>
  
              <div class="col-md-4">
                <label class="form-label">Date Of Birth:</label>
                <input v-model="form.date_of_birth" type="date" class="form-control" />
              </div>
              <div class="col-md-4">
                <label class="form-label">Gender:</label>
                <select v-model="form.gender" class="form-select">
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
                <input v-model="form.guardian_contact" class="form-control" />
              </div>
              <div class="col-md-4">
                <label class="form-label">Appointment Date</label>
                <input v-model="form.appointment_date" type="date" class="form-control" />
              </div>
              <div class="col-md-4">
                <label class="form-label">Hospital Name</label>
                <input v-model="form.hospital" class="form-control" />
              </div>
  
              <div class="col-md-4">
                <label class="form-label">Dzongkhag</label>
                <input v-model="form.dzongkhag" class="form-control" />
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
  
      <div
        class="modal fade"
        id="successModal"
        tabindex="-1"
        ref="successModal"
        data-bs-backdrop="static"
      >
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content success-modal">
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
      username: "sezylub",
      is_staff: false,
      is_active: true,
      is_gyalsung: true,
      identity_number: "12203000121",
      nationality: "Bhutanese",
      first_name: "Rashme",
      middle_name: null,
      last_name: "Gurung",
      date_of_birth: "1984-05-14",
      gender: "Female",
      email: "rashmegurung123@druksmart.com",
      mob_number: "17648107",
      father_name: null,
      mother_name: null,
      perm_add_village: "Dugphey(Dubey)",
      perm_add_gewog: "Norgaygang/Bara",
      perm_add_dzongkhag: "Samtse",
      profile_picture: null,
      academy_code: null,
      date_joined: "2024-02-17T12:37:23.854000+06:00",
      role: "student",
      active_agency: null,
      active_agency_details: {
        agency_name: null,
        agency_code: null,
        agency_parent: null
      },
      gyalsung_status: "registered",
      registration_method: "gyalsung_registration"
    }
  ])
  
  const validateCid = () => {
    const cidValue = cid.value.trim()
  
    if (!cidValue) {
      cidError.value = ''
      return
    }
  
    if (!/^\d+$/.test(cidValue)) {
      cidError.value = 'CID must contain only numbers'
      return
    }
  
    if (cidValue.length !== 11) {
      cidError.value = 'CID must be exactly 11 digits'
      return
    }
  
    cidError.value = ''
  }
  
  const lookup = async () => {
    if (!cid.value || cidError.value) return
    loading.value = true
    userFound.value = false
    
    try {
      // Simulate CID lookup delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Find user with matching CID
      const userData = mockUsers.value.find(user => user.identity_number === cid.value);
      
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
    // Store the CID for screening
    localStorage.setItem('ClientUserIdCaseBase', JSON.stringify([cid.value]))
    
    // Show success modal directly without API call
    const modal = new bootstrap.Modal(successModal.value)
    modal.show()
  } catch (error) {
    console.error('Registration failed:', error)
    alert('Registration failed. Please try again.')
  } finally {
    submitting.value = false
  }
}
  
    submitting.value = true
    try {
      // Show success modal directly without API call
      const modal = new bootstrap.Modal(successModal.value)
      modal.show()
    } catch (error) {
      console.error('Registration failed:', error)
      alert('Registration failed. Please try again.')
    } finally {
      submitting.value = false
    }
  
  
  const startScreening = () => {
  const modal = bootstrap.Modal.getInstance(successModal.value)
  modal.hide()

  // Set flag to indicate we're in Gyalsung flow
  localStorage.setItem('isGyalsungFlow', 'true')
  
  // Store the user data for screening
  if (cid.value) {
    localStorage.setItem('gyalsungUserCID', cid.value)
    localStorage.setItem('gyalsungUserData', JSON.stringify(form.value))
  }
  
  // Navigate to gyalsung screening page
  router.push('/GyalsungModel/GyalsungScreening')
}
  
  onMounted(() => {})
  </script>
  
  <style scoped>
  .bg-color {
    background-color: #e8f6ee;
    min-height: 100vh;
  }
  .title-text {
    color: #2c6975;
    font-weight: 700;
  }
  .teal-panel {
    background-color: #2c6975;
    color: #fff;
  }
  .teal-panel .form-label {
    color: #fff;
    font-weight: 600;
  }
  
  .success-modal .modal-content {
    border: none;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  }
  
  .success-icon {
    color: #28a745;
    font-size: 4rem;
  }
  
  .success-title {
    color: #28a745;
    font-weight: 600;
  }
  
  .btn-start-screening {
    background-color: #5a9b9e;
    color: white;
    border: none;
    padding: 0.75rem 2rem;
    font-weight: 600;
    border-radius: 4px;
    font-size: 1rem;
  }
  
  .btn-start-screening:hover {
    background-color: #4a8b8e;
  }
  </style>