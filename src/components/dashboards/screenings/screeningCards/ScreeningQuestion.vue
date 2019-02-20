<template>
  <div class="row container-fluid p-5">
    <div class="col-md-8">
      <h1 class="text-center bold mb-4">{{ clusterTestTitle }}</h1>
      <p class="custom-font mb-4">{{ clusterTestContent }}</p>
      <p class="custom-text-color mb-5">{{ clusterTestDisclaimer }}</p>
      <div class="d-flex justify-content-center">
        <button class="btn btn-primary btn-lg custom-size-btn" @click="continueAction">Continue</button>
      </div>
    </div>
    <div class="col-md-4 text-center">
      <img :src="clusterTestIcon" :alt="app_name" class="img-fluid animated-icon">
    </div>
  </div>
</template>

  
<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import endpoints from '@/api';

const clusterTestTitle = ref('');
const clusterTestContent = ref('');
const clusterTestDisclaimer = ref('');
const clusterTestIcon = ref('');
const app_name = ref('');

// Fetch data from the API when the component is mounted
onMounted(async () => {
  try {
    const response = await axios.get(endpoints.settings);
    if (response && response.data && response.data.length > 0) {
      const data = response.data[0];
      clusterTestTitle.value = data.cluster_test_title;
      clusterTestContent.value = data.cluster_test_content;
      clusterTestDisclaimer.value = data.cluster_test_disclaimer;
      clusterTestIcon.value = data.cluster_test_icon;
      app_name.value = data.app_name;
    }
  } catch (error) {
    console.error('There was an error fetching the data:', error);
  }
});

const continueAction = () => {
  // Define what happens when the user clicks continue.
  // This could change the state, navigate to a new route, etc.
};
</script>
<style scoped>
.custom-size-btn {
  width: 100%;
  height: auto;
  font-size: 18px;
  background-color: #2C6975;
}

.custom-text-color {
  color: #2C6975;
  font-weight: 800;
}

.custom-font {
  font-weight: 600;
}
</style>

  