<template>
  <div class="content-wrapper">
    <header>
      <div class="wrapper">
        <nav>
        </nav>
      </div>
    </header>

    <RouterView />

    <footer class="text-center bg-transparent text-color py-2 d-none">
      <p v-html="copyright" />
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import endpoints from '@/api'
import Cookies from 'js-cookie'

const copyright = ref('')
const isMobileDevice = ref(false)
const csrfToken = ref('')
onMounted(async () => {
  try {
    const csrfResponse = await axios.get(endpoints.getCSRFToken)
    if (csrfResponse.data && csrfResponse.data.csrf_token) {
      csrfToken.value = csrfResponse.data.csrf_token
      Cookies.set('csrftoken', csrfToken.value)
    }
  } catch (error) {
    console.error('Error fetching CSRF token:', error)
  }

  try {
    const response = await axios.get(endpoints.settings)
    if (response.data && response.data.length > 0 && response.data[0].copyright_message) {
      const currentYear = new Date().getFullYear()
      const message = response.data[0].copyright_message
      copyright.value = `&copy; ${currentYear}. ${message}`
    }
  } catch (error) {
    console.error('Error fetching copyright message:', error)
  }
  isMobileDevice.value = window.innerWidth <= 768;

  if (isMobileDevice.value) {
    alert("This application is not optimized for mobile use. Please revisit on a computer or use a tablet in landscape mode. Alternatively, consider downloading our dedicated app for mobile access.");

    setTimeout(() => {
      window.location.href = "https://www.google.com";
    }, 5000);
  }
})
</script>


<style scoped>
.content-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.text-color {
  color: #2B656F;
}

footer {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  margin-left: auto;
  margin-right: auto;
  width: 100%;
}
</style>
