<template>
    <div class="p-d-flex p-jc-center p-mb-2" style="flex-wrap: wrap; gap: 1rem;">
        <Card v-for="metric in metrics" :key="metric.label" style="flex: 1 0 250px; min-width: 250px;">
            <template #title>
                <h6 class="metric-label">{{ metric.label }}</h6>
            </template>
            <template #content>
                <h3 class="metric-value">{{ metric.value }}</h3>
                <small v-if="metric.trend !== undefined"
                    :class="['trend-value', metric.trend > 0 ? 'text-success' : 'text-danger']">
                    {{ metric.trend > 0 ? '+' : '' }}{{ metric.trend }}% from previous period
                </small>
            </template>
        </Card>
    </div>
</template>

<script setup>
import { computed } from 'vue';
import Card from 'primevue/card';

const props = defineProps({
    filteredData: {
        type: Array,
        required: true,
    },
});

const metrics = computed(() => {
    if (!props.filteredData || props.filteredData.length === 0) {
        return [];
    }

    const data = props.filteredData;

    // --- Metrics Calculation (Based on the provided 'hwss data.txt' structure) ---

    // 1. Total Users Screened 
    const totalUsersScreened = data.length;

    // 2. Assessment Completion Rate
    const completedAssessments = data.filter(
        (item) => item.assessment_status === 'Conducted'
    ).length;
    const assessmentCompletionRate = totalUsersScreened > 0
        ? ((completedAssessments / totalUsersScreened) * 100).toFixed(1)
        : 0;

    // 3. High-Risk Cases (Based on PHQ or GAD interpretation in screening_data)
    const highRiskCases = data.filter((item) => {
        return item.screening_data &&
            (item.screening_data.phq_interpretation === 'Severe' ||
                item.screening_data.gad_interpretation === 'Severe');
    }).length;

    // 4. Average PHQ-9 Score (Only for users with screening data)
    const phq9Scores = data.map(item => item.screening_data?.phq_score).filter(score => typeof score === 'number');
    const averagePhq9Score = phq9Scores.length > 0
        ? (phq9Scores.reduce((sum, score) => sum + score, 0) / phq9Scores.length).toFixed(1)
        : 0;

    // 5. Average GAD-7 Score (Only for users with screening data)
    const gad7Scores = data.map(item => item.screening_data?.gad_score).filter(score => typeof score === 'number');
    const averageGad7Score = gad7Scores.length > 0
        ? (gad7Scores.reduce((sum, score) => sum + score, 0) / gad7Scores.length).toFixed(1)
        : 0;

    // 6. Average ACE Score (Only for users with screening data)
    const aceScores = data.map(item => item.screening_data?.ace_score).filter(score => typeof score === 'number');
    const averageAceScore = aceScores.length > 0 ? (aceScores.reduce((sum, score) => sum + score, 0) / aceScores.length).toFixed(1) : 0;

    // 7. Referral Rate
    const referredUsers = data.filter((item) => item.referral_instance !== null).length;
    const referralRate = totalUsersScreened > 0
        ? ((referredUsers / totalUsersScreened) * 100).toFixed(1)
        : 0;

    // 8. Average Referral Time 
    const averageReferralTime = calculateAverageReferralTime(data);

    // 9. Cases Closed 
    const casesClosed = data.filter((item) => item.case_status === 'Case Closed').length;

    // 10. Counseling Status (Availed)
    const counselingAvailed = data.filter((item) => item.counseling === 'Availed').length;

    // 11. Intervention Completion Rate 
    const interventionCompletionRate = calculateInterventionCompletionRate(data);

    // 12. Average Treatment Duration
    const averageTreatmentDuration = calculateAverageTreatmentDuration(data);

    // 13. Average Age 
    const averageAge = calculateAverageAge(data);

    // 14. Gender Distribution 
    const genderDistribution = calculateGenderDistribution(data);

    // Placeholder for previous period data 
    const previousPeriodTotalUsersScreened = 0;
    const previousPeriodCompletedAssessments = 0;
    const previousPeriodHighRiskCases = 0;
    const previousPeriodReferredUsers = 0;
    const previousPeriodCasesClosed = 0;

    return [
        { label: 'Total Users Screened', value: totalUsersScreened, trend: calculatePercentageChange(totalUsersScreened, previousPeriodTotalUsersScreened) },
        { label: 'Assessment Completion Rate', value: `${assessmentCompletionRate}%`, trend: calculatePercentageChange(completedAssessments, previousPeriodCompletedAssessments) },
        { label: 'Average PHQ-9 Score', value: averagePhq9Score, trend: undefined },
        { label: 'Average GAD-7 Score', value: averageGad7Score, trend: undefined },
        { label: 'Average ACE Score', value: averageAceScore, trend: undefined },
        { label: 'High-Risk Cases', value: highRiskCases, trend: calculatePercentageChange(highRiskCases, previousPeriodHighRiskCases) },
        { label: 'Referral Rate', value: `${referralRate}%`, trend: calculatePercentageChange(referredUsers, previousPeriodReferredUsers) },
        { label: 'Average Referral Time', value: `${averageReferralTime} days`, trend: undefined },
        { label: 'Cases Closed', value: casesClosed, trend: calculatePercentageChange(casesClosed, previousPeriodCasesClosed) },
        { label: 'Counseling Availed', value: counselingAvailed, trend: undefined },
        { label: 'Intervention Completion Rate', value: `${interventionCompletionRate}%`, trend: undefined },
        { label: 'Average Treatment Duration', value: `${averageTreatmentDuration} days`, trend: undefined },
        { label: 'Average Age', value: averageAge, trend: undefined },
        { label: 'Gender Distribution', value: `M: ${genderDistribution.males}, F: ${genderDistribution.females}`, trend: undefined },
    ];
});

