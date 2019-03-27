<template>
  <div class="container-fluid">
    <!-- Filters -->
    <MonitorFilterCard @filtersApplied="handleFiltersApplied"/>


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
          <tr v-for="(user, index) in filteredUsers" :key="index" class="shadow-row align-middle text-nowrap">
            <td><input type="checkbox" :value="user.id" v-model="selectedUsers"></td>
            <td>{{ user.date }}</td>
            <td>{{ user.name }}</td>
            <td>{{ user.age }}</td>
            <td>{{ user.sex }}</td>
            <td><span class="severity-dot"></span>{{
              user.pastMentalDisorder }}</td>
            <td><span :class="getSeverityClass(user.depressionSeverity)"><span class="severity-dot"></span>{{
              user.depressionSeverity }}</span></td>
            <td><span :class="getSeverityClass(user.generalAnxietySeverity)"><span class="severity-dot"></span>{{
              user.generalAnxietySeverity }}</span></td>
            <td><span :class="getSeverityClass(user.adverseChildhoodExperienceSeverity)"><span
                  class="severity-dot"></span>{{
                    user.adverseChildhoodExperienceSeverity }}</span></td>
            <td><span :class="getSeverityClass(user.tobaccoProductsSeverity)"><span class="severity-dot"></span>{{
              user.tobaccoProductsSeverity }}</span></td>
            <td><span :class="getSeverityClass(user.alcoholicBeveragesSeverity)"><span class="severity-dot"></span>{{
              user.alcoholicBeveragesSeverity }}</span></td>
            <td><span :class="getSeverityClass(user.cannabisSeverity)"><span class="severity-dot"></span>{{
              user.cannabisSeverity }}</span></td>
            <td><span :class="getSeverityClass(user.cocaineSeverity)"><span class="severity-dot"></span>{{
              user.cocaineSeverity }}</span></td>
            <td><span :class="getSeverityClass(user.amphetamineTypeSeverity)"><span class="severity-dot"></span>{{
              user.amphetamineTypeSeverity }}</span></td>
            <td><span :class="getSeverityClass(user.inhalantsSeverity)"><span class="severity-dot"></span>{{
              user.inhalantsSeverity }}</span></td>
            <td><span :class="getSeverityClass(user.sedativesSeverity)"><span class="severity-dot"></span>{{
              user.sedativesSeverity }}</span></td>
            <td><span :class="getSeverityClass(user.hallucinogensSeverity)"><span class="severity-dot"></span>{{
              user.hallucinogensSeverity }}</span></td>
            <td><span :class="getSeverityClass(user.opioidsSeverity)"><span class="severity-dot"></span>{{
              user.opioidsSeverity }}</span></td>
            <td><span :class="getSeverityClass(user.othersSeverity)"><span class="severity-dot"></span>{{
              user.othersSeverity }}</span></td>
            <td><span :class="getSeverityClass(user.substanceByInjection)"><span class="severity-dot"></span>{{
              user.substanceByInjection }}</span></td>
            <td><button @click="viewDetails(user)" class="btn hwss-btn">View Details</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import MonitorFilterCard from './MonitorFilterCard.vue';

// Sample data for table body
const users = ref([
  { id: 1, date: '2024-03-23', name: 'John Doe', age: 30, sex: 'Male', pastMentalDisorder: 'Yes', depressionSeverity: 'Severe', generalAnxietySeverity: 'Moderate', adverseChildhoodExperienceSeverity: 'Mild', tobaccoProductsSeverity: 'Severe', alcoholicBeveragesSeverity: 'Moderately Severe', cannabisSeverity: 'Mild', cocaineSeverity: 'Moderate', amphetamineTypeSeverity: 'Moderate', inhalantsSeverity: 'Mild', sedativesSeverity: 'Severe', hallucinogensSeverity: 'Moderate', opioidsSeverity: 'Moderately Severe', othersSeverity: 'Moderate', substanceByInjection: 'No' },
  { id: 2, date: '2024-03-23', name: 'John Doe', age: 30, sex: 'Male', pastMentalDisorder: 'Yes', depressionSeverity: 'Moderate', generalAnxietySeverity: 'Moderate', adverseChildhoodExperienceSeverity: 'Mild', tobaccoProductsSeverity: 'Severe', alcoholicBeveragesSeverity: 'Moderately Severe', cannabisSeverity: 'Mild', cocaineSeverity: 'Moderate', amphetamineTypeSeverity: 'Moderate', inhalantsSeverity: 'Mild', sedativesSeverity: 'Severe', hallucinogensSeverity: 'Moderate', opioidsSeverity: 'Moderately Severe', othersSeverity: 'Moderate', substanceByInjection: 'No' },
  // Add more mock data as needed
]);

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

// const viewDetails = (user) => {
//   // Logic to view details of a user
// };

const getSeverityClass = (severity) => {
  if (severity === 'Severe' || severity === 'High Risk') {
    return 'severity-severe';
  } else if (severity === 'Moderately Severe') {
    return 'severity-moderate-severe';
  } else if (severity === 'Moderate Risk' || severity === 'Moderate') {
    return 'severity-moderate';
  } else {
    return 'severity-mild';
  }
};

const handleFiltersApplied = (filterValues) => {
  // Logic to handle the selected filter values
  console.log("Selected filter values:", filterValues);
};
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
  color: red;
}

.severity-moderate-severe {
  color: rgb(255, 140, 0);
}

.severity-moderate {
  color: rgb(255, 217, 0);
}

.severity-mild {
  color: green;
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
</style>
