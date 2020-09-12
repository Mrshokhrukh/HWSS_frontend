<template>
  <div class="container-fluid bg-color pt-3">
    <div class="row mb-3">
      <div class="col-12">
        <div class="card p-3 shadow-sm">
          <div class="d-flex justify-content-between align-items-center">
            <h5 class="mb-0 text-teal">Gyalsung Screening</h5>
            <div class="entrant-info">
              <span class="badge bg-light text-dark me-2">Entrant CID : {{ entrantCid }}</span>
              <span class="badge bg-light text-dark me-2">Name: {{ entrantName }}</span>
              <span class="badge bg-light text-dark">Gender: {{ entrantGender }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="loading" class="row">
      <div class="col-12 text-center py-5">
        <div class="spinner-border text-teal" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-3">Loading screening questions...</p>
      </div>
    </div>

    <div v-else-if="error" class="row">
      <div class="col-12">
        <div class="alert alert-danger" role="alert"><strong>Error:</strong> {{ error }}</div>
      </div>
    </div>

    <div v-else-if="questions.length > 0" class="row">
      <div class="col-12">
        <div class="card shadow-sm">
          <!-- Progress bar -->
          <div class="card-body pb-0">
            <div class="progress-container py-1 mt-2 mb-4">
              <div class="progress" style="height: 15px; border-radius: 20px">
                <div
                  class="progress-bar bg-teal"
                  :style="{ width: progressPercentage + '%' }"
                  role="progressbar"
                  aria-valuemin="0"
                  aria-valuemax="100"
                ></div>
              </div>
            </div>
          </div>

          <!-- Question Header -->
          <div class="card-header bg-teal text-white">
            <h5 class="mb-0">How often have you been bothered by any of the following problems:</h5>
          </div>

          <div class="card-body p-4">
            <!-- Question Text -->
            <div class="question-text mb-4 text-center">
              <h6 class="text-dark">{{ currentQuestion.text }}</h6>
            </div>

            <!-- Answer Options -->
            <div class="answer-options">
              <div class="row justify-content-center">
                <div
                  v-for="option in currentQuestion.answers"
                  :key="option.id"
                  class="col-md-6 col-sm-12 mb-3 answer-option"
                >
                  <button
                    class="btn btn-lg w-100 option-button"
                    :class="{ selected: isSelectedAnswer(option) }"
                    @click="handleAnswerSelection(option)"
                  >
                    {{ option.option }}
                  </button>
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

const questions = ref([])
const currentQuestionIndex = ref(0)
const answers = ref({})
const loading = ref(false)
const error = ref('')

const entrantCid = ref('')
const entrantName = ref('')
const entrantGender = ref('')

const getDummyQuestionsFlat = () => {
  const dummySets = [
    {
      name: 'GYALSUNG BASELINE',
      questions: [
        {
          id: 1001,
          text: 'Feeling nervous, anxious, or on edge?',
          answers: [
            { id: 1, option: 'Not at all' },
            { id: 2, option: 'Several days' },
            { id: 3, option: 'More than half the days' },
            { id: 4, option: 'Nearly every day' }
          ]
        },
        {
          id: 1002,
          text: 'Not being able to stop or control worrying?',
          answers: [
            { id: 1, option: 'Not at all' },
            { id: 2, option: 'Several days' },
            { id: 3, option: 'More than half the days' },
            { id: 4, option: 'Nearly every day' }
          ]
        }
      ]
    },
    {
      name: 'GYALSUNG WELLBEING',
      questions: [
        {
          id: 2001,
          text: 'Little interest or pleasure in doing things?',
          answers: [
            { id: 1, option: 'Not at all' },
            { id: 2, option: 'Several days' },
            { id: 3, option: 'More than half the days' },
            { id: 4, option: 'Nearly every day' }
          ]
        }
      ]
    }
  ]

  return dummySets.flatMap((set) =>
    (set.questions || []).sort((a, b) => a.id - b.id).map((q) => ({ ...q, setName: set.name }))
  )
}

const currentQuestion = computed(() => {
  return questions.value[currentQuestionIndex.value] || {}
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

const loadEntrantDetails = () => {
  try {
    const raw = localStorage.getItem('gyalsungEntrant')
    if (raw) {
      const data = JSON.parse(raw)
      entrantCid.value = data.cid || ''
      entrantName.value = data.name || ''
      entrantGender.value = data.gender || ''
    }

    // Also check for gyalsung flow data
    const cid = localStorage.getItem('gyalsungUserCID')
    if (cid && !entrantCid.value) {
      entrantCid.value = cid
    }

    const userData = localStorage.getItem('gyalsungUserData')
    if (userData && (!entrantName.value || !entrantGender.value)) {
      try {
        const parsedData = JSON.parse(userData)
        entrantName.value = entrantName.value || parsedData.name || ''
        entrantGender.value = entrantGender.value || parsedData.gender || ''
      } catch (e) {
        console.warn('Failed to parse gyalsungUserData')
      }
    }
  } catch (e) {
    console.warn('Failed to parse gyalsungEntrant from storage')
  }
}

const initializeAnswers = () => {
  answers.value = {}
  questions.value.forEach((question) => {
    answers.value[question.id] = null
  })
}

const fetchQuestions = async () => {
  loading.value = true
  error.value = ''

  try {
    const token = localStorage.getItem('authToken')
    const headers = token ? { Authorization: `Bearer ${token}` } : {}

    // Use the parameterized endpoint with "Gyalsung Screening" as the name
    const endpoint = endpoints.gyalsungScreeningQuestions('Gyalsung Screening')
    
    const response = await axios.get(endpoint, {
      headers,
      timeout: 8000
    })

    let questionData = []

    if (Array.isArray(response.data)) {
      const tests = response.data
      questionData = tests.flatMap((test) =>
        (test.question_sets || []).flatMap((set) =>
          (set.questions || [])
            .sort((a, b) => a.id - b.id)
            .map((q) => ({ ...q, setName: set.name }))
        )
      )
    } else if (response.data?.question_sets) {
      questionData = response.data.question_sets.flatMap((set) =>
        (set.questions || []).sort((a, b) => a.id - b.id).map((q) => ({ ...q, setName: set.name }))
      )
    }

    if (!questionData.length) {
      questions.value = getDummyQuestionsFlat()
    } else {
      questions.value = questionData
    }

    initializeAnswers()
  } catch (err) {
    console.error('Failed to fetch questions:', err)
    console.error('Error details:', err.response?.data || err.message)
    error.value = `Failed to load screening questions. Using dummy for testing.`
    questions.value = getDummyQuestionsFlat()
    initializeAnswers()
  } finally {
    loading.value = false
  }
}

const handleAnswerSelection = (option) => {
  answers.value[currentQuestion.value.id] = option
  console.log(`Question ${currentQuestion.value.id} answered:`, option)
}

const isSelectedAnswer = (option) => {
  const selected = answers.value[currentQuestion.value.id]
  return selected && selected.id === option.id && selected.option === option.option
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

// Helper functions to process answers and calculate scores
const processGADAnswers = () => {
  const gadQuestions = questions.value.filter(q => 
    q.setName === 'GYALSUNG BASELINE' || 
    q.text.toLowerCase().includes('anxious') || 
    q.text.toLowerCase().includes('worry')
  )
  const gadData = {}
  let gadScore = 0
  
  gadQuestions.forEach((question, index) => {
    const answer = answers.value[question.id]
    if (answer) {
      const scoreValue = answer.id - 1 // Convert to 0-3 scale
      gadData[`question${index + 1}`] = scoreValue
      gadScore += scoreValue
    }
  })
  
  const gadInterpretation = getGADInterpretation(gadScore)
  return { gadData, gadScore, gadInterpretation }
}

const processPHQAnswers = () => {
  const phqQuestions = questions.value.filter(q => 
    q.setName === 'GYALSUNG WELLBEING' || 
    q.text.toLowerCase().includes('interest') || 
    q.text.toLowerCase().includes('pleasure')
  )
  const phqData = {}
  let phqScore = 0
  
  phqQuestions.forEach((question, index) => {
    const answer = answers.value[question.id]
    if (answer) {
      const scoreValue = answer.id - 1
      phqData[`question${index + 1}`] = scoreValue
      phqScore += scoreValue
    }
  })
  
  const phqInterpretation = getPHQInterpretation(phqScore)
  return { phqData, phqScore, phqInterpretation }
}

const processACEAnswers = () => {
  // Process ACE questions if they exist
  const aceQuestions = questions.value.filter(q => 
    q.setName && q.setName.toLowerCase().includes('ace')
  )
  const aceData = {}
  let aceScore = 0
  
  aceQuestions.forEach((question, index) => {
    const answer = answers.value[question.id]
    if (answer) {
      const scoreValue = answer.id - 1
      aceData[`question${index + 1}`] = scoreValue
      aceScore += scoreValue
    }
  })
  
  const aceInterpretation = getACEInterpretation(aceScore)
  return { aceData, aceScore, aceInterpretation }
}

const processPSYAnswers = () => {
  // Process psychosis screening questions if they exist
  const psyQuestions = questions.value.filter(q => 
    q.setName && (q.setName.toLowerCase().includes('psy') || q.setName.toLowerCase().includes('psychosis'))
  )
  const psyData = {}
  let psyScore = 0
  
  psyQuestions.forEach((question, index) => {
    const answer = answers.value[question.id]
    if (answer) {
      const scoreValue = answer.id - 1
      psyData[`question${index + 1}`] = scoreValue
      psyScore += scoreValue
    }
  })
  
  const psyInterpretation = getPSYInterpretation(psyScore)
  return { psyData, psyScore, psyInterpretation }
}

// Interpretation functions
const getGADInterpretation = (score) => {
  if (score >= 15) return "Severe anxiety"
  if (score >= 10) return "Moderate anxiety"
  if (score >= 5) return "Mild anxiety"
  return "Minimal anxiety"
}

const getPHQInterpretation = (score) => {
  if (score >= 20) return "Severe depression"
  if (score >= 15) return "Moderately severe depression"
  if (score >= 10) return "Moderate depression"
  if (score >= 5) return "Mild depression"
  return "Minimal depression"
}

const getACEInterpretation = (score) => {
  if (score >= 4) return "High ACE score"
  if (score >= 2) return "Moderate ACE score"
  if (score >= 1) return "Low ACE score"
  return "No ACE exposure"
}

const getPSYInterpretation = (score) => {
  if (score >= 3) return "High psychosis risk"
  if (score >= 2) return "Moderate psychosis risk"
  if (score >= 1) return "Low psychosis risk"
  return "No psychosis risk"
}

const determineFinalStatus = (gadScore, phqScore, aceScore, psyScore) => {
  const totalScore = gadScore + phqScore + aceScore + psyScore
  
  if (totalScore >= 20 || gadScore >= 15 || phqScore >= 15) {
    return "high"
  } else if (totalScore >= 10 || gadScore >= 10 || phqScore >= 10) {
    return "moderate"
  } else {
    return "low"
  }
}

const clearGyalsungScreeningData = () => {
  localStorage.removeItem('gyalsungEntrant')
  localStorage.removeItem('gyalsungUserCID')
  localStorage.removeItem('gyalsungUserData')
  localStorage.removeItem('reassessmentUserId')
}

const isAllQuestionsAnswered = () => {
  return questions.value.every(question => 
    answers.value[question.id] !== null && answers.value[question.id] !== undefined
  )
}

const submitScreeningData = async () => {
  try {
    // Get user details from localStorage (similar to CaseScreening pattern)
    const userDetailsStore = JSON.parse(localStorage.getItem('userDetailsStore'))
    const counselorId = userDetailsStore ? userDetailsStore.user.id : null
    
    // Get entrant CID from localStorage or component state
    const selectedUserId = entrantCid.value || localStorage.getItem('gyalsungUserCID')
    
    // Optional: Get reassessment user if needed
    const reassessmentUserId = localStorage.getItem('reassessmentUserId') || null
    
    if (!selectedUserId) {
      throw new Error('User CID is required for screening submission')
    }
    
    if (!counselorId) {
      throw new Error('Counselor ID is required for screening submission')
    }

    // Process answers to calculate scores and interpretations
    const { gadData, gadScore, gadInterpretation } = processGADAnswers()
    const { phqData, phqScore, phqInterpretation } = processPHQAnswers()
    const { aceData, aceScore, aceInterpretation } = processACEAnswers()
    const { psyData, psyScore, psyInterpretation } = processPSYAnswers()
    
    // Determine final screening status based on scores
    const finalScreeningStatus = determineFinalStatus(gadScore, phqScore, aceScore, psyScore)
    
    const payload = {
      identity_number: selectedUserId,
      gad_data: gadData,
      gad_score: gadScore,
      gad_interpretation: gadInterpretation,
      phq_data: phqData,
      phq_score: phqScore,
      phq_interpretation: phqInterpretation,
      ace_data: aceData,
      ace_score: aceScore,
      ace_interpretation: aceInterpretation,
      psy_data: psyData,
      psy_score: psyScore,
      psy_interpretation: psyInterpretation,
      final_screening_status: finalScreeningStatus,
      is_reassessment_screening: reassessmentUserId ? true : false,
      counselor_user: counselorId,
      reassessment_user: reassessmentUserId || "",
      counselor_remarks: "Gyalsung screening completed",
      reassessment_remarks: reassessmentUserId ? "Reassessment completed" : ""
    }

    const token = localStorage.getItem('authToken')
    const headers = token ? { Authorization: `Bearer ${token}` } : {}

    console.log('Submitting payload:', payload)

    const submissionEndpoint = endpoints.gyalsungScreenSubmission

    console.log('Using endpoint:', submissionEndpoint)

    const response = await axios.post(
      submissionEndpoint,
      payload,
      { headers }
    )

    console.log("Screening data submitted successfully:", response.data)
    
    // Clear localStorage and redirect
    clearGyalsungScreeningData()
    
    // Show success message and redirect
    alert('Screening submitted successfully!')
    router.push('/gyalsung-dashboard') // Adjust route as needed
    
  } catch (error) {
    console.error("Error submitting screening data:", error.response?.data || error.message)
    let errorMessage = 'Error submitting screening'
    
    if (error.response?.data?.message) {
      errorMessage += `: ${error.response.data.message}`
    } else if (error.message) {
      errorMessage += `: ${error.message}`
    }
    
    alert(errorMessage)
  }
}

// Update the submitScreening function to call submitScreeningData
const submitScreening = async () => {
  if (!isAllQuestionsAnswered()) {
    alert('Please answer all questions before submitting.')
    return
  }
  
  if (confirm('Are you sure you want to submit the screening?')) {
    await submitScreeningData()
  }
}

onMounted(() => {
  loadEntrantDetails()
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
  border: 0;
  padding: 0.25rem;
}

.option-button {
  border-radius: 8px;
  font-weight: 600;
  padding: 0.75rem 1.5rem;
  border: 2px solid #e9ecef;
  background-color: #fff;
  color: #495057;
  transition: all 0.2s ease;
}

.option-button:hover {
  border-color: #2c6975;
  background-color: #f8f9fa;
}

.option-button.selected {
  border-color: #2c6975;
  background-color: #e8f6ee;
  color: #2c6975;
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