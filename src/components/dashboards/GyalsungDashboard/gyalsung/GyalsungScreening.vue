<template>
  <div class="container-fluid bg-color pt-3">
    <!-- Header with Entrant Information -->
    <div class="row mb-3">
      <div class="col-12">
        <div class="card p-3 shadow-sm">
          <div class="d-flex justify-content-between align-items-center">
            <h5 class="mb-0 text-teal">Screening</h5>
            <div class="entrant-info">
              <span class="badge bg-light text-dark me-2">Entrant CID#: {{ entrantCid }}</span>
              <span class="badge bg-light text-dark me-2">Name: {{ entrantName }}</span>
              <span class="badge bg-light text-dark">Gender: {{ entrantGender }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="row">
      <div class="col-12 text-center py-5">
        <div class="spinner-border text-teal" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-3">Loading screening questions...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="row">
      <div class="col-12">
        <div class="alert alert-danger" role="alert"><strong>Error:</strong> {{ error }}</div>
      </div>
    </div>

    <!-- Questions Display -->
    <div v-else-if="questions.length > 0" class="row">
      <div class="col-12">
        <div class="card shadow-sm">
          <!-- Question Header -->
          <div class="card-header bg-teal text-white">
            <h5 class="mb-0">{{ currentQuestionHeader }}</h5>
          </div>

          <div class="card-body p-4">
            <!-- Question Text -->
            <div class="question-text mb-4">
              <h6 class="text-dark">{{ currentQuestion.text }}</h6>
            </div>

            <!-- Answer Options -->
            <div class="answer-options">
              <div class="row">
                <div
                  v-for="option in currentQuestion.answers"
                  :key="option.id"
                  class="col-md-6 col-sm-12 mb-3"
                >
                  <div class="answer-option">
                    <label class="radio-label w-100">
                      <input
                        type="radio"
                        :value="option"
                        @change="handleAnswerSelection(option)"
                        :name="`question_${currentQuestion.id}`"
                        required
                        class="radio-input"
                      />
                      <span class="option-text">{{ option.option }}</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Navigation Buttons -->
        <div class="d-flex justify-content-between mt-4">
          <button
            class="btn btn-secondary btn-lg"
            @click="goBack"
            :disabled="currentQuestionIndex === 0"
          >
            <i class="fas fa-arrow-left me-2"></i>BACK
          </button>

          <div>
            <button class="btn btn-warning btn-lg me-2" @click="resetAnswers">RESET</button>

            <button
              v-if="currentQuestionIndex < questions.length - 1"
              class="btn btn-primary btn-lg"
              @click="goNext"
              :disabled="!isCurrentQuestionAnswered"
            >
              NEXT<i class="fas fa-arrow-right ms-2"></i>
            </button>

            <button
              v-else
              class="btn btn-success btn-lg"
              @click="submitScreening"
              :disabled="!isCurrentQuestionAnswered"
            >
              SUBMIT SCREENING
            </button>
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="progress mt-4" style="height: 8px">
          <div
            class="progress-bar bg-teal"
            :style="{ width: progressPercentage + '%' }"
            role="progressbar"
          ></div>
        </div>
        <div class="text-center mt-2">
          <small class="text-muted"
            >Question {{ currentQuestionIndex + 1 }} of {{ questions.length }}</small
          >
        </div>
      </div>
    </div>

    <!-- No Questions State -->
    <div v-else class="row">
      <div class="col-12 text-center py-5">
        <div class="alert alert-info" role="alert">
          <h5>No screening questions available</h5>
          <p>Please contact the administrator to configure screening questions.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import endpoints from '@/api'

const router = useRouter()

// Reactive data
const questions = ref([])
const currentQuestionIndex = ref(0)
const answers = ref({})
const loading = ref(false)
const error = ref('')

const entrantCid = ref('')
const entrantName = ref('')
const entrantGender = ref('')

// Computed properties
const currentQuestion = computed(() => {
  return questions.value[currentQuestionIndex.value] || {}
})

const currentQuestionHeader = computed(() => {
  return 'Over Past 2 Weeks, have you been bothered by any of the following problems:'
})

const isCurrentQuestionAnswered = computed(() => {
  return (
    answers.value[currentQuestion.value.id] !== undefined &&
    answers.value[currentQuestion.value.id] !== null
  )
})

const progressPercentage = computed(() => {
  if (questions.value.length === 0) return 0
  return ((currentQuestionIndex.value + 1) / questions.value.length) * 100
})

const fetchQuestions = async () => {
  loading.value = true
  error.value = ''

  try {
    const token = localStorage.getItem('authToken')
    const headers = token ? { Authorization: `Token ${token}` } : {}

    const response = await axios.get(`http://localhost:8686/api/v1/question_bank/question/`, {
      headers,
      timeout: 5000
    })

    let questionData = []

    if (Array.isArray(response.data)) {
      const testWithQuestions = response.data.find(
        (test) => test.question_sets && test.question_sets.length > 0
      )
      if (testWithQuestions) {
        questionData = testWithQuestions.question_sets.flatMap((set) =>
          set.questions.map((q) => ({ ...q, setName: set.name }))
        )
      }
    } else if (response.data.question_sets) {
      questionData = response.data.question_sets.flatMap((set) =>
        set.questions.map((q) => ({ ...q, setName: set.name }))
      )
    }

    questions.value = questionData

    if (questionData.length > 0) {
      console.log('Questions successfully fetched from API:', questionData.length, 'questions')
    } else {
      console.log('API returned no questions, using fallback')
    }

    console.log('Questions API response:', questionData)

    questions.value.forEach((question) => {
      answers.value[question.id] = null
    })
  } catch (err) {
    console.error('Failed to fetch questions from QBS:', err)
    console.error('Error details:', err.response?.data || err.message)
    error.value = `Failed to load screening questions. Error: ${err.response?.data?.detail || err.message}`
  } finally {
    loading.value = false
  }
}

const handleAnswerSelection = (option) => {
  answers.value[currentQuestion.value.id] = option
  console.log(`Question ${currentQuestion.value.id} answered:`, option)
}

const goNext = () => {
  if (currentQuestionIndex.value < questions.value.length - 1) {
    currentQuestionIndex.value++
  }
}

const goBack = () => {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--
  }
}

