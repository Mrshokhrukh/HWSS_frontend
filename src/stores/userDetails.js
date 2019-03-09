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
    clearUserDetails() {
      this.$reset();
      localStorage.removeItem('userDetailsStore');
      sessionStorage.removeItem('userAgeData');
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

function calculateAge(dateOfBirth) {
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
  if (age < 14) {
    return 'Below 14';
  } else if (age >= 14 && age <= 17) {
    return '15 to 17';
  } else {
    return 'Above 18';
  }
}
