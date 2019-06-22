<template>
    <h1 class="text-center fw-bold mb-4" style="color: #2c6975">Case Status Report</h1>
    <div>
        <canvas ref="chartCanvas"></canvas>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import Chart from 'chart.js/auto';
const reportData = JSON.parse(sessionStorage.getItem('reportData')) || [];

//Ongoing Case
const OngoingCase_Count = ref(0);
const OngoingCase_filter = ref([]);
OngoingCase_filter.value = reportData.filter(item => item.service_and_treatment?.case_status === "On Going");
OngoingCase_Count.value = OngoingCase_filter.value.length;
console.log(`Ongoing Case Count = ${OngoingCase_Count.value}`);

//Case Discontinue
const CaseDiscontinue_Count = ref(0);
const CaseDiscontinue_filter = ref([]);
CaseDiscontinue_filter.value = reportData.filter(item => item.service_and_treatment?.case_status === "Case Discontinue");
CaseDiscontinue_Count.value = CaseDiscontinue_filter.value.length;
console.log(`Case Discontinue Count = ${CaseDiscontinue_Count.value}`);

//Case Closed
const CaseClosed_Count = ref(0);
const CaseClosed_filter = ref([]);
CaseClosed_filter.value = reportData.filter(item => item.service_and_treatment?.case_status === "Case Closed");
CaseClosed_Count.value = CaseClosed_filter.value.length;
console.log(`Case Closed Count = ${CaseClosed_Count.value}`);

const chartCanvas = ref(null);

const data = {
    "On going Case": OngoingCase_Count.value,
    "Case Discontinued": CaseDiscontinue_Count.value,
    "Case Closed": CaseClosed_Count.value
};

onMounted(() => {
    if (chartCanvas.value) {
        new Chart(chartCanvas.value.getContext('2d'), {
            type: 'bar',
            data: {
                labels: Object.keys(data),
                datasets: [{
                    label: 'Case Count',
                    data: Object.values(data),
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 206, 86, 0.2)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                indexAxis: 'y',
                scales: {
                    x: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
});

</script>