const resetAnswers = () => {
  if (confirm('Are you sure you want to reset all answers?')) {
    Object.keys(answers.value).forEach((key) => {
      answers.value[key] = null
    })
    currentQuestionIndex.value = 0
  }
}

const submitScreening = async () => {
  try {
    // Format answers for submission (1:a, 2:c format)
    const formattedAnswers = Object.entries(answers.value)
      .filter(([_, answer]) => answer !== null)
      .map(([questionId, answer]) => `${questionId}:${answer.option.charAt(0).toLowerCase()}`)
      .join(', ')

    console.log('Submitting screening answers:', formattedAnswers)

    const token = localStorage.getItem('authToken')
    const response = await axios.post(
      endpoints.submitGyalsungScreening,
      {
        cid: entrantCid.value,
        answers: formattedAnswers
      },
      {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Token ${token}` } : {})
        }
      }
    )

    console.log('Screening submission response:', response)
    alert('Screening completed successfully!')
    router.push('/gyalsung-dashboard')
  } catch (err) {
    console.error('Failed to submit screening:', err)
    alert('Failed to submit screening. Please try again.')
  }
}

onMounted(() => {
  fetchQuestions()
})
</script>

<style scoped>
.bg-color {
  background-color: #e8f6ee;
  min-height: 100vh;
}

.text-teal {
  color: #2c6975;
}

.bg-teal {
  background-color: #2c6975;
}

.answer-option {
  border: 2px solid #e9ecef;
  border-radius: 8px;
  padding: 1rem;
  transition: all 0.3s ease;
  cursor: pointer;
}

.answer-option:hover {
  border-color: #2c6975;
  background-color: #f8f9fa;
}

.radio-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  margin: 0;
}

.radio-input {
  margin-right: 0.75rem;
  transform: scale(1.2);
}

.radio-input:checked + .option-text {
  color: #2c6975;
  font-weight: 600;
}

.option-text {
  font-size: 1rem;
  color: #495057;
}

.question-text h6 {
  font-size: 1.1rem;
  line-height: 1.5;
}

.progress-bar {
  transition: width 0.3s ease;
}

.btn {
  border-radius: 8px;
  font-weight: 600;
  padding: 0.75rem 1.5rem;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
