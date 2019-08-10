// src/stores/dashboardStore.js
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
    regions: ['Western', 'Central', 'Eastern', 'Southern'],
    dzongkhags: {
      Western: ['Thimphu', 'Paro', 'Haa', 'Punakha', 'Gasa', 'Wangdue Phodrang'],
      Central: ['Trongsa', 'Bumthang', 'Zhemgang', 'Sarpang'],
      Eastern: ['Mongar', 'Trashigang', 'Trashi Yangtse', 'Lhuentse', 'Pema Gatshel', 'Samdrup Jongkhar'],
      Southern: ['Chukha', 'Samtse', 'Dagana', 'Tsirang']
    },
    isLoading: false,
    error: null
  }),

  getters: {
    filteredData: (state) => {
      return state.reportData.filter((item) => {
        const itemDzongkhag = item.user?.fields?.ps_add_dzongkhag;
        const itemRegion = Object.entries(state.dzongkhags).find(([_, dzongkhags]) => 
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
    async fetchReportData() {
      this.isLoading = true;
      this.error = null;
      try {
        console.log('Fetching report data...');
        const storedData = sessionStorage.getItem('reportData');
        const storedTimestamp = sessionStorage.getItem('reportDataTimestamp');
        const currentTime = new Date().getTime();

        if (storedData && storedTimestamp) {
          const dataAge = currentTime - parseInt(storedTimestamp);
          const maxDataAge = 600000; // 10 minutes in milliseconds

          if (dataAge < maxDataAge) {
            this.reportData = JSON.parse(storedData);
            console.log('Using stored data:', this.reportData);
            this.isLoading = false;
            return;
          }
        }

        const reportResponse = await axios.get(endpoints.getReport);
        console.log('Fetched data:', reportResponse.data);
        if (reportResponse.data && reportResponse.data.reporting_model_data) {
          this.reportData = reportResponse.data.reporting_model_data;
          sessionStorage.setItem('reportData', JSON.stringify(this.reportData));
          sessionStorage.setItem('reportDataTimestamp', currentTime.toString());
          console.log('Stored new data in session storage:', this.reportData);
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