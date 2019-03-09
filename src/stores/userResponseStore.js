import { defineStore } from 'pinia';

// Define a Pinia store to manage user responses
export const useUserResponseStore = defineStore({
    id: 'userResponse',
    state: () => ({
        responses: [],
    }),
    actions: {
        // Method to store user response
        storeUserResponse(answer, substance) {
            // Push the user response to the responses array
            this.responses.push({ answer, substance });
        },
    },
});
