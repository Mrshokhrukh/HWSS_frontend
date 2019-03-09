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
            // Reset scores before calculation
            this.scores.PHQ2 = 0;
            this.scores.GAD2 = 0;
            this.scores.PHQ9 = 0;
            this.scores.GAD7 = 0;

            // Calculate PHQ2 score
            const phq2Questions = [4, 5];
            phq2Questions.forEach(qId => {
                const answer = this.answers.find(a => a.questionId === qId)?.answer;
                if (answer) {
                    this.scores.PHQ2 += answer.points;
                }
            });

            // Calculate GAD2 score
            const gad2Questions = [15, 16];
            gad2Questions.forEach(qId => {
                const answer = this.answers.find(a => a.questionId === qId)?.answer;
                if (answer) {
                    this.scores.GAD2 += answer.points;
                }
            });

            // Calculate PHQ9 score
            const phq9Questions = [8, 9, 10, 11, 12, 13, 14];
            phq9Questions.forEach(qId => {
                const answer = this.answers.find(a => a.questionId === qId)?.answer;
                if (answer) {
                    this.scores.PHQ9 += answer.points;
                }
            });
            // Add PHQ2 score to PHQ9
            this.scores.PHQ9 += this.scores.PHQ2;

            // Calculate GAD7 score
            const gad7Questions = [19, 20, 21, 22, 23];
            gad7Questions.forEach(qId => {
                const answer = this.answers.find(a => a.questionId === qId)?.answer;
                if (answer) {
                    this.scores.GAD7 += answer.points;
                }
            });
            // Add GAD2 score to GAD7
            this.scores.GAD7 += this.scores.GAD2;
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
            this.currentQuestionIndex = 0;
            this.answers = [];
            this.scores = {
                PHQ2: 0,
                GAD2: 0
            };
            this.skippedSets = [];
            this.saveProgress();
        }

    }
});
