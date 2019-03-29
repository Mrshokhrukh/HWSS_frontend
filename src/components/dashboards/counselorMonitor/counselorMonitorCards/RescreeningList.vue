<template>
  <div class="container-fluid">
    <!-- Filters -->
    <div class="row d-flex align-items-center">
      <div class="col-11">
        <MonitorFilterCard @filtersApplied="handleFiltersApplied" />
      </div>
      <div class="col-1">
        <button class="btn hwss-btn">Rescreen</button>
      </div>
    </div>


    <!-- Table -->
    <div class="main-container">
      <table class="table">
        <thead>
          <tr class="align-middle">
            <th scope="col"><input type="checkbox" @change="selectAll($event)"></th>
            <th scope="col" @click="sortBy('date')">
              <div class="d-flex justify-content-between align-items-center me-2">
                Date
                <i class="fa"
                  :class="{ 'fa-sort': sortByColumn !== 'date', 'fa-sort-asc': sortByColumn === 'date' && sortDirection === 'asc', 'fa-sort-desc': sortByColumn === 'date' && sortDirection === 'desc' }"></i>
              </div>
            </th>
            <th scope="col" @click="sortBy('name')">
              <div class="d-flex justify-content-between align-items-center me-2">
                Name
                <i class="fa "
                  :class="{ 'fa-sort': sortByColumn !== 'name', 'fa-sort-asc': sortByColumn === 'name' && sortDirection === 'asc', 'fa-sort-desc': sortByColumn === 'name' && sortDirection === 'desc' }"></i>
              </div>
            </th>
            <th scope="col" @click="sortBy('age')">
              <div class="d-flex justify-content-between align-items-center me-2">
                Age
                <i class="fa"
                  :class="{ 'fa-sort': sortByColumn !== 'age', 'fa-sort-asc': sortByColumn === 'age' && sortDirection === 'asc', 'fa-sort-desc': sortByColumn === 'age' && sortDirection === 'desc' }"></i>
              </div>
            </th>
            <th scope="col" @click="sortBy('sex')">
              <div class="d-flex justify-content-between align-items-center me-2">
                Sex
                <i class="fa"
                  :class="{ 'fa-sort': sortByColumn !== 'sex', 'fa-sort-asc': sortByColumn === 'sex' && sortDirection === 'asc', 'fa-sort-desc': sortByColumn === 'sex' && sortDirection === 'desc' }"></i>
              </div>
            </th>
            <th scope="col">
              <div class="d-flex justify-content-between align-items-center me-2">
                Past Mental Disorder History
                <i class="fa fa-sort"></i>
              </div>
            </th>
            <th scope="col">
              <div class="d-flex justify-content-between align-items-center me-2">
                Depression Severity
                <i class="fa fa-sort"></i>
              </div>
            </th>
            <th scope="col">
              <div class="d-flex justify-content-between align-items-center me-2">
                General Anxiety Severity
                <i class="fa fa-sort"></i>
              </div>
            </th>
            <th scope="col">
              <div class="d-flex justify-content-between align-items-center me-2">
                Adverse Childhood Experience Severity
                <i class="fa fa-sort"></i>
              </div>
            </th>
            <th scope="col">
              <div class="d-flex justify-content-between align-items-center me-2">
                Tobacco Products Severity
                <i class="fa fa-sort"></i>
              </div>
            </th>
            <th scope="col">
              <div class="d-flex justify-content-between align-items-center me-2">
                Alcoholic Beverages Severity
                <i class="fa fa-sort"></i>
              </div>
            </th>
            <th scope="col">
              <div class="d-flex justify-content-between align-items-center me-2">
                Cannabis Severity
                <i class="fa fa-sort"></i>
              </div>
            </th>
            <th scope="col" class="table-head-td">
              <div class="d-flex justify-content-between align-items-center me-2">
                Cocaine Severity
                <i class="fa fa-sort"></i>
              </div>
            </th>
            <th scope="col">
              <div class="d-flex justify-content-between align-items-center me-2">
                Amphetamine Type Severity
                <i class="fa fa-sort"></i>
              </div>
            </th>
            <th scope="col">
              <div class="d-flex justify-content-between align-items-center me-2">
                Inhalants Severity
                <i class="fa fa-sort"></i>
              </div>
            </th>
            <th scope="col">
              <div class="d-flex justify-content-between align-items-center me-2">
                Sedatives Severity
                <i class="fa fa-sort"></i>
              </div>
            </th>
            <th scope="col">
              <div class="d-flex justify-content-between align-items-center me-2">
                Hallucinogens Severity
                <i class="fa fa-sort"></i>
              </div>
            </th>
            <th scope="col">
              <div class="d-flex justify-content-between align-items-center me-2">
                Opioids Severity
                <i class="fa fa-sort"></i>
              </div>
            </th>
            <th scope="col">
              <div class="d-flex justify-content-between align-items-center me-2">
                Others Severity
                <i class="fa fa-sort"></i>
              </div>
            </th>
            <th scope="col">Substance by Injection</th>
            <th scope="col"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(user, index) in filteredUsers" :key="index" class="shadow-row align-middle text-nowrap text-center">
            <td><input type="checkbox" :value="user.id" v-model="selectedUsers"></td>
            <td>{{ user.date }}</td>
            <td>{{ user.name }}</td>
            <td>{{ user.age }}</td>
            <td>{{ user.sex }}</td>
            <td>{{ user.pastMentalDisorder }}</td>
            <td><span :class="getSeverityClass(user.depressionSeverity)"><i class="fas fa-flag"></i>{{
              user.depressionSeverity }}</span></td>
            <td><span :class="getSeverityClass(user.generalAnxietySeverity)"><i class="fas fa-flag"></i>{{
              user.generalAnxietySeverity }}</span></td>
            <td><span :class="getSeverityClass(user.adverseChildhoodExperienceSeverity)"><i class="fas fa-flag"></i>{{
              user.adverseChildhoodExperienceSeverity }}</span></td>
            <td><span :class="getSeverityClass(user.tobaccoProductsSeverity)"><i class="fas fa-flag"></i>{{
              user.tobaccoProductsSeverity }}</span></td>
            <td><span :class="getSeverityClass(user.alcoholicBeveragesSeverity)"><i class="fas fa-flag"></i>{{
              user.alcoholicBeveragesSeverity }}</span></td>
            <td><span :class="getSeverityClass(user.cannabisSeverity)"><i class="fas fa-flag"></i>{{
              user.cannabisSeverity }}</span></td>
            <td><span :class="getSeverityClass(user.cocaineSeverity)"><i class="fas fa-flag"></i>{{
              user.cocaineSeverity }}</span></td>
            <td><span :class="getSeverityClass(user.amphetamineTypeSeverity)"><i class="fas fa-flag"></i>{{
              user.amphetamineTypeSeverity }}</span></td>
            <td><span :class="getSeverityClass(user.inhalantsSeverity)"><i class="fas fa-flag"></i>{{
              user.inhalantsSeverity }}</span></td>
            <td><span :class="getSeverityClass(user.sedativesSeverity)"><i class="fas fa-flag"></i>{{
              user.sedativesSeverity }}</span></td>
            <td><span :class="getSeverityClass(user.hallucinogensSeverity)"><i class="fas fa-flag"></i>{{
              user.hallucinogensSeverity }}</span></td>
            <td><span :class="getSeverityClass(user.opioidsSeverity)"><i class="fas fa-flag"></i>{{
              user.opioidsSeverity }}</span></td>
            <td><span :class="getSeverityClass(user.othersSeverity)"><i class="fas fa-flag"></i>{{
              user.othersSeverity }}</span></td>
            <td><span :class="getSeverityClass(user.substanceByInjection)"><i class="fas fa-flag"></i>{{
              user.substanceByInjection }}</span></td>
            <td><button @click="viewDetails(user)" class="btn hwss-btn">View Details</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import MonitorFilterCard from './MonitorFilterCard.vue';
