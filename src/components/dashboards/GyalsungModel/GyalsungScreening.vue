<template>
  <div class="screening-container">
    <div class="screening-layout">
      <!-- Main Content -->
      <div class="main-content">
        <div class="content-card">
          <!-- Loading State -->
          <div v-if="loading" class="loading-state">
            <div class="loading-spinner"></div>
            <h4>Loading screening questions...</h4>
          </div>

          <!-- Error State -->
          <div v-else-if="error" class="error-state">
            <h4>Error loading questions</h4>
            <p>{{ error }}</p>
            <button @click="fetchScreeningQuestions" class="retry-btn">Retry</button>
          </div>

          <!-- Screening Questions -->
          <div v-else-if="screeningQuestions.length > 0" class="screening-questions">
            <div class="question-header">
              <h3>Gyalsung Screening</h3>
              <div class="progress-indicator">
                Question {{ currentQuestionIndex + 1 }} of {{ screeningQuestions.length }}
              </div>
            </div>

            <div class="question-container" v-if="currentQuestion">
              <div class="question-card">
                <h4 class="question-text">{{ currentQuestion.question_text }}</h4>

                <!-- Multiple Choice Questions -->
                <div
                  v-if="currentQuestion.question_type === 'multiple_choice'"
                  class="answer-options"
                >
                  <div
                    v-for="option in currentQuestion.options"
                    :key="option.id"
                    class="option-item"
                    @click="selectAnswer(option)"
                    :class="{ selected: selectedAnswer?.id === option.id }"
                  >
                    <div class="option-radio">
                      <input
                        type="radio"
                        :name="`question_${currentQuestion.id}`"
                        :checked="selectedAnswer?.id === option.id"
                        readonly
                      />
                    </div>
                    <span class="option-text">{{ option.option_text }}</span>
                  </div>
                </div>

                <!-- Text Input Questions -->
                <div
                  v-else-if="currentQuestion.question_type === 'text'"
                  class="text-input-container"
                >
                  <textarea
                    v-model="textAnswer"
                    :placeholder="currentQuestion.placeholder || 'Enter your answer...'"
                    class="text-input"
                    rows="4"
                  ></textarea>
                </div>

                <!-- Number Input Questions -->
                <div
                  v-else-if="currentQuestion.question_type === 'number'"
                  class="number-input-container"
                >
                  <input
                    type="number"
                    v-model="numberAnswer"
                    :placeholder="currentQuestion.placeholder || 'Enter a number...'"
                    class="number-input"
                    :min="currentQuestion.min_value || 0"
                    :max="currentQuestion.max_value || 100"
                  />
                </div>
              </div>

              <!-- Navigation Buttons -->
              <div class="navigation-buttons">
                <button
                  @click="goToPreviousQuestion"
                  class="nav-btn prev-btn"
                  :disabled="currentQuestionIndex === 0"
                >
                  Previous
                </button>

                <button @click="goToNextQuestion" class="nav-btn next-btn" :disabled="!hasAnswered">
                  {{ isLastQuestion ? 'Complete' : 'Next' }}
                </button>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else class="empty-state">
            <h4>No screening questions available</h4>
            <p>Please try again later or contact support.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import Swal from 'sweetalert2'
import { useRouter } from 'vue-router'
import { getUserScreenedData, setUserScreenedData } from '@/indexedDBHelper'
import apiClient from '@/apiClient'
import endpoints from '@/api'

const router = useRouter()

// Reactive variables
const loading = ref(false)
const error = ref(null)
const screeningQuestions = ref([])
const currentQuestionIndex = ref(0)
const selectedAnswer = ref(null)
const textAnswer = ref('')
const numberAnswer = ref('')
const answers = ref([])

// Check if this is a Gyalsung flow
const isGyalsungFlow = computed(() => {
  return localStorage.getItem('isGyalsungFlow') === 'true'
})

// Get the CID from Gyalsung registration if available
const ClientUserIdCaseBase = ref([])

// Computed properties
const currentQuestion = computed(() => {
  return screeningQuestions.value[currentQuestionIndex.value] || null
})

const isLastQuestion = computed(() => {
  return currentQuestionIndex.value === screeningQuestions.value.length - 1
})

