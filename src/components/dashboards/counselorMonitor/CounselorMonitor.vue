<template>
    <div class="container-fluid gradient-background p-5">
        <div class="row justify-content-center mb-5">
            <div class="col-md-10 col-lg-10">
                <nav class="tab-container">
                    <button v-for="(tab, index) in filteredTabs" :key="index"
                        :class="['tab-button', { active: activeTab === tab.key }]" @click="changeTab(tab.key)">
                        {{ tab.label }}
                    </button>
                </nav>
            </div>
        </div>
        <div class="row justify-content-center">
            <div class="col-md-12 col-lg-12">
                <div class="content-card">
                    <transition name="fade" mode="in-out">
                        <component :is="activeComponent" v-if="activeComponent" />
                    </transition>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import RescreeningList from "@/components/dashboards/counselorMonitor/counselorMonitorCards/RescreeningList.vue";
import ServiceAndTreatmentList from "@/components/dashboards/counselorMonitor/counselorMonitorCards/ServiceAndTreatmentList.vue";
import ReferralList from "@/components/dashboards/counselorMonitor/counselorMonitorCards/ReferralList.vue";

const activeTab = ref('ServiceAndTreatmentList');

const tabs = [
    { key: 'RescreeningList', label: 'Rescreening', component: RescreeningList },
    { key: 'ServiceAndTreatmentList', label: 'Service & Treatment', component: ServiceAndTreatmentList },
    { key: 'ReferralList', label: 'Referrals', component: ReferralList }
];

const userRole = ref(null);

onMounted(() => {
    const userDetails = JSON.parse(localStorage.getItem('userDetailsStore'));
    if (userDetails && userDetails.user) {
        userRole.value = userDetails.user.role;
    }

    if (userRole.value === 'clinical_counselor') {
        activeTab.value = 'ServiceAndTreatmentList';
    }
});

const filteredTabs = computed(() => {
    if (userRole.value === 'clinical_counselor') {
        return tabs.filter(tab => tab.key !== 'RescreeningList');
    }
    return tabs;
});

const changeTab = (tabName) => {
    activeTab.value = tabName;
};

const activeComponent = computed(() => {
    const currentTab = filteredTabs.value.find(tab => tab.key === activeTab.value);
    return currentTab ? currentTab.component : null;
});
</script>


<style scoped>
.gradient-background {
    background: linear-gradient(135deg, #2B656F 0%, #1D4851 100%);
    height: auto;
    border-radius: 15px;
}

.tab-container {
    display: flex;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 15px;
    padding: 0.5rem;
    backdrop-filter: blur(10px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.tab-button {
    flex: 1;
    padding: 0.75rem 1.5rem;
    border: none;
    background: transparent;
    color: rgba(255, 255, 255, 0.7);
    font-weight: 600;
    transition: all 0.3s ease;
    border-radius: 10px;
    cursor: pointer;
}

.tab-button.active {
    background: linear-gradient(135deg, #e6f3f5, #f0f7f8);
    color: #2B656F;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.content-card {
    background: white;
    border-radius: 15px;
    padding: 1.5rem;
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.1s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>