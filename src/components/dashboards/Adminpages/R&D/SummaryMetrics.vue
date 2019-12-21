<template>
    <div class="metrics-grid mb-4">
        <div v-for="metric in metrics" :key="metric.label" class="metric-card"
            :class="{ 'has-trend': metric.trend !== undefined }">
            <div class="metric-content">
                <div class="metric-header">
                    <i :class="getIconForMetric(metric.label)"></i>
                    <span class="metric-label">{{ metric.label }}</span>
                </div>
                <div class="metric-body">
                    <span class="metric-value">{{ metric.value }}</span>
                    <span v-if="metric.trend !== undefined"
                        :class="['trend-value', metric.trend > 0 ? 'trend-up' : 'trend-down']">
                        <i :class="metric.trend > 0 ? 'pi pi-arrow-up' : 'pi pi-arrow-down'"></i>
                        {{ Math.abs(metric.trend) }}%
                    </span>
                </div>
            </div>
        </div>
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
        { label: 'Gender Distribution', value: `M: ${genderDistribution.males} | F: ${genderDistribution.females}`, trend: undefined },
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

function getIconForMetric(label) {
    const iconMap = {
        'Total Users Screened': 'pi pi-users',
        'Assessment Completion Rate': 'pi pi-check-circle',
        'Average PHQ-9 Score': 'pi pi-chart-bar',
        'Average GAD-7 Score': 'pi pi-chart-line',
        'Average ACE Score': 'pi pi-star',
        'High-Risk Cases': 'pi pi-exclamation-triangle',
        'Referral Rate': 'pi pi-send',
        'Average Referral Time': 'pi pi-clock',
        'Cases Closed': 'pi pi-check-square',
        'Counseling Availed': 'pi pi-heart',
        'Intervention Completion Rate': 'pi pi-check',
        'Average Treatment Duration': 'pi pi-calendar',
        'Average Age': 'pi pi-user',
        'Gender Distribution': 'pi pi-users'
    };
    return iconMap[label] || 'pi pi-chart-bar';
}
</script>

<style scoped>
.metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 0.75rem;
    padding: 0.5rem;
    width: 100%;
}

.metric-card {
    background: linear-gradient(135deg, rgba(43, 101, 111, 0.95) 0%, rgba(29, 72, 81, 0.95) 100%);
    border-radius: 8px;
    padding: 1rem;
    transition: all 0.2s ease;
    position: relative;
    overflow: hidden;
    min-height: 120px;
}

.metric-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.metric-content {
    display: flex;
    flex-direction: column;
    height: 100%;
    gap: 0.75rem;
}

.metric-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.metric-header i {
    color: rgba(255, 255, 255, 0.9);
    font-size: 1rem;
}

.metric-label {
    color: rgba(255, 255, 255, 0.9);
    font-size: 0.8rem;
    font-weight: 500;
    line-height: 1.2;
}

.metric-body {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.metric-value {
    color: white;
    font-size: 1.5rem;
    font-weight: 600;
    line-height: 1;
}

.trend-value {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.75rem;
    font-weight: 500;
    padding: 0.25rem 0.5rem;
    border-radius: 12px;
    line-height: 1;
}

.trend-up {
    background: rgba(76, 175, 80, 0.2);
    color: #4caf50;
}

.trend-down {
    background: rgba(244, 67, 54, 0.2);
    color: #f44336;
}

.trend-value i {
    font-size: 0.7rem;
}

/* Responsive adjustments */
@media (max-width: 1400px) {
    .metrics-grid {
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    }
}

@media (max-width: 768px) {
    .metrics-grid {
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    }
    
    .metric-card {
        min-height: 100px;
        padding: 0.75rem;
    }
    
    .metric-value {
        font-size: 1.25rem;
    }
}

/* Add subtle animation for loading state */
@keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.7; }
    100% { opacity: 1; }
}

.metrics-grid.loading .metric-card {
    animation: pulse 1.5s infinite;
}
</style>