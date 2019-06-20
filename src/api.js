// api.js

// Function to determine base URL based on the condition
const protocol = window.location.protocol;
function getBaseUrl() {
  const isLocalhost5173 = window.location.hostname === 'localhost' && window.location.port === '5173';
  return isLocalhost5173 ? `${protocol}//localhost:8000` : `${protocol}//app.thepemasystem.gov.bt`;
}

// Function to combine base URL with middle params
function combineBaseUrlWithMiddleParams(baseUrl, middleParams) {
  return `${baseUrl}/api/v1/${middleParams}`;
}

// Define base URLs
const baseUrl = getBaseUrl();
const baseScreeningUrl = getBaseUrl() === `${protocol}//localhost:8000` ? `${protocol}//localhost:8686` : `${protocol}//qbs.thepemasystem.gov.bt`;

// Define middle params
const accessMiddleParams = 'access';
const settingsMiddleParams = 'settings';
const screeningMiddleParams = 'screening';
const measurementMiddleParams = 'measurement';
const monitoringMiddleParams = 'monitoring';
const reportingMiddleParams = 'reporting';
const counselorScreeningMiddleParams = 'screening';

// Combine base URLs with middle params
const accessBaseUrl = combineBaseUrlWithMiddleParams(baseUrl, accessMiddleParams);
const settingsBaseUrl = combineBaseUrlWithMiddleParams(baseUrl, settingsMiddleParams);
const screeningBaseUrl = combineBaseUrlWithMiddleParams(baseScreeningUrl, screeningMiddleParams);
const measurementBaseUrl = combineBaseUrlWithMiddleParams(baseUrl, measurementMiddleParams);
const monitoringBaseUrl = combineBaseUrlWithMiddleParams(baseUrl, monitoringMiddleParams);
const reportingBaseUrl = combineBaseUrlWithMiddleParams(baseUrl, reportingMiddleParams);
const counselorScreeningBaseUrl = combineBaseUrlWithMiddleParams(baseUrl, counselorScreeningMiddleParams);

// Define API endpoints
const endpoints = {
  getCitizenDetails: `${accessBaseUrl}/get-citizen-details/`,
  getRcscDetails: `${accessBaseUrl}/get-rcsc-details/`,
  registerUser: `${accessBaseUrl}/register-user/`,
  registerCounselorCaseUser: `${accessBaseUrl}/register-counselor-case-user/`,
  registerCounselorEventUser: `${accessBaseUrl}/register-counselor-event-user/`,
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

  fetchReferralCounselors: `${accessBaseUrl}/get-referral-counselors/`,

  settings: `${settingsBaseUrl}/appconfig/`,
  menuItem: `${settingsBaseUrl}/menuItem/`,
  getVideo: `${settingsBaseUrl}/get-videos/`,

  // Screening endpoint
  screeningPreTests: `${screeningBaseUrl}/screening-questions/`,
  assistTest: `${screeningBaseUrl}/assist-screening/`,

  // Submission endpoint
  submitCluster: `${measurementBaseUrl}/submit-screening/`,
  getMeasurement: `${measurementBaseUrl}/get-measurement/`,
  getAssistMeasurement: `${measurementBaseUrl}/get-assist-measurement/`,
  getSubmissionData: `${measurementBaseUrl}/get-submission-data/`,
  getSUDData: `${measurementBaseUrl}/get-sud-data/`,
  getSchoolEnvData: `${measurementBaseUrl}/get-school-env-data/`,

  // Monitoring endpoints
  getRescreeningList: `${monitoringBaseUrl}/check-rescreening-flags/`,
  getServiceAndTreatmentList: `${monitoringBaseUrl}/get-service-and-treatment/`,
  generateServiceAndTreatment: `${monitoringBaseUrl}/generate-service-and-treatment/`,
  getReferralList: `${monitoringBaseUrl}/get-referral-list/`,
  rescreenSubmission: `${monitoringBaseUrl}/submit-rescreening/`,
  getUserMonitoringDetails: `${monitoringBaseUrl}/get-user-monitoring-details/`,
  updateServiceAndTreatment: `${monitoringBaseUrl}/update-service-and-treatment/`,
  updateReferralStatus: `${monitoringBaseUrl}/update-referral-status/`,
  rejectReferral: `${monitoringBaseUrl}/reject-referral/`,
  acceptReferral: `${monitoringBaseUrl}/accept-referral/`,

  // Reporting endpoints
  generateReport: `${reportingBaseUrl}/generate-report/`,
  getReport: `${reportingBaseUrl}/get-reporting-model-data/`,
  updateUserArchive: `${reportingBaseUrl}/update-user-archive/`,

  // Counselor endpoints
  createEventScreening: `${counselorScreeningBaseUrl}/create-event-screening/`,
  getEventInfo: (counselorName) => `${counselorScreeningBaseUrl}/get-event-info/${encodeURIComponent(counselorName)}/`,
  caseScreenSubmission: `${counselorScreeningBaseUrl}/submit-case-screening/`,
  eventScreenSubmission: `${counselorScreeningBaseUrl}/submit-event-screening/`,
  getEventScreeningList: `${counselorScreeningBaseUrl}/get-event-screenings/`,
  updateEventScreeningList: `${counselorScreeningBaseUrl}/update-event-screening/`,
};

export default endpoints;
