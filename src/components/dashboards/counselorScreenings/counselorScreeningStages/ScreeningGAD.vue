<template>
    <div>
        <table class="table mb-4 table-borderless">
            <thead class="border-bottom align-middle">
                <tr class="text-capitalize">
                    <th class="text-capitalize fs-6 text-black">{{ GADQuestion }}</th>
                    <th v-for="option in currentQuestion[0].answers" :key="option.id" class="text-center text-black">
                        {{ option.option }}
                    </th>
                </tr>
            </thead>
            <tbody class="table-group-divider">
                <tr>
                    <td class="text-capitalize">Feeling nervous, anxious, or on edge</td>
                    <!-- Radio buttons for question 1 -->
                    <td class="text-center">
                        <input type="radio" value="0" v-model="question1" required />
                    </td>
                    <td class="text-center">
                        <input type="radio" value="1" v-model="question1" required />
                    </td>
                    <td class="text-center">
                        <input type="radio" value="2" v-model="question1" required />
                    </td>
                    <td class="text-center">
                        <input type="radio" value="3" v-model="question1" required />
                    </td>
                </tr>
                <tr>
                    <td class="text-capitalize">Not being able to stop or control worrying</td>
                    <!-- Radio buttons for question 2 -->
                    <td class="text-center">
                        <input type="radio" value="0" v-model="question2" required />
                    </td>
                    <td class="text-center">
                        <input type="radio" value="1" v-model="question2" required />
                    </td>
                    <td class="text-center">
                        <input type="radio" value="2" v-model="question2" required />
                    </td>
                    <td class="text-center">
                        <input type="radio" value="3" v-model="question2" required />
                    </td>
                </tr>
                <tr v-for="text in currentQuestion" :key="text">
                    <td class="text-capitalize ">{{ text.text }}</td>
                    <td v-for="option in currentQuestion[0].answers" :key="option.id" class="text-center">
                        <input type="radio" :value="option" @change="handleAnswerSelection(option, text)"
                            :name="'question_' + text.id" required />
                        <span class="d-none">{{ option.points }}</span>
                    </td>
                </tr>
                <tr>
                    <td class="text-capitalize"><strong>Total</strong></td>
                    <td class="text-center" colspan="5">
                        <strong v-if="!totalScore">0</strong>
                        <strong v-else>{{ totalScore }}</strong>
                    </td>
                </tr>
                <tr>
                    <td class="text-capitalize"><strong>Interpretation</strong></td>
                    <td class="text-center" :class="interpretationClass" colspan="5">
                        <strong>{{ interpretation }}</strong>
                    </td>
                </tr>
            </tbody>
        </table>
        <div class="footer d-flex">
            <button class="btn hwss-btn" @click="goBack">Back</button>
            <div class="flex-grow-1"></div>
            <button class="btn hwss-btn" @click="proceed">Next</button>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, inject } from 'vue';

const emit = defineEmits(['goToNext', 'goBack']);

// Define reactive variables for storing selected options for static questions
const question1 = ref(null);
const question2 = ref(null);

// Compute total score based on selected options for all questions
const totalScore = computed(() => {
    let score = 0;

    // Add scores for static questions
    score += parseInt(question1.value);
    score += parseInt(question2.value);

    // Add scores for dynamic questions
    for (const text of currentQuestion.value) {
        const selectedOption = text.selectedOption;
        if (selectedOption !== undefined) {
            score += selectedOption.points;
        }
    }

    return score;
});

const handleAnswerSelection = (option, text) => {
    text.selectedOption = option;
}

const counselorScreeningQuestions = ref(inject('counselorScreeningQuestions'));

const currentQuestion = ref(counselorScreeningQuestions.value?.find(set => set.name === 'Case Screening').question_sets.find(set => set.name === 'GAD7').questions);


const GADQuestion = ref('Over the last 2 weeks, how often have you been bothered by any of the following problems: ');

const interpretation = computed(() => {
    if (totalScore.value >= 0 && totalScore.value <= 4 || totalScore.value === null || isNaN(totalScore.value)) {
        return 'Minimal';
    } else if (totalScore.value >= 5 && totalScore.value <= 9) {
        return 'Mild';
    } else if (totalScore.value >= 10 && totalScore.value <= 14) {
        return 'Moderate';
    } else {
        return 'Severe';
    }
});

const interpretationClass = computed(() => {
    if (totalScore.value >= 0 && totalScore.value <= 4 || totalScore.value === null || isNaN(totalScore.value)) {
        return 'bg-primary bg-opacity-50 text-primary';
    } else if (totalScore.value >= 5 && totalScore.value <= 9) {
        return 'bg-success bg-opacity-50 text-success';
    } else if (totalScore.value >= 10 && totalScore.value <= 14) {
        return 'bg-warning bg-opacity-50 text-warning';
    } else {
        return 'bg-danger bg-opacity-50 text-danger';
    }
});

const proceed = () => {
    const responses = [];
    for (const text of currentQuestion.value) {
        const response = {
            question: text.text,
            selectedOption: text.selectedOption ? text.selectedOption.option : null,
            score: text.selectedOption ? text.selectedOption.points : 0
        };
        responses.push(response);
    }

    // Get total score and interpretation from computed properties
    const totalScoreValue = totalScore.value;
    const interpretationValue = interpretation.value;

    // Save responses, total score, and interpretation to local storage
    const data = { responses, totalScore: totalScoreValue, interpretation: interpretationValue };
    localStorage.setItem('GAD_set_counselor_screening', JSON.stringify(data));

    // Emit the goToNext event
    emit('goToNext', 'GAD');
};

</script>

<style scoped>
.bg-m-severe {
    background: rgba(255, 99, 71, 0.5) !important;
}

.text-m-severe {
    color: tomato !important;
}

tbody>tr>td,
tbody>tr>th {
    border-top: none;
}

input[type="radio"] {
    scale: 1.5;
}
</style>