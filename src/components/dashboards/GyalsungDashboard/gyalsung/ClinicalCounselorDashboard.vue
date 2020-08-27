<template>
  <div class="">
    <div class="bg-white rounded">
      <TopNavbarCard />
    </div>

    <!-- category change basen on the route -->
    <div v-if="isRegisterRoute">
      <component :is="RegisterPage" />
    </div>
    <div v-else-if="isReportRoute">
      <component :is="GyalsungReport" />
    </div>
    <div v-else-if="isScreeningRoute">
      <component :is="GyalsungScreening" />
    </div>

    <div v-else>
      <div class="mb-3 pt-4">
        <input
          v-model="search"
          type="text"
          class="form-control form-control-lg rounded"
          placeholder="Type to Search..."
        />
      </div>

      <div v-if="error" class="alert alert-danger mb-3" role="alert">
        <strong>Error:</strong> {{ error }}
      </div>

      <div class="table-responsive">
        <table class="table table-striped align-middle">
          <thead class="table-teal text-white">
            <tr>
              <th scope="col" class="text-nowrap">Sl. No.</th>
              <th scope="col">Name</th>
              <th scope="col">CID</th>
              <th scope="col">DOB</th>
              <th scope="col" class="text-nowrap">Personal Contact No.</th>
              <th scope="col">Appointment Date</th>
              <th scope="col">Hospital</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="8" class="text-center text-muted py-4">
                <div class="spinner-border spinner-border-sm me-2" role="status"></div>
                Loading users...
              </td>
            </tr>

            <tr
              v-for="(user, index) in filteredUsers"
              :key="user.id || user.identity_number || index"
            >
              <td>{{ index + 1 }}</td>
              <td>{{ formatName(user) }}</td>
              <td>{{ user.identity_number || user.cid || '-' }}</td>
              <td>{{ formatDate(user.date_of_birth || user.dob) }}</td>
              <td>{{ user.mob_number || '-' }}</td>
              <td>{{ formatDate(user.date_joined) || '-' }}</td>
              <td class="text-wrap">{{ user.hospital || '-' }}</td>
              <td>
                <span :class="getStatusClass(user.status)" class="badge">
                  {{ user.status || 'Registered' }}
                </span>
              </td>
            </tr>

            <tr v-if="!loading && filteredUsers.length === 0 && !error">
              <td colspan="8" class="text-center text-muted py-4">
                {{ search ? 'No users found matching your search' : 'No public users found' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import endpoints from '@/api'
import RegisterPage from './GyalsungRegister.vue'
import TopNavbarCard from '@/components/navbar/TopNavbarCard.vue'
import GyalsungReport from './GyalsungReport.vue'
import GyalsungScreening from './GyalsungScreening.vue'

const users = ref([])
const loading = ref(false)
const error = ref('')
const search = ref('')
const route = useRoute()

const filteredUsers = computed(() => {
  const searchTerm = search.value.trim().toLowerCase()

  if (!searchTerm) {
    return users.value
  }

  return users.value.filter((user) => {
    const searchableFields = [user.name, user.cid, user.contact, user.hospital, user.status].filter(
      Boolean
    )

    return searchableFields.some((field) => String(field).toLowerCase().includes(searchTerm))
  })
})

const isRegisterRoute = computed(() => route.path === '/gyalsung-dashboard/register')
const isReportRoute = computed(() => route.path === '/gyalsung-dashboard/reports')
const isScreeningRoute = computed(() => route.path === '/gyalsung-dashboard/gyalsung-screening')

const fetchUsers = async () => {
  loading.value = true
  error.value = ''

  try {
    const token = localStorage.getItem('authToken')
    const response = await axios.get(endpoints.getUsers, {
      headers: token ? { Authorization: `Token ${token}` } : {},
      timeout: 10000
    })

    let userData = []
    if (Array.isArray(response.data)) {
      userData = response.data
    } else if (response.data?.user_details) {
      userData = response.data.user_details
    } else if (response.data?.data) {
      userData = response.data.data
    } else if (response.data?.users) {
      userData = response.data.users
    }

    users.value = userData
      .filter(
        (
          user // temporary filter users who is not gyalsung, actually it should be true
        ) =>
          String(user.role || '').toLowerCase() === 'general_public' && Boolean(!user?.is_gyalsung)
      )
      .map((user) => {
        const mappedUser = {
          ...user,
          id: user.id || user.user_id || user.userId,
          name:
            user.name ||
            user.full_name ||
            user.fullName ||
            `${user.first_name || user.firstName || ''} ${user.middle_name || user.middleName || ''} ${user.last_name || user.lastName || ''}`.trim() ||
            user.username ||
            '-',
          cid:
            user.cid ||
            user.identity_number ||
            user.identityNumber ||
            user.citizen_id ||
            user.citizenId ||
            '-',
          dob:
            user.dob || user.date_of_birth || user.dateOfBirth || user.birth_date || user.birthDate,
          contact:
            user.contact ||
            user.mobile_number ||
            user.mobileNumber ||
            user.phone_number ||
            user.phoneNumber ||
            user.personal_contact ||
            user.personalContact ||
            user.phone ||
            user.mobile ||
            '-',
          appointmentDate:
            user.appointmentDate ||
            user.appointment_date ||
            user.appointmentDate ||
            user.scheduled_date ||
            user.scheduledDate ||
            user.booking_date ||
            user.bookingDate,
          hospital:
            user.hospital ||
            user.hospital_name ||
            user.hospitalName ||
            user.clinic ||
            user.facility ||
            '-',
          status: user.status || user.appointment_status || user.appointmentStatus || 'Registered'
        }

        return mappedUser
      })
  } catch (err) {
    console.error('Failed to fetch users:', err)
  } finally {
    loading.value = false
  }
}

const formatName = (user) => {
  if (user.name) return user.name
  const parts = [user.firstName, user.middleName, user.lastName].filter(Boolean)
  return parts.length > 0 ? parts.join(' ') : '-'
}

const formatDate = (dateString) => {
  if (!dateString) return '-'

  let date

  // Handle various date formats that might come from API
  if (dateString.includes('-')) {
    // Handle formats like "06-Oct-87", "11-Apr-06", "2023-10-06"
    const parts = dateString.split('-')
    if (parts.length === 3) {
      // Check if it's DD-MMM-YY format
      if (isNaN(parts[1])) {
        const monthMap = {
          Jan: '01',
          Feb: '02',
          Mar: '03',
          Apr: '04',
          May: '05',
          Jun: '06',
          Jul: '07',
          Aug: '08',
          Sep: '09',
          Oct: '10',
          Nov: '11',
          Dec: '12'
        }
        const day = parts[0].padStart(2, '0')
        const month = monthMap[parts[1]] || '01'
        let year = parts[2]
        // Convert 2-digit year to 4-digit (assuming 00-30 is 2000s, 31-99 is 1900s)
        if (year.length === 2) {
          year = parseInt(year) <= 30 ? `20${year}` : `19${year}`
        }
        date = new Date(`${year}-${month}-${day}`)
      } else {
        // Handle YYYY-MM-DD or DD-MM-YY format
        date = new Date(dateString)
      }
    }
  } else {
    date = new Date(dateString)
  }

  if (isNaN(date.getTime())) {
    return dateString // Return original if can't parse
  }

  // Format as MM/DD/YYYY
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const year = date.getFullYear()

  return `${month}/${day}/${year}`
}

const getStatusClass = (status) => {
  switch (status?.toLowerCase()) {
    case 'registered':
      return 'bg-primary text-white'
    case 'screened':
      return 'bg-success text-white'
    case 'pending':
      return 'bg-warning text-dark'
    case 'cancelled':
      return 'bg-danger text-white'
    default:
      return 'bg-secondary text-white'
  }
}

onMounted(() => {
  fetchUsers()
})
</script>

<style scoped>
.table-teal {
  background-color: #2b656f;
}

.table th {
  font-weight: 600;
  border-bottom: 2px solid #2b656f;
}

.table td {
  vertical-align: middle;
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}

.badge {
  font-size: 0.75rem;
  padding: 0.375rem 0.75rem;
}
</style>
