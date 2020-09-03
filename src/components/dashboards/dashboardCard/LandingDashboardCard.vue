<template>
  <div class="dashboard-container">
    <div v-if="loading" class="loader-container">
      <div class="modern-loader"></div>
    </div>

    <div class="dashboard-content" v-else>
      <div class="welcome-card">
        <div class="content-grid">
          <div class="welcome-content">
            <h1 class="greeting">
              Hi, <span class="highlight">{{ fullName }}</span
              >!
            </h1>
            <h2 class="welcome-text">
              Welcome to <span class="highlight">{{ appName }}</span> Dashboard!
            </h2>
            <div class="action-container">
              <button
                class="screen-button"
                @click="navigateToScreening"
                :class="{ 'animate-pulse': true }"
              >
                <span class="button-text">Screen your Mental Health</span>
                <span class="button-icon">→</span>
              </button>
            </div>
          </div>

          <div class="brain-animation">
            <img src="@/assets/images/brainicon.png" class="brain-icon" alt="Brain Health Icon" />
          </div>
        </div>
      </div>
    </div>

    <!-- Enhanced Modal -->
    <div v-if="showModal" class="modal-backdrop" @click="showModal = false">
      <div class="modal-window" @click.stop>
        <div class="modal-header">
          <h3>Hello {{ fullName }}!</h3>
          <button class="close-btn" @click="showModal = false">
            <span>×</span>
          </button>
        </div>

        <div class="modal-body">
          <p v-if="clusterTestStatus === 'inactive'" class="status-message">
            Currently, there are no tests available. In the meantime, consider reading these
            articles for mental health awareness:
          </p>
          <p v-if="clusterTestStatus === 'disabled'" class="status-message">
            This test does not exist yet. Consider reading these articles for mental health
            awareness:
          </p>

          <div class="resources-list">
            <a
              href="https://www.helpguide.org/articles/depression/depression-symptoms-and-warning-signs.htm"
              target="_blank"
              class="resource-link"
            >
              <span>Understanding Depression</span>
              <svg class="external-link-icon" viewBox="0 0 24 24" width="16" height="16">
                <path
                  fill="currentColor"
                  d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"
                />
              </svg>
            </a>
            <a
              href="https://www.nimh.nih.gov/health/topics/anxiety-disorders"
              target="_blank"
              class="resource-link"
            >
              <span>Anxiety Disorders</span>
              <svg class="external-link-icon" viewBox="0 0 24 24" width="16" height="16">
                <path
                  fill="currentColor"
                  d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"
                />
              </svg>
            </a>
            <a
              href="https://www.drugabuse.gov/publications/drugfacts/understanding-drug-use-addiction"
              target="_blank"
              class="resource-link"
            >
              <span>Coping with Drug Use and Addiction</span>
              <svg class="external-link-icon" viewBox="0 0 24 24" width="16" height="16">
                <path
                  fill="currentColor"
                  d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"
                />
              </svg>
            </a>
            <a
              href="https://www.mentalhealth.gov/basics/what-is-mental-health"
              target="_blank"
              class="resource-link"
            >
              <span>Mental Health and Wellness</span>
              <svg class="external-link-icon" viewBox="0 0 24 24" width="16" height="16">
                <path
                  fill="currentColor"
                  d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"
                />
              </svg>
            </a>
          </div>
        </div>

        <div class="modal-footer">
          <button class="close-modal-btn" @click="showModal = false">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import apiClient from '@/apiClient'
import { useRouter } from 'vue-router'
import { useUserDetailsStore } from '@/stores/userDetails'
import endpoints from '@/api'
import Swal from 'sweetalert2'

const router = useRouter()
const userDetailsStore = useUserDetailsStore()
const appName = ref('')
const showModal = ref(false)
const loading = ref(true)
const clusterTestStatus = ref('')

const fullName = computed(() => {
  const { firstName, middleName, lastName } = userDetailsStore.user
  return `${firstName} ${middleName ? middleName + ' ' : ''}${lastName}`.trim()
})

