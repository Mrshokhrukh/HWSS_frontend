// store/userDetails.js
import { defineStore } from 'pinia'

export const useUserDetailsStore = defineStore('userDetails', {
  state: () => ({
    userName: '',
    profilePicture: '',
    isAuthenticated: false,
  }),
  actions: {
    setUserDetails(name, picture) {
      this.userName = name;
      this.profilePicture = picture;
      this.isAuthenticated = true;
    },
    clearUserDetails() {
      this.userName = '';
      this.profilePicture = '';
      this.isAuthenticated = false;
    }
  }
});
