// api.js

const isLocalhost5173 = window.location.hostname === 'localhost' && window.location.port === '5173';

// Define base URL based on the condition
const baseUrl = isLocalhost5173 ? 'http://localhost:8000' : 'http://172.30.3.5';

// Define base URL based on the condition
const baseScreeningUrl = isLocalhost5173 ? 'http://localhost:8080' : 'http://172.30.3.16';

// Define api middle params
const accessMiddleParams = '/api/v1/access';

// Define api middle params
const settingsMiddleParams = '/api/v1/settings';

// Define api middle params
const screeningMiddleParams = '/api/v1/screening';

// Define api middle params
const measurementMiddleParams = '/api/v1/measurement';

// Define api middle params
const monitoringMiddleParams = '/api/v1/monitoring';

// Combine BaseURL and middle params for ease of use
const accessBaseUrl = `${baseUrl}${accessMiddleParams}`;

// Combine BaseURL and middle params for ease of use
const settingsBaseUrl = `${baseUrl}${settingsMiddleParams}`;

// Combine BaseURL and middle params for ease of use
const screeningBaseUrl = `${baseScreeningUrl}${screeningMiddleParams}`;

// Combine BaseURL and middle params for ease of use
const measurementBaseUrl = `${baseUrl}${measurementMiddleParams}`;

// Combine BaseURL and middle params for ease of use
const moitoringBaseUrl = `${baseUrl}${monitoringMiddleParams}`;

// Define your API endpoints
const endpoints = {
  getCitizenDetails: `${accessBaseUrl}/get-citizen-details/`,
  getRcscDetails: `${accessBaseUrl}/get-rcsc-details/`,
  registerUser: `${accessBaseUrl}/register-user/`,
  registerCounselorUser: `${accessBaseUrl}/register-counselor-user/`,
  registerAgency: `${accessBaseUrl}/register-agency/`,
  getEmisStudent: `${accessBaseUrl}/get-emis-student-details/`,
  getEmisEmployee: `${accessBaseUrl}/get-emis-staff-details/`,

  verifyPreRecordedUser: `${accessBaseUrl}/verify-pre-recorded-user/`,
  registerPreRecordedUser: `${accessBaseUrl}/register-pre-recorded-user/`,
  registerPreRecordedAgency: `${accessBaseUrl}/register-pre-recorded-agency/`,
  loginUsers: `${accessBaseUrl}/login/`,
  getUserDetails: `${accessBaseUrl}/get-user-details/`,
  logOutUser: `${accessBaseUrl}/user-logout/`,
  passwordResetRequest: `${accessBaseUrl}/password-reset-request/`,
  passwordReset: (token) => `${accessBaseUrl}/password-reset/${token}/`,
  getCSRFToken: `${accessBaseUrl}/get_csrf_token/`,
  updateUserInfo: `${accessBaseUrl}/update-user-info/`,

  settings: `${settingsBaseUrl}/appconfig/`,
  menuItem: `${settingsBaseUrl}/menuItem/`,

  // screening endpoint 
  ScreeningPreTests: `${screeningBaseUrl}/screening-questions/`,
  assistTest: `${screeningBaseUrl}/assist-screening/`,

  // submission endpoint
  submitCluster: `${measurementBaseUrl}/submit-screening/`,
  getMeasurement: `${measurementBaseUrl}/get-measurement/`,
  getAssistMeasurement: `${measurementBaseUrl}/get-assist-measurement/`,
  getSubmissionData: `${measurementBaseUrl}/get-submission-data/`,

  // monitoring endpoints
  getRescreeningList: `${moitoringBaseUrl}/check-rescreening-flags/`,

};

export default endpoints;
