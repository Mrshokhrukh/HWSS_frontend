function getBaseUrl() {
  if (import.meta.env.DEV) {
    return 'http://localhost:8123';
  } else {
    return 'https://thepemasystem.gov.bt/api/core';
  }
}

function getScreeningBaseUrl() {
  if (import.meta.env.DEV) {
    return 'http://localhost:8686';
  } else {
    return 'https://thepemasystem.gov.bt/api/screening';
  }
}

// --- 2. API CONFIGURATION ---
const apiConfig = {
  core: {
    baseUrl: getBaseUrl(),
    modules: {
      access: 'access',
      settings: 'settings',
      measurement: 'measurement',
      monitoring: 'monitoring',
      reporting: 'reporting',
      counselorScreening: 'screening' 
    }
  },
  screening: {
    baseUrl: getScreeningBaseUrl(), 
    modules: { 
      screening: 'screening' 
    } 
  }
};

// --- 3. ENDPOINT DEFINITIONS ---
const endpointDefinitions = {
  access: {
    getCitizenDetails: 'get-citizen-details/',
    getRcscDetails: 'get-rcsc-details/',
    registerUser: 'register-user/',
    registerCounselorCaseUser: 'register-counselor-case-user/',
    registerCounselorEventUser: 'register-counselor-event-user/',
    registerAgency: 'register-agency/',
    getEmisStudent: 'get-emis-student-details/',
    getEmisEmployee: 'get-emis-staff-details/',
    authenticateToken: 'authenticate-token/',
    confirmUser: 'check_email_cid/',
    verifyPreRecordedUser: 'verify-pre-recorded-user/',
    registerPreRecordedUser: 'register-pre-recorded-user/',
    registerPreRecordedAgency: 'register-pre-recorded-agency/',
    loginUsers: 'login/',
    getUserDetails: 'get-user-details/',
    logOutUser: 'user-logout/',
    passwordResetRequest: 'password-reset-request/',
    passwordReset: (token) => `password-reset/${token}/`,
    getCSRFToken: 'get_csrf_token/',
    updateUserInfo: 'update-user-info/',
    changePassword: 'change-password/',
    fetchReferralCounselors: 'get-referral-counselors/',
    getGyalsungUserData: 'get-gyalsung-user-data/',
    registerGyalsungCounselorUser: 'gyalsung/counselor-users/',
    registerGyalsungUser: 'register-gyalsung-user/'
  },
  settings: {
    settings: 'appconfig/',
    menuItem: 'menuItem/',
    getVideo: 'get-videos/'
  },
  screening: {
    screeningPreTests: 'screening-questions/',
    assistTest: 'assist-screening/',
    gyalsungScreenSubmission: 'gyalsung-submission/' 
  },
  measurement: {
    submitCluster: 'submit-screening/',
    getMeasurement: 'get-measurement/',
    getAssistMeasurement: 'get-assist-measurement/',
    getSubmissionData: 'get-submission-data/',
    getSUDData: 'get-sud-data/',
    getSchoolEnvData: 'get-school-env-data/',
    getDiagnosis: 'diagnosis/'
  },
  monitoring: {
    getRescreeningList: 'check-rescreening-flags/',
    markSubmissionSafe: 'mark-submission-safe/',
    getServiceAndTreatmentList: 'service-and-treatment/get-service-and-treatment/',
    generateServiceAndTreatment: 'generate-service-and-treatment/',
    getReferralList: 'get-referral-list/',
    rescreenSubmission: 'submit-rescreening/',
    getUserMonitoringDetails: 'get-user-monitoring-details/',
    updateServiceAndTreatment: 'update-service-and-treatment/',
    updateReferralStatus: 'update-referral-status/',
    rejectReferral: 'reject-referral/',
    acceptReferral: 'accept-referral/',
    getNotifications: 'get-notification/',
    markNotificationAsRead: 'notifications/mark-as-read/',
    getClusterRecords: 'final-submissions/',
    getGyalsungScreenings: 'final-submissions/', 
    newServiceAndTreatment: 'service-and-treatment/get-service-and-treatment/',
    newReferrals: 'referrals/'
  },
  reporting: {
    generateReport: 'generate-report/',
    getReport: 'get-reporting-model-data/',
    updateUserArchive: 'update-user-archive/',
    generateCounselorXLSEncryptedReport: 'generate-counselor-report-encrypted-xls/',
    generateGyalsungExcelReport: 'generate-gyalsung-excel-report/'
  },
  counselorScreening: {
    createEventScreening: 'create-event-screening/',
    getEventInfo: (counselorName) => `get-event-info/${encodeURIComponent(counselorName)}/`,
    caseScreenSubmission: 'submit-case-screening/',
    eventScreenSubmission: 'submit-event-screening/',
    getEventScreeningList: 'get-event-screenings/',
    updateEventScreeningList: 'update-event-screening/',
    getCaseRecords: 'case-records/',
    getEventRecords: 'event-records/',
    gyalsungScreenSubmission: 'gyalsung-submission/' 
  }
};

// --- 4. ENDPOINT BUILDER ---
function buildEndpoints() {
  const builtEndpoints = {};

  const { core, screening } = apiConfig;
  const getModulePath = (baseUrl, module) => `${baseUrl}/api/v1/${module}`;

  for (const moduleName in endpointDefinitions) {
    const endpointsForModule = endpointDefinitions[moduleName];

    let basePath;
    if (core.modules[moduleName]) {
      basePath = getModulePath(core.baseUrl, core.modules[moduleName]);
    } else if (screening.modules[moduleName]) {
      basePath = getModulePath(screening.baseUrl, screening.modules[moduleName]);
    } else {
      console.error(`Module "${moduleName}" is not configured in apiConfig.`);
      continue;
    }

    for (const endpointKey in endpointsForModule) {
      const endpointValue = endpointsForModule[endpointKey];
      if (typeof endpointValue === 'function') {
        builtEndpoints[endpointKey] = (...args) => `${basePath}/${endpointValue(...args)}`;
      } else {
        builtEndpoints[endpointKey] = `${basePath}/${endpointValue}`;
      }
    }
  }
  return builtEndpoints;
}

// --- 5. EXPORT ---
const endpoints = buildEndpoints();

export default endpoints;
