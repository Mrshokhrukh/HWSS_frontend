import { defineStore } from 'pinia';

export const useScreeningTestStore = defineStore('screeningTest', {
    state: () => ({
        currentQuestionIndex: 0,
        userResponses: {},
        testProgress: 0,
    }),
    getters: {
        progressPercentage: (state, getters) => {
            const totalQuestions = Object.keys(getters.userResponses).length;
            const answeredQuestions = Object.values(getters.userResponses).filter(val => val !== null).length;
            return (answeredQuestions / totalQuestions) * 100;
        },
        userResponses: (state) => state.userResponses,
    },
    actions: {
        updateUserResponses(questionId, answer) {
            this.userResponses[questionId] = answer;
            this.currentQuestionIndex++;
        },
        goBack() {
            if (this.currentQuestionIndex > 0) this.currentQuestionIndex--;
        },
        calculateProgress(totalQuestions) {
            this.testProgress = (Object.keys(this.userResponses).length / totalQuestions) * 100;
        }
    }
});
