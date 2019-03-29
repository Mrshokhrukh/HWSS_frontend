<template>


    <div v-if="currentRoute === '/admin-dashboard/admin-approval'" class="admin-approval">
        <MentalhealthApproval />
    </div>

    <div v-else-if="currentRoute === '/admin-dashboard/admin-report'" class="admin-report">
        <MentalhealthReport />
    </div>
 
    <div class="container my-5" v-else>
        <DashboardCurrentStatus />
        <div class="row mt-5">
            <div class="col-md-12">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Status Table</h5>
                        <div class="table-responsive">
                            <table class="table table-bordered w-100">
                                <thead>
                                    <tr>
                                        <th></th>
                                        <th>Female</th>
                                        <th>Male</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <th>Total Screened</th>
                                        <td>865</td>
                                        <td>983</td>
                                    </tr>
                                    <tr>
                                        <th>Total Old Screened</th>
                                        <td>470</td>
                                        <td>588</td>
                                    </tr>
                                    <tr>
                                        <th>Total New Screened</th>
                                        <td>395</td>
                                        <td>395</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="row mt-5">
            <div class="col-md-6">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title text-center bold" style="color: #2c6975;">Independent Screening Overview</h5>
                        <canvas ref="chartLeft"></canvas>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title text-center bold" style="color: #2c6975;"> Cluster Screening Overview</h5>
                        <canvas ref="chartRight"></canvas>
                    </div>
                </div>
            </div>
        </div>

        
    <div>
        {{ currentRoute }}
    </div>
    </div>

</template>
  
<script setup>
import { onMounted, ref, nextTick, computed } from 'vue';
import Chart from 'chart.js/auto';
import MentalhealthApproval from "@/components/dashboards/Adminpages/Approval/MentalhealthApproval.vue"
import MentalhealthReport from "@/components/dashboards/Adminpages/report/MentalhealthReport.vue"
import DashboardCurrentStatus from "@/components/dashboards/Adminpages/Mentalhealthcard/DashboardCurrentStatus.vue"
import {useRoute} from 'vue-router';

const route = useRoute();

// const userCurrentRole = JSON.stringify(localStorage.getItem('userDetailsStore'))

const currentRoute = computed(() => route.path);

const chartLeftRef = ref(null);
const chartRightRef = ref(null);

const dataLeft = {
    labels: ['Total Female', 'Total Male'],
    datasets: [
        {
            data: [395, 345],
            backgroundColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)'],
            borderWidth: 0,
        },
    ],
};

const optionsLeft = {
    plugins: {
        legend: {
            display: true,
            position: 'bottom',
        },
    },
};

const dataRight = {
    labels: ['Total Female', 'Total Male'],
    datasets: [
        {
            data: [395, 345],
            backgroundColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)'],
            borderWidth: 0,
        },
    ],
};

const optionsRight = {
    plugins: {
        legend: {
            display: true,
            position: 'bottom',
        },
    },
};

onMounted(async () => {
    await nextTick(); // Wait for the DOM to update
    const ctxLeft = chartLeftRef.value.getContext('2d');
    const ctxRight = chartRightRef.value.getContext('2d');

    if (ctxLeft && ctxRight) { // Check if both contexts are available
        new Chart(ctxLeft, {
            type: 'doughnut',
            data: dataLeft,
            options: optionsLeft,
        });

        new Chart(ctxRight, {
            type: 'doughnut',
            data: dataRight,
            options: optionsRight,
        });
    } else {
        console.error('Canvas context not available');
    }
});
</script>
  
<style>
.bg{
background-color: #d3e2e4;
}
</style>