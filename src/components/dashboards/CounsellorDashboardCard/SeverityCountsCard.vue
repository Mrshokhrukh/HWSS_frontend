<template>
  <div class="severity-dashboard">
    <div class="dashboard-header">
      <h4 class="dashboard-title">Severity Analysis</h4>
      <div class="year-filter">
        <label class="year-label">Select Year</label>
        <div class="select-wrapper">
          <select v-model="selectedYear" class="year-select" :disabled="isLoading">
            <option v-for="year in availableYears" :key="year" :value="year">
              {{ year }}
            </option>
          </select>
          <span class="select-icon">▼</span>
        </div>
      </div>
    </div>

    <div class="severity-grid">
      <div v-for="(item, index) in SEVERITY_ITEMS" :key="index" class="severity-item">
        <div
          @click="setActiveIndex(index)"
          :class="['severity-card', { 'active-card': isActive(index) }]"
        >
          <div class="card-body">
            <div class="count-wrapper">
              <div class="count-circle">
                <span class="count-number">{{ item.count }}</span>
              </div>
            </div>
            <h6 class="card-title">{{ item.title }}</h6>
          </div>
        </div>
      </div>
    </div>

    <transition name="fade">
      <div class="analysis-section" v-if="activeItem">
        <template v-if="activeItem.title !== 'Assist'">
          <div class="analysis-grid">
            <div class="indicator-section">
              <SeverityIndicatorCard
                v-if="dataReady"
                :cardTitle="activeItem.title"
                :filteredData="getRelevantData"
                :isLoading="isLoading"
                :severityCounts="severityCounts"
                :key="activeItem.title + 'indicator'"
              />
            </div>
            <div class="graph-section">
              <SeverityGraphCard
                v-if="dataReady"
                :cardTitle="activeItem.title"
                :filteredData="getRelevantData"
                :isLoading="isLoading"
                :key="activeItem.title + 'graph'"
              />
            </div>
          </div>
        </template>
        <template v-else>
          <AssistSeverityAndGraph
            v-if="dataReady"
            :data="assistStructuredData"
            :isLoading="isLoading"
            :totalRiskUsers="assistStructuredData.total"
            :key="activeItem.title + 'assist'"
          />
        </template>
      </div>
    </transition>

    <div class="status-overlay" v-if="isLoading">
      <div class="loader"></div>
      <span>Processing data...</span>
    </div>
    <div class="error-message" v-if="error">{{ error }}</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watchEffect, nextTick } from 'vue'
import apiClient from '@/apiClient'
import endpoints from '@/api'

import SeverityGraphCard from './SeverityGraphCard.vue'
import AssistSeverityAndGraph from './AssistSeverityAndGraph.vue'
import SeverityIndicatorCard from './SeverityIndicatorCard.vue'

