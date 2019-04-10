<template>
    <div>
        <table class="table mb-4">
            <thead>
                <tr>
                    <th>{{ GADQuestion }}</th>
                    <th v-for="option in currentQuestion[0].answers" :key="option.id" class="text-center text-black">
                        {{ option.option }}
                    </th>
                </tr>
            </thead>
            <tbody>
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
                        <!-- Adjust the colspan according to the number of <td> elements in the row -->
                        <strong>{{ totalScore }}</strong>
                    </td>
                </tr>
                <tr>
                    <td class="text-capitalize"><strong>Interpretation</strong></td>
                    <td class="text-center" :class="interpretationClass" colspan="5">
                        <!-- Adjust the colspan according to the number of <td> elements in the row -->
                        <strong>{{ interpretation }}</strong>
                    </td>
                </tr>
            </tbody>
        </table>
        <div class="footer d-flex">
            <button class="btn hwss-btn" @click="goBack">Back</button>
            <div class="flex-grow-1"></div> <!-- This ensures the buttons span all the width -->
            <button class="btn hwss-btn" @click="proceed">Next</button>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, inject } from 'vue';

const emit = defineEmits(['goToNext', 'goBack']);

const totalScore = computed(() => {
    let score = 0;
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

const GADQuestion = ref('Over the last 2 weeks, how often have you been bothered by any of the following problems: ')


const interpretation = computed(() => {
    if (totalScore.value >= 0 && totalScore.value <= 4) {
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
    if (totalScore.value >= 0 && totalScore.value <= 4) {
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
</style>