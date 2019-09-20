import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as api from './counselorDashboardAPI'

// Constants
const CHART_COLORS = ['#2c6975', '#64ac99']
const SEVERITY_ITEMS = [
  { count: '0', title: 'Suicidal Behavior', link: '/suicidal-behavior' },
  { count: '0', title: 'Depression', link: '/depression' },
  { count: '0', title: 'Anxiety', link: '/anxiety' },
  { count: '0', title: 'ACE', link: '/ace' },
  { count: '0', title: 'Assist', link: '/assist' }
]

export const useCounselorDashboardStore = defineStore('counselorDashboard', () => {
  // State
  const userDetails = ref(null)
  const reportData = ref([])
  const filteredReportData = ref([])
  const measurementData = ref([])
  const filteredMeasurementData = ref([])
  const assistMeasurementData = ref([])
  const filteredAssistMeasurementData = ref([])
  const activeCardIndex = ref(0)
  const currentYear = ref(new Date().getFullYear())
  const sudData = ref(null)
  const filteredSudData = ref({ lifetime_users: [], active_users: [] })
  const sudError = ref(null)
  const gyalsungUserProfiles = ref([])
  const isLoading = ref(false)
  const isInitialized = ref(false)
  const error = ref(null)
  const serviceAndTreatmentList = ref([])
  const selectedUserDetails = ref(null)
  const officialOptions = ref([])
  const referralList = ref([])
  const selectedReferral = ref(null)

  // Getters
  const agencyName = computed(() => {
    console.log('Computing agencyName:', userDetails.value?.agency?.agencyName);
    return userDetails.value?.agency?.agencyName || 'Unknown Agency';
  })

  const userRole = computed(() => {
    console.log('Computing userRole:', userDetails.value?.user?.role);
    return userDetails.value?.user?.role || null;
  })
  
  const chartData = computed(() => {
    console.log('Computing chartData. Filtered report data:', filteredReportData.value);
    const maleCount = filteredReportData.value.filter(item => item.user?.fields?.gender === 'Male').length
    const femaleCount = filteredReportData.value.filter(item => item.user?.fields?.gender === 'Female').length
    
    console.log('Computed counts:', { maleCount, femaleCount });

    return {
      labels: ['Male', 'Female'],
      datasets: [{
        data: [maleCount, femaleCount],
        backgroundColor: CHART_COLORS,
        borderWidth: 0
      }]
    }
  })

  const totalScreenedCount = computed(() => {
    console.log('Computing totalScreenedCount:', filteredReportData.value.length);
    return filteredReportData.value.length
  })
  const activeItem = computed(() => SEVERITY_ITEMS[activeCardIndex.value])

  const severityChartData = computed(() => (cardTitle) => {
    const { maleData, femaleData } = countSeverityByGender(filteredMeasurementData.value, cardTitle)
    const allSeverities = new Set([...Object.keys(maleData), ...Object.keys(femaleData)])

    return [
      {
        name: 'Male',
        data: Object.fromEntries(Array.from(allSeverities).map(severity => [severity, maleData[severity] || 0]))
      },
      {
        name: 'Female',
        data: Object.fromEntries(Array.from(allSeverities).map(severity => [severity, femaleData[severity] || 0]))
      }
    ]
  })

  const severityChartCategories = computed(() => (cardTitle) => {
    const { maleData, femaleData } = countSeverityByGender(filteredMeasurementData.value, cardTitle)
    return Array.from(new Set([...Object.keys(maleData), ...Object.keys(femaleData)]))
  })

  const agencyUserIds = computed(() => {
    return new Set(filteredReportData.value.map(report => report.user?.id))
  })

  const filteredReferrals = computed(() => {
    const currentUserId = userDetails.value?.user?.id
    return referralList.value.filter(referral =>
      referral.referred_to && referral.referred_to.user_id === currentUserId
    )
  })

  // Actions
  async function initializeStore() {
    if (isInitialized.value) return
    
    isLoading.value = true
    error.value = null

    try {
      const [
        userDetailsData,
        reportDataResult,
        measurementDataResult,
        assistDataResult,
        sudDataResult,
        referralListResult
      ] = await Promise.all([
        api.fetchUserDetails(),
        api.fetchReportData(),
        api.fetchMeasurementData(),
        api.fetchAssistMeasurementData(),
        api.fetchSUDData(),
        api.fetchReferralList()
      ])
      console.log('Raw API responses:', {
        userDetails: userDetailsData,
        reportData: reportDataResult,
        measurementData: measurementDataResult,
        assistData: assistDataResult,
        sudData: sudDataResult,
        referralList: referralListResult
      });

      userDetails.value = userDetailsData
      reportData.value = reportDataResult.reporting_model_data || []
      measurementData.value = Array.isArray(measurementDataResult) ? measurementDataResult : []
      assistMeasurementData.value = Array.isArray(assistDataResult) ? assistDataResult : []
      sudData.value = sudDataResult
      referralList.value = Array.isArray(referralListResult) ? referralListResult : []


      console.log('Raw data processed:', {
        userDetails: !!userDetails.value,
        reportData: reportData.value.length,
        measurementData: measurementData.value.length,
        assistMeasurementData: assistMeasurementData.value.length,
        sudData: !!sudData.value,
        referralList: referralList.value.length
      });

      filterAllData()
      updateSeverityCounts()
      isInitialized.value = true
      console.log('Store initialization complete.');

    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An unknown error occurred'
    } finally {
      isLoading.value = false
    }
  }

  function filterAllData() {
    console.log('Filtering data...');
    filteredReportData.value = filterByAgency(reportData.value, item => item?.agency_name || item?.user?.fields?.agency || item?.user_details?.agency)
    filteredMeasurementData.value = filterByAgency(measurementData.value, item => item?.user_details?.active_agency?.agency_name)
    filteredAssistMeasurementData.value = filterByAgency(assistMeasurementData.value, item => {
      const user = reportData.value.find(report => report?.user?.id === item?.user)
      return user?.agency_name || user?.user?.fields?.agency || user?.user_details?.agency
    })
    filterSUDData()

    console.log('After filtering:', {
      filteredReportData: filteredReportData.value.length,
      filteredMeasurementData: filteredMeasurementData.value.length,
      filteredAssistMeasurementData: filteredAssistMeasurementData.value.length
    });
  }

  function filterByAgency(data, agencyNameGetter) {
    if (!Array.isArray(data)) {
      console.warn('Expected an array to filter, but received:', typeof data);
      return [];
    }
    const userAgencyName = userDetails.value?.agency?.agencyName?.toLowerCase();
    if (!userAgencyName) {
      console.warn('User agency name not found, returning all data');
      return data;
    }
    const filtered = data.filter(item => {
      const itemAgencyName = agencyNameGetter(item)?.toLowerCase().trim();
      return itemAgencyName && itemAgencyName.includes(userAgencyName);
    });
    console.log(`Filtering by agency: ${userAgencyName}. Before: ${data.length}, After: ${filtered.length}`);
    return filtered;
  }

  function filterSUDData() {
    if (!sudData.value) return
    
    filteredSudData.value = {
      lifetime_users: filterByAgency(sudData.value.lifetime_users, user => {
        const reportUser = reportData.value.find(report => report.user?.id === user.user_id)
        return reportUser?.agency_name || reportUser?.user?.fields?.agency || reportUser?.user_details?.agency
      }),
      active_users: filterByAgency(sudData.value.active_users, user => {
        const reportUser = reportData.value.find(report => report.user?.id === user.user_id)
        return reportUser?.agency_name || reportUser?.user?.fields?.agency || reportUser?.user_details?.agency
      })
    }
  }

  function updateSeverityCounts() {
    SEVERITY_ITEMS.forEach(item => {
      item.count = countSeverity(item.title).toString()
    })
  }

  function countSeverity(title) {
    const propertyMap = {
      'Suicidal Behavior': 'suicidal_measurement',
      'Depression': 'phq_measurement',
      'Anxiety': 'gad_measurement',
      'ACE': 'ace_measurement',
      'Assist': 'assist'
    }
    const property = propertyMap[title]
    return filteredMeasurementData.value.filter(item => item.measurement && item.measurement[property] !== null).length
  }

  function setActiveCardIndex(index) {
    activeCardIndex.value = index
  }

  async function fetchServiceAndTreatmentList() {
    try {
      serviceAndTreatmentList.value = await api.fetchServiceAndTreatmentList()
    } catch (error) {
      console.error('Error fetching service and treatment list:', error)
    }
  }

  async function fetchUserDetailsById(userId) {
    try {
      selectedUserDetails.value = await api.fetchUserDetailsById(userId)
    } catch (error) {
      console.error('Error fetching user details:', error)
    }
  }

  async function updateServiceAndTreatment(formData) {
    try {
      return await api.updateServiceAndTreatment(formData)
    } catch (error) {
      console.error('Error updating service and treatment:', error)
      throw error
    }
  }

  async function updateReferralStatus(formData) {
    try {
      return await api.updateReferralStatus(formData)
    } catch (error) {
      console.error('Error updating referral status:', error)
      throw error
    }
  }

  async function fetchOfficialOptions(role) {
    try {
      officialOptions.value = await api.fetchOfficialOptions(role)
    } catch (error) {
      console.error('Error fetching official options:', error)
    }
  }

  function setSelectedReferral(referral) {
    selectedReferral.value = referral
  }

  // Helper function
  function countSeverityByGender(data, cardTitle) {
    const maleData = {}
    const femaleData = {}
    const titleToProperty = {
      'Suicidal Behavior': 'suicidal_measurement',
      'Depression': 'phq_measurement',
      'Anxiety': 'gad_measurement',
      'ACE': 'ace_measurement',
      'Assist': 'assist'
    }

    const measurementProperty = titleToProperty[cardTitle]

    data.forEach(entry => {
      const measurement = entry.measurement
      const userDetails = entry.user_details

      if (measurement && measurement[measurementProperty] !== null) {
        const gender = userDetails.gender.toLowerCase()
        const severity = measurement[measurementProperty]

        if (gender === 'male') {
          maleData[severity] = (maleData[severity] || 0) + 1
        } else if (gender === 'female') {
          femaleData[severity] = (femaleData[severity] || 0) + 1
        }
      }
    })

    return { maleData, femaleData }
  }

  return {
    // State
    userDetails,
    reportData,
    filteredReportData,
    measurementData,
    filteredMeasurementData,
    assistMeasurementData,
    filteredAssistMeasurementData,
    activeCardIndex,
    currentYear,
    sudData,
    filteredSudData,
    sudError,
    gyalsungUserProfiles,
    isLoading,
    isInitialized,
    error,
    serviceAndTreatmentList,
    selectedUserDetails,
    officialOptions,
    referralList,
    selectedReferral,
    
    // Getters
    agencyName,
    userRole,
    chartData,
    totalScreenedCount,
    activeItem,
    severityChartData,
    severityChartCategories,
    agencyUserIds,
    filteredReferrals,

    // Actions
    initializeStore,
    filterAllData,
    updateSeverityCounts,
    setActiveCardIndex,
    fetchServiceAndTreatmentList,
    fetchUserDetailsById,
    updateServiceAndTreatment,
    updateReferralStatus,
    fetchOfficialOptions,
    setSelectedReferral,
    countSeverity,


    //Constants
    SEVERITY_ITEMS,
    CHART_COLORS
  }
})