import endpoints from '@/api';
import axios from 'axios';

// Sample data for table body
const users = ref([]);

// Filter options
const tableFields = ['Date', 'Name', 'Age', 'Sex', 'Past Mental Disorder History'];
// const severityOptions = ['Severe', 'Moderately Severe', 'Moderate', 'Mild'];

// Filter and sorting variables
const searchQuery = ref('');
const selectedFields = ref(tableFields);
const sortBy = ref('');

// Selected users for bulk actions
const selectedUsers = ref([]);

// Filtered users based on search query and selected fields
const filteredUsers = computed(() => {
  if (!searchQuery.value.trim()) {
    // No search query, return all users
    return users.value;
  }

  if (!Array.isArray(users.value) || users.value.length === 0) {
    // Handle empty or invalid user data
    return [];
  }

  const filtered = users.value.filter(user => {
    return selectedFields.value.some(field => {
      const fieldValue = user[field.toLowerCase()];
      if (typeof fieldValue === 'undefined') {
        // Handle missing field value
        return false;
      }
      return fieldValue.toString().toLowerCase().includes(searchQuery.value.toLowerCase());
    });
  });

  return filtered;
});

// Methods
const selectAll = (event) => {
  if (event.target.checked) {
    selectedUsers.value = filteredUsers.value.map(user => user.id);
  } else {
    selectedUsers.value = [];
  }
};