// ... (Helper functions updated to use 'data' from props.filteredData) ...
function calculateAverageReferralTime(data) {
    let totalReferralTime = 0;
    let referralCount = 0;

    data.forEach(item => {
        if (item.referral_instance && item.screening_data && item.screening_data.submission_date) {
            const referralDate = new Date(item.referral_instance.date);
            const submissionDate = new Date(item.screening_data.submission_date);

            if (!isNaN(referralDate.getTime()) && !isNaN(submissionDate.getTime())) {
                const timeDiff = Math.abs(submissionDate - referralDate);
                totalReferralTime += timeDiff / (1000 * 60 * 60 * 24); // Convert milliseconds to days
                referralCount++;
            }
        }
    });

    return referralCount > 0 ? (totalReferralTime / referralCount).toFixed(1) : 0;
}

function calculateInterventionCompletionRate(data) {
    let completedInterventions = 0;
    let totalInterventions = 0;

    data.forEach(item => {
        if (item.follow_up) {
            totalInterventions++;
            if (item.follow_up === 'Treatment Completed' || item.follow_up === 'Completed Counselling Sessions') {
                completedInterventions++;
            }
        }
    });

    return totalInterventions > 0 ? ((completedInterventions / totalInterventions) * 100).toFixed(1) : 0;
}

function calculateAverageTreatmentDuration(data) {
    let totalDuration = 0;
    let count = 0;

    data.forEach((item) => {
        // Check if necessary properties exist and follow_up status indicates treatment
        if (item.screening_data && item.screening_data.submission_date &&
            (item.follow_up === 'Treatment Completed' ||
                item.follow_up === 'Completed Counselling Sessions' ||
                item.follow_up === 'Undergone Rehabilitation')) {
            const treatmentStartDate = new Date(item.screening_data.submission_date);
            const today = new Date(); // Using today's date as the end date

            if (!isNaN(treatmentStartDate.getTime())) {
                const duration = Math.abs(today - treatmentStartDate) / (1000 * 60 * 60 * 24); // Convert to days
                totalDuration += duration;
                count++;
            }
        }
    });

    return count > 0 ? (totalDuration / count).toFixed(1) : 0;
}

function calculateAverageAge(data) {
    let totalAge = 0;
    let count = 0;

    data.forEach(item => {
        if (item.user && item.user.date_of_birth) {
            const birthYear = new Date(item.user.date_of_birth).getFullYear();
            const currentYear = new Date().getFullYear();
            totalAge += (currentYear - birthYear);
            count++;
        }
    });

    return count > 0 ? (totalAge / count).toFixed(1) : 0;
}

function calculateGenderDistribution(data) {
    let males = 0;
    let females = 0;

    data.forEach(item => {
        if (item.user && item.user.gender) {
            if (item.user.gender === 'Male') {
                males++;
            } else if (item.user.gender === 'Female') {
                females++;
            }
        }
    });

    return { males, females };
}

function calculatePercentageChange(current, previous) {
    if (previous === 0) return 0; // Avoid division by zero
    return (((current - previous) / previous) * 100).toFixed(1);
}
</script>

<style scoped>
/* You might need to adjust card styles if needed */
.metric-label {
    color: rgba(255, 255, 255, 0.9);
    font-size: 0.9rem;
    margin: 0;
    padding: 0;
}

.metric-value {
    color: white;
    font-size: 2rem;
    font-weight: 600;
    margin: 0.5rem 0;
}

.trend-value {
    display: block;
    margin-top: 0.5rem;
    font-size: 0.8rem;
    color: white;
}

.text-success {
    color: #4caf50 !important;
}

.text-danger {
    color: #f44336 !important;
}
</style>