const hasAnswered = computed(() => {
  if (!currentQuestion.value) return false

  if (currentQuestion.value.question_type === 'multiple_choice') {
    return selectedAnswer.value !== null
  } else if (currentQuestion.value.question_type === 'text') {
    return textAnswer.value.trim() !== ''
  } else if (currentQuestion.value.question_type === 'number') {
    return numberAnswer.value !== '' && numberAnswer.value !== null
  }
  return false
})

// Method to fetch screening questions from backend API
const fetchScreeningQuestions = async () => {
  try {
    loading.value = true
    error.value = null

    // Fetch Gyalsung screening questions from the API
    const response = await apiClient.get(`${endpoints.screeningPreTests}?name=Gyalsung Screening`)

    if (response.data && Array.isArray(response.data) && response.data.length > 0) {
      // Process the API response to match our expected format
      const processedQuestions = []

      response.data.forEach((testData) => {
        if (testData.question_sets && Array.isArray(testData.question_sets)) {
          testData.question_sets.forEach((questionSet) => {
            if (questionSet.questions && Array.isArray(questionSet.questions)) {
              questionSet.questions.forEach((question) => {
                processedQuestions.push({
                  id: question.id,
                  question_text: question.text,
                  question_type: 'multiple_choice', // Assuming all are multiple choice for now
                  options: question.answers
                    ? question.answers.map((answer) => ({
                        id: answer.id,
                        option_text: answer.option,
                        point: answer.points || 0
                      }))
                    : [],
                  setName: questionSet.name
                })
              })
            }
          })
        }
      })

      screeningQuestions.value = processedQuestions
      console.log('Loaded Gyalsung questions from API:', screeningQuestions.value.length)
    } else {
      // Fallback to mock data if no questions found
      screeningQuestions.value = getMockGyalsungQuestions()
      console.log(
        'No API data found, using mock Gyalsung questions:',
        screeningQuestions.value.length
      )
    }
  } catch (err) {
    console.error('Error fetching Gyalsung screening questions from API:', err)
    error.value = 'Failed to load screening questions. Please try again.'

    // Load mock data for testing if API fails
    screeningQuestions.value = getMockGyalsungQuestions()
    console.log('API failed, using mock Gyalsung questions:', screeningQuestions.value.length)
  } finally {
    loading.value = false
  }
}

// Get questions from ScreeningGyalsung component structure
const getGyalsungQuestionsFromScreeningComponent = () => {
  // Static questions from ScreeningGyalsung
  const staticQuestions = [
    'Feeling nervous, anxious, or on edge',
    'Not being able to stop or control worrying'
  ]

  // Default answers from ScreeningGyalsung
  const defaultAnswers = [
    { id: 0, option: 'Not at all', points: 0 },
    { id: 1, option: 'Several days', points: 1 },
    { id: 2, option: 'More than half the days', points: 2 },
    { id: 3, option: 'Nearly everyday', points: 3 }
  ]

  // Fallback questions from ScreeningGyalsung
  const fallbackQuestions = [
    { id: 14, text: 'Worrying too much about different things', answers: defaultAnswers },
    { id: 15, text: 'Trouble relaxing', answers: defaultAnswers },
    { id: 16, text: 'Being so restless that it is hard to sit still', answers: defaultAnswers },
    { id: 17, text: 'Becoming easily annoyed or irritable', answers: defaultAnswers },
    { id: 18, text: 'Feeling afraid, as if something awful might happen', answers: defaultAnswers }
  ]

  // Combine static questions and fallback questions
  const allQuestions = []

  // Add static questions
  staticQuestions.forEach((question, index) => {
    allQuestions.push({
      id: `static_${index}`,
      question_text: question,
      question_type: 'multiple_choice',
      options: defaultAnswers.map((da) => ({
        id: da.id,
        option_text: da.option,
        point: da.points
      }))
    })
  })

  // Add fallback questions
  fallbackQuestions.forEach((question, index) => {
    allQuestions.push({
      id: question.id,
      question_text: question.text,
      question_type: 'multiple_choice',
      options: question.answers.map((a) => ({
        id: a.id,
        option_text: a.option,
        point: a.points
      }))
    })
  })

  return allQuestions
}

