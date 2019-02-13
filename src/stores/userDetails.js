import { defineStore } from 'pinia';

export const useUserDetailsStore = defineStore('userDetails', {
  state: () => ({
    fullName: '', // Changed from userName to fullName for clarity
    profilePicture: '',
    userRole: '', // Added user role to store
    isAuthenticated: false,
    agencyDetails: {}, // Added to store agency details
    userAgencyDetails: {}, // Added to store user-specific agency details
  }),
  actions: {
    setUserDetails({ fullName, profilePicture, userRole, agencyDetails, userAgencyDetails }) {
      this.fullName = fullName;
      this.profilePicture = profilePicture;
      this.userRole = userRole;
      this.agencyDetails = agencyDetails;
      this.userAgencyDetails = userAgencyDetails;
      this.isAuthenticated = true;
    },
    clearUserDetails() {
      this.fullName = '';
      this.profilePicture = '';
      this.userRole = '';
      this.agencyDetails = {};
      this.userAgencyDetails = {};
      this.isAuthenticated = false;
    },
  }
});
