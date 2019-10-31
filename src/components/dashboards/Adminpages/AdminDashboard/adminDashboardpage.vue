DashboardView.vue
<template>
    <div class="dashboard-container">
        <!-- Common dashboard elements -->
        <div class="dashboard-header">
            <h2>{{ roleConfig.title || 'Dashboard' }}</h2>
        </div>

        <!-- Role-specific additional components -->
        <template v-for="(component, index) in additionalComponents" :key="index">
            <component :is="component" :userData="userData" />
        </template>

        <!-- Common dashboard content -->
        <div class="dashboard-content">
            <div class="stats-container">
                <!-- Common statistics -->
                <div class="stat-card" v-for="stat in statistics" :key="stat.label">
                    <h3>{{ stat.label }}</h3>
                    <p>{{ stat.value }}</p>
                </div>
            </div>

            <!-- Data table -->
            <div class="data-table">
                <table>
                    <thead>
                        <tr>
                            <th v-for="header in tableHeaders" :key="header">{{ header }}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="item in filteredData" :key="item.id">
                            <td v-for="header in tableHeaders" :key="header">
                                {{ item[header.toLowerCase()] }}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
    userData: {
        type: Object,
        required: true
    },
    roleConfig: {
        type: Object,
        required: true
    }
});

// Get additional components from role config
const additionalComponents = computed(() => {
    return props.roleConfig?.dashboard?.additionalComponents || [];
});

// Filter and process data based on role configuration
const filteredData = computed(() => {
    if (!props.userData || !props.roleConfig.dataFilter) return [];
    return props.roleConfig.dataFilter(props.userData);
});

// Common table headers - can be customized per role if needed
const tableHeaders = computed(() => {
    return ['Date', 'Type', 'Status', 'Actions'];
});

// Basic statistics - can be extended based on role
const statistics = computed(() => {
    return [
        { label: 'Total Cases', value: filteredData.value.length },
        { label: 'Active Cases', value: filteredData.value.filter(item => item.status === 'active').length },
        { label: 'Completed', value: filteredData.value.filter(item => item.status === 'completed').length }
    ];
});
</script>