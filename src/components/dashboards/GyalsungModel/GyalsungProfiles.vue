<template>
  <div class="profiles-container">
    <div class="form-header">
      <h3 class="title">Gyalsung Profiles</h3>
    </div>

    <div class="content-section">
      <div class="search-bar-container">
        <i class="fas fa-search search-icon"></i>
        <input v-model="search" type="text" class="search-input" placeholder="Search by Name, CID, Hospital..." />
      </div>

      <div v-if="error" class="error-alert" role="alert">
        <strong>Error:</strong> {{ error }}
      </div>

      <div class="table-wrapper">
        <table class="profiles-table">
          <thead>
            <tr>
              <th>Sl. No.</th>
              <th>Name</th>
              <th>CID</th>
              <th>DOB</th>
              <th>Personal Contact No.</th>
              <th>Appointment Date</th>
              <th>Hospital</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="8" class="state-cell">
                <div class="loader"></div>
                Loading users...
              </td>
            </tr>

            <tr v-for="(user, index) in filteredUsers" :key="user.id || user.identity_number || index">
              <td>{{ index + 1 }}</td>
              <td>{{ formatName(user) }}</td>
              <td>{{ user.identity_number || user.cid || '-' }}</td>
              <td>{{ formatDate(user.date_of_birth || user.dob) }}</td>
              <td>{{ user.mob_number || user.contact || '-' }}</td>
              <td>{{ formatDate(user.date_joined || user.appointmentDate) || '-' }}</td>
              <td>{{ user.hospital || '-' }}</td>
              <td>
                <span :class="getStatusClass(user.status)" class="status-badge">
                  {{ user.status || 'Registered' }}
                </span>
              </td>
            </tr>

            <tr v-if="!loading && filteredUsers.length === 0 && !error">
              <td colspan="8" class="state-cell">
                {{ search ? 'No users found matching your search' : 'No Gyalsung users found' }}
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
import axios from 'axios'
import endpoints from '@/api'

const users = ref([])
const loading = ref(false)
const error = ref('')
const search = ref('')

const filteredUsers = computed(() => {
  const searchTerm = search.value.trim().toLowerCase()
  if (!searchTerm) {
    return users.value
  }
  return users.value.filter((user) => {
    const fullName = formatName(user).toLowerCase()
    const searchableFields = [
      fullName,
      user.cid,
      user.contact,
      user.hospital,
      user.status,
      user.identity_number,
      user.mob_number
    ].filter(Boolean)
    return searchableFields.some((field) => String(field).toLowerCase().includes(searchTerm))
  })
})

const fetchGyalsungUsers = async () => {
  loading.value = true
  error.value = ''
  try {
    const token = localStorage.getItem('authToken')
    const response = await axios.get('http://127.0.0.1:8123/api/v1/gyalsung/counselor-users/', {
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

    users.value = userData.map((user) => ({
      ...user,
      id: user.id || user.user_id || user.userId,
      name:
        user.name ||
        user.full_name ||
        user.fullName ||
        `${user.first_name || user.firstName || ''} ${user.middle_name || user.middleName || ''} ${
          user.last_name || user.lastName || ''
        }`.trim() ||
        user.username ||
        '-',
      cid: user.cid || user.identity_number || user.identityNumber || user.citizen_id || user.citizenId || '-',
      dob: user.dob || user.date_of_birth || user.dateOfBirth || user.birth_date || user.birthDate,
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
        user.mob_number ||
        '-',
      appointmentDate:
        user.appointmentDate ||
        user.appointment_date ||
        user.scheduled_date ||
        user.scheduledDate ||
        user.booking_date ||
        user.bookingDate ||
        user.date_joined,
      hospital: user.hospital || user.hospital_name || user.hospitalName || user.clinic || user.facility || '-',
      status: user.status || user.appointment_status || user.appointmentStatus || 'Registered'
    }))
  } catch (err) {
    console.error('Failed to fetch gyalsung users:', err)
    error.value = 'Failed to fetch gyalsung users. Please try again.'
  } finally {
    loading.value = false
  }
}

const formatName = (user) => {
  const name =
    user.name ||
    `${user.first_name || ''} ${user.middle_name || ''} ${user.last_name || ''}`.replace(/\s+/g, ' ').trim()
  return name || '-'
}

const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        const parts = dateString.split('-');
        if (parts.length === 3 && isNaN(parseInt(parts[1], 10))) {
            const day = parts[0];
            const monthStr = parts[1];
            let year = parts[2];
            if (year.length === 2) {
                year = parseInt(year, 10) > 30 ? '19' + year : '20' + year;
            }
            const monthDate = new Date(`${day} ${monthStr} ${year}`);
            if (!isNaN(monthDate.getTime())) {
                return monthDate.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
            }
        }
        return dateString; // Return original string if parsing fails
    }
    return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
};


