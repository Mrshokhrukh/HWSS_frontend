import { defineStore } from 'pinia';

export const useUserDetailsStore = defineStore('userDetails', {
  state: () => {
    const savedState = localStorage.getItem('userDetailsStore');
    return savedState ? JSON.parse(savedState) : {
      user: {
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
        psAddVillage: '',
        psAddGewog: '',
        psAddDzongkhag: '',
        profilePicture: '',
        isGyalsung: false,
        academyCode: '',
        dateJoined: '',
        role: '',
        accessLevel: '',
      },
      agency: {
        id: null,
        agencyCode: '',
        agencyName: '',
        agencyParent: '',
        presentDzongkhag: '',
        presentGewog: '',
        presentVillage: '',
      },
      userAgency: {
        userCode: '',
        parentOccupation: '',
        guardianName: '',
        guardianOccupation: '',
        parentStatus: '',
        currentLivingWith: '',
        userRoleAgency: '',
        userClass: '',
        userSubClass: '',
      },
      isAuthenticated: false,
    };
  },
  actions: {
    setUserDetails({ user, agency, userAgency }) {
      try {

        // Transforming data keys from snake_case to camelCase for each object
        const camelCaseUser = Object.keys(user).reduce((acc, key) => {
          const camelKey = key.replace(/_([a-z])/g, g => g[1].toUpperCase());
          acc[camelKey] = user[key];
          return acc;
        }, {});

        const camelCaseAgency = Object.keys(agency).reduce((acc, key) => {
          const camelKey = key.replace(/_([a-z])/g, g => g[1].toUpperCase());
          acc[camelKey] = agency[key];
          return acc;
        }, {});

        const camelCaseUserAgency = Object.keys(userAgency).reduce((acc, key) => {
          const camelKey = key.replace(/_([a-z])/g, g => g[1].toUpperCase());
          acc[camelKey] = userAgency[key];
          return acc;
        }, {});

        // Updating the store
        this.user = { ...camelCaseUser };
        this.agency = { ...camelCaseAgency };
        this.userAgency = { ...camelCaseUserAgency };
        this.isAuthenticated = true;

        // Persisting the updated state
        this.saveState();

        console.log('Updated store with:', { user: this.user, agency: this.agency, userAgency: this.userAgency });

        // Returning a success response
        return Promise.resolve({ status: 'success', message: 'User details saved successfully.' });
      } catch (error) {
        console.error('Error setting user details in store:', error);
        // Ensure a response is returned even in case of error
        return Promise.resolve({ status: 'error', message: 'Failed to save user details.' });
      }
    },
    clearUserDetails() {
      this.$reset();
      localStorage.removeItem('userDetailsStore');
      console.log('User details cleared from store.');
    },
    saveState() {
      const state = {
        user: this.user,
        agency: this.agency,
        userAgency: this.userAgency,
        isAuthenticated: this.isAuthenticated,
      };
      localStorage.setItem('userDetailsStore', JSON.stringify(state));
      console.log('State saved to localStorage.');
    }
  }
});