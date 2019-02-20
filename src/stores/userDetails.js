import { defineStore } from 'pinia';

export const useUserDetailsStore = defineStore('userDetails', {
  state: () => ({
    // User details
    id: null,
    username: '',
    isStaff: false,
    isActive: false,
    identityNumber: '',
    nationality: '',
    firstName: '',
    middleName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    email: '',
    mobNumber: '',
    fatherName: '',
    motherName: '',
    permAddVillage: '',
    permAddGewog: '',
    permAddDzongkhag: '',
    profilePicture: '',
    activeAgency: null,
    isGyalsung: false,
    academyCode: '',
    dateJoined: '',
    role: '',
    accessLevel: '',
    // Agency details
    agencyId: null,
    agencyCode: '',
    agencyName: '',
    // User agency details
    userCode: '',
    psAddVillage: '',
    psAddGewog: '',
    psAddDzongkhag: '',
    parentOccupation: '',
    guardianName: '',
    guardianOccupation: '',
    parentStatus: '',
    currentLivingWith: '',
    userRoleAgency: '',
    userClass: '',
    userSubClass: '',
    // Authentication state
    isAuthenticated: false,
  }),
  actions: {
    setUserDetails(userDetails, agencyDetails, userAgencyDetails) {
      // Destructuring for clarity and to avoid direct mutation warnings
      Object.assign(this, {
        ...userDetails,
        ...agencyDetails,
        ...userAgencyDetails,
        isAuthenticated: true,
      });
    },
    clearUserDetails() {
      // Reset state
      this.$reset();
    },
  }
});