// Mock data for testing
const getMockGyalsungQuestions = () => {
  return [
    {
      id: 1,
      question_text: 'How often have you felt nervous, anxious, or on edge?',
      question_type: 'multiple_choice',
      options: [
        { id: 1, option_text: 'Not at all', point: 0 },
        { id: 2, option_text: 'Several days', point: 1 },
        { id: 3, option_text: 'More than half the days', point: 2 },
        { id: 4, option_text: 'Nearly every day', point: 3 }
      ]
    },
    {
      id: 2,
      question_text: 'How often have you been able to stop or control worrying?',
      question_type: 'multiple_choice',
      options: [
        { id: 5, option_text: 'Not at all', point: 0 },
        { id: 6, option_text: 'Several days', point: 1 },
        { id: 7, option_text: 'More than half the days', point: 2 },
        { id: 8, option_text: 'Nearly every day', point: 3 }
      ]
    },
    {
      id: 3,
      question_text: 'How often do you worry about different things?',
      question_type: 'multiple_choice',
      options: [
        { id: 9, option_text: 'Not at all', point: 0 },
        { id: 10, option_text: 'Several days', point: 1 },
        { id: 11, option_text: 'More than half the days', point: 2 },
        { id: 12, option_text: 'Nearly every day', point: 3 }
      ]
    }
  ]
}

// Method to select an answer for multiple choice
const selectAnswer = (option) => {
  selectedAnswer.value = option
}

// Method to clear current answer when changing questions
const clearCurrentAnswer = () => {
  selectedAnswer.value = null
  textAnswer.value = ''
  numberAnswer.value = ''
}

// Method to save current answer
const saveCurrentAnswer = () => {
  if (!currentQuestion.value || !hasAnswered.value) return

  const questionId = currentQuestion.value.id
  const existingAnswerIndex = answers.value.findIndex((a) => a.question_id === questionId)

  let answerData = {
    question_id: questionId,
    question_text: currentQuestion.value.question_text,
    question_type: currentQuestion.value.question_type
  }

  if (currentQuestion.value.question_type === 'multiple_choice') {
    answerData.selected_option_id = selectedAnswer.value.id
    answerData.selected_option_text = selectedAnswer.value.option_text
    answerData.point = selectedAnswer.value.point || 0
  } else if (currentQuestion.value.question_type === 'text') {
    answerData.text_answer = textAnswer.value.trim()
  } else if (currentQuestion.value.question_type === 'number') {
    answerData.number_answer = parseFloat(numberAnswer.value)
  }

  if (existingAnswerIndex > -1) {
    answers.value[existingAnswerIndex] = answerData
  } else {
    answers.value.push(answerData)
  }
}

// Method to load saved answer for current question
const loadSavedAnswer = () => {
  if (!currentQuestion.value) return

  const savedAnswer = answers.value.find((a) => a.question_id === currentQuestion.value.id)
  if (!savedAnswer) {
    clearCurrentAnswer()
    return
  }

  if (currentQuestion.value.question_type === 'multiple_choice') {
    const option = currentQuestion.value.options?.find(
      (o) => o.id === savedAnswer.selected_option_id
    )
    selectedAnswer.value = option || null
  } else if (currentQuestion.value.question_type === 'text') {
    textAnswer.value = savedAnswer.text_answer || ''
  } else if (currentQuestion.value.question_type === 'number') {
    numberAnswer.value = savedAnswer.number_answer || ''
  }
}

// Method to go to next question
const goToNextQuestion = () => {
  if (!hasAnswered.value) return

  saveCurrentAnswer()

  if (isLastQuestion.value) {
    completeScreening()
  } else {
    currentQuestionIndex.value++
    loadSavedAnswer()
  }
}

// Method to go to previous question
const goToPreviousQuestion = () => {
  if (currentQuestionIndex.value > 0) {
    saveCurrentAnswer()
    currentQuestionIndex.value--
    loadSavedAnswer()
  }
}

// Method to complete screening
const completeScreening = () => {
  Swal.fire({
    icon: 'question',
    title: 'Assessment completed',
    text: 'Do you wish to proceed to submission?',
    showCancelButton: true,
    confirmButtonText: 'Yes, submit',
    cancelButtonText: 'No, not yet'
  }).then((result) => {
    if (result.isConfirmed) {
      submitAssessments()
    }
  })
}