// --- No changes to this section ---
const SEVERITY_ITEMS = ref([
  {
    count: '0',
    title: 'Suicidal Behavior',
    field: 'phq_data',
    threshold: (value) => {
      try {
        if (Array.isArray(value)) {
          const suicidalQuestion = value.find(
            (q) =>
              q.question &&
              q.question.toLowerCase().includes('thoughts that you would be better off dead')
          )
          return (
            suicidalQuestion &&
            suicidalQuestion.score >= 1 &&
            suicidalQuestion.selectedOption?.toLowerCase() !== 'not at all'
          )
        }
        if (typeof value === 'string') {
          const phqData = JSON.parse(value)
          if (phqData.responses) {
            const suicidalQuestion = phqData.responses.find(
              (q) =>
                q.question &&
                q.question.toLowerCase().includes('thoughts that you would be better off dead')
            )
            return (
              suicidalQuestion &&
              suicidalQuestion.score >= 1 &&
              suicidalQuestion.selectedOption?.toLowerCase() !== 'not at all'
            )
          }
        }
        if (value && value.responses) {
          const suicidalQuestion = value.responses.find(
            (q) =>
              q.question &&
              q.question.toLowerCase().includes('thoughts that you would be better off dead')
          )
          return (
            suicidalQuestion &&
            suicidalQuestion.score >= 1 &&
            suicidalQuestion.selectedOption?.toLowerCase() !== 'not at all'
          )
        }
        return false
      } catch (e) {
        console.error('Error evaluating suicidal behavior threshold:', e)
        return false
      }
    }
  },
  {
    count: '0',
    title: 'Depression',
    field: 'phq_score',
    threshold: (value) => value >= 10
  },
  {
    count: '0',
    title: 'Anxiety',
    field: 'gad_score',
    threshold: (value) => value >= 10
  },
  {
    count: '0',
    title: 'ACE',
    field: 'ace_score',
    threshold: (value) => value >= 4
  },
  {
    count: '0',
    title: 'Assist',
    field: 'assist_data',
    threshold: (value) => {
      if (!value) return false
      try {
        const assistData = typeof value === 'string' ? JSON.parse(value) : value
        if (Array.isArray(assistData)) {
          return assistData.some(
            (item) =>
              item?.risk_flag &&
              item.risk_flag !== 'none' &&
              item.risk_flag !== 'low' &&
              item.risk_flag !== 'no risk' &&
              item.risk_flag !== '' &&
              item.risk_flag !== null
          )
        } else if (typeof assistData === 'object') {
          return Object.values(assistData).some(
            (flag) =>
              flag &&
              flag !== 'none' &&
              flag !== 'low' &&
              flag !== 'no risk' &&
              flag !== '' &&
              flag !== null
          )
        }
        return false
      } catch (error) {
        console.error('Error parsing assist_data:', error)
        return false
      }
    }
  }
])

const selectedYear = ref(new Date().getFullYear())
const availableYears = computed(() => {
  const currentYear = new Date().getFullYear()
  const years = []
  for (let i = 0; i < 5; i++) {
    years.push(currentYear - i)
  }
  return years
})

const activeIndex = ref(0)
const activeItem = computed(() => SEVERITY_ITEMS.value[activeIndex.value])
const filteredData = ref([])
const assistStructuredData = ref({
  total: 0,
  substances: {},
  injections: {},
  lifetime: 0,
  active: 0
})
const isLoading = ref(true)
const error = ref(null)
const severityCounts = ref({})
const dataReady = ref(false)
// --- End of unchanged section ---

// MODIFIED: This function now uses server-side filtering for agency_name
const fetchAndFilterData = async () => {
  try {
    isLoading.value = true
    error.value = null

    // 1. Get the current user's agency name
    const { agencyName } = getUserDetailsFromStorage()

    // 2. Construct the URL with the agency_name as a query parameter
    let requestUrl = endpoints.newServiceAndTreatment
    if (agencyName && agencyName !== 'Unknown Agency') {
      requestUrl = `${endpoints.newServiceAndTreatment}?agency_name=${encodeURIComponent(
        agencyName
      )}`
    }

    // 3. Fetch the pre-filtered data from the backend
    const response = await apiClient.get(requestUrl)
    const dataArray = response.data || []

    // 4. The client-side agency filter is now REMOVED. We only filter by year.
    filteredData.value = dataArray.filter((item) => {
      // const agencyMatch = ...; // THIS LINE IS GONE
      const screeningData = item.screening_data
      const submissionYear = screeningData?.submission_date
        ? new Date(screeningData.submission_date).getFullYear()
        : null

      // The agencyMatch check is removed from the return statement
      return screeningData && submissionYear === selectedYear.value
    })

    updateSeverityCounts()
    processAssistData()
    dataReady.value = true
  } catch (err) {
    console.error('Error fetching data:', err)
    error.value = 'Failed to load data'
  } finally {
    isLoading.value = false
  }
}

// --- All other functions and computed properties below are unchanged ---

const getRelevantData = computed(() => {
  if (!activeItem.value || !filteredData.value.length) return []
  return filteredData.value
})

const extractRiskLevel = (riskFlag) => {
  if (!riskFlag) return 'low'
  const lowerCaseFlag = riskFlag.toLowerCase()
  if (
    lowerCaseFlag.includes('severe') ||
    lowerCaseFlag.includes('high') ||
    lowerCaseFlag === 'green'
  )
    return 'high'
  if (lowerCaseFlag.includes('moderate') || lowerCaseFlag.includes('moderately severe'))
    return 'moderate'
  return 'low'
}

