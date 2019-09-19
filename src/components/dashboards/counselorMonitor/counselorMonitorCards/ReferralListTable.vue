<template>
  <DataTable v-model:filters="filters" :value="store.referralList" :paginator="true" :rows="10" :dataKey="'id'"
    filterMode="menu" :filters="{ 'global': { matchMode: 'contains' } }" :emptyMessage="'No referrals found.'"
    :loading="store.referralList.length === 0">
    <template #header>
      <div class="flex justify-content-between">
        <Button type="button" icon="pi pi-filter-slash" label="Clear" outlined @click="clearFilter()" />
      </div>
    </template>
    <template #empty> No referrals found. </template>
    <template #loading> Loading referrals data. Please wait. </template>
    <Column field="date" header="Date" :filterMatchMode="'startsWith'" :sortable="true"
      :style="{ 'min-width': '12rem' }">
      <template #body="{ data }">
        {{ formatDate(data.date) }}
      </template>
      <template #filter="{ filterModel }">
        <InputText v-model="filterModel['date']" type="text" class="p-column-filter" placeholder="Search by date" />
      </template>
    </Column>
    <Column field="user_data.name" header="Name" :filterMatchMode="'contains'" :sortable="true"
      :style="{ 'min-width': '12rem' }">
      <template #body="{ data }">
        {{ data.user_data.name }}
      </template>
      <template #filter="{ filterModel }">
        <InputText v-model="filterModel['user_data.name']" type="text" class="p-column-filter"
          placeholder="Search by name" />
      </template>
    </Column>
    <Column field="user_data.age" header="Age" :filterMatchMode="'equals'" :sortable="true"
      :style="{ 'min-width': '8rem' }">
      <template #body="{ data }">
        {{ data.user_data.age }}
      </template>
      <template #filter="{ filterModel }">
        <InputText v-model="filterModel['user_data.age']" type="text" class="p-column-filter"
          placeholder="Search by age" />
      </template>
    </Column>
    <Column field="user_data.gender" header="Sex" :filterMatchMode="'equals'" :sortable="true"
      :style="{ 'min-width': '8rem' }">
      <template #body="{ data }">
        {{ data.user_data.gender }}
      </template>
      <template #filter="{ filterModel }">
        <InputText v-model="filterModel['user_data.gender']" type="text" class="p-column-filter"
          placeholder="Search by gender" />
      </template>
    </Column>
    <Column field="referred_to.name" header="Referred To" :filterMatchMode="'contains'" :sortable="true"
      :style="{ 'min-width': '12rem' }">
      <template #body="{ data }">
        {{ data.referred_to.name }}
      </template>
      <template #filter="{ filterModel }">
        <InputText v-model="filterModel['referred_to.name']" type="text" class="p-column-filter"
          placeholder="Search by referred to" />
      </template>
    </Column>
    <Column field="referred_by.username" header="Referred By" :filterMatchMode="'contains'" :sortable="true"
      :style="{ 'min-width': '12rem' }">
      <template #body="{ data }">
        {{ data.referred_by.username }}
      </template>
      <template #filter="{ filterModel }">
        <InputText v-model="filterModel['referred_by.username']" type="text" class="p-column-filter"
          placeholder="Search by referred by" />
      </template>
    </Column>
    <Column field="referral_status" header="Referral Status" :filterMatchMode="'equals'" :sortable="true"
      :style="{ 'min-width': '12rem' }">
      <template #body="{ data }">
        {{ data.referral_status }}
      </template>
      <template #filter="{ filterModel }">
        <InputText v-model="filterModel['referral_status']" type="text" class="p-column-filter"
          placeholder="Search by referral status" />
      </template>
    </Column>
    <Column :style="{ 'min-width': '8rem' }">
      <template #body="{ data }">
        <Button label="View Details" icon="pi pi-external-link" @click="showDetails(data)" />
      </template>
    </Column>
  </DataTable>

  <Dialog v-model:visible="dialogVisible" maximizable modal header="User Records" @hide="handleModalClose"
    :style="{ width: '80rem', minHeight: '40rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
    <div class="container-fluid mx-0 px-0">
      <div class="row">
        <!-- Profile Card -->
        <aside class="col-4">
          <div class="profile-card card mt-3 pt-4 h-full col-3" style="position: fixed; height: auto;">
            <div class="card-img-top"
              :style="{ backgroundImage: `url(${store.selectedReferral.user_data.profile_picture})` }">
            </div>
            <div class="card-body">
              <h5 class="card-title mb-3 hwss-primary">{{ store.selectedReferral.user_data.first_name }} {{
                store.selectedReferral.user_data.middle_name }} {{ store.selectedReferral.user_data.last_name }}</h5>
              <ul class="list-unstyled ">
                <li class="mb-3"><strong>Age:</strong><br> {{ store.selectedReferral.user_data.date_of_birth }}</li>
                <li class="mb-3"><strong>Sex:</strong><br> {{ store.selectedReferral.user_data.gender }}</li>
                <li class="mb-3" v-if="store.selectedReferral.user_data.role !== 'student'"><strong>Employee
                    ID:</strong><br> {{ store.selectedReferral.user_data.academy_code }}</li>
                <li class="mb-3"><strong>Citizen ID:</strong><br> {{ store.selectedReferral.user_data.identity_number }}
                </li>
                <li class="mb-3"><strong>Nationality:</strong><br> {{ store.selectedReferral.user_data.nationality }}
                </li>
                <li class="mb-3"><strong>Phone Number:</strong><br> {{ store.selectedReferral.user_data.mob_number }}
                </li>
                <li class="mb-3"><strong>Email:</strong><br> {{ store.selectedReferral.user_data.email }}</li>
                <li class="mb-3"><strong>Role:</strong><br> {{ store.selectedReferral.user_data.role }}</li>
                <li class="mb-3 text-truncate" v-if="store.selectedReferral.user_data.active_agency"><strong>Active
                    Agency:</strong><br> {{ store.selectedReferral.user_data.active_agency }}</li>
              </ul>
            </div>
          </div>
        </aside>

        <!-- Main Content -->
        <main class="col-md-8">
          <div class="row mb-4 card p-4 bg-white">
            <div class="col-md-12">
              <h4 class="hwss-primary">Personal Details</h4>
              <div class="row">
                <div class="col-6">Mother's Name: <input type="text" class="form-control"
                    v-model="store.selectedReferral.user_data.mother_name" readonly disabled></div>
                <div class="col-6">Father's Name: <input type="text" class="form-control"
                    v-model="store.selectedReferral.user_data.father_name" readonly disabled></div>
                <div class="col-6">Parents' Occupation: <input type="text" class="form-control"
                    v-model="store.selectedReferral.user_data.parents_occupation" readonly disabled></div>
                <div class="col-6">Parental Status: <input type="text" class="form-control"
                    v-model="store.selectedReferral.user_data.parental_status" readonly disabled></div>
                <div class="col-6">Phone: <input type="text" class="form-control"
                    v-model="store.selectedReferral.user_data.mob_number" readonly disabled></div>
              </div>
            </div>
          </div>
          <div class="row mb-4 card p-4 bg-white">
            <div class="col-md-12">
              <h4 class="hwss-primary">Permanent Address</h4>
              <div class="row">
                <div class="col-6">Village: <input type="text" class="form-control"
                    v-model="store.selectedReferral.user_data.perm_add_village" readonly disabled></div>
                <div class="col-6">Gewog: <input type="text" class="form-control"
                    v-model="store.selectedReferral.user_data.perm_add_gewog" readonly disabled></div>
                <div class="col-6">Dzongkhag: <input type="text" class="form-control"
                    v-model="store.selectedReferral.user_data.perm_add_dzongkhag" readonly disabled></div>
              </div>
            </div>
          </div>
          <div class="row mb-4 card p-4 bg-white">
            <div class="col-md-12">
              <h4 class="hwss-primary">Present Address</h4>
              <div class="row">
                <div class="col-6">Village: <input type="text" class="form-control"
                    v-model="store.selectedReferral.user_data.ps_add_village" readonly disabled></div>
                <div class="col-6">Gewog: <input type="text" class="form-control"
                    v-model="store.selectedReferral.user_data.ps_add_gewog" readonly disabled></div>
                <div class="col-6">Dzongkhag: <input type="text" class="form-control"
                    v-model="store.selectedReferral.user_data.ps_add_dzongkhag" readonly disabled></div>
              </div>
            </div>
          </div>
          <div class="row mb-4 card p-4 bg-white">
            <div class="col-md-12">
              <h4 class="hwss-primary">Referral Details</h4>
              <div class="row">
                <div class="col-6">Referred To: <input type="text" class="form-control"
                    :value="store.selectedReferral.referred_to.name" readonly disabled></div>
                <div class="col-6">Referred By: <input type="text" class="form-control"
                    :value="store.selectedReferral.referred_by.username" readonly disabled></div>
                <div class="col-6">Referral Status: <input type="text" class="form-control"
                    :value="store.selectedReferral.referral_status" readonly disabled></div>
                <div class="col-6">Date: <input type="text" class="form-control"
                    :value="formatDate(store.selectedReferral.date)" readonly disabled></div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>

    <div class="mt-4 d-flex justify-content-end">
      <div>
        <Button label="Close" class="p-button-secondary p-mr-2 mx-2" @click="handleModalClose" />
      </div>
    </div>
  </Dialog>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useCounselorDashboardStore } from '@/stores/counselorDashboard';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';

const store = useCounselorDashboardStore();
const filters = ref({});
const dialogVisible = ref(false);

const formatDate = (timestamp) => {
  if (!timestamp) return '';

  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const clearFilter = () => {
  filters.value = {};
};

const showDetails = (data) => {
  store.setSelectedReferral(data);
  dialogVisible.value = true;
};

const handleModalClose = () => {
  store.setSelectedReferral(null);
  dialogVisible.value = false;
};

onMounted(async () => {
  await store.fetchReferralList();
});
</script>

<style scoped>
.sticky-top {
  position: -webkit-sticky;
  position: sticky;
  top: 0;
}

.card-img-top {
  height: 200px;
  background-size: cover;
  background-position: center;
}

.hwss-primary {
  color: #2c6975;
}

.sticky-top {
  position: -webkit-sticky;
  position: sticky;
  top: 0;
}

.card-img-top {
  height: 200px;
  background-size: cover;
  background-position: center;
}

.hwss-primary {
  color: #2c6975;
}

.greyout {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}
</style>