const getStatusClass = (status) => {
  switch (status?.toLowerCase()) {
    case 'registered':
      return 'status-registered'
    case 'screened':
      return 'status-screened'
    case 'pending':
      return 'status-pending'
    case 'cancelled':
    case 'rejected':
      return 'status-cancelled'
    default:
      return 'status-default'
  }
}

onMounted(() => {
  fetchGyalsungUsers()
})
</script>

<style scoped>
.profiles-container {
  background: linear-gradient(135deg, #e6f3f5, #f0f7f8);
  border-radius: 16px;
  padding: 2rem;
  font-family: sans-serif;
}

.form-header {
  text-align: center;
  margin-bottom: 2rem;
}

.title {
  color: #2b656f;
  font-weight: 600;
}

.content-section {
  background: #ffffff;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(43, 101, 111, 0.08);
}

/* Search Bar */
.search-bar-container {
  position: relative;
  margin-bottom: 2rem;
}

.search-icon {
  position: absolute;
  top: 50%;
  left: 1rem;
  transform: translateY(-50%);
  color: #9ab0b5;
}

.search-input {
  width: 100%;
  background: #f8fbfb;
  border: 1px solid rgba(43, 101, 111, 0.2);
  border-radius: 8px;
  padding: 0.8rem 1rem 0.8rem 2.5rem; /* Left padding for icon */
  color: #1d4851;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #2b656f;
  box-shadow: 0 0 0 3px rgba(43, 101, 111, 0.1);
  background: #fff;
}

/* Error Alert */
.error-alert {
  background-color: #fdeeee;
  color: #c93d3d;
  border: 1px solid #f8c9c9;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 2rem;
}

/* Table Styles */
.table-wrapper {
  overflow-x: auto;
}

.profiles-table {
  width: 100%;
  border-collapse: collapse;
  white-space: nowrap;
}

.profiles-table thead {
  background-color: #2b656f;
  color: #ffffff;
}

.profiles-table th {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.profiles-table td {
  padding: 1rem;
  vertical-align: middle;
  color: #3e5a60;
  font-size: 0.9rem;
}

.profiles-table tbody tr {
  border-bottom: 1px solid #e9f1f3;
  transition: background-color 0.2s ease-in-out;
}

.profiles-table tbody tr:last-child {
  border-bottom: none;
}

.profiles-table tbody tr:hover {
  background-color: #f5f9fa;
}

/* Status Badges */
.status-badge {
  display: inline-block;
  padding: 0.3rem 0.8rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: capitalize;
}

.status-registered { background-color: #e3f2fd; color: #1e88e5; }
.status-screened { background-color: #e8f5e9; color: #43a047; }
.status-pending { background-color: #fff8e1; color: #ffb300; }
.status-cancelled { background-color: #ffebee; color: #e53935; }
.status-default { background-color: #f5f5f5; color: #757575; }


/* Loading and Empty State */
.state-cell {
  text-align: center;
  color: #7d979d;
  padding: 3rem 1rem;
  font-style: italic;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.75rem;
}

.loader {
  width: 20px;
  height: 20px;
  border: 2px solid #2b656f;
  border-bottom-color: transparent;
  border-radius: 50%;
  display: inline-block;
  box-sizing: border-box;
  animation: rotation 1s linear infinite;
}

@keyframes rotation {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>