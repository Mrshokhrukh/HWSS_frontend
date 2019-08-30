<template>
  <div class="card p-4">
    <DataTable v-model:filters="filters" :value="filteredData" paginator showGridlines :rows="10" dataKey="id"
      filterDisplay="row" :loading="loading"
      :globalFilterFields="['id', 'eventName', 'toolsUsed', 'duration', 'submittedBy', 'approvalProcess']">
      <template #header>
        <div class="d-flex justify-content-between align-items-center">
          <Button type="button" icon="fa-solid fa-filter-circle-xmark" class="p-button-text" label="Clear" outlined
            @click="clearFilter()" />
          <div class="p-input-icon-left">
            <i class="fa-solid fa-magnifying-glass"></i>
            <InputText v-model="filters['global'].value" placeholder="Keyword Search" class="p-inputtext-sm ms-3" />
          </div>
        </div>
      </template>
      <template #empty> No events found. </template>
      <template #loading> Loading events data. Please wait. </template>

      <!-- Existing columns -->
      <Column field="start_date" header="Date" :sortable="true" />
      <Column field="event_name" header="Event Name" :sortable="true" />
      <Column field="toolsUsed" header="Tools Used" :sortable="true">
        <template #body="{ data }">
          {{ data.selected_tool }}
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <MultiSelect v-model="filterModel.value" @change="filterCallback('toolsUsed')" :options="toolOptions"
            placeholder="Select" class="p-column-filter" :optionLabel="'label'" />
        </template>
      </Column>
      <Column field="duration" header="Duration" :sortable="true" />
      <Column field="counselor" header="Submitted By" :sortable="true" />

      <!-- New column for Approval Process -->
      <Column header="Approval Process" :showFilterMenu="false">
        <template #body="{ data }">
          <Button type="button" icon="pi pi-info-circle" class="custom-button" @click="openDialogue(data)"
            label="Process for Approval" />
        </template>

      </Column>
    </DataTable>

    <Dialog v-model:visible="visible" header="Approval Process Details" modal style="width: 50%;">
      <div class="card p-4">
        <h4 class="event-details__title">Event Details</h4>
        <section v-for="(section, index) in sections" :key="index" class="event-details__section">
          <h6 class="hwss-primary">{{ section.label }}:</h6>
          <p class="event-details__value">{{ section.value }}</p>
        </section>
        <h6 class="hwss-primary">Purpose:</h6>
        <div class="event-details__description px-4 py-2 mb-4 lh-base ">
          {{ eventData.eventPurpose }}
        </div>
        <h6 class="hwss-primary">Tools to be used:</h6>
        <p class="event-details__tools px-4 py-2 mb-4 lh-base ">{{ eventData.toolsUsed }}</p>
        <section class="event-details__section">
          <h6 class="hwss-primary">Total days for screening:</h6>
          <p class="event-details__value px-4 py-2 mb-4 lh-base ">{{ eventData.totalDays }} day(s)</p>
        </section>
        <section class="event-details__actions">
          <Button type="button" icon="pi pi-check" class="custom-button" @click="acceptEvent(eventData)"
            label="Accept" />
          <Button type="button" icon="pi pi-times" class="custom-button" @click="showRejectPopup(eventData)"
            label="Reject" />
        </section>
        <div v-if="showPopup" class="popup">
          <div class="popup-content">
            <span class="close" @click="closePopup">×</span>
            <label for="comment">Comment:</label>
            <textarea id="comment" v-model="rejectComment"></textarea>
            <button @click="rejectEvent">Save</button>
          </div>
        </div>
      </div>
    </Dialog>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { FilterMatchMode } from 'primevue/api';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import MultiSelect from 'primevue/multiselect';
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


const eventPurpose = ref('Mental health screening serves as a proactive measure for early detection and intervention for mental health disorders. It aims to identify individuals who are experiencing symptoms or are at risk of developing mental health conditions. By doing so, it facilitates timely access to treatment.');

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

const clearFilter = () => {
  // Clear all filters
  for (const key in filters.value) {
    filters.value[key].value = [];
  }
};
const fetchReportData = async () => {
  try {
    const response = await axios.get(endpoints.getEventScreeningList);
    console.log('API Response:', response.data); // Log the response data to check
    if (response.data && Array.isArray(response.data)) {
      monitorData.value = response.data; // Use monitorData instead of reportData
      console.log('Fetched Data: for request', monitorData.value); // Log the fetched data to check
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
  console.log(data)
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
.custom-button {
  background-color: #f0f0f0;
  /* Grey background color */
  border: 1px solid #ccc;
  /* Grey border */
  color: black;
}

.event-details {
  border-radius: 0 5px 5px 0;
  box-shadow: 4px 4px 14.2px 0 rgba(0, 0, 0, 0.25);
  background-color: #fff;
  display: flex;
  max-width: 751px;
  flex-direction: column;
  padding: 20px 15px;
  margin: 0 auto;
  /* Added margin to center the element */
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

@media (max-width: 991px) {
  .event-details__section {
    flex-wrap: wrap;
  }
}

.hwss-primary {
  color: #30406b;
}

.event-details__value {
  color: #000;
}

@media (max-width: 991px) {
  .event-details__value {
    max-width: 100%;
  }
}

.event-details__description,
.event-details__tools {
  align-self: start;
  color: #000;
  margin-top: 5px;
}

@media (max-width: 991px) {

  .event-details__description,
  .event-details__tools {
    max-width: 100%;
  }
}

.event-details__actions {
  justify-content: center;
  align-items: center;
  display: flex;
  margin-top: 20px;
  text-align: center;
  padding: 10px;
}

@media (max-width: 991px) {
  .event-details__actions {
    max-width: 100%;
    padding: 0 20px;
  }
}

.event-details__button {
  justify-content: center;
  border-radius: 8px;
  padding: 2px 25px;
  cursor: pointer;
}

.event-details__button--accept {
  background-color: var(--Primary, #2c6975);
  color: #fff;
}

.event-details__button--reject {
  border: 1px solid rgba(43, 101, 111, 1);
  color: #000;
}

@media (max-width: 991px) {
  .event-details__button {
    padding: 0 20px;
  }
}

.popup {
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
}

.popup-content {
  background-color: #fff;
  padding: 20px;
  border-radius: 5px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  max-width: 400px;
  width: 100%;
}

.close {
  position: absolute;
  top: 5px;
  right: 10px;
  cursor: pointer;
}

label {
  display: block;
  margin-bottom: 5px;
}

textarea {
  width: 100%;
  height: 100px;
  margin-bottom: 10px;
}

button {
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
  background-color: #2c6975;
  color: white;
  border: none;
}

button:hover {
  background-color: #265e69;
}
</style>
