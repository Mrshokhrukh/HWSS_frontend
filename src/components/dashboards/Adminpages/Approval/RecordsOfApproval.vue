<template>
  <div class="card p-4">
    <DataTable v-model:filters="filters" :value="filteredData" paginator showGridlines :rows="10" dataKey="id"
      filterDisplay="row" :loading="loading" :globalFilterFields="['eventName', 'toolsUsed', 'duration', 'status']">
      <template #header>
        <div class="d-flex justify-content-between align-items-center">
          <Button type="button" icon="fa-solid fa-filter-circle-xmark" class="hwss-btn" label="Clear" outlined
            @click="clearFilter()" />
          <div class="p-input-icon-left">
            <i class="fa-solid fa-magnifying-glass"></i>
            <InputText v-model="filters['global'].value" placeholder="Keyword Search" class="p-inputtext-sm ms-2" />
          </div>
        </div>
      </template>
      <template #empty> No events found. </template>
      <template #loading> Loading events data. Please wait. </template>

      <!-- Existing columns -->
      <Column field="date" header="Date" :sortable="true" />
      <Column field="eventName" header="Event Name" :sortable="true" />
      <Column field="toolsUsed" header="Tools Used" :sortable="true" />
      <Column field="duration" header="Duration" :sortable="true" />
      <Column header="Status" :sortable="true">
        <template #body="{ data }">
          <Badge
            :class="{ 'p-badge-success': data.status === 'Accepted', 'p-badge-danger': data.status === 'Rejected' }"
            :value="data.status" @click="showStatusPopup(data.status)" style="cursor: pointer" class="w-50" />
        </template>
      </Column>
    </DataTable>
  </div>

  <Dialog v-model:visible="showPopup" :modal="true" style="max-width: 50%;">
    <div class="card p-4">
      <h4 class="event-details__title">Event Details</h4>
      <section class="event-details__section">
        <h6 class="hwss-primary">Event Name:</h6>
        <p class="event-details__value">Empower Wellness Summit</p>
      </section>
      <section class="event-details__section">
        <h6 class="hwss-primary">Proposed/Submitted By:</h6>
        <p class="event-details__value">Mr. Namgay Tshering</p>
      </section>
      <section class="event-details__section">
        <h6 class="hwss-primary">Working Agency:</h6>
        <p class="event-details__value">Clincial Counselor</p>
      </section>
      <section class="event-details__section">
        <h6 class="hwss-primary">Location:</h6>
        <p class="event-details__value">Motithang Higher Secondary School</p>
      </section>
      <section class="event-details__section">
        <h6 class="hwss-primary">Dzongkhag:</h6>
        <p class="event-details__value">Thimphu</p>
      </section>
      <section class="event-details__section">
        <h6 class="hwss-primary">Start Date:</h6>
        <p class="event-details__value">01/12/2023</p>
      </section>
      <section class="event-details__section">
        <h6 class="hwss-primary">End Date:</h6>
        <p class="event-details__value">05/12/2023</p>
      </section>
      <section class="event-details__section">
        <h6 class="hwss-primary">Duration:</h6>
        <p class="event-details__value">4 days</p>
      </section>
      <h6 class="hwss-primary">Purpose:</h6>
      <div class="event-details__description py-2 px-4 mb-3">
        {{ eventPurpose }}
      </div>
      <h6 class="hwss-primary">Tools to be used:</h6>
      <p class="event-details__tools">Mental Health / SUD / Mental health & SUD</p>
      <section class="event-details__section">
        <h6 class="hwss-primary">Total users to be screened:</h6>
        <p class="event-details__value">12</p>
      </section>
      <section class="event-details__section">
        <h6 class="hwss-primary">Status:</h6>
        <p class="event-details__status" v-if="showPopup">{{ selectedStatus }}</p>
      </section>
    </div>
    <div class="d-flex">
      <Button type="button" label="Close" class="btn hwss-btn my-4 ms-auto" @click="closePopup" />
    </div>
  </Dialog>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { FilterMatchMode } from 'primevue/api';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Badge from 'primevue/badge';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Dialog from 'primevue/dialog';

const eventPurpose = ref('Mental health screening serves as a proactive measure for early detection and intervention for mental health disorders. It aims to identify individuals who are experiencing symptoms or are at risk of developing mental health conditions. By doing so, it facilitates timely access to treatment.');

const monitorData = ref();
const filters = ref({
  global: { value: [], matchMode: FilterMatchMode.CONTAINS }
});
const loading = ref(true);
const showPopup = ref(false);
const selectedStatus = ref('');

const filteredData = computed(() => {
  let filtered = monitorData.value;
  // Apply filters based on the selected values
  for (const key in filters.value) {
    if (filters.value[key].value.length > 0) {
      filtered = filtered.filter(item => filters.value[key].value.includes(item[key]));
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

const closePopup = () => {
  showPopup.value = false;
};

onMounted(() => {
  // Dummy Data
  monitorData.value = [
    {
      id: 1,
      date: '21/02/24',
      eventName: 'Empower Wellness Summit',
      toolsUsed: 'Mental Health, SUD',
      duration: '5 days',
      status: 'Rejected'
    },
    {
      id: 2,
      date: '21/02/25',
      eventName: 'Mental Health Awareness Workshop',
      toolsUsed: 'Mental Health',
      duration: '3 days',
      status: 'Accepted'
    },
    {
      id: 3,
      date: '21/02/26',
      eventName: 'Substance Abuse Prevention Seminar',
      toolsUsed: 'SUD',
      duration: '2 days',
      status: 'Rejected'
    },
    {
      id: 4,
      date: '21/02/27',
      eventName: 'Meditation Retreat',
      toolsUsed: 'Mental Health',
      duration: '7 days',
      status: 'Accepted'
    },
    {
      id: 5,
      date: '21/02/28',
      eventName: 'Stress Management Workshop',
      toolsUsed: 'Mental Health',
      duration: '1 day',
      status: 'Rejected'
    }
  ];
  loading.value = false;
});

const showStatusPopup = (status) => {
  selectedStatus.value = status;
  showPopup.value = true;
  // Update selectedStatus based on the status date in monitorData.value
  const event = monitorData.value.find(item => item.status === status);
  if (event) {
    selectedStatus.value = event.status;
  }
};
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