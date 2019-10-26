<template>
  <div class="min-h-screen bg-gradient-wrapper">
    <!-- Tab Container -->
    <div class="max-w-7xl mx-auto px-4 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-semibold text-white text-center mb-2">Event Screening Dashboard</h1>
        <p class="text-white/80 text-center">Manage and approve event screening requests</p>
      </div>

      <!-- Tabs -->
      <div class="bg-white/10 backdrop-blur-sm rounded-xl p-2 mb-8 max-w-xl mx-auto">
        <div class="grid grid-cols-2 gap-2">
          <button v-for="(tab, index) in tabs" :key="index" :class="[
            'py-3 px-6 rounded-lg font-medium transition-all duration-200 text-center',
            activeTab === tab.key
              ? 'bg-white text-[#2B656F] shadow-lg'
              : 'text-white/90 hover:bg-white/10'
          ]" @click="changeTab(tab.key)">
            {{ tab.label }}
          </button>
        </div>
      </div>

      <!-- Main Content Card -->
      <div class="bg-white rounded-xl shadow-xl">
        <!-- Table Controls -->
        <div class="p-6 border-b border-gray-100">
          <div class="flex justify-between items-center">
            <Button type="button"
              class="inline-flex items-center px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <i class="fa-solid fa-filter-circle-xmark mr-2"></i>
              Clear Filters
            </Button>
            <div class="relative">
              <i class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <InputText v-model="filters['global'].value" placeholder="Search events..."
                class="pl-10 pr-4 py-2 rounded-lg border-gray-200 w-64 focus:ring-2 focus:ring-[#2B656F]/20" />
            </div>
          </div>
        </div>

        <!-- DataTable -->
        <DataTable v-model:filters="filters" :value="filteredData" :paginator="true" :rows="10" stripedRows class="p-4"
          :loading="loading">
          <Column v-for="col in columns" :key="col.field" :field="col.field" :header="col.header" :sortable="true"
            class="p-4" />

          <Column header="Actions" :exportable="false">
            <template #body="slotProps">
              <Button type="button"
                class="mr-2 px-4 py-2 rounded-lg bg-[#2B656F] text-white hover:bg-[#1D4851] transition-colors"
                @click="openDialogue(slotProps.data)">
                View Details
              </Button>
            </template>
          </Column>
        </DataTable>
      </div>

      <!-- Modal -->
      <Dialog v-model:visible="visible" :modal="true" :closable="true" class="p-0 rounded-xl overflow-hidden max-w-2xl">
        <template #header>
          <div class="bg-gradient-to-r from-[#2B656F] to-[#1D4851] p-6">
            <h3 class="text-xl font-semibold text-white">Event Details</h3>
          </div>
        </template>

        <div class="p-6">
          <div class="space-y-6">
            <!-- Event Details -->
            <div v-for="(section, index) in sections" :key="index" class="border-b border-gray-100 pb-4">
              <h6 class="text-sm font-medium text-[#2B656F] mb-2">{{ section.label }}:</h6>
              <p class="text-gray-700">{{ section.value }}</p>
            </div>

            <!-- Purpose Section -->
            <div>
              <h6 class="text-sm font-medium text-[#2B656F] mb-2">Purpose:</h6>
              <div class="bg-gray-50 rounded-lg p-4 text-gray-700">
                {{ eventData.eventPurpose }}
              </div>
            </div>

            <!-- Tools Section -->
            <div>
              <h6 class="text-sm font-medium text-[#2B656F] mb-2">Tools to be used:</h6>
              <div class="bg-gray-50 rounded-lg p-4 text-gray-700">
                {{ eventData.toolsUsed }}
              </div>
            </div>

            <!-- Actions -->
            <div class="flex justify-end gap-4 pt-4">
              <Button type="button"
                class="px-6 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                @click="showRejectPopup(eventData)">
                Reject
              </Button>
              <Button type="button"
                class="px-6 py-2 rounded-lg bg-[#2B656F] text-white hover:bg-[#1D4851] transition-colors"
                @click="acceptEvent(eventData)">
                Accept
              </Button>
            </div>
          </div>
        </div>
      </Dialog>

      <!-- Reject Popup -->
      <Dialog v-if="showPopup" :visible="true" :modal="true" class="p-0 rounded-xl overflow-hidden max-w-md">
        <template #header>
          <div class="bg-gradient-to-r from-[#2B656F] to-[#1D4851] p-4">
            <h3 class="text-lg font-semibold text-white">Rejection Reason</h3>
          </div>
        </template>

        <div class="p-6">
          <textarea v-model="rejectComment"
            class="w-full rounded-lg border border-gray-200 p-4 h-32 resize-none focus:ring-2 focus:ring-[#2B656F]/20"
            placeholder="Please provide a reason for rejection..."></textarea>

          <div class="flex justify-end gap-4 mt-4">
            <Button type="button" class="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              @click="closePopup">
              Cancel
            </Button>
            <Button type="button"
              class="px-4 py-2 rounded-lg bg-[#2B656F] text-white hover:bg-[#1D4851] transition-colors"
              @click="rejectEvent">
              Submit
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  </div>
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
import Swal from "sweetalert2";

