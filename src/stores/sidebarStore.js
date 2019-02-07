import { defineStore } from 'pinia';

export const useSidebarStore = defineStore('sidebar', {
  state: () => ({
    isOpen: true, // Default state
  }),
  actions: {
    toggle() {
      this.isOpen = !this.isOpen;
      // Persist state to localStorage for state retention across sessions
      localStorage.setItem('sidebarOpen', JSON.stringify(this.isOpen));
    },
    initializeSidebarState() {
      const sidebarState = localStorage.getItem('sidebarOpen');
      if (sidebarState !== null) {
        this.isOpen = JSON.parse(sidebarState);
      }
    }
  }
});