// Method to submit assessments to the API
const submitAssessments = async () => {
  try {
    let userId = ClientUserIdCaseBase.value.length > 0 ? ClientUserIdCaseBase.value[0] : null

    if (!userId && isGyalsungFlow.value) {
      userId = localStorage.getItem('gyalsungUserCID')
    }

    if (!userId) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'User ID not found. Please register first.',
        confirmButtonText: 'OK'
      })
      return
    }

    // Calculate total score
    const totalScore = answers.value.reduce((sum, answer) => {
      return sum + (answer.point || 0)
    }, 0)

    // Prepare submission data in the format expected by the API
    const submissionData = {
      user_cid: userId,
      test_type_name: 'Gyalsung Screening',
      total_score: totalScore,
      responses: answers.value.map((answer, index) => ({
        question_id: answer.question_id,
        question_text: answer.question_text,
        answer: answer.selected_option_text || answer.text_answer || answer.number_answer,
        score: answer.point || 0,
        question_set_name: answer.setName || 'Gyalsung Screening'
      }))
    }

    console.log('Submitting Gyalsung screening data:', submissionData)

    // Submit to the Gyalsung screening API endpoint
    const response = await apiClient.post(endpoints.gyalsungScreenSubmission, submissionData)

    console.log('Gyalsung submission response:', response.data)

    // Handle successful submission
    if (response.data) {
      // Store the screening data in localStorage for reference
      const screeningData = {
        userId: userId,
        answers: answers.value,
        totalScore: totalScore,
        submittedAt: new Date().toISOString(),
        submissionResponse: response.data
      }

      localStorage.setItem('gyalsungScreeningData', JSON.stringify(screeningData))

      // Clear local storage
      clearLocalStorageData()
      await incrementUserScreenedToday()

      // Show success message
      Swal.fire({
        icon: 'success',
        title: 'Assessment Submitted Successfully',
        text: 'Your Gyalsung screening has been submitted successfully.',
        confirmButtonText: 'OK'
      }).then(() => {
        // Clear the Gyalsung flow flag
        if (isGyalsungFlow.value) {
          localStorage.removeItem('isGyalsungFlow')
          localStorage.removeItem('gyalsungUserCID')
          localStorage.removeItem('gyalsungUserData')
        }

        // Navigate back to dashboard or reload
        router.push('/counselor-dashboard')
      })
    }
  } catch (error) {
    console.error('Error submitting Gyalsung assessment:', error)

    // Handle specific API errors
    if (error.response && error.response.data) {
      const errorMessage =
        error.response.data.error || error.response.data.message || 'Failed to submit assessment'

      if (errorMessage.includes('already submitted')) {
        const confirmSubmit = await Swal.fire({
          icon: 'warning',
          title: 'Already Submitted',
          text: 'You have already submitted this screening. Do you want to submit again?',
          showCancelButton: true,
          confirmButtonText: 'Yes, submit again',
          cancelButtonText: 'Cancel'
        })

        if (confirmSubmit.isConfirmed) {
          // Retry submission with confirmation flag
          try {
            const retryData = { ...submissionData, confirmation: true }
            const retryResponse = await apiClient.post(
              endpoints.gyalsungScreenSubmission,
              retryData
            )

            Swal.fire({
              icon: 'success',
              title: 'Assessment Resubmitted Successfully',
              text: 'Your Gyalsung screening has been resubmitted successfully.',
              confirmButtonText: 'OK'
            }).then(() => {
              if (isGyalsungFlow.value) {
                localStorage.removeItem('isGyalsungFlow')
                localStorage.removeItem('gyalsungUserCID')
                localStorage.removeItem('gyalsungUserData')
              }
              router.push('/counselor-dashboard')
            })
          } catch (retryError) {
            console.error('Error resubmitting:', retryError)
            Swal.fire({
              icon: 'error',
              title: 'Submission Failed',
              text: 'Failed to resubmit assessment. Please try again later.',
              confirmButtonText: 'OK'
            })
          }
        }
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Submission Failed',
          text: errorMessage,
          confirmButtonText: 'OK'
        })
      }
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Network Error',
        text: 'Failed to submit assessment. Please check your connection and try again.',
        confirmButtonText: 'OK'
      })
    }
  }
}

