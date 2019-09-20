import axios from 'axios'
import endpoints from '@/api'

export const fetchUserDetails = async () => {
  try {
    const storedDetails = localStorage.getItem('userDetailsStore')
    if (storedDetails) {
      return JSON.parse(storedDetails)
    } else {
      throw new Error('User details not found in localStorage')
    }
  } catch (error) {
    console.error('Error fetching user details:', error)
    throw error
  }
}

export const fetchReportData = async () => {
    try {
      console.log('Fetching report data from:', endpoints.getReport);
      const response = await axios.get(endpoints.getReport);
      console.log('Report data response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching report data:', error);
      throw error;
    }
  }

export const fetchMeasurementData = async () => {
  try {
    const response = await axios.get(endpoints.getMeasurement)
    return response.data
  } catch (error) {
    console.error('Error fetching measurement data:', error)
    throw error
  }
}

export const fetchAssistMeasurementData = async () => {
  try {
    const response = await axios.get(endpoints.getAssistMeasurement)
    return response.data
  } catch (error) {
    console.error('Error fetching assist measurement data:', error)
    throw error
  }
}

export const fetchSUDData = async () => {
  try {
    const response = await axios.get(endpoints.getSUDData)
    return response.data
  } catch (error) {
    console.error('Error fetching SUD data:', error)
    throw error
  }
}

export const fetchServiceAndTreatmentList = async () => {
  try {
    const response = await axios.get(endpoints.generateServiceAndTreatment)
    return response.data.data
  } catch (error) {
    console.error('Error fetching service and treatment list:', error)
    throw error
  }
}

export const fetchUserDetailsById = async (userId) => {
  try {
    const response = await axios.get(`${endpoints.getUserMonitoringDetails}?user_id=${userId}`)
    return response.data
  } catch (error) {
    console.error('Error fetching user details:', error)
    throw error
  }
}

export const updateServiceAndTreatment = async (formData) => {
  try {
    const response = await axios.post(endpoints.updateServiceAndTreatment, JSON.stringify(formData))
    return response.data
  } catch (error) {
    console.error('Error updating service and treatment:', error)
    throw error
  }
}

export const updateReferralStatus = async (formData) => {
  try {
    const response = await axios.post(endpoints.updateReferralStatus, JSON.stringify(formData))
    return response.data
  } catch (error) {
    console.error('Error updating referral status:', error)
    throw error
  }
}

export const fetchOfficialOptions = async (role) => {
  try {
    const response = await axios.get(`${endpoints.fetchReferralCounselors}?role=${role}`)
    return response.data.data
  } catch (error) {
    console.error('Error fetching official options:', error)
    throw error
  }
}

export const fetchReferralList = async () => {
  try {
    const response = await axios.get(endpoints.getReferralList)
    return response.data.referral_list
  } catch (error) {
    console.error('Error fetching referral list:', error)
    throw error
  }
}