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

// Define api middle params
const reportingMiddleParams = '/api/v1/reporting';

// Define api middle params
const counselorScreeningMiddleParams = '/api/v1/screening';

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

// Combine BaseURL and middle params for ease of use
const reportingBaseUrl = `${baseUrl}${reportingMiddleParams}`;

// Combine BaseURL and middle params for ease of use
const counselorScreeninggBaseUrl = `${baseUrl}${counselorScreeningMiddleParams}`;

// Define your API endpoints
const endpoints = {
  getCitizenDetails: `${accessBaseUrl}/get-citizen-details/`,
  getRcscDetails: `${accessBaseUrl}/get-rcsc-details/`,
  registerUser: `${accessBaseUrl}/register-user/`,
  registerCounselorUser: `${accessBaseUrl}/register-counselor-user/`,
  registerAgency: `${accessBaseUrl}/register-agency/`,
  getEmisStudent: `${accessBaseUrl}/get-emis-student-details/`,
  getEmisEmployee: `${accessBaseUrl}/get-emis-staff-details/`,
  authenticateToken: `${accessBaseUrl}/authenticate-token/`,

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
  changePassword: `${accessBaseUrl}/change-password/`,

  settings: `${settingsBaseUrl}/appconfig/`,
  menuItem: `${settingsBaseUrl}/menuItem/`,
  getVideo: `${settingsBaseUrl}/get-videos/`,

  // screening endpoint 
  ScreeningPreTests: `${screeningBaseUrl}/screening-questions/`,
  assistTest: `${screeningBaseUrl}/assist-screening/`,

  // submission endpoint
  submitCluster: `${measurementBaseUrl}/submit-screening/`,
  getMeasurement: `${measurementBaseUrl}/get-measurement/`,
  getAssistMeasurement: `${measurementBaseUrl}/get-assist-measurement/`,
  getSubmissionData: `${measurementBaseUrl}/get-submission-data/`,
  getSUDData: `${measurementBaseUrl}/get-sud-data/`,
  getSchoolEnvData: `${measurementBaseUrl}/get-school-env-data/`,

  // monitoring endpoints
  getRescreeningList: `${moitoringBaseUrl}/check-rescreening-flags/`,
  getServiceAndTreatmentList: `${moitoringBaseUrl}/get-service-and-treatment/`,
  generateServiceAndTreatment: `${moitoringBaseUrl}/generate-service-and-treatment/`,
  getReferralList: `${moitoringBaseUrl}/get-referral-list/`,
  rescreenSubmission: `${moitoringBaseUrl}/submit-rescreening/`,
  getUserMonitoringDetails: `${moitoringBaseUrl}/get-user-monitoring-details/`,

  // reporting endpoints
  generateReport: `${reportingBaseUrl}/generate-report/`,

  // counselor endpoints
  createEventScreening: `${counselorScreeninggBaseUrl}/create-event-screening/`,
  getEventInfo: (counselorName) => `${counselorScreeninggBaseUrl}/get-event-info/${encodeURIComponent(counselorName)}/`,
  
  caseScreenSubmission: `${counselorScreeninggBaseUrl}/submit-case-screening/`,
  eventScreenSubmission: `${counselorScreeninggBaseUrl}/submit-event-screening/`,
};

export default endpoints;