const incrementUserScreenedToday = async () => {
  const userDetailsStore = JSON.parse(localStorage.getItem('userDetailsStore'))
  const userId = userDetailsStore ? userDetailsStore.user.id : null

  if (userId) {
    const userData = await getUserScreenedData(userId)
    const today = new Date().toLocaleDateString()

    if (userData && userData.screeningDate === today) {
      userData.count += 1
    } else {
      userData.count = 1
      userData.screeningDate = today
    }

    await setUserScreenedData(userId, userData)
  }
}

// Function to clear localStorage data for assessments
const clearLocalStorageData = () => {
  localStorage.removeItem('ASSIST_set_counselor_screening')
  localStorage.removeItem('answeredSubstances')
  localStorage.removeItem('selectedMenu')
  localStorage.removeItem('selectedTools')
}

// Initialize component
onMounted(() => {
  // Get CID from Gyalsung registration if available
  if (isGyalsungFlow.value) {
    const cid = localStorage.getItem('gyalsungUserCID')
    if (cid) {
      ClientUserIdCaseBase.value = [cid]
      localStorage.setItem('ClientUserIdCaseBase', JSON.stringify([cid]))
    }
  } else {
    ClientUserIdCaseBase.value = JSON.parse(localStorage.getItem('ClientUserIdCaseBase')) || []
  }

  // Fetch Gyalsung screening questions from ScreeningGyalsung component data
  fetchScreeningQuestions()
})

// Watch for question changes to load saved answers
watch(currentQuestionIndex, () => {
  loadSavedAnswer()
})
</script>

<style scoped>
.screening-container {
  background: linear-gradient(135deg, #e6f3f5, #f0f7f8);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(43, 101, 111, 0.08);
  min-height: 600px;
}

.screening-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  height: 100%;
}

/* Main Content Styles */
.main-content {
  height: 100%;
}

.content-card {
  background: rgba(255, 255, 255, 0.7);
  border-radius: 12px;
  padding: 2rem;
  height: 100%;
  box-shadow: 0 4px 15px rgba(43, 101, 111, 0.1);
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #2b656f;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e6f3f5;
  border-top: 4px solid #2b656f;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Error State */
.error-state {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #d32f2f;
  text-align: center;
}

.retry-btn {
  background: #2b656f;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 1rem;
}

/* Screening Questions */
.screening-questions {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e6f3f5;
}

.question-header h3 {
  color: #2b656f;
  margin: 0;
}

.progress-indicator {
  color: #666;
  font-size: 0.9rem;
}

.question-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.question-card {
  flex: 1;
  margin-bottom: 2rem;
}

.question-text {
  color: #2b656f;
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

/* Answer Options */
.answer-options {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.option-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  border: 2px solid #e6f3f5;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.option-item:hover {
  border-color: #2b656f;
  background: rgba(43, 101, 111, 0.05);
}

.option-item.selected {
  border-color: #2b656f;
  background: rgba(43, 101, 111, 0.1);
}

.option-radio {
  margin-right: 0.75rem;
}

.option-radio input[type='radio'] {
  width: 20px;
  height: 20px;
  accent-color: #2b656f;
}

.option-text {
  flex: 1;
  color: #1d4851;
}

/* Text Input */
.text-input-container,
.number-input-container {
  margin-top: 1rem;
}

.text-input,
.number-input {
  width: 100%;
  padding: 1rem;
  border: 2px solid #e6f3f5;
  border-radius: 8px;
  font-size: 1rem;
  color: #1d4851;
  resize: vertical;
}

.text-input:focus,
.number-input:focus {
  outline: none;
  border-color: #2b656f;
}

/* Navigation Buttons */
.navigation-buttons {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.nav-btn {
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.prev-btn {
  background: #f5f5f5;
  color: #666;
}

.prev-btn:hover:not(:disabled) {
  background: #e0e0e0;
}

.next-btn {
  background: #2b656f;
  color: white;
}

.next-btn:hover:not(:disabled) {
  background: #1d4851;
}

.nav-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  text-align: center;
  color: #666;
}

/* Responsive Design */
@media (max-width: 768px) {
  .screening-container {
    padding: 1rem;
  }

  .question-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .navigation-buttons {
    flex-direction: column;
  }

  .nav-btn {
    width: 100%;
  }
}
</style>
