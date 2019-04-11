<template>
    <!-- template for Mental Health admin -->
    <div class="card admin-card p-4 mb-3 h-100 w-100">
        <div v-if="userRole === 'mh_admin'">
            <div v-if="currentRoute === '/admin-dashboard/admin-approval'" class="admin-approval">
                <MentalhealthApproval />
            </div>

            <div v-else-if="currentRoute === '/admin-dashboard/admin-report'" class="admin-report">
                <MentalhealthReport />
            </div>

            <div v-else-if="currentRoute === '/admin-dashboard/admin-chart-maker'" class="admin-report">
                <ChartMakerAdmin />
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
                <SudDahsboard />
                <SudTotalScreening />
                <SudSubstanceCard />
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
                <AaaDashboard />
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
                <RnDDashboard />
            </div>

            <div v-if="currentRoute === '/admin-dashboard/admin-report'" class="admin-report">
                <AAAReport />
            </div>

            <div v-if="currentRoute === '/admin-dashboard/admin-setting'" class="admin-setting">
                <AaaSetting />
            </div>
        </div>
    </div>

</template>

<script setup>
import { computed } from 'vue';
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
import ChartMakerAdmin from "@/components/dashboards/Adminpages/Mentalhealthcard/ChartMakerAdmin.vue"
import { useRoute } from 'vue-router';

const route = useRoute();

const currentRoute = computed(() => route.path);

const userRole = computed(() => {
    const savedUserRole = JSON.parse(localStorage.getItem('userDetailsStore'));
    return savedUserRole.user.role;
});

</script>

<style>
.admin-card {
    background-color: #d3e2e4;
}
</style>