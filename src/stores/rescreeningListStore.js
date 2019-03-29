import { defineStore } from 'pinia';

export const useRescreeningStore = defineStore({
  id: 'rescreening',
  state: () => ({
    rescreeningData: null, // Initialize as null
  }),
  actions: {
    setRescreeningData(data) {
      this.rescreeningData = data;
    },
  },
});