async function fetchAppName() {
  try {
    const response = await apiClient.get(endpoints.settings)
    appName.value = response.data[0].app_name
    loading.value = false
  } catch (error) {
    console.error('Error fetching app name:', error)
    loading.value = false
  }
}

async function navigateToScreening() {
  loading.value = true
  try {
    const response = await apiClient.get(endpoints.screeningPreTests)
    const clusterTest = response.data.find((test) => test.name === 'Cluster Screening')
    if (clusterTest) {
      clusterTestStatus.value = clusterTest.status
      showModalBasedOnStatus(clusterTest.status)
    } else {
      console.error('Cluster test not found')
    }
  } catch (error) {
    console.error('Error fetching cluster test status:', error)
  } finally {
    loading.value = false
  }
}

function showModalBasedOnStatus(status) {
  if (status === 'active') {
    Swal.fire('Congratulations!', 'The questions are now available to screen.', 'success').then(
      () => {
        router.push('/student-dashboard/screening')
      }
    )
  } else {
    showModal.value = true
  }
}

onMounted(async () => {
  await fetchAppName()
})
</script>

<style scoped>
.dashboard-container {
  background-color: #f8fafc;
}

.dashboard-content {
  max-width: 1200px;
  margin: 0 auto;
}

.welcome-card {
  background: linear-gradient(135deg, #e6f3f5, #f0f7f8);
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  padding: 1rem;
}

.content-grid {
  display: grid;
  grid-template-columns: 3fr 1fr;
  gap: 2rem;
  align-items: center;
}

.welcome-content {
  padding: 1rem;
}

.greeting {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 0.5rem;
}

.welcome-text {
  font-size: 1.75rem;
  color: #4a5568;
  margin-bottom: 2rem;
}

.highlight {
  color: #2b656f;
  font-weight: 700;
}

.action-container {
  margin-top: 2rem;
}

.screen-button {
  display: inline-flex;
  align-items: center;
  background: linear-gradient(135deg, #2b656f 0%, #1d4851 100%);
  color: white;
  padding: 1rem 2rem;
  border: none;
  border-radius: 12px;
  font-size: 1.125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px -1px rgba(43, 101, 111, 0.2);
}

.button-text {
  margin-right: 1rem;
}

.button-icon {
  font-size: 1.25rem;
  transition: transform 0.3s ease;
}

.screen-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 15px -3px rgba(43, 101, 111, 0.2);
}

.screen-button:hover .button-icon {
  transform: translateX(4px);
}

.brain-animation {
  display: flex;
  justify-content: center;
  align-items: center;
}

.brain-icon {
  max-width: 300px;
  height: auto;
  animation: float 6s ease-in-out infinite;
}

/* Modal Styles */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

.modal-window {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 600px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  animation: slideUp 0.3s ease;
}

.modal-header {
  position: relative;
  padding: 1.5rem;
  background: linear-gradient(135deg, #2b656f 0%, #1d4851 100%);
  color: white;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.5rem;
}

.close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.modal-body {
  padding: 1.5rem;
}

.status-message {
  color: #4a5568;
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.resources-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.resource-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: #f7fafc;
  border-radius: 8px;
  color: #2b656f;
  text-decoration: none;
  transition: all 0.3s ease;
}

.resource-link:hover {
  background: #edf2f7;
  transform: translateX(4px);
}

.external-link-icon {
  opacity: 0.6;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
}

.close-modal-btn {
  background: #2b656f;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.close-modal-btn:hover {
  background: #1d4851;
}

/* Loader */
.loader-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.modern-loader {
  width: 48px;
  height: 48px;
  border: 4px solid #e2e8f0;
  border-top: 4px solid #2b656f;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }

  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-20px);
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.7;
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .content-grid {
    grid-template-columns: 1fr;
  }

  .brain-animation {
    order: -1;
  }

  .brain-icon {
    max-width: 200px;
  }

  .greeting {
    font-size: 2rem;
  }

  .welcome-text {
    font-size: 1.5rem;
  }

  .screen-button {
    width: 100%;
    justify-content: center;
    padding: 0.875rem 1.5rem;
  }
}
</style>