const processAssistData = () => {
  const structured = {
    total: 0,
    substances: {},
    injections: {},
    lifetime: 0,
    active: 0
  }

  filteredData.value.forEach((item) => {
    let hasNonNoneRisk = false
    let hasInjection = false
    const allAssistData = []
    const injectionAssistData = []

    if (item.case_substance_risks) {
      allAssistData.push(...item.case_substance_risks)
    }
    if (item.event_substance_risks) {
      allAssistData.push(...item.event_substance_risks)
    }
    if (item.screening_data?.assist_data) {
      let assistData = item.screening_data.assist_data
      if (typeof assistData === 'string') {
        assistData = JSON.parse(assistData)
      }
      if (Array.isArray(assistData)) {
        allAssistData.push(...assistData)
      } else if (typeof assistData === 'object') {
        if (
          assistData.injection_flag &&
          assistData.injection_flag !== 'none' &&
          assistData.injection_flag !== 'no risk' &&
          assistData.injection_flag !== '' &&
          assistData.injection_flag !== null
        ) {
          hasInjection = true
          injectionAssistData.push({
            substance_name: 'Injection',
            risk_flag: assistData.injection_flag
          })
        }
        Object.entries(assistData).forEach(([key, value]) => {
          if (
            key.endsWith('_flag') &&
            key !== 'injection_flag' &&
            value &&
            value !== 'none' &&
            value !== 'no risk' &&
            value !== '' &&
            value !== null
          ) {
            allAssistData.push({
              substance_name: key.replace('_flag', ''),
              risk_flag: value
            })
          }
        })
      }
    }

    if (allAssistData.length > 0) {
      hasNonNoneRisk = allAssistData.some((data) => {
        return extractRiskLevel(data.risk_flag) !== 'low' && data.substance_name !== 'Injection'
      })
    }

    const userGender = item.user?.gender || 'Unknown'

    if (hasNonNoneRisk) {
      structured.total++
      allAssistData.forEach((data) => {
        if (data.substance_name !== 'Injection') {
          let name = data.substance__name || data.substance_name || 'Unknown Substance'
          const risk = extractRiskLevel(data.risk_flag)
          const normalizedSubstance = normalizeSubstanceName(name)
          if (!structured.substances[normalizedSubstance]) {
            structured.substances[normalizedSubstance] = {
              male: { high: 0, moderate: 0, low: 0 },
              female: { high: 0, moderate: 0, low: 0 },
              other: { high: 0, moderate: 0, low: 0 }
            }
          }
          structured.substances[normalizedSubstance][userGender.toLowerCase()][risk]++
        }
      })
    }

    if (hasInjection) {
      injectionAssistData.forEach((data) => {
        let name = data.substance_name || 'Injection'
        const risk = extractRiskLevel(data.risk_flag)
        if (!structured.injections[name]) {
          structured.injections[name] = {
            male: { high: 0, moderate: 0, low: 0 },
            female: { high: 0, moderate: 0, low: 0 },
            other: { high: 0, moderate: 0, low: 0 }
          }
        }
        structured.injections[name][userGender.toLowerCase()][risk]++
      })
    }
  })

  assistStructuredData.value = structured
}

const normalizeSubstanceName = (name) => {
  const substanceMap = {
    'Tobacco products (cigarettes, chewing tobacco etc)': 'Tobacco',
    'Alcoholic beverages (beer, wine, spirits, ara etc.)': 'Alcohol',
    'Cannabis (marijuana, pot, grass, hash, black etc.)': 'Cannabis',
    'Opioids (heroin, morphine, fentanyl, codeine, SP+, tramadol, BS etc.)': 'Opioids',
    Cocaine: 'Cocaine',
    'Amphetamine-type stimulants (meth, ecstasy, yebe, diet pills etc.)': 'Amphetamines',
    'Inhalants (dendrite, glue, petrol, paint thinner, etc.)': 'Inhalants',
    'Sedatives or Sleeping Pills (N-10, diazepam etc.)': 'Sedatives',
    'Hallucinogens (LSD, trips, Ketamine, etc.)': 'Hallucinogens',
    'Other - specify': 'Other',
    'Any Drug': 'Any Drug'
  }
  return substanceMap[name] || name
}

