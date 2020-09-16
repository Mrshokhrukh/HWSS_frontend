import { defineStore } from 'pinia';
import apiClient from '@/apiClient';

// Helper function to avoid repeating the camelCase logic
const keysToCamelCase = (obj) => {
  // If obj is not a valid object, return an empty object to prevent crashes
  if (!obj || typeof obj !== 'object') {
    return {};
  }
  return Object.keys(obj).reduce((acc, key) => {
    const camelKey = key.replace(/_([a-z])/g, g => g[1].toUpperCase());
    acc[camelKey] = obj[key];
    return acc;
  }, {});
};

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
        age: null,
        ageGroup: null,
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
    async fetchUserDetails() {
      try {
        const response = await apiClient.get('/api/users/me');
        // The check remains the same, but the action it calls is now safe
        if (response.data) {
          this.setUserDetails(response.data);
        } else {
          // If API returns no data, clear everything
          this.clearUserDetails();
        }
      } catch (error) {
        console.error("Failed to fetch user details (likely not logged in):", error.message);
        this.clearUserDetails();
        // Don't re-throw the error unless something downstream needs to catch it
        // throw error; 
      }
    },

    // ***** THIS IS THE CORRECTED ACTION *****
    setUserDetails(data) {
      // 1. ADD A GUARD CLAUSE: Check if the data is valid before doing anything.
      // We check for `data` and the essential `data.user` property.
      if (!data || !data.user) {
        console.error('Error setting user details in store: Invalid or empty data received.', data);
        this.clearUserDetails(); // Clear state if bad data is received
        return; // Stop execution
      }

      try {
        // 2. DESTRUCTURE SAFELY: Destructure *after* the guard clause.
        const { user, agency, userAgency } = data;

        // 3. PROCESS SAFELY: Use the helper function which handles null/undefined inputs.
        const camelCaseUser = keysToCamelCase(user);
        const camelCaseAgency = keysToCamelCase(agency);
        const camelCaseUserAgency = keysToCamelCase(userAgency);

        // 4. UPDATE STATE: Update state with the processed data.
        // Use the initial state as a base to avoid missing properties if the API response changes.
        this.user = { ...this.$state.user, ...camelCaseUser, age: calculateAge(camelCaseUser.dateOfBirth) };
        this.agency = { ...this.$state.agency, ...camelCaseAgency };
        this.userAgency = { ...this.$state.userAgency, ...camelCaseUserAgency };
        this.isAuthenticated = true;
        this.saveState();

        const ageGroup = calculateAgeGroup(this.user.age);
        sessionStorage.setItem('userAgeData', JSON.stringify({ age: this.user.age, ageGroup }));
      } catch (error) {
        console.error('Error processing user details in store:', error);
        this.clearUserDetails();
      }
    },

    clearUserDetails() {
      this.$reset();
      localStorage.removeItem('userDetailsStore');
      sessionStorage.removeItem('userAgeData');
      localStorage.removeItem('authToken'); // Also clear tokens
      localStorage.removeItem('tokenExpiry');
    },

    saveState() {
      const state = {
        user: this.user,
        agency: this.agency,
        userAgency: this.userAgency,
        isAuthenticated: this.isAuthenticated,
      };
      localStorage.setItem('userDetailsStore', JSON.stringify(state));
    },
  },
});

// Helper functions (remain unchanged)
function calculateAge(dateOfBirth) {
  if (!dateOfBirth) return null;
  const dobDate = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - dobDate.getFullYear();
  const monthDiff = today.getMonth() - dobDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dobDate.getDate())) {
    age--;
  }
  return age;
}

function calculateAgeGroup(age) {
  if (age === null || age === undefined) return null;
  if (age < 14) {
    return 'Below 14';
  } else if (age >= 14 && age <= 17) {
    return '15 to 17';
  } else {
    return 'Above 18';
  }
}