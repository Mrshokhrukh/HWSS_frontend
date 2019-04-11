<template>
    <div class="container-fluid">
        <div class="row mb-5">
            <div class="col-6 mx-auto">
                <nav>
                    <div class="nav nav-tabs nav-fill" role="tablist">
                        <button v-for="(tab, index) in tabs" :key="index"
                            :class="{ 'nav-link': true, 'active': activeTab === tab.key }" @click="changeTab(tab.key)">
                            {{ tab.label }}
                        </button>
                    </div>
                </nav>
            </div>
        </div>

        <div class="row">
            <div class="col-12">
                <div class="card p-4">
                    <div v-for="tab in tabs" :key="tab.key">
                        <div v-if="activeTab === tab.key">
                            <component :is="tab.component" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
  
  
<script setup>
import { ref } from 'vue';
import RescreeningList from "@/components/dashboards/counselorMonitor/counselorMonitorCards/RescreeningList.vue";
import ServiceAndTreatmentList from "@/components/dashboards/counselorMonitor/counselorMonitorCards/ServiceAndTreatmentList.vue";
import ReferralList from "@/components/dashboards/counselorMonitor/counselorMonitorCards/ReferralList.vue";

const activeTab = ref('RescreeningList');

const tabs = [
    { key: 'RescreeningList', label: 'Rescreening', component: RescreeningList },
    { key: 'ServiceAndTreatmentList', label: 'Service & Treatment', component: ServiceAndTreatmentList },
    { key: 'ReferralList', label: 'Referrals', component: ReferralList }
];

const changeTab = (tabName) => {
    activeTab.value = tabName;
}
</script>
  
<style scoped>
.nav-link {
    background-color: transparent;
    color: #000;
    border: none;
    border-radius: 10px;
}

.nav-link.active {
    background-color: #fff;
    color: #000;
}

.nav-tabs {
    padding: 0.4rem;
    border-radius: 10px;
    background-color: #2c697552;
    backdrop-filter: blur(5px);
}
</style>
  