const mapSubstanceKeyToName = (key) => {
  const substanceMap = {
    tobacco: 'Tobacco',
    alcoholic: 'Alcohol',
    cannabis: 'Cannabis',
    opioids: 'Opioids',
    cocaine: 'Cocaine',
    amphetamine: 'Amphetamines',
    inhalants: 'Inhalants',
    sedatives: 'Sedatives',
    hallucinogens: 'Hallucinogens',
    injection: 'Injection',
    other: 'Other'
  }
  return substanceMap[key] || key
}

function isActive(index) {
  return index === activeIndex.value
}

async function setActiveIndex(index) {
  if (isLoading.value) return
  activeIndex.value = index
  await nextTick()
  setTimeout(() => {
    dataReady.value = true
    isLoading.value = false
  }, 100)
}

const getUserDetailsFromStorage = () => {
  const userDetailsString = localStorage.getItem('userDetailsStore')
  if (!userDetailsString) {
    console.error('No userDetailsStore found in localStorage')
    return { agencyName: 'Unknown Agency' }
  }
  try {
    const userDetails = JSON.parse(userDetailsString)
    return { agencyName: userDetails?.agency?.agencyName || 'Unknown Agency' }
  } catch (error) {
    console.error('Error parsing user details:', error)
    return { agencyName: 'Unknown Agency' }
  }
}

const updateSeverityCounts = () => {
  const counts = {}
  SEVERITY_ITEMS.value.forEach((item) => {
    counts[item.title] = {}
  })
  filteredData.value.forEach((entry) => {
    const screeningData = entry.screening_data
    if (!screeningData || screeningData === 'Data not available') return
    SEVERITY_ITEMS.value.forEach((item) => {
      let measurement = null
      if (item.field === 'assist_data') {
        let hasRisk = false
        if (entry.case_substance_risks && entry.case_substance_risks.length > 0) {
          hasRisk = entry.case_substance_risks.some(
            (risk) => extractRiskLevel(risk.risk_flag) !== 'low'
          )
        }
        if (!hasRisk && entry.event_substance_risks && entry.event_substance_risks.length > 0) {
          hasRisk = entry.event_substance_risks.some(
            (risk) => extractRiskLevel(risk.risk_flag) !== 'low'
          )
        }
        if (!hasRisk && screeningData?.assist_data) {
          try {
            let assistValue = screeningData.assist_data
            if (assistValue) {
              if (typeof assistValue === 'string') {
                assistValue = JSON.parse(assistValue)
              }
              if (Array.isArray(assistValue)) {
                hasRisk = assistValue.some((data) => extractRiskLevel(data.risk_flag) !== 'low')
              } else {
                hasRisk = item.threshold(assistValue)
              }
            }
          } catch (error) {
            console.error(`Error evaluating assist data:`, error)
          }
        }
        if (hasRisk) {
          measurement = 'Has Risk'
        }
      } else if (item.field === 'phq_data') {
        try {
          let value = screeningData[item.field]
          if (typeof value === 'string') {
            value = JSON.parse(value)
          }
          let hasSuicidalThoughts = false
          if (Array.isArray(value)) {
            const suicideQuestion = value.find(
              (q) =>
                q.question &&
                q.question.toLowerCase().includes('thoughts that you would be better off dead')
            )
            hasSuicidalThoughts =
              suicideQuestion?.score >= 1 &&
              suicideQuestion.selectedOption?.toLowerCase() !== 'not at all'
          } else if (value?.responses) {
            const suicideQuestion = value.responses.find(
              (q) =>
                q.question &&
                q.question.toLowerCase().includes('thoughts that you would be better off dead')
            )
            hasSuicidalThoughts =
              suicideQuestion?.score >= 1 &&
              suicideQuestion.selectedOption?.toLowerCase() !== 'not at all'
          }
          if (hasSuicidalThoughts) {
            measurement = 'Has Suicidal Thoughts'
          }
        } catch (error) {
          console.error(`Error evaluating PHQ data:`, error)
        }
      } else {
        let value = screeningData[item.field]
        if (value === undefined || value === null) return
        try {
          if (
            typeof value === 'string' &&
            item.field !== 'phq_score' &&
            item.field !== 'gad_score'
          ) {
            value = JSON.parse(value)
          }
          if (item.threshold(value)) {
            if (item.title === 'Depression') {
              measurement = screeningData.phq_interpretation || null
            } else if (item.title === 'Anxiety') {
              measurement = screeningData.gad_interpretation || null
            } else if (item.title === 'ACE') {
              measurement = screeningData.ace_interpretation || null
            } else {
              measurement = 'Has Risk'
            }
          }
        } catch (error) {
          console.error(`Error evaluating threshold for ${item.title}:`, error)
        }
      }
      if (measurement) {
        counts[item.title][measurement] = (counts[item.title][measurement] || 0) + 1
      }
    })
  })
  SEVERITY_ITEMS.value.forEach((item) => {
    let total = 0
    for (let key in counts[item.title]) {
      total += counts[item.title][key]
    }
    item.count = total.toString()
  })
  severityCounts.value = counts
}

