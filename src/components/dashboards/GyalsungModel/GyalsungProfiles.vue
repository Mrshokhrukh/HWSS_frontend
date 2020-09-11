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
import endpoints from '@/api';

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
    ].filter(Boolean);

    return searchableFields.some((field) => String(field).toLowerCase().includes(searchTerm));
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
    console.error('Failed to fetch gyalsung users:', err);
    error.value = 'Failed to fetch gyalsung users. Please try again.';
  } finally {
    loading.value = false;
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
          };

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
    fetchGyalsungUsers()
  });
  
  </script>
  
  <style scoped>
  .card-header.bg-teal {
    background-color: #2b656f !important;
  }
  
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
