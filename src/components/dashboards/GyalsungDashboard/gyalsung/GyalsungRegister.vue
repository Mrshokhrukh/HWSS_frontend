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
            />
            <button class="btn btn-primary btn-lg" :disabled="!cid || loading" @click="lookup">
              <span v-if="!loading">Search</span>
              <span v-else>Searching...</span>
            </button>
          </div>
          <small class="text-muted mt-2 d-block"
            >Enter CID and click Search to auto-fill details.</small
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
            <button class="btn btn-success btn-lg" @click="goNext">Next</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import endpoints from '@/api'
import { useRouter } from 'vue-router'

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

const lookup = async () => {
  if (!cid.value) return
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

const goNext = () => {
  router.push('/gyalsung-clinical-counselor-dashboard/gyalsung-screening')
}
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
</style>
