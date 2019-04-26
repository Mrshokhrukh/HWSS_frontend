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

            <div v-else-if="currentRoute === '/admin-dashboard/admin-help'" class="admin-help">
                <MentalhealthHelp />
            </div>


            <div v-else-if="currentRoute === '/admin-dashboard/admin-settings'" class="admin-settings">
                <MentalhealthcardSetting />
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

            <div v-if="currentRoute === '/admin-dashboard/admin-help'" class="admin-help">
                <SudHelp />
            </div>

            <div v-if="currentRoute === '/admin-dashboard/admin-settings'" class="admin-setting">
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

            <div v-if="currentRoute === '/admin-dashboard/admin-help'" class="admin-help">
                <AaaHelp />
            </div>

            <div v-if="currentRoute === '/admin-dashboard/admin-settings'" class="admin-setting">
                <AaaSetting />
            </div>
        </div>

        <!-- Template for R&D Admin -->
        <div v-if="userRole === 'rd_admin'">
            <div v-if="currentRoute === '/admin-dashboard'" class="admin-dashboard">
                <RnDDashboard />
            </div>

            <div v-if="currentRoute === '/admin-dashboard/admin-report'" class="admin-report">
                <AAAReport />
            </div>

            <div v-if="currentRoute === '/admin-dashboard/admin-help'" class="admin-help">
                <RndHelp />
            </div>

            <div v-if="currentRoute === '/admin-dashboard/admin-settings'" class="admin-setting">
                <RnDSetting />
            </div>
        </div>
    </div>
    <footer class="footer">
        <div class="container text-center my-4">
            <p>&copy; {{ currentYear }} {{ websiteName }}. All rights reserved.</p>
        </div>
    </footer>

</template>

<script setup>
import { computed } from 'vue';
import MentalhealthApproval from "@/components/dashboards/Adminpages/Approval/MentalhealthApproval.vue"
import MentalhealthReport from "@/components/dashboards/Adminpages/report/MentalhealthReport.vue"
import MentalhealthHelp from "@/components/dashboards/Adminpages/MentalhealthHelp/MentalhealthHelp.vue"
import MentalhealthcardSetting from "@/components/dashboards/Adminpages/MentalhealthcardProfile/MentalhealthcardSetting.vue"
import DashboardCurrentStatus from "@/components/dashboards/Adminpages/Mentalhealthcard/DashboardCurrentStatus.vue"
import TableTotalScreening from "@/components/dashboards/Adminpages/Mentalhealthcard/TableTotalScreening.vue"
import ChartCard from "@/components/dashboards/Adminpages/Mentalhealthcard/ChartCard.vue"
import SudDahsboard from "@/components/dashboards/Adminpages/Sud/SudDashboard.vue"
import SudSubstanceCard from "@/components/dashboards/Adminpages/Sud/SudSubstanceCard.vue"
import SudTotalScreening from "@/components/dashboards/Adminpages/Sud/SudTotalScreening.vue"
import SudProcessRequest from "@/components/dashboards/Adminpages/Sud/processrequest/SudProcessRequest.vue"
import SudReport from "@/components/dashboards/Adminpages/Sud/sudreport/SudReport.vue"
import SudSetting from "@/components/dashboards/Adminpages/Sud/SudSetting.vue"
import SudHelp from "@/components/dashboards/Adminpages/Sud/SudHelp/SudHelp.vue"
import AaaDashboard from "@/components/dashboards/Adminpages/AAA/AaaDashboard.vue"
import AAAReport from "@/components/dashboards/Adminpages/AAA/report/AAAReport.vue"
import AaaSetting from "@/components/dashboards/Adminpages/AAA/AaaSetting.vue"
import AaaHelp from "@/components/dashboards/Adminpages/AAA/AaaHelp.vue"
import RnDDashboard from "@/components/dashboards/Adminpages/R&D/RnDDashboard.vue"
import RndHelp from "@/components/dashboards/Adminpages/R&D/RndHelp.vue"
import RnDSetting from "@/components/dashboards/Adminpages/R&D/RnDProfile/RnDSetting.vue"
import ChartMakerAdmin from "@/components/dashboards/Adminpages/Mentalhealthcard/ChartMakerAdmin.vue"
import { useRoute } from 'vue-router';

const route = useRoute();

const currentRoute = computed(() => route.path);

const userRole = computed(() => {
    const savedUserRole = JSON.parse(localStorage.getItem('userDetailsStore'));
    return savedUserRole.user.role;
});

// Dynamically get the current year
const currentYear = new Date().getFullYear();

// Dynamically populate website name
const websiteName = "The PEMA HWSS";

</script>

<style>
.admin-card {
    background-color: #d3e2e4;
}

.header {
	height: 8rem;
}

.footer {
	margin-top: auto;
}
</style>