const sortByColumn = (columnName) => {
  if (sortBy.value === columnName) {
    sortBy.value = '';
  } else {
    sortBy.value = columnName;
  }
};

const getSeverityClass = (severity) => {
  if (severity === 'severe' || severity === 'high risk') {
    return 'severity-severe';
  } else if (severity === 'moderately severe') {
    return 'severity-moderate-severe';
  } else if (severity === 'moderate risk' || severity === 'moderate') {
    return 'severity-moderate';
  } else if (severity === 'low risk' || severity === 'mild') {
    return 'severity-mild';
  } else {
    return 'severity-none';
  }
};

const handleFiltersApplied = (filterValues) => {
  // Logic to handle the selected filter values
  console.log("Selected filter values:", filterValues);
};

onMounted(async () => {
  try {
    const response = await axios.get(endpoints.getRescreeningList);
    if (response && response.data && response.data.flag_details) {
      const mappedUsers = response.data.flag_details.map(detail => {
        return {
          id: detail.user_data.id,
          date: detail.submission_details[0].submission_data.submission_date.split(' ')[0],
          name: `${detail.user_data.first_name} ${detail.user_data.middle_name ? detail.user_data.middle_name + ' ' : ''}${detail.user_data.last_name}`,
          age: new Date().getFullYear() - new Date(detail.user_data.date_of_birth).getFullYear(),
          sex: detail.user_data.gender,
          pastMentalDisorder: detail.submission_details[0].submission_data.diagnosis || 'none',
          depressionSeverity: detail.submission_details[0].measurement_data.phq_measurement || 'none',
          generalAnxietySeverity: detail.submission_details[0].measurement_data.gad_measurement || 'none',
          adverseChildhoodExperienceSeverity: 'none',
          tobaccoProductsSeverity: detail.submission_details[0].measurement_assist_data.tobacco_measurement || 'none',
          alcoholicBeveragesSeverity: detail.submission_details[0].measurement_assist_data.alcoholic_measurement || 'none',
          cannabisSeverity: detail.submission_details[0].measurement_assist_data.cannabis_measurement || 'none',
          cocaineSeverity: detail.submission_details[0].measurement_assist_data.cocaine_measurement || 'none',
          amphetamineTypeSeverity: detail.submission_details[0].measurement_assist_data.amphetamine_measurement || 'none',
          inhalantsSeverity: detail.submission_details[0].measurement_assist_data.inhalants_measurement || 'none',
          sedativesSeverity: detail.submission_details[0].measurement_assist_data.sedatives_measurement || 'none',
          hallucinogensSeverity: detail.submission_details[0].measurement_assist_data.hallucinogens_measurement || 'none',
          opioidsSeverity: detail.submission_details[0].measurement_assist_data.opioids_measurement || 'none',
          othersSeverity: detail.submission_details[0].measurement_assist_data.other_measurement || 'none',
          substanceByInjection: detail.submission_details[0].measurement_assist_data.injection_measurement || 'none'
          // Add more fields as needed
        };
      });
      users.value = mappedUsers;
    }
  } catch (error) {
    console.error(error);
  }
});

</script>


<style scoped>
table {
  border-collapse: separate;
  border-spacing: 0 10px;
  table-layout: auto;
  width: 100%;
}

tbody {
  border: 1px solid black;
}

.main-container {
  overflow: scroll;
}

.shadow-row {
  border-bottom: 1px solid #d8e2e588;
  box-shadow: 4px 4px 4px rgba(0, 0, 0, 0.15);
  background-color: #d8e2e5;
  border-radius: 20px !important;
}

.shadow-row td {
  background: transparent;
}

table th,
table td {
  width: 20rem;
}

.severity-severe {
  color: #c40000;
  background: #a800003a;
}

.severity-moderate-severe {
  color: #dc6503;
  background: #b563003a;
}

.severity-moderate {
  color: #e39700;
  background: #c8aa003a;
}

.severity-mild {
  color: #008300;
  background: #0083003a;
}

.severity-none {
  color: #5f5f5f;
}

/* Style for severity dot */
.severity-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 5px;
}

/* Apply border, border-radius, and padding to severity text */
td span.severity-severe,
td span.severity-moderate-severe,
td span.severity-moderate,
td span.severity-mild {
  border: 2px solid;
  border-radius: 50px;
  padding: 0.5rem 1rem;
}

thead tr td {
  color: green !important;
}

.me-2 {
  display: flex;
  widows: 50rem;
}

i.fas {
  margin-right: 0.5rem;
}
</style>
