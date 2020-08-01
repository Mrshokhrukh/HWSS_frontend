<template>
  <div class="bg-white rounded-lg shadow-lg">
    <DataTable v-model:filters="filters" :value="filteredData" :paginator="true" :rows="10"
      :rowsPerPageOptions="[5, 10, 20]" dataKey="id" filterDisplay="row" :loading="loading"
      :globalFilterFields="['event_name', 'selected_tool', 'duration', 'approval_status']" class="p-4"
      responsiveLayout="scroll">
      <!-- Enhanced Header -->
      <template #header>
        <div class="flex justify-between items-center gap-4 mb-4">
          <Button type="button" class="bg-red-50 text-red-600 border-red-200 hover:bg-red-100" icon="pi pi-filter-slash"
            label="Clear Filters" outlined @click="clearFilter()" />
          <span class="p-input-icon-left flex-grow-0">
            <i class="pi pi-search" />
            <InputText v-model="filters['global'].value" placeholder="Search events..." class="p-inputtext-sm w-80" />
          </span>
        </div>
      </template>
TEST TEST
      <!-- Enhanced Empty State -->
      <template #empty>
        <div class="text-center py-8">
          <i class="pi pi-folder-open text-4xl text-gray-400 mb-4"></i>
          <p class="text-gray-500">No events found</p>
        </div>
      </template>

      <!-- Enhanced Loading State -->
      <template #loading>
        <div class="text-center py-8">
          <i class="pi pi-spin pi-spinner text-4xl text-blue-400 mb-4"></i>
          <p class="text-gray-600">Loading events...</p>
        </div>
      </template>

      <!-- Enhanced Columns -->
      <Column field="start_date" header="Date" :sortable="true" class="p-4">
        <template #body="{ data }">
          <span class="font-medium">
            {{ new Date(data.start_date).toLocaleDateString() }}
          </span>
        </template>
      </Column>

      <Column field="event_name" header="Event Name" :sortable="true" class="p-4">
        <template #body="{ data }">
          <div class="font-medium text-blue-600 hover:text-blue-800 cursor-pointer" @click="showEventDetails(data)">
            {{ data.event_name }}
          </div>
        </template>
      </Column>

      <Column field="selected_tool" header="Tools Used" :sortable="true" class="p-4">
        <template #body="{ data }">
          <div class="flex flex-wrap gap-1">
            <span v-for="tool in data.selected_tool.split('/')" :key="tool"
              class="px-2 py-1 bg-blue-50 text-blue-600 text-sm rounded-full">
              {{ tool.trim() }}
            </span>
          </div>
        </template>
      </Column>

      <Column field="duration" header="Duration" :sortable="true" class="p-4">
        <template #body="{ data }">
          <span class="inline-flex items-center gap-1">
            <i class="pi pi-clock text-gray-400"></i>
            {{ data.duration }} days
          </span>
        </template>
      </Column>

      <Column field="approval_status" header="Status" :sortable="true" class="p-4">
        <template #body="{ data }">
          <span :class="{
            'px-3 py-1 rounded-full text-sm font-medium': true,
            'bg-green-50 text-green-600': data.approval_status === 'approved',
            'bg-red-50 text-red-600': data.approval_status === 'rejected',
            'bg-yellow-50 text-yellow-600': data.approval_status === 'ended'
          }">
            {{ data.approval_status.charAt(0).toUpperCase() + data.approval_status.slice(1) }}
          </span>
        </template>
      </Column>
    </DataTable>
  </div>

  <!-- Enhanced Modal -->
  <Dialog v-model:visible="showPopup" :modal="true" :style="{ width: '750px' }" :dismissableMask="true" class="p-4">
    <template #header>
      <div class="flex items-center gap-2">
        <i class="pi pi-calendar text-2xl text-blue-600"></i>
        <h3 class="text-xl font-semibold text-gray-800">Event Details</h3>
      </div>
    </template>

    <div class="grid grid-cols-2 gap-6">
      <div class="space-y-4">
        <DetailField label="Event Name" :value="selectedEvent?.event_name" />
        <DetailField label="Proposed By" :value="selectedEvent?.submitted_by" />
        <DetailField label="Working Agency" :value="selectedEvent?.working_agency" />
        <DetailField label="Location" :value="selectedEvent?.location" />
      </div>

      <div class="space-y-4">
        <DetailField label="Dzongkhag" :value="selectedEvent?.dzongkhag" />
        <DetailField label="Duration"
          :value="`${selectedEvent?.start_date} - ${selectedEvent?.end_date} (${selectedEvent?.duration} days)`" />
        <DetailField label="Status" :value="selectedEvent?.approval_status" :status="true" />
      </div>
    </div>

    <div class="mt-6 space-y-4">
      <div>
        <h4 class="font-medium text-gray-700 mb-2">Purpose</h4>
        <p class="bg-gray-50 p-4 rounded-lg text-gray-600">{{ eventPurpose }}</p>
      </div>

      <div>
        <h4 class="font-medium text-gray-700 mb-2">Tools to be used</h4>
        <div class="flex flex-wrap gap-2">
          <span v-for="tool in selectedEvent?.selected_tool?.split('/')" :key="tool"
            class="px-3 py-1 bg-blue-50 text-blue-600 rounded-full">
            {{ tool.trim() }}
          </span>
        </div>
      </div>

      <DetailField label="Total users to be screened" :value="selectedEvent?.total_users" />
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <Button label="Close" icon="pi pi-times" @click="closePopup" class="p-button-text" />
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { FilterMatchMode } from 'primevue/api';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Dialog from 'primevue/dialog';
import axios from 'axios';
import endpoints from '@/api';