watchEffect(() => {
  if (selectedYear.value) {
    fetchAndFilterData()
  }
})

onMounted(async () => {
  await fetchAndFilterData()
})

watchEffect(() => {
  if (filteredData.value.length > 0) {
    processAssistData()
    updateSeverityCounts()
  }
})
</script>

<style scoped>
.severity-dashboard {
  padding: 2.5rem;
  background: linear-gradient(145deg, #f8fafb, #edf4f6);
  border-radius: 20px;
  box-shadow: 0 15px 30px rgba(43, 101, 111, 0.08);
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.5rem;
}

.dashboard-title {
  color: #1a4954;
  font-size: 1.75rem;
  font-weight: 700;
  letter-spacing: -0.5px;
  margin: 0;
}

.year-filter {
  position: relative;
}

.year-label {
  display: block;
  color: #2b656f;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.select-wrapper {
  position: relative;
  width: 180px;
}

.year-select {
  width: 100%;
  background-color: white;
  border: 2px solid #2b656f;
  border-radius: 12px;
  color: #2b656f;
  font-weight: 600;
  padding: 0.75rem 1rem;
  appearance: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.select-icon {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #2b656f;
  pointer-events: none;
  font-size: 0.75rem;
}

.severity-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2.5rem;
}

.severity-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  border: 2px solid transparent;
  box-shadow: 0 8px 16px rgba(43, 101, 111, 0.06);
}

.severity-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(43, 101, 111, 0.12);
}

.active-card {
  background: linear-gradient(165deg, #2b656f 0%, #1d4851 100%);
  border-color: #3d7d89;
  box-shadow: 0 12px 24px rgba(43, 101, 111, 0.2);
}

.count-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}

.count-circle {
  background: rgba(43, 101, 111, 0.08);
  width: 70px;
  height: 70px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.active-card .count-circle {
  background: rgba(255, 255, 255, 0.15);
}

.count-number {
  font-size: 1.75rem;
  font-weight: 700;
  color: #2b656f;
  transition: color 0.3s ease;
}

.active-card .count-number {
  color: white;
}

.card-title {
  text-align: center;
  color: #2b656f;
  font-size: 0.9rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0;
  transition: color 0.3s ease;
}

.active-card .card-title {
  color: white;
}

.analysis-section {
  margin-top: 2rem;
}

.analysis-grid {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 1.5rem;
}

.indicator-section,
.graph-section {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 8px 16px rgba(43, 101, 111, 0.06);
}

.status-overlay {
  position: fixed;
  inset: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  z-index: 1000;
}

.loader {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #2b656f;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.error-message {
  color: #dc3545;
  text-align: center;
  padding: 1rem;
  border-radius: 8px;
  background: rgba(220, 53, 69, 0.1);
  margin-top: 1rem;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

@media (max-width: 1024px) {
  .analysis-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .severity-dashboard {
    padding: 1.5rem;
  }

  .dashboard-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .select-wrapper {
    width: 100%;
  }

  .count-circle {
    width: 60px;
    height: 60px;
  }

  .count-number {
    font-size: 1.5rem;
  }
}
</style>