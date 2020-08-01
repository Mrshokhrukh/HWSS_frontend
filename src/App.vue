<template>
  <div class="content-wrapper">
    <div>
      <NewChatWidget />
    </div>

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
import NewChatWidget from '@/components/common/NewChatWidget.vue'

const copyright = ref('')
const isMobileDevice = ref(false)
const csrfToken = ref('')

onMounted(async () => {
  // Check if mobile device
  isMobileDevice.value = window.innerWidth <= 768;

  // Redirect if mobile
  if (isMobileDevice.value) {
    alert("This application is not optimized for mobile use. Please revisit on a computer or use a tablet in landscape mode. Alternatively, consider downloading our dedicated app for mobile access.");

    setTimeout(() => {
      window.location.href = "https://www.google.com";
    }, 500);
  }

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

.chat-icon {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 9999;
  cursor: pointer;
  background-color: #ffffffe9;
  border-radius: 50%;
  box-shadow: 14px 14px 14px 18px rgba(0, 0, 0, 0.1);
}

.chat-icon img {
  width: 60px;
  height: 60px;
  border-radius: 50%;
}

.chat-icon.active {
  display: none;
}

.chat-icon:hover {
  background-color: #ffffff;
  box-shadow: 14px 14px 14px rgba(0, 0, 0, 0.15);
}

.chat-widget {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 9998;
  width: 300px;
  height: 400px;
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

@keyframes float-around {
  0% {
    transform: translate(0, 0);
  }

  25% {
    transform: translate(-20px, -10px);
  }

  50% {
    transform: translate(-10px, -20px);
  }

  75% {
    transform: translate(-20px, -10px);
  }

  100% {
    transform: translate(0, 0);
  }
}
</style>