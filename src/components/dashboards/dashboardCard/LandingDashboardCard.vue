<template>
  <div class="container">
    <div class="row">
      <div class="col-md-8">
        <h1 class="text-center my-3"> Hi, <span class="text-capitalized">{{ userName }}</span>! </h1>
        <h3 class="my-4">Welcome to <span class="text-capitalized">{{ appName }}</span> Dashboard!</h3>
        <div class="row justify-content-center">
          <button class="btn custom-btn arrow-button" @click="navigateToScreening">Screen your mental Health</button>
        </div>
      </div>
      <div class="col-md-4 d-flex align-items-center justify-content-center">
        <img src="@/assets/images/brainicon.png" class="img-fluid" alt="">
      </div>
    </div>

    <!-- Modal Popup -->
    <div v-if="showModal" class="modal-overlay" @click="showModal = false">
      <div class="modal-content" @click.stop style="max-width: 350px; z-index:9999;">
        <p>There are no active questions available at the moment.</p>
        <button @click="showModal = false">Close</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import { useUserDetailsStore } from '@/stores/userDetails'; // Import the userDetails store
import test_types from '@/questions.json';
import endpoints from '@/api';

const router = useRouter();
const userDetailsStore = useUserDetailsStore(); // Use the store

// Computed properties to reactively access userName and profilePicture
const userName = computed(() => `${userDetailsStore.userName}`);
const appName = ref('');
const showModal = ref(false);
const loading = ref(true); // Introduce loading state

async function fetchAppName() {
  try {
    const cachedAppName = sessionStorage.getItem('appName');
    if (cachedAppName) {
      appName.value = cachedAppName;
    } else {
      const response = await axios.get(endpoints.settings);
      appName.value = response.data[0].app_name;
      sessionStorage.setItem('appName', appName.value);
    }
    loading.value = false; // Set loading to false once app name is fetched
  } catch (error) {
    console.error('Error fetching app name:', error);
    loading.value = false;
  }
}

async function navigateToScreening() {
  let clusterTestFound = false;
  for (const test of Object.values(test_types)) {
    if (test.name === "Cluster Test" && test.status === "Active") {
      clusterTestFound = true;
      break;
    }
  }

  if (clusterTestFound) {
    alert('Congratulations, the questions are now available to screen.');
    router.push('/student-dashboard/screening');
  } else {
    alert('Sorry, you cannot continue as there are no Cluster tests available to screen.');
    // showModal.value = true;
  }
}

onMounted(async () => {
  await fetchAppName(); // Only fetchAppName is needed on mounted
});
</script>




<style scoped>
.custom-btn {
  background-color: #2B656F;
  color: #fff;
  font-size: inherit;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

span.text-capitalized {
  color: #2B656F;
  text-transform: uppercase;
}

.arrow-button {
  position: relative;
  display: flex;
  align-items: center;
  padding: 10px 20px;
  background-color: #2B656F;
  color: #fff;
  border: none;
  border-radius: 20px;
  cursor: pointer;
}

.arrow-button::after {
  content: '\2192';
  /* Unicode character for right arrow */
  font-size: 25px;
  font-weight: 800;
  font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
  position: absolute;
  right: -10px;
  /* Adjust this value to control the distance of the arrow from the right edge */
}

.arrow-button::before {
  content: '';
  width: 40px;
  /* Adjust the width of the circle */
  height: 40px;
  /* Adjust the height of the circle */
  background-color: #2B656F;
  /* Same as the button background color */
  border-radius: 50%;
  position: absolute;
  right: 0;
  transform: translateX(50%);
  /* Center the circle on the right side */
  display: flex;
  justify-content: center;
  align-items: center;
  border: 2px solid #fff;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 5px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
</style>
