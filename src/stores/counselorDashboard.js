import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as api from './counselorDashboardAPI'

export const useCounselorDashboardStore = defineStore('counselorDashboard', () => {
  // State
  const userDetails = ref(null)
  const reportData = ref([])
  const measurementData = ref([])
  const assistMeasurementData = ref([])
  const sudData = ref(null)
  const referralList = ref([])
  const serviceAndTreatmentList = ref([])
  const counselors = ref([])
  const currentYear = ref(new Date().getFullYear())
  const isLoading = ref(false)
  const isInitialized = ref(false)
  const error = ref(null)
  const userDetailsFromStorage = ref(null)

  // New state for chart
  const CHART_COLORS = ['#36A2EB', '#2c6975'] 

  // Helper function to safely parse JSON
  const safeJSONParse = (jsonString, fallback = null) => {
    try {
      return jsonString ? JSON.parse(jsonString) : fallback;
    } catch (error) {
      console.warn('Error parsing JSON:', error);
      return fallback;
    }
  };

  // Function to initialize user details from local storage
  const initUserDetailsFromStorage = () => {
    const storedDetails = localStorage.getItem('userDetailsStore')
    if (storedDetails) {
      userDetailsFromStorage.value = JSON.parse(storedDetails)
    }
  }

  // Call this function when the store is created
  initUserDetailsFromStorage()

  // Computed property to map all user data together
  const mappedUserData = computed(() => {
    const userMap = new Map()

    // Function to get or create a user in the map
    const getOrCreateUser = (userId) => {
      if (!userMap.has(userId)) {
        userMap.set(userId, {
          userId: userId,
          measurementData: null,
          assistMeasurementData: null,
          sudData: { lifetime: null, active: null },
          referrals: [],
          serviceAndTreatment: [],
          reportData: null
        })
      }
      return userMap.get(userId)
    }

    if (reportData.value && reportData.value.reporting_model_data) {
      reportData.value.reporting_model_data.forEach(report => {
        const user = report.user && report.user[0]?.fields;
        const userAgency = report.user_agency && report.user_agency[0]?.fields;
        const measurement = report.measurement && report.measurement[0]?.fields;
        const measurementAssist = report.measurement_assist && report.measurement_assist[0]?.fields;
        const rescreeningData = report.rescreening_data && report.rescreening_data[0]?.fields;

        const userId = user?.id || report.userId;
        if (!userId) {
          console.warn('No valid user ID found in report:', report);
          return;
        }

        const userEntry = getOrCreateUser(userId);
        Object.assign(userEntry, {
          username: user?.username,
          firstName: user?.first_name,
          middleName: user?.middle_name,
          lastName: user?.last_name,
          dateOfBirth: user?.date_of_birth,
          gender: user?.gender,
          email: user?.email,
          mobNumber: user?.mob_number,
          agencyName: report.agency_name,
          activeAgency: user?.active_agency,
          psAddVillage: user?.ps_add_village,
          psAddGewog: user?.ps_add_gewog,
          psAddDzongkhag: user?.ps_add_dzongkhag,
          isGyalsung: user?.is_gyalsung,
          academyCode: user?.academy_code,
          role: user?.role,
          accessLevel: user?.access_level,
          userCode: userAgency?.user_code,
          parentOccupation: userAgency?.parent_occupation,
          guardianName: userAgency?.guardian_name,
          guardianOccupation: userAgency?.guardian_occupation,
          parentStatus: userAgency?.parent_status,
          currentLivingWith: userAgency?.current_living_with,
          userRoleAgency: userAgency?.user_role_agency,
          userClass: userAgency?.user_class,
          userStream: userAgency?.user_stream,
          userSubClass: userAgency?.user_sub_class,
          measurementData: measurement,
          assistMeasurementData: measurementAssist,
          rescreeningData: rescreeningData,
          reportData: report
        });
      });
    } else {
      console.warn('reportData.value or reporting_model_data is not available:', reportData.value);
    }

    // Process measurement data
    measurementData.value.forEach(data => {
      const userId = data.measurement.user
      const userEntry = getOrCreateUser(userId)
      if (!userEntry.measurementData) {
        userEntry.measurementData = data.measurement
      }
    })

    // Process assist measurement data
    assistMeasurementData.value.forEach(data => {
      const userId = data.measurement_assist.user
      const userEntry = getOrCreateUser(userId)
      if (!userEntry.assistMeasurementData) {
        userEntry.assistMeasurementData = data.measurement_assist
      }
    })

    if (sudData.value) {
      sudData.value.lifetime_users.forEach(user => {
        const userEntry = getOrCreateUser(user.user_id)
        userEntry.sudData.lifetime = user
      })
      sudData.value.active_users.forEach(user => {
        const userEntry = getOrCreateUser(user.user_id)
        userEntry.sudData.active = user
      })
    }

    // Process referral data
    if (referralList.value && referralList.value.referral_list) {
      referralList.value.referral_list.forEach(referral => {
        const userId = referral.user_data.patient_id
        const userEntry = getOrCreateUser(userId)
        userEntry.referrals.push(referral)
      })
    }

    // Process service and treatment data
    serviceAndTreatmentList.value.forEach(service => {
      const userId = service.user.id
      const userEntry = getOrCreateUser(userId)
      userEntry.serviceAndTreatment.push(service)
    })

    const mappedData = Array.from(userMap.values());
    console.log('Final mapped data:', mappedData);
    console.log('Users with SUD data:', mappedData.filter(user => user.sudData.lifetime || user.sudData.active).length);
    return mappedData;
  })

  const agencyName = computed(() => userDetailsFromStorage.value?.agency?.agencyName || 'Unknown Agency')

  // New computed property for filtered user data
  const filteredUserData = computed(() => {
    if (!userDetailsFromStorage.value || !mappedUserData.value) {
      console.log('userDetailsFromStorage or mappedUserData is null/undefined');
      return [];
    }

    const userRole = userDetailsFromStorage.value.user?.role;
    const agencyName = userDetailsFromStorage.value.agency?.agencyName;
    const userPsAddDzongkhag = userDetailsFromStorage.value.user?.psAddDzongkhag;

    console.log('Filtering with:', { userRole, agencyName, userPsAddDzongkhag });

    return mappedUserData.value.filter(user => {
      const checkAgencyName = (user) => {
        const agencyNames = [
          user.serviceAndTreatment?.[0]?.user?.user_agency?.agency_name,
          user.sudData?.active?.agency_name,
          user.sudData?.lifetime?.agency_name,
          user.agencyName,
          user.user?.user_agency?.agency_name,
          user.agency_name
        ];
        return agencyNames.some(name => name && name.toLowerCase() === agencyName?.toLowerCase());
      };

      const checkDzongkhag = (user) => {
        const dzongkhags = [
          user.psAddDzongkhag,
          user.sudData?.active?.ps_dzongkhag,
          user.sudData?.lifetime?.ps_dzongkhag,
          user.user?.ps_add_dzongkhag
        ];
        return dzongkhags.some(dzongkhag => dzongkhag && dzongkhag.toLowerCase() === userPsAddDzongkhag?.toLowerCase());
      };

      let shouldInclude = false;

      switch (userRole) {
        case 'school_counselor':
        case 'trained_professional':
        case 'gyalsung_counselor':
          shouldInclude = checkAgencyName(user);
          break;
        case 'clinical_counselor':
          shouldInclude = checkDzongkhag(user);
          break;
        default:
          shouldInclude = true;
      }

      if (shouldInclude) {
        console.log('Including user:', user.userId || user.id);
      } else {
        console.log('Excluding user:', user.userId || user.id);
      }

      return shouldInclude;
    });
  });
  
  // Adjust the chartData and totalScreenedCount computeds accordingly:
  const chartData = computed(() => {
    const maleCount = filteredUserData.value.filter(user => user.sudData.active?.sex === 'Male').length
    const femaleCount = filteredUserData.value.filter(user => user.sudData.active?.sex === 'Female').length
    
    return {
      labels: ['Male', 'Female'],
      datasets: [{
        data: [maleCount, femaleCount],
        backgroundColor: CHART_COLORS,
        hoverBackgroundColor: CHART_COLORS
      }]
    }
  })
  
  const totalScreenedCount = computed(() => {
    return filteredUserData.value.length
  })

  // Actions
  async function initializeStore() {
    if (isInitialized.value) return
    
    isLoading.value = true
    error.value = null

    try {
      const [
        userDetailsResult,
        reportDataResult,
        measurementDataResult,
        assistDataResult,
        sudDataResult,
        referralListResult,
        serviceAndTreatmentResult
      ] = await Promise.all([
        api.fetchUserDetails(),
        api.fetchReportData(),
        api.fetchMeasurementData(),
        api.fetchAssistMeasurementData(),
        api.fetchSUDData(),
        api.fetchReferralList(),
        api.fetchServiceAndTreatmentList()
      ])

      userDetails.value = userDetailsResult
      reportData.value = reportDataResult || []
      measurementData.value = measurementDataResult || []
      assistMeasurementData.value = assistDataResult || []
      sudData.value = sudDataResult
      referralList.value = referralListResult || []
      serviceAndTreatmentList.value = serviceAndTreatmentResult || []

      console.log('Data loaded:', {
        userDetails: userDetails.value,
        reportData: reportData.value,
        measurementData: measurementData.value,
        assistMeasurementData: assistMeasurementData.value,
        sudData: sudData.value,
        referralList: referralList.value,
        serviceAndTreatmentList: serviceAndTreatmentList.value
      })

      isInitialized.value = true
    } catch (err) {
      console.error('Error in initializeStore:', err)
      error.value = err instanceof Error ? err.message : 'An unknown error occurred'
    } finally {
      isLoading.value = false
    }
  }

  async function fetchUserDetailsById(userId) {
    try {
      const result = await api.fetchUserDetailsById(userId)
      return result
    } catch (err) {
      console.error('Error in fetchUserDetailsById:', err)
      error.value = err instanceof Error ? err.message : 'An error occurred while fetching user details'
      throw err
    }
  }

  async function fetchOfficialOptions(role) {
    try {
      const options = await api.fetchOfficialOptions(role)
      return options
    } catch (err) {
      console.error('Error in fetchOfficialOptions:', err)
      error.value = err instanceof Error ? err.message : 'An error occurred while fetching official options'
      throw err
    }
  }

  return {
    userDetails,
    reportData,
    measurementData,
    assistMeasurementData,
    sudData,
    referralList,
    serviceAndTreatmentList,
    counselors,
    currentYear,
    isLoading,
    isInitialized,
    error,
    mappedUserData,
    filteredUserData,
    userDetailsFromStorage,
    initializeStore,
    fetchUserDetailsById,
    fetchOfficialOptions,
    initUserDetailsFromStorage,
    CHART_COLORS,
    agencyName,
    chartData,
    totalScreenedCount,
  }
})