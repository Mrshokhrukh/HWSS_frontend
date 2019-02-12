<template>
  <div class="row container-fluid p-5">
    <div class="col-md-8">
      <h1 class="text-center bold">{{ clusterTestTitle }}</h1>
      <p class="custom-font">{{ clusterTestContent }}</p>
      <p class="custom-text-color">{{ clusterTestDisclaimer }}</p>
      <div class="d-flex justify-content-center">
        <button class="btn btn-primary btn-lg custom-size-btn" @click="continueAction">Continue</button>
      </div>
    </div>
    <div class="col-md-4">
      <img :src="clusterTestIcon" :alt="app_name" class="img-fluid">
    </div>
  </div>
</template>
  
<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const clusterTestTitle = ref('');
const clusterTestContent = ref('');
const clusterTestDisclaimer = ref('');
const clusterTestIcon = ref('');
const app_name = ref('');

// Fetch data from the API when the component is mounted
onMounted(async () => {
  try {
    const response = await axios.get('http://localhost:8000/api/v1/settings/');
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
  width: 432px;
  height: 62px;
  /* Optional: Adjust font size and other properties as needed */
  font-size: 18px; /* Example to increase font size */
  background-color: #2C6975;
}
.custom-text-color{
  color: #2C6975;
  font-weight: 800;
}
.custom-font{
  font-weight: 600;
}
</style>
  