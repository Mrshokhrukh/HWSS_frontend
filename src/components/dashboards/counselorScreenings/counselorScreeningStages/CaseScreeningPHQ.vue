<template>
    <div>
        <table class="table mb-4">
            <thead>
                <tr>
                    <th>{{ GADQuestion }}</th>
                    <th v-for="option in currentQuestion[0].answers" :key="option.id" class="text-center">
                        {{ option.option }}
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="text in currentQuestion" :key="text">
                    <td class="text-capitalize">{{ text.text }}</td>
                    <td v-for="option in currentQuestion[0].answers" :key="option.id" class="text-center">
                        <input type="radio" :value="option.id" @change="handleAnswerSelection(option)"
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
                    <td class="text-center text-white" :class="interpretationClass" colspan="5">
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
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import endpoints from '@/api'

const emit = defineEmits(['proceed', 'goBack']);

const totalScore = ref(0);

const handleAnswerSelection = (option) => {
    totalScore.value += option.points;
}

const counselorScreeningQuestions = JSON.parse(sessionStorage.getItem('counselorScreeningQuestions'));

const GADQuestion = ref('Over the last 2 weeks, how often have you been bothered by any of the following problems: ')

const currentQuestion = ref(counselorScreeningQuestions.find(set => set.name === 'Case Screening').question_sets.find(set => set.name === 'PHQ9').questions);


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
        return 'bg-primary';
    } else if (totalScore.value >= 5 && totalScore.value <= 9) {
        return 'bg-success';
    } else if (totalScore.value >= 10 && totalScore.value <= 14) {
        return 'bg-warning';
    } else {
        return 'bg-danger';
    }
});

// eslint-disable-next-line no-unused-vars
const questions = onMounted(async () => {
    if (counselorScreeningQuestions.length === 0) {
        try {
            const response = await axios.get(`${endpoints.ScreeningPreTests}?name=Case Screening`);
            counselorScreeningQuestions.value = response.data;
            sessionStorage.setItem('counselorScreeningQuestions', JSON.stringify(counselorScreeningQuestions.value));
        } catch (error) {
            console.error('Error fetching questions:', error);
        }
    }
});

const proceed = () => {
    emit('goToACE');
};

</script>

<style scoped>
.bg-warning {
    background: tomato !important;
}
</style>