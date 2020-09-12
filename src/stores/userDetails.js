import { defineStore } from 'pinia';

import apiClient from '@/apiClient';

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

        
        if (response.data) {
          
          this.setUserDetails(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch user details:", error);
        
        this.clearUserDetails();
        
        throw error;
      }
    },

    
    setUserDetails({ user, agency, userAgency }) {
      try {
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

        this.user = { ...camelCaseUser, age: calculateAge(camelCaseUser.dateOfBirth) };
        this.agency = { ...camelCaseAgency };
        this.userAgency = { ...camelCaseUserAgency };
        this.isAuthenticated = true;
        this.saveState();

        const ageGroup = calculateAgeGroup(this.user.age);
        sessionStorage.setItem('userAgeData', JSON.stringify({ age: this.user.age, ageGroup }));

        return Promise.resolve({ status: 'success', message: 'User details saved successfully.' });
      } catch (error) {
        console.error('Error setting user details in store:', error);
        return Promise.resolve({ status: 'error', message: 'Failed to save user details.' });
      }
    },

    // 3. IMPROVED clearUserDetails ACTION
    clearUserDetails() {
      this.$reset(); // Resets the store state to its initial definition
      localStorage.removeItem('userDetailsStore');
      sessionStorage.removeItem('userAgeData');
      // Also clear the tokens themselves, as they are likely invalid
      localStorage.removeItem('authToken');
      localStorage.removeItem('tokenExpiry');
    },

    // Your existing saveState action is fine.
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

// These helper functions are fine as they are.
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