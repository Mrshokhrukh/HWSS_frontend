<template>
  <div class="school-environment-table">
    <DataTable :value="roleFilteredData" :paginator="true" :rows="10" :globalFilterFields="globalFilterFields"
      resizableColumns columnResizeMode="fit">
      <Column v-for="field in tableFields" :key="field.key" :field="field.key" :header="field.header" :sortable="true">
        <template #body="{ data }">
          <span>{{ data[field.key] }}</span>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import endpoints from '@/api';

// Get user details from localStorage
const userDetailsString = localStorage.getItem('userDetailsStore');
const userDetails = JSON.parse(userDetailsString);

// Create reactive variables
const userRole = ref(userDetails.user.role);
const agencyName = ref(userDetails.agency.agencyName);
const userDzongkhag = ref(userDetails.user.psAddDzongkhag);

const schoolEnvData = ref(null);
const loading = ref(false);
const error = ref(null);

const globalFilterFields = [
  'I feel safe at school', 'My school is free of corporal punishment',
  'I feel motivated to come to school', 'My teachers and other staff are helpful and supportive',
  'My school is free of bullying', 'All the students receive fair treatment at school',
  'My school engages all the students in all school activities', 'Students get along well with each other in our school',
  'What do you like the most about your school?', 'What changes do you really wish to see in your school?'
];

const tableFields = [
  { key: 'I feel safe at school', header: 'I feel safe at school' },
  { key: 'My school is free of corporal punishment', header: 'My school is free of corporal punishment' },
  { key: 'I feel motivated to come to school', header: 'I feel motivated to come to school' },
  { key: 'My teachers and other staff are helpful and supportive', header: 'My teachers and other staff are helpful and supportive' },
  { key: 'My school is free of bullying', header: 'My school is free of bullying' },
  { key: 'All the students receive fair treatment at school', header: 'All the students receive fair treatment at school' },
  { key: 'My school engages all the students in all school activities', header: 'My school engages all the students in all school activities' },
  { key: 'Students get along well with each other in our school', header: 'Students get along well with each other in our school' },
  { key: 'What do you like the most about your school? (Mention two things)', header: 'What do you like the most about your school?' },
  { key: 'What changes do you really wish to see in your school? (mention two things)', header: 'What changes do you really wish to see in your school?' }
];
const fetchSchoolEnvData = async () => {
  loading.value = true;
  error.value = null;

  try {
    const response = await axios.get(endpoints.getSchoolEnvData);
    schoolEnvData.value = response.data;
  } catch (err) {
    error.value = 'Failed to fetch school environment data';
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const processedData = computed(() => {
  if (!schoolEnvData.value) return [];

  return Object.values(schoolEnvData.value).map(user => {
    const rowData = { username: user.user_details.username };

    // Create an object to collect all answers for repeated questions
    const answersMap = {};

    user.submissions.forEach(submission => {
      if (answersMap[submission.question]) {
        // Append answer if this question has multiple answers
        answersMap[submission.question] += `, ${submission.answer}`;
      } else {
        // Add the first answer for this question
        answersMap[submission.question] = submission.answer;
      }
    });

    // Populate rowData with concatenated answers
    tableFields.forEach(field => {
      rowData[field.key] = answersMap[field.key] || '----';
    });

    return rowData;
  });
});


const roleFilteredData = computed(() => {
  if (!userRole.value) return processedData.value;

  switch (userRole.value) {
    case 'school_counselor':
    case 'trained_professional':
    case 'gyalsung_counselor':
      return processedData.value.filter(user =>
        schoolEnvData.value[user.username].user_details.user_agency?.agency_name === agencyName.value
      );
    case 'clinical_counselor':
      return processedData.value.filter(user => {
        const userDetails = schoolEnvData.value[user.username].user_details;
        return userDetails.perm_add_dzongkhag === userDzongkhag.value ||
          userDetails.ps_add_dzongkhag === userDzongkhag.value;
      });
    default:
      return processedData.value;
  }
});

onMounted(() => {
  fetchSchoolEnvData();
});
</script>

<style scoped>
/* Add scoped styles here if needed */
</style>