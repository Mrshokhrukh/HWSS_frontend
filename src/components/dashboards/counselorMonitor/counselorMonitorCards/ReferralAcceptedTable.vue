<template>
  <div>
    <div class="card">
      <DataTable
        v-model:filters="filters"
        :value="acceptedReferrals"
        paginator
        :rows="10"
        dataKey="id"
        filterDisplay="menu"
        :loading="loading"
        scrollable
        scrollHeight="400px"
        :globalFilterFields="[
          'name',
          'age',
          'gender',
          'date',
          'referral_status',
          'referred_by',
          'assessment_status',
          'counseling_status',
          'follow_up',
          'comments'
        ]"
        tableStyle="min-width: 75rem"
        striped
        class="p-datatable-sm"
        @filter="onFilter"
      >
        <template #header>
          <div class="flex justify-content-between">
            <span class="p-input-icon-left"> </span>
            <Button
              type="button"
              icon="pi pi-filter-slash"
              label="Clear Table Filters"
              outlined
              @click="clearTableFilters()"
            />
          </div>
        </template>
        <template #empty> No accepted referrals found for you. </template>
        <template #loading> Loading your accepted referrals. Please wait. </template>

        <Column field="date" header="Date" :sortable="true">
          <template #body="{ data }">
            {{ new Date(data.date).toLocaleDateString() }}
          </template>
        </Column>
        <Column field="name" header="Name" :sortable="true" />
        <Column field="age" header="Age" :sortable="true" />
        <Column field="gender" header="Gender" :sortable="true" />
        <!-- <Column field="referred_to" header="Referred To" :sortable="true" /> -->
        <!-- This is 'me' -->
        <Column field="referred_by" header="Referred By" :sortable="true" />
        <Column field="referral_status" header="Status" :sortable="true">
          <template #body="{ data }">
            <Tag
              :value="data.referral_status"
              :severity="getStatusSeverity(data.referral_status)"
            />
          </template>
        </Column>
        <Column field="assessment_status" header="Assessment" :sortable="true">
          <template #body="{ data }">
            <Tag
              :value="data.assessment_status"
              :severity="getStatusSeverity(data.assessment_status)"
            />
          </template>
        </Column>
        <Column field="counseling_status" header="Counseling" :sortable="true">
          <template #body="{ data }">
            <Tag
              :value="data.counseling_status"
              :severity="getStatusSeverity(data.counseling_status)"
            />
          </template>
        </Column>
        <Column field="follow_up" header="Follow-up" :sortable="true" />
        <Column field="comments" header="Comments" :sortable="true">
          <template #body="{ data }">
            <Button
              icon="pi pi-comment"
              class="p-button-text"
              @click="showComments(data.comments)"
            />
          </template>
        </Column>
      </DataTable>
    </div>

    <Dialog v-model:visible="commentsVisible" header="Comments" :style="{ width: '50vw' }">
      <p>{{ selectedComments }}</p>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { FilterMatchMode, FilterOperator } from 'primevue/api' // FilterOperator might be needed for complex filters
import apiClient from '@/apiClient'
import endpoints from '@/api'
// PrimeVue components used in template are auto-imported if using unplugin-vue-components
// otherwise import them:
// import DataTable from 'primevue/datatable';
// import Column from 'primevue/column';
// import Button from 'primevue/button';
// import Tag from 'primevue/tag';
// import Dialog from 'primevue/dialog';
// import InputText from 'primevue/inputtext';

const props = defineProps({
  userId: {
    type: [String, Number],
    required: true
  },
  searchQuery: {
    type: String,
    default: ''
  }
})

const filters = ref({})
const loading = ref(true)
const referralList = ref([]) // Raw list from API
const serviceAndTreatmentList = ref([]) // Raw list from API
const commentsVisible = ref(false)
const selectedComments = ref('')
// const currentUserId = ref(null); // This will now come from props.userId

const initFilters = () => {
  filters.value = {
    global: { value: props.searchQuery || null, matchMode: FilterMatchMode.CONTAINS }, // Initialize with parent's search
    date: {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }]
    }, // Example: Filter by exact date
    name: {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }]
    },
    age: {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }]
    },
    gender: {
      operator: FilterOperator.OR,
      constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }]
    },
    // referred_to: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] }, // Not needed for this table
    referred_by: {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }]
    },
    referral_status: {
      operator: FilterOperator.OR,
      constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }]
    }, // Should always be 'accepted' due to acceptedReferrals computed
    assessment_status: {
      operator: FilterOperator.OR,
      constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }]
    },
    counseling_status: {
      operator: FilterOperator.OR,
      constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }]
    },
    follow_up: {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }]
    }
    // comments: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] } // Comments are usually long, direct filter might not be best UX
  }
}

watch(
  () => props.searchQuery,
  (newValue) => {
    if (filters.value.global) {
      filters.value.global.value = newValue
    } else {
      // Should not happen if initFilters is called correctly
      filters.value.global = { value: newValue, matchMode: FilterMatchMode.CONTAINS }
    }
  }
)

