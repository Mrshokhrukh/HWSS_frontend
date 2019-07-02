<template>
    <div class="container-fluid">
        <div class="card">
            <div class="row">
                <!-- Sidebar for Options -->
                <div class="col-md-2 p-4 bg-light border-end d-flex flex-column">
                    <h5 class="mb-4">Data Set</h5>
                    <div v-for="option in options" :key="option.id" class="form-check mb-2">
                        <input type="checkbox" class="form-check-input" :id="option.id" v-model="option.selected"
                            @change="handleOptionChange(option)" />
                        <label class="form-check-label" :for="option.id">{{ option.label }}</label>
                    </div>
                    <button @click="generateReport" class="btn btn-primary mt-auto">Generate</button>
                </div>
                <!-- Preview Area -->
                <div class="col-md-9 p-3 bg-white">
                    <div v-if="!showPreview" class="text-center text-muted">
                        <p class="note">Note: Please select a parameter</p>
                        <p class="note">Note: The report will be shown only when the generate button is pressed.</p>
                    </div>
                    <div v-else>
                        <div class="graph">
                            <div class="graph-placeholder d-flex justify-content-around">
                                <SUDMonitorGraph v-if="selectedOption && selectedOption.id !== 'Table'" :selectedOption="selectedOption"
                                    :reportData="reportData" />
                                <SUDTableLayer v-if="selectedOption && selectedOption.id === 'Table'" :reportData="filteredData" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import SUDMonitorGraph from './SUDMonitorGraph.vue';
import SUDTableLayer from './SUDTableLayer.vue';

// Mock data similar to your example
const rawData = [
    {
        "id": 1,
        "service": {
            "counseling_measurement": "WaitingList",
            "assessment_measurement": "Conducted",
            "referral_measurement": "Referred",
            "follow_up_measurement": "TreatmentCompleted"
        },
        "Rescreened": true
    },
    {
        "id": 2,
        "service": {
            "counseling_measurement": "NotRequired",
            "assessment_measurement": "NotConducted",
            "referral_measurement": "NotReferred",
            "follow_up_measurement": "InstitutionBasedSUDTreatmentAndCare"
        },
        "Rescreened": false
    },
    {
        "id": 3,
        "service": {
            "counseling_measurement": "Availed",
            "assessment_measurement": "NotConducted",
            "referral_measurement": "NotReferred",
            "follow_up_measurement": "CompletedCounsellingSessions"
        },
        "Rescreened": true
    },
    {
        "id": 4,
        "service": {
            "counseling_measurement": "Availed",
            "assessment_measurement": "NotConducted",
            "referral_measurement": "NotReferred",
            "follow_up_measurement": "UndergoingTreatment"
        },
        "Rescreened": true
    }
];

const options = ref([
    { id: 'Rescreening', label: 'Rescreening', selected: false },
    { id: 'Counseling', label: 'Counseling', selected: false },
    { id: 'Assessment', label: 'Assessment', selected: false },
    { id: 'Follow', label: 'Follow up', selected: false },
    { id: 'Referrals', label: 'Referrals', selected: false },
    { id: 'Table', label: 'Table', selected: false },
]);

const showPreview = ref(false);
const selectedOption = ref(null);
const reportData = ref([]);

const handleOptionChange = (changedOption) => {
    options.value.forEach(option => {
        if (option.id !== changedOption.id) {
            option.selected = false;
        }
    });
};

const generateReport = () => {
    selectedOption.value = options.value.find(option => option.selected);
    if (selectedOption.value) {
        showPreview.value = true;
        if (selectedOption.value.id !== 'Table') {
            const selectedKey = selectedOption.value.id === 'Follow' ? 'follow_up_measurement' :
                selectedOption.value.id === 'Referrals' ? 'referral_measurement' :
                    selectedOption.value.id.toLowerCase() + '_measurement';
            reportData.value = rawData.map(item => ({
                status: item.service[selectedKey],
                count: item.Rescreened && item.service[selectedKey] !== undefined ? 1 : 0
            })).reduce((acc, curr) => {
                const existingItem = acc.find(item => item.status === curr.status);
                if (existingItem) {
                    existingItem.count += curr.count;
                } else {
                    acc.push(curr);
                }
                return acc;
            }, []);
        }
        // For 'Table' option, we don't need to process the data as filteredData will handle it
    } else {
        alert('Please select a parameter before generating the report.');
    }
};

const filteredData = computed(() => {
    if (!selectedOption.value || selectedOption.value.id === 'Table') {
        return rawData;
    } else {
        const selectedKey = selectedOption.value.id === 'Follow' ? 'follow_up_measurement' :
            selectedOption.value.id === 'Referrals' ? 'referral_measurement' :
                selectedOption.value.id.toLowerCase() + '_measurement';
        return rawData.filter(item => item.service[selectedKey] !== undefined);
    }
});
</script>

<style scoped>
/* Add scoped styles as needed */
</style>