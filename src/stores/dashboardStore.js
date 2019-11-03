import { defineStore } from 'pinia'
import axios from 'axios'
import endpoints from '@/api';

export const useDashboardStore = defineStore('dashboard', {
  state: () => ({
    reportData: [],
    selectedReport: '',
    filters: {
      region: '',
      dzongkhag: ''
    },
    regions: ['Western', 'Central', 'Eastern'],
    dzongkhags: {
      Western: ['Thimphu', 'Paro', 'Haa', 'Punakha', 'Gasa', 'Chhukha', 'Samtse', 'Phuentsholing Thromde', 'Thimphu Thromde'],
      Central: ['Bumthang', 'Dagana', 'Sarpang', 'Trongsa', 'Tsirang', 'Wangdue Phodrang', 'Zhemgang', 'Gelephu Thromde'],
      Eastern: ['Lhuentse', 'Mongar', 'Pemagatshel', 'Samdrup Jongkhar', 'Samdrup Jongkhar Thromde', 'Trashi Yangtse', 'Trashigang']
    },

    isLoading: false,
    error: null,
    userRole: null,
    userAgencyName: null,
    currentYear: new Date().getFullYear(),
    websiteName: "The PEMA HWSS"
  }),

  getters: {
    filteredData: (state) => {
      return state.reportData.filter((item) => {
        const itemDzongkhag = item.user?.fields?.ps_add_dzongkhag;
        const itemRegion = Object.entries(state.dzongkhags).find(([dzongkhags]) =>
          dzongkhags.includes(itemDzongkhag)
        )?.[0];

        if (state.filters.region && itemRegion !== state.filters.region) {
          return false;
        }
        if (state.filters.dzongkhag && itemDzongkhag !== state.filters.dzongkhag) {
          return false;
        }
        return true;
      });
    }
  },

  actions: {
    setSelectedReport(report) {
      this.selectedReport = report;
    },
    setFilter(filterType, value) {
      this.filters[filterType] = value;
      if (filterType === 'region') {
        this.filters.dzongkhag = '';
      }
    },
    resetFilters() {
      this.filters.region = '';
      this.filters.dzongkhag = '';
    },
    setUserDetails() {
      const userDetails = JSON.parse(localStorage.getItem('userDetailsStore'));
      if (userDetails) {
        this.userAgencyName = userDetails.agency ? userDetails.agency.agencyName : null;
        this.userRole = userDetails.user ? userDetails.user.role : null;
      }
    },
    async fetchReportData() {
      this.isLoading = true;
      this.error = null;
      try {
        const storedData = sessionStorage.getItem('reportData');
        const storedTimestamp = sessionStorage.getItem('reportDataTimestamp');
        const currentTime = new Date().getTime();

        if (storedData && storedTimestamp) {
          const dataAge = currentTime - parseInt(storedTimestamp);
          const maxDataAge = 600000; // 10 minutes in milliseconds

          if (dataAge < maxDataAge) {
            this.reportData = JSON.parse(storedData);
            this.isLoading = false;
            return;
          }
        }

        const reportResponse = await axios.get(endpoints.getReport);
        if (reportResponse.data && reportResponse.data.reporting_model_data) {
          let reportItems = reportResponse.data.reporting_model_data;

          // Apply filtering based on user role
          if (this.userRole === 'aaa_admin') {
            // For 'aaa_admin', filter by agency name matching user's agency
            reportItems = reportItems.filter(item => {
              const itemAgencyName = item.agency_name ? item.agency_name.toLowerCase() : null;
              return itemAgencyName === this.userAgencyName.toLowerCase();
            });
          } else if (this.userRole === 'cecd_admin') {
            // For 'cecd_admin', filter by agency name containing 'school'
            reportItems = reportItems.filter(item => {
              const itemAgencyName = item.agency_name ? item.agency_name.toLowerCase() : null;
              return itemAgencyName && itemAgencyName.includes('school');
            });
          }

          this.reportData = reportItems;
          sessionStorage.setItem('reportData', JSON.stringify(this.reportData));
          sessionStorage.setItem('reportDataTimestamp', currentTime.toString());
        } else {
          throw new Error('No data received from the API');
        }
      } catch (error) {
        console.error('Error fetching report data:', error);
        this.error = error.message || 'An error occurred while fetching report data';
      } finally {
        this.isLoading = false;
      }
    }
  }
})