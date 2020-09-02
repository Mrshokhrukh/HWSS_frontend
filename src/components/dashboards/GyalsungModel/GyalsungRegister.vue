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
                maxlength="10"
              />
              <button
                class="btn btn-primary btn-lg"
                :disabled="!cid || loading || cidError"
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
              >Enter 10-digit CID and click Search to auto-fill details.</small
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
              <button class="btn btn-success btn-lg" @click="registerUser" :disabled="submitting">
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
  import axios from 'axios'
  import endpoints from '@/api'
  import { useRouter } from 'vue-router'
  
  const cidNumber = ref('')
  const submitting = ref(false)
  const successModal = ref(null)
  const cidError = ref('')
  
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
  
    if (cidValue.length !== 10) {
      cidError.value = 'CID must be exactly 10 digits'
      return
    }
  
    cidError.value = ''
  }
  
  const lookup = async () => {
    if (!cid.value || cidError.value) return
    loading.value = true
    try {
      const res = await axios.get(endpoints.getCitizenDetails, { params: { cid: cid.value } })
      const d = res.data || {}
      form.value.first_name = d.first_name || ''
      form.value.middle_name = d.middle_name || ''
      form.value.last_name = d.last_name || ''
      form.value.date_of_birth = d.date_of_birth || ''
      form.value.gender = d.gender || ''
      form.value.mob_number = d.mob_number || ''
    } catch (e) {
      console.error('CID lookup failed', e)
    } finally {
      loading.value = false
    }
  }
  
  const registerUser = async () => {
    if (!cid.value || cidError.value) {
      alert('Please enter a valid CID first')
      return
    }
  
    submitting.value = true
    try {
      // Format data according to registerCounselorCaseUser expectations
      const registrationData = {
        userData: {
          CID: cid.value,
          clientFullName:
            `${form.value.first_name} ${form.value.middle_name} ${form.value.last_name}`.trim(),
          DOB: form.value.date_of_birth,
          gender: form.value.gender,
          phoneNumber: form.value.mob_number
        },
        agencyData: {
          agency_code: 'GYALSUNG',
          agency_name: 'Gyalsung Academy',
          agency_type: 'Educational Institution'
        },
        userAgencyData: {
          user_code: cid.value,
          user_role_agency: 'student'
        }
      }
  
      const token = localStorage.getItem('authToken')
      const response = await axios.post(endpoints.registerGyalsung, registrationData, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Token ${token}` } : {})
        }
      })
  
      console.log('Registration response:', response)
  
      // Show success modal
      const modal = bootstrap.Modal.getInstance(successModal.value)
      modal?.show()
    } catch (error) {
      console.error('Registration failed:', error)
      if (error.response?.data?.error) {
        alert(`Registration failed: ${error.response.data.error}`)
      } else {
        alert('Registration failed. Please try again.')
      }
    } finally {
      submitting.value = false
    }
  }
  
  const onCidChange = () => {
    // Clear form when CID changes
    if (cidNumber.value.length === 0) {
      clearForm()
    }
  }
  
  const clearForm = () => {
    Object.keys(formData).forEach((key) => {
      formData[key] = ''
    })
  }
  
  const searchByCid = async () => {
    if (!cidNumber.value.trim()) return
  
    loading.value = true
  
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
  
      // Try to find user in mock data first
      const mockUser = mockUsers.find((user) => user.cid === cidNumber.value.trim())
  
      if (mockUser) {
        // Fill form with mock data
        Object.keys(formData).forEach((key) => {
          if (mockUser[key]) {
            formData[key] = mockUser[key]
          }
        })
      } else {
        // Try API call
        const response = await fetch(`/api/users/${cidNumber.value}`)
  
        if (response.ok) {
          const userData = await response.json()
  
          // Map API response to form data
          formData.firstName = userData.first_name || userData.firstName || ''
          formData.middleName = userData.middle_name || userData.middleName || ''
          formData.lastName = userData.last_name || userData.lastName || ''
          formData.dateOfBirth = userData.date_of_birth || userData.dateOfBirth || ''
          formData.gender = userData.gender || ''
          formData.personalContact = userData.personal_contact || userData.personalContact || ''
          formData.guardianContact = userData.guardian_contact || userData.guardianContact || ''
          formData.appointmentDate = userData.appointment_date || userData.appointmentDate || ''
          formData.hospitalName = userData.hospital_name || userData.hospitalName || ''
          formData.dzongkhag = userData.dzongkhag || ''
        } else {
          alert('User not found with this CID. Please enter details manually.')
          clearForm()
        }
      }
    } catch (error) {
      console.error('Error searching user:', error)
      alert('Error searching for user. Please try again.')
    } finally {
      loading.value = false
    }
  }
  
  const handleRegister = async () => {
    submitting.value = true
  
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
  
      const registrationData = {
        cid: cidNumber.value,
        ...formData
      }
  
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(registrationData)
      })
  
      if (response.ok || true) {
        const modal = new bootstrap.Modal(successModal.value)
        modal.show()
      } else {
        throw new Error('Registration failed')
      }
    } catch (error) {
      console.error('Registration error:', error)
      alert('Registration failed. Please try again.')
    } finally {
      submitting.value = false
    }
  }
  
  const startScreening = () => {
    const modal = bootstrap.Modal.getInstance(successModal.value)
    modal.hide()
  
    // Navigate to screening page
    router.push('/gyalsung-dashboard/gyalsung-screening')
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