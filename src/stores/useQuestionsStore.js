import { defineStore } from 'pinia';

export const useQuestionsStore = defineStore('questions', {
  state: () => ({
    questions: [],
    responses: [],
    currentQuestionIndex: 0,
    scores: { PHQ2: 0, GAD2: 0 },
  }),
  actions: {
    setQuestions(questions) {
      this.questions = questions;
    },
    addResponse(response) {
      this.responses.push(response);
    },
    setCurrentQuestionIndex(index) {
      this.currentQuestionIndex = index;
    },
    setScore(scoreType, points) {
      this.scores[scoreType] += points;
    },
    resetStore() {
      this.questions = [];
      this.responses = [];
      this.currentQuestionIndex = 0;
      this.scores = { PHQ2: 0, GAD2: 0 };
    },
  },
});
