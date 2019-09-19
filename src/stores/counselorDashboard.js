import { defineStore } from 'pinia'
import axios from 'axios'
import endpoints from '@/api'

export const useCounselorDashboardStore = defineStore('counselorDashboard', {
  state: () => ({
    userDetails: null,
    reportData: [],
    filteredReportData: [],
    measurementData: [],
    filteredMeasurementData: [],
    assistMeasurementData: [],
    filteredAssistMeasurementData: [],
    activeCardIndex: 0,
    currentYear: new Date().getFullYear(),
    chartColors: ['#2c6975', '#64ac99'],
    severityItems: [
      { count: '0', title: 'Suicidal Behavior', link: '/suicidal-behavior' },
      { count: '0', title: 'Depression', link: '/depression' },
      { count: '0', title: 'Anxiety', link: '/anxiety' },
      { count: '0', title: 'ACE', link: '/ace' },
      { count: '0', title: 'Assist', link: '/assist' }
    ],
    sudData: null,
    filteredSudData: {
      lifetime_users: [],
      active_users: []
    },
    sudError: null,
    gyalsungUserProfiles: [],
    isLoading: false,
    isInitialized: false,
    error: null
  }),

  getters: {
    agencyName: (state) => state.userDetails?.agency?.agencyName || 'Unknown Agency',
    userRole: (state) => state.userDetails?.user?.role || null,
    
    chartData: (state) => {
      const maleCount = state.filteredReportData.filter(item => item.user?.fields?.gender === 'Male').length;
      const femaleCount = state.filteredReportData.filter(item => item.user?.fields?.gender === 'Female').length;
      
      return {
        labels: ['Male', 'Female'],
        datasets: [{
          data: [maleCount, femaleCount],
          backgroundColor: state.chartColors,
          borderWidth: 0
        }]
      }
    },

    totalScreenedCount: (state) => state.filteredReportData.length,

    activeItem: (state) => state.severityItems[state.activeCardIndex],

    severityChartData: (state) => (cardTitle) => {
      const { maleData, femaleData } = countSeverityByGender(state.filteredMeasurementData, cardTitle);
      const allSeverities = new Set([...Object.keys(maleData), ...Object.keys(femaleData)]);

      return [
        {
          name: 'Male',
          data: Object.fromEntries(Array.from(allSeverities).map(severity => [severity, maleData[severity] || 0]))
        },
        {
          name: 'Female',
          data: Object.fromEntries(Array.from(allSeverities).map(severity => [severity, femaleData[severity] || 0]))
        }
      ];
    },

    severityChartCategories: (state) => (cardTitle) => {
      const { maleData, femaleData } = countSeverityByGender(state.filteredMeasurementData, cardTitle);
      return Array.from(new Set([...Object.keys(maleData), ...Object.keys(femaleData)]));
    },

    agencyUserIds: (state) => {
      return new Set(state.filteredReportData.map(report => report.user?.id));
    },
  },

  actions: {
    async fetchUserDetails() {
      console.log('Fetching user details...');
      const storedDetails = localStorage.getItem('userDetailsStore');
      if (storedDetails) {
        this.userDetails = JSON.parse(storedDetails);
        console.log('User details fetched:', this.userDetails);
      } else {
        console.error('User details not found in localStorage');
        this.error = 'User details not found';
      }
    },

    async fetchReportData() {
      console.log('Fetching report data...');
      this.isLoading = true;
      try {
        const response = await axios.get(endpoints.getReport);
        if (response.data) {
          if (Array.isArray(response.data)) {
            this.reportData = response.data;
          } else if (typeof response.data === 'object') {
            const arrayData = Object.values(response.data).find(val => Array.isArray(val));
            if (arrayData) {
              this.reportData = arrayData;
            } else {
              throw new Error('Unexpected data structure: No array found in response');
            }
          } else {
            throw new Error('Unexpected data structure: Response is neither an array nor an object');
          }
          
          console.log('Report data fetched:', this.reportData.length, 'items');
        } else {
          throw new Error('No data in response');
        }
      } catch (error) {
        console.error('Error fetching report data:', error);
        this.error = `Failed to fetch report data: ${error.message}`;
        this.reportData = [];
      } finally {
        this.isLoading = false;
      }
    },

    async fetchMeasurementData() {
      console.log('Fetching measurement data...');
      try {
        const response = await axios.get(endpoints.getMeasurement);
        if (response.data && response.data.length > 0) {
          this.measurementData = response.data;
          console.log('Measurement data fetched:', this.measurementData.length, 'items');
        } else {
          throw new Error('No measurement data received');
        }
      } catch (error) {
        console.error('Error fetching measurement data:', error);
        this.error = `Failed to fetch measurement data: ${error.message}`;
      }
    },
    
    async fetchAssistMeasurementData() {
      console.log('Fetching assist measurement data...');
      try {
        const response = await axios.get(endpoints.getAssistMeasurement);
        if (response.data && response.data.length > 0) {
          this.assistMeasurementData = response.data;
          console.log('Assist measurement data fetched:', this.assistMeasurementData.length, 'items');
        } else {
          throw new Error('No assist measurement data received');
        }
      } catch (error) {
        console.error('Error fetching assist measurement data:', error);
        this.error = `Failed to fetch assist measurement data: ${error.message}`;
      }
    },

    async fetchSUDData() {
      console.log('Fetching SUD data...');
      try {
        const sudResponse = await axios.get(endpoints.getSUDData);
        if (sudResponse.data && sudResponse.data.success === true) {
          this.sudData = sudResponse.data.data;
          this.sudError = null;
          console.log('SUD data fetched successfully');
        } else {
          throw new Error('SUD data fetch was not successful or data is in unexpected format');
        }
      } catch (error) {
        console.error("Error fetching SUD data:", error);
        this.sudError = `Failed to fetch SUD data: ${error.message}`;
        this.sudData = null;
        this.filteredSudData = { lifetime_users: [], active_users: [] };
      }
    },

    filterByAgency(data, agencyNameGetter) {
      const userAgencyName = this.userDetails?.agency?.agencyName?.toLowerCase();
      if (!userAgencyName) {
        console.warn('User agency name not found, returning all data');
        return data;
      }
      return data.filter(item => {
        const itemAgencyName = agencyNameGetter(item)?.toLowerCase();
        return itemAgencyName === userAgencyName;
      });
    },

    filterReportData() {
      this.filteredReportData = this.filterByAgency(this.reportData, 
        item => item.agency_name || item.user?.fields?.agency || item.user_details?.agency);
    },

    filterMeasurementData() {
      this.filteredMeasurementData = this.filterByAgency(this.measurementData, 
        item => item.user_details?.active_agency?.agency_name);
    },

    filterAssistMeasurementData() {
      this.filteredAssistMeasurementData = this.filterByAgency(this.assistMeasurementData, 
        item => {
          const user = this.reportData.find(report => report.user?.id === item.user);
          return user?.agency_name || user?.user?.fields?.agency || user?.user_details?.agency;
        });
    },

    filterSUDData() {
      if (!this.sudData) return;
      
      const filterUsers = users => this.filterByAgency(users, 
        user => {
          const reportUser = this.reportData.find(report => report.user?.id === user.user_id);
          return reportUser?.agency_name || reportUser?.user?.fields?.agency || reportUser?.user_details?.agency;
        });

      this.filteredSudData = {
        lifetime_users: filterUsers(this.sudData.lifetime_users),
        active_users: filterUsers(this.sudData.active_users)
      };
    },

    updateSeverityCounts() {
      const filteredMeasurements = this.filteredMeasurementData.map(item => item.measurement);
      this.severityItems[0].count = filteredMeasurements.filter(item => item.suicidal_measurement !== null).length.toString();
      this.severityItems[1].count = filteredMeasurements.filter(item => item.phq_measurement !== null).length.toString();
      this.severityItems[2].count = filteredMeasurements.filter(item => item.gad_measurement !== null).length.toString();
      this.severityItems[3].count = filteredMeasurements.filter(item => item.ace_measurement !== null).length.toString();
    },

    updateAssistCount() {
      this.severityItems[4].count = this.filteredAssistMeasurementData.length.toString();
    },

    setActiveCardIndex(index) {
      this.activeCardIndex = index;
    },

    async initializeStore() {
      console.log('Initializing store...');
      if (!this.isInitialized) {
        this.isLoading = true;
        this.error = null;
        try {
          await this.fetchUserDetails();
          if (this.error) throw new Error(this.error);
    
          await this.fetchReportData();
          if (this.error) throw new Error(this.error);
    
          await this.fetchMeasurementData();
          if (this.error) throw new Error(this.error);
    
          await this.fetchAssistMeasurementData();
          if (this.error) throw new Error(this.error);
    
          await this.fetchSUDData();
          if (this.error) throw new Error(this.error);
    
          // Filter all data after fetching
          this.filterReportData();
          this.filterMeasurementData();
          this.filterAssistMeasurementData();
          this.filterSUDData();
    
          // Update severity counts after all data is fetched and filtered
          this.updateSeverityCounts();
          this.updateAssistCount();
    
          this.isInitialized = true;
          console.log('Store initialization complete.');
        } catch (error) {
          console.error('Error during store initialization:', error);
          this.error = `Failed to initialize store: ${error.message}`;
        } finally {
          this.isLoading = false;
        }
      } else {
        console.log('Store already initialized.');
      }
    }    
  }
})

function countSeverityByGender(data, cardTitle) {
  const maleData = {};
  const femaleData = {};
  const titleToProperty = {
    'Suicidal Behavior': 'suicidal_measurement',
    'Depression': 'phq_measurement',
    'Anxiety': 'gad_measurement',
    'ACE': 'ace_measurement',
    'Assist': 'assist'
  };

  const measurementProperty = titleToProperty[cardTitle];

  data.forEach(entry => {
    const measurement = entry.measurement;
    const userDetails = entry.user_details;

    if (measurement && measurement[measurementProperty] !== null) {
      const gender = userDetails.gender.toLowerCase();
      const severity = measurement[measurementProperty];

      if (gender === 'male') {
        maleData[severity] = (maleData[severity] || 0) + 1;
      } else if (gender === 'female') {
        femaleData[severity] = (femaleData[severity] || 0) + 1;
      }
    }
  });

  return { maleData, femaleData };
}