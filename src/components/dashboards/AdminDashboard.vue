<template>
    <!-- template for Mental Health admin -->
    <div v-if="userRole === 'mh_admin'">
        <div v-if="currentRoute === '/admin-dashboard/admin-approval'" class="admin-approval">
            <MentalhealthApproval />
        </div>

        <div v-else-if="currentRoute === '/admin-dashboard/admin-report'" class="admin-report">
            <MentalhealthReport />
        </div>

        <div v-else>
            <DashboardCurrentStatus />
            <div class="row mt-5">
                <div class="col-md-12">
                    <TableTotalScreening />
                </div>
            </div>
            <ChartCard />
        </div>
    </div>

    <!-- Template for SUD Admin -->
    <div v-if="userRole === 'sud_admin'">
        <div v-if="currentRoute === '/admin-dashboard'" class="admin-dashboard">
            <SudDahsboard/>
       <SudTotalScreening/>
       <SudSubstanceCard/>
        </div>
       
       <div v-if="currentRoute === '/admin-dashboard/admin-approval'" class="admin-approval">
            <SudProcessRequest />
        </div>

        <div v-if="currentRoute === '/admin-dashboard/admin-report'" class="admin-report">
            <SudReport />
        </div>

        <div v-if="currentRoute === '/admin-dashboard/admin-setting'" class="admin-setting">
            <SudSetting />
        </div>
    </div>

    <!-- Template for AAA Admin -->
    <div v-if="userRole === 'aaa_admin'">
        <div v-if="currentRoute === '/admin-dashboard'" class="admin-dashboard">
            <AaaDashboard/>
        </div>

        <div v-if="currentRoute === '/admin-dashboard/admin-report'" class="admin-report">
            <AAAReport />
        </div>

        <div v-if="currentRoute === '/admin-dashboard/admin-setting'" class="admin-setting">
            <AaaSetting />
        </div>
    </div>

     <!-- Template for AAA Admin -->
     <div v-if="userRole === 'rd_admin'">
        <div v-if="currentRoute === '/admin-dashboard'" class="admin-dashboard">
            <RnDDashboard/>
        </div>

        <div v-if="currentRoute === '/admin-dashboard/admin-report'" class="admin-report">
            <AAAReport />
        </div>

        <div v-if="currentRoute === '/admin-dashboard/admin-setting'" class="admin-setting">
            <AaaSetting />
        </div>
    </div>

</template>
  
<script setup>
import { onMounted, ref, nextTick, computed } from 'vue';
import Chart from 'chart.js/auto';
import MentalhealthApproval from "@/components/dashboards/Adminpages/Approval/MentalhealthApproval.vue"
import MentalhealthReport from "@/components/dashboards/Adminpages/report/MentalhealthReport.vue"
import DashboardCurrentStatus from "@/components/dashboards/Adminpages/Mentalhealthcard/DashboardCurrentStatus.vue"
import TableTotalScreening from "@/components/dashboards/Adminpages/Mentalhealthcard/TableTotalScreening.vue"
import ChartCard from "@/components/dashboards/Adminpages/Mentalhealthcard/ChartCard.vue"
import SudDahsboard from "@/components/dashboards/Adminpages/Sud/SudDashboard.vue"
import SudSubstanceCard from "@/components/dashboards/Adminpages/Sud/SudSubstanceCard.vue"
import SudTotalScreening from "@/components/dashboards/Adminpages/Sud/SudTotalScreening.vue"
import SudProcessRequest from "@/components/dashboards/Adminpages/Sud/processrequest/SudProcessRequest.vue"
import SudReport from "@/components/dashboards/Adminpages/Sud/sudreport/SudReport.vue"
import SudSetting from "@/components/dashboards/Adminpages/Sud/SudSetting.vue"
import AaaDashboard from "@/components/dashboards/Adminpages/AAA/AaaDashboard.vue"
import AAAReport from "@/components/dashboards/Adminpages/AAA/report/AAAReport.vue"
import AaaSetting from "@/components/dashboards/Adminpages/AAA/AaaSetting.vue"
import RnDDashboard from "@/components/dashboards/Adminpages/R&D/RnDDashboard.vue"
import { useRoute } from 'vue-router';

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

const userRole = computed(() => {
    const savedUserRole = JSON.parse(localStorage.getItem('userDetailsStore'));
    return savedUserRole.user.role;
});


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
.bg {
    background-color: #d3e2e4;
}
</style>