const eventData = ref({}); // Add this to store the event data for the modal
const visible = ref(false); // Control visibility of the dialog
const showPopup = ref(false); // Control visibility of the reject popup
const rejectComment = ref(''); // Store the reject comment

const monitorData = ref();
const filters = ref({
  global: { value: [], matchMode: FilterMatchMode.CONTAINS },
  toolsUsed: { value: [], matchMode: FilterMatchMode.IN }
});
const loading = ref(true);

const filteredData = computed(() => {
  let filtered = monitorData.value ? monitorData.value.filter(item => item.approval_status === "pending") : [];

  // Apply existing filters
  for (const key in filters.value) {
    if (filters.value[key].value.length > 0) {
      if (key === 'toolsUsed') {
        filtered = filtered.filter(item => filters.value[key].value.every(option => item[key].includes(option)));
      } else {
        filtered = filtered.filter(item => filters.value[key].value.includes(item[key]));
      }
    }
  }
  return filtered;
});

const fetchReportData = async () => {
  try {
    const response = await axios.get(endpoints.getEventScreeningList);
    if (response.data && Array.isArray(response.data)) {
      monitorData.value = response.data; // Use monitorData instead of reportData
    } else {
      handleFetchError();
    }
  } catch (error) {
    console.error('Error fetching data:', error); // Log any error
    handleFetchError();
  } finally {
    loading.value = false;
  }
};

const handleFetchError = () => {
  monitorData.value = [];
  console.error('Failed to fetch data'); // Log fetch error
};

onMounted(() => {
  fetchReportData();
});

const showRejectPopup = (data) => {
  eventData.value = data; // Store the data to be used in the popup
  showPopup.value = true; // Show the reject popup
};

function closePopup() {
  showPopup.value = false;
  visible.value = false; // Close the dialog
}

const rejectEvent = async () => {
  try {
    const response = await axios.post(endpoints.updateEventScreeningList, {
      event_id: eventData.value.id,
      approval_status: "rejected",
      rejection_reason: rejectComment.value,
    });
    console.log('Event rejected with comment:', response.data);

    // Update the local data to reflect the change
    const index = monitorData.value.findIndex(item => item.id === eventData.value.id);
    if (index !== -1) {
      monitorData.value[index].approval_status = "rejected";
    }

    closePopup();
    Swal.fire({
      icon: 'error',
      title: 'Event Rejected',
      text: 'Reason: ' + rejectComment.value,
      showConfirmButton: false,
      timer: 2000
    });
  } catch (error) {
    console.error('Error updating event:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Failed to reject the event. Please try again.',
      showConfirmButton: true,
    });
  }
};

const openDialogue = (data) => {
  eventData.value = {
    id: data.id,
    eventPurpose: data.event_purpose,
    toolsUsed: data.selected_tool ? data.selected_tool : 'Not Choosen',
    totalDays: data.duration
    // Include any other necessary data fields here
  };
  visible.value = true;
};

const acceptEvent = async (eventData) => {
  try {
    const response = await axios.post(endpoints.updateEventScreeningList, {
      event_id: eventData.id,
      approval_status: "approved",
    });
    console.log('Event accepted:', response.data);
  } catch (error) {
    console.error('Error updating event:', error);
  } finally {
    visible.value = false; // Close the dialog
    Swal.fire({
      icon: 'success',
      title: 'Successfully Approved',
      showConfirmButton: false,
      timer: 2000
    });
  }
};



</script>

<style scoped>
.bg-gradient-wrapper {
  background: linear-gradient(135deg, #2B656F 0%, #1D4851 100%);
}

:deep(.p-datatable) {
  border-radius: 0.75rem;
  overflow: hidden;
}

:deep(.p-datatable .p-datatable-thead > tr > th) {
  background-color: #f8fafc;
  color: #1f2937;
  font-weight: 600;
  padding: 1rem;
}

:deep(.p-datatable .p-datatable-tbody > tr) {
  transition: background-color 0.2s;
}

:deep(.p-datatable .p-datatable-tbody > tr:hover) {
  background-color: #f1f5f9;
}

:deep(.p-dialog) {
  border-radius: 0.75rem;
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
}

:deep(.p-dialog-header),
:deep(.p-dialog-content) {
  padding: 0;
}

:deep(.p-button) {
  transition: all 0.2s;
}

:deep(.p-inputtext:focus) {
  border-color: #2B656F;
  box-shadow: 0 0 0 2px rgba(43, 101, 111, 0.2);
}

/* Add smooth transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>