// Create DetailField as a separate component
const DetailField = {
  props: {
    label: String,
    value: [String, Number],
    status: Boolean
  },
  computed: {
    statusClass() {
      if (!this.status) return '';
      return {
        'px-3 py-1 rounded-full inline-block': true,
        'bg-green-50 text-green-600': this.value === 'approved',
        'bg-red-50 text-red-600': this.value === 'rejected',
        'bg-yellow-50 text-yellow-600': this.value === 'ended'
      };
    }
  },
  template: `
    <div>
      <label class="text-sm font-medium text-gray-600">{{ label }}</label>
      <div :class="['mt-1', status ? '' : 'text-gray-800']">
        <span :class="statusClass">
          {{ status ? value.charAt(0).toUpperCase() + value.slice(1) : value }}
        </span>
      </div>
    </div>
  `
};

const eventPurpose = ref('Mental health screening serves as a proactive measure for early detection and intervention for mental health disorders. It aims to identify individuals who are experiencing symptoms or are at risk of developing mental health conditions. By doing so, it facilitates timely access to treatment.');
const monitorData = ref([]);
const selectedEvent = ref(null);
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const loading = ref(true);
const showPopup = ref(false);

const filteredData = computed(() => {
  if (!monitorData.value) return [];

  let filtered = monitorData.value;
  const globalFilter = filters.value.global.value?.toLowerCase();

  if (globalFilter) {
    filtered = filtered.filter(item =>
      Object.values(item).some(val =>
        String(val).toLowerCase().includes(globalFilter)
      )
    );
  }

  return filtered;
});

const clearFilter = () => {
  filters.value = {
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
  };
};

const showEventDetails = (event) => {
  selectedEvent.value = event;
  showPopup.value = true;
};

const closePopup = () => {
  showPopup.value = false;
  selectedEvent.value = null;
};

const fetchReportData = async () => {
  try {
    loading.value = true;
    const response = await axios.get(endpoints.getEventScreeningList);

    if (response.data && Array.isArray(response.data)) {
      monitorData.value = response.data;
    } else {
      throw new Error('Invalid data format');
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    monitorData.value = [];
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchReportData();
});
</script>

<style scoped>
.event-details {
  border-radius: 0 5px 5px 0;
  box-shadow: 4px 4px 14.2px 0 rgba(0, 0, 0, 0.25);
  background-color: #fff;
  display: flex;
  flex-direction: column;
  padding: 20px 15px 10px;
}

.event-details__title {
  color: #000;
  text-align: center;
  align-self: center;
}

.event-details__section {
  display: flex;
  gap: 5px;
  text-align: center;
  padding: 6px 0;
}

.event-details__label {
  color: #30406b;
}

.event-details__value {
  color: #000;
}

.event-details__description,
.event-details__tools {
  align-self: start;
  color: #000;
  margin-top: 5px;
}

.event-details__status {
  color: #2b656f;
}
</style>