import { defineStore } from 'pinia';
import { useRouter } from 'vue-router'; 

const router = useRouter();

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isAuthenticated: false,
  }),
  actions: {
    setAuthenticated(value) {
      this.isAuthenticated = value;
    },
    logout() {
      // Clear local storage, reset state, and redirect if needed
      localStorage.removeItem('authToken');
      this.isAuthenticated = false;
    },
  },
  // Watch isAuthenticated changes and reactively update the route
  watch: {
    isAuthenticated(newValue) {
      if (!newValue) {
        // Use router.replace instead of router.push to replace the current entry
        router.replace({ name: 'login' });
      }
    },
  },
});