const clearTableFilters = () => {
  initFilters() // This will reset column filters and global filter based on current props.searchQuery
  // If you want the table's clear button to also clear the parent's search, you'd emit an event.
  // For now, it only clears this table's filters. The global filter will be repopulated from props.searchQuery.
}

// This function is useful if you want to manually handle filter events,
// but DataTable typically handles it internally with v-model:filters.
// const onFilter = (event) => {
//   console.log('DataTable filtered:', event.filters);
//   filters.value = event.filters;
// };

const combinedReferrals = computed(() => {
  if (!props.userId) return []
  return referralList.value
    .filter((referral) => referral.referred_to && referral.referred_to.user_id === props.userId) // Filter by current user first
    .map((referral) => {
      const serviceData =
        serviceAndTreatmentList.value.find(
          (service) => service.user && service.user.id === referral.user_data.patient_id // Ensure service.user exists
        ) || {}
      return {
        id: referral.user_data.patient_id, // Ensure this ID is unique for dataKey
        date: referral.date,
        name: referral.user_data.name,
        age: referral.user_data.age,
        gender: referral.user_data.gender,
        referred_to: referral.referred_to.name, // Will be current user's name
        referred_by: referral.referred_by.username,
        referral_status: referral.referral_status,
        assessment_status: serviceData.assessment_status || 'Not Available',
        counseling_status: serviceData.counseling || 'Not Available',
        follow_up: serviceData.follow_up || 'Not Available',
        comments: serviceData.comments || 'No comments'
        // referred_to_id: referral.referred_to.user_id // Already used for filtering
      }
    })
})

const acceptedReferrals = computed(() => {
  return combinedReferrals.value.filter(
    (referral) => referral.referral_status && referral.referral_status.toLowerCase() === 'accepted'
  )
})

const getStatusSeverity = (status) => {
  if (!status) return 'info'
  const statusLower = status.toLowerCase()
  if (
    statusLower.includes('complete') ||
    statusLower === 'accepted' ||
    statusLower === 'conducted' ||
    statusLower === 'availed'
  )
    return 'success'
  if (
    statusLower.includes('progress') ||
    statusLower === 'scheduled' ||
    statusLower === 'waiting list'
  )
    return 'warning'
  if (statusLower.includes('not') || statusLower === 'pending' || statusLower.includes('rejected'))
    return 'danger' // Added rejected
  return 'info'
}

const showComments = (commentsText) => {
  selectedComments.value = commentsText
  commentsVisible.value = true
}

const fetchData = async () => {
  if (!props.userId) {
    loading.value = false
    console.warn('User ID not available for fetching accepted referrals.')
    referralList.value = []
    serviceAndTreatmentList.value = []
    return
  }
  loading.value = true
  try {
    const [referralResponse, serviceResponse] = await Promise.all([
      apiClient.get(endpoints.getReferralList), // Fetches all, filtering happens in computed props
      apiClient.get(endpoints.generateServiceAndTreatment)
    ])

    if (
      referralResponse?.data?.referral_list &&
      Array.isArray(referralResponse.data.referral_list)
    ) {
      referralList.value = referralResponse.data.referral_list
    } else {
      console.error('Invalid referral response format:', referralResponse)
      referralList.value = []
    }

    if (serviceResponse?.data?.data && Array.isArray(serviceResponse.data.data)) {
      serviceAndTreatmentList.value = serviceResponse.data.data
    } else {
      console.error('Invalid service response format:', serviceResponse)
      serviceAndTreatmentList.value = []
    }
  } catch (error) {
    console.error('Error fetching accepted referrals data:', error)
    referralList.value = []
    serviceAndTreatmentList.value = []
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  initFilters()
  // getUserDetailsFromLocalStorage(); // Not needed, userId comes from prop
  if (props.userId) {
    await fetchData()
  } else {
    loading.value = false // Ensure loading is false if no userId
  }
})

// Refetch if userId changes (e.g., on login/logout if this component isn't destroyed)
watch(
  () => props.userId,
  async (newUserId) => {
    if (newUserId) {
      await fetchData()
    } else {
      referralList.value = []
      serviceAndTreatmentList.value = []
      loading.value = false
    }
  }
)
</script>

<style scoped>
/* Styles from your original component */
.p-datatable .p-datatable-thead > tr > th {
  background-color: #f8f9fa;
  color: #495057;
  font-weight: 600;
}
.p-datatable .p-datatable-tbody > tr {
  transition: box-shadow 0.2s;
}
.p-datatable .p-datatable-tbody > tr:hover {
  background-color: #e9ecef;
  cursor: pointer;
}
.p-tag {
  width: auto; /* Allow tag to size based on content */
  min-width: 80px; /* Keep a minimum width */
  justify-content: center;
  padding: 0.25rem 0.5rem;
}
</style>