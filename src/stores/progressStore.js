import { defineStore } from 'pinia';

export const useProgressStore = defineStore('progress', {
    state: () => ({
        currentQuestionIndex: 0,
        answers: [],
        scores: {
            PHQ2: 0,
            GAD2: 0
        },
        skippedSets: [],
    }),
    getters: {
        shouldSkipPHQ9: (state) => state.scores.PHQ2 < 3,
        shouldSkipGAD7: (state) => state.scores.GAD2 < 3
    },
    actions: {
        setQuestionIndex(index) {
            this.currentQuestionIndex = index;
        },
        setAnswer(questionId, answer) {
            const existing = this.answers.find(a => a.questionId === questionId);
            if (existing) {
                existing.answer = answer;
            } else {
                this.answers.push({ questionId, answer });
            }
            this.calculateScores();
            this.checkAndSkipSets();
        },
        setDiagnosisDetail(questionId, detail) {
            const existing = this.answers.find(a => a.questionId === questionId);
            if (existing) {
                existing.diagnosisDetail = detail;
            } else {
                this.answers.push({ questionId, answer: {}, diagnosisDetail: detail });
            }
            this.saveProgress(); // Optionally save the progress after setting the detail
        },

        calculateScores() {
            this.scores.PHQ2 = this.answers.filter(a => a.questionSet === 'PHQ2').reduce((acc, curr) => acc + curr.answer.points, 0);
            this.scores.GAD2 = this.answers.filter(a => a.questionSet === 'GAD2').reduce((acc, curr) => acc + curr.answer.points, 0);
        },
        skipSet(setName) {
            if (!this.skippedSets.includes(setName)) {
                this.skippedSets.push(setName);
            }
        },
        checkAndSkipSets() {
            if (this.shouldSkipPHQ9 && !this.skippedSets.includes('PHQ9')) {
                this.skipSet('PHQ9');
            }
            if (this.shouldSkipGAD7 && !this.skippedSets.includes('GAD7')) {
                this.skipSet('GAD7');
            }
        },
        calculateNextQuestionIndex() {
            const nextIndex = this.questions.findIndex(
                (q, index) => !this.skippedSets.includes(q.setName) && index > this.currentQuestionIndex
            );
            if (nextIndex !== -1) {
                this.currentQuestionIndex = nextIndex;
            }
        },
        goBack() {
            let newIndex = this.currentQuestionIndex - 1;
            while (newIndex >= 0 && this.skippedSets.includes(this.questions[newIndex].setName)) {
                newIndex--;
            }
            if (newIndex >= 0) {
                this.currentQuestionIndex = newIndex;
            }
        },
        setSpecificDiagnosis(diagnosis) {
            this.specificDiagnosis = diagnosis;
        },
        loadProgress() {
            const progress = JSON.parse(sessionStorage.getItem('progress'));
            if (progress) {
                this.$state = progress;
            }
        },
        saveProgress() {
            sessionStorage.setItem('progress', JSON.stringify(this.$state));
        },
        resetStore() {
            this.$reset();
            sessionStorage.clear();
        },
    }
});
