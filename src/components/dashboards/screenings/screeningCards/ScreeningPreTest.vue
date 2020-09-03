<template>
  <div class="card shadow-lg border-0 rounded-3 overflow-hidden">
    <div class="card-body p-0">
      <div class="row g-0">
        <div class="col-lg-8 p-5">
          <div v-if="loading" class="loading-container">
            <div class="loading-spinner"></div>
            <p class="loading-text">Loading...</p>
          </div>
          <div v-else>
            <div v-if="clusterTestStatus === 'active'">
              <h1 class="fw-bold mb-4 hwss-primary gradient-text">{{ clusterTestTitle }}</h1>
              <p class="lead mb-4">{{ clusterTestContent }}</p>
              <div class="alert alert-info mb-4 custom-alert" role="alert">
                <i class="bi bi-info-circle-fill me-2"></i>
                {{ clusterTestDisclaimer }}
              </div>
              <button
                @click="continueAction"
                class="btn btn-primary btn-lg w-100 py-3 fw-bold text-uppercase gradient-button"
              >
                Continue <i class="bi bi-arrow-right-circle ms-2"></i>
              </button>
            </div>
            <div v-else>
              <h2 class="h3 mb-4 gradient-text">No Tests Available</h2>
              <p class="lead mb-4">
                Currently, there are no tests available. In the meantime, consider reading these
                articles for mental health awareness:
              </p>
              <div class="list-group custom-list-group">
                <a
                  v-for="(article, index) in articles"
                  :key="index"
                  :href="article.url"
                  target="_blank"
                  class="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                >
                  <span>{{ article.title }}</span>
                  <i class="bi bi-box-arrow-up-right"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
        <div class="col-lg-4 d-flex align-items-center justify-content-center gradient-bg p-5">
          <img :src="clusterTestIcon" :alt="app_name" class="img-fluid animated-icon" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import apiClient from '@/apiClient'
import endpoints from '@/api'
import { useRouter } from 'vue-router'
import clusterTestIcon from '@/assets/images/book1.png'

const router = useRouter()
const clusterTestTitle = ref('')
const clusterTestContent = ref('')
const clusterTestDisclaimer = ref('')
const app_name = ref('')

const clusterTestStatus = ref('')
const loading = ref(true)
const cacheDuration = 5 * 60 * 1000

const articles = [
  {
    title: 'Understanding Depression',
    url: 'https://www.helpguide.org/articles/depression/depression-symptoms-and-warning-signs.htm'
  },
  { title: 'Anxiety Disorders', url: 'https://www.nimh.nih.gov/health/topics/anxiety-disorders' },
  {
    title: 'Coping with Drug Use and Addiction',
    url: 'https://www.drugabuse.gov/publications/drugfacts/understanding-drug-use-addiction'
  },
  {
    title: 'Mental Health and Wellness',
    url: 'https://www.mentalhealth.gov/basics/what-is-mental-health'
  }
]

const continueAction = () => {
  if (clusterTestStatus.value === 'active') {
    router.push('/student-dashboard/screening-start')
  }
}

async function checkClusterTestStatus() {
  const cacheKey = 'clusterTestStatus'
  const cached = localStorage.getItem(cacheKey)
  const now = new Date().getTime()

  if (cached) {
    const { expiry, status } = JSON.parse(cached)
    if (now < expiry) {
      clusterTestStatus.value = status
      loading.value = false
      return
    }
  }

  try {
    const response = await apiClient.get(endpoints.screeningPreTests)
    const clusterTest = response.data.find((test) => test.name === 'Cluster Screening')
    if (clusterTest) {
      clusterTestStatus.value = clusterTest.status
      localStorage.setItem(
        cacheKey,
        JSON.stringify({ expiry: now + cacheDuration, status: clusterTest.status })
      )
    }
  } catch (error) {
    console.error('Error fetching cluster test status:', error)
  } finally {
    setTimeout(() => {
      loading.value = false
    }, 1200)
  }
}

onMounted(async () => {
  checkClusterTestStatus()
  try {
    const response = await apiClient.get(endpoints.settings)
    if (response && response.data && response.data.length > 0) {
      const data = response.data[0]
      clusterTestTitle.value = data.cluster_test_title
      clusterTestContent.value = data.cluster_test_content
      clusterTestDisclaimer.value = data.cluster_test_disclaimer
      app_name.value = data.app_name
    }
  } catch (error) {
    console.error('There was an error fetching the data:', error)
  }
})
</script>

<style scoped>
.card {
  background: #ffffff;
  transition: box-shadow 0.3s ease-in-out;
}

.card:hover {
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.gradient-bg {
  background: linear-gradient(135deg, #2b656f 0%, #1d4851 100%);
}

.gradient-text {
  background: linear-gradient(135deg, #2b656f 0%, #1d4851 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  color: transparent;
}

.gradient-button {
  background: linear-gradient(135deg, #2b656f 0%, #1d4851 100%);
  border: none;
  color: white;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-size: 1.125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px -1px rgba(43, 101, 111, 0.2);
}

.gradient-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 8px -1px rgba(43, 101, 111, 0.3);
}

.animated-icon {
  transition: transform 0.3s ease-in-out;
}

.animated-icon:hover {
  transform: scale(1.05);
}

.custom-list-group .list-group-item {
  transition: all 0.3s ease;
  border-left: 4px solid transparent;
}

.custom-list-group .list-group-item:hover {
  background-color: #f8f9fa;
  border-left-color: #2b656f;
  transform: translateX(5px);
}

.custom-alert {
  border-left: 4px solid #2b656f;
  background-color: rgba(43, 101, 111, 0.1);
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
}

.loading-spinner {
  border: 4px solid rgba(43, 101, 111, 0.1);
  border-top: 4px solid #2b656f;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

.loading-text {
  margin-top: 1rem;
  color: #2b656f;
  font-weight: 600;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>