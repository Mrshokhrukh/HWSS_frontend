<template>
    <div class="accordion" id="filterAccordion">
        <div class="accordion-item">
            <h2 class="accordion-header" id="filterHeading">
                <button class="accordion-button hwss-primary" type="button" data-bs-toggle="collapse"
                    data-bs-target="#filterCollapse" aria-expanded="false" aria-controls="filterCollapse">
                    <span class="me-auto">
                        <i class="fas fa-filter"></i>
                        Open Filters
                    </span>
                </button>
            </h2>
            <div id="filterCollapse" class="accordion-collapse collapse hwss-primary" aria-labelledby="filterHeading"
                data-bs-parent="#filterAccordion">
                <div class="accordion-body">
                    <!-- Filter content goes here -->
                    <div class="row mb-3">
                        <!-- Search Bar -->
                        <div class="col-md-4">
                            <label for="searchQuery" class="form-label">Search:</label>
                            <input type="text" id="searchQuery" class="form-control" v-model="searchQuery"
                                placeholder="Search...">
                        </div>
                        <!-- Severity Selector -->
                        <div class="col-md-4">
                            <label class="form-label">Select Severity:</label>
                            <div class="row">
                                <label class="form-check-label col-6" v-for="severity in severityOptions" :key="severity">
                                    <input class="form-check-input" type="checkbox" :value="severity"
                                        v-model="selectedSeverities"> {{ severity }}
                                </label>
                            </div>
                        </div>
                        <!-- Date Range Selector -->
                        <div class="col-md-2">
                            <label for="startDate" class="form-label">Select Start Date:</label>
                            <Datepicker v-model="startDate" id="startDate"></Datepicker>
                        </div>
                        <div class="col-md-2">
                            <label for="endDate" class="form-label">Select End Date:</label>
                            <Datepicker v-model="endDate" id="endDate"></Datepicker>
                        </div>
                    </div>
                    <div class="row mb-3">
                        <!-- Selectable Table Fields -->
                        <div class="col-md-12">
                            <label class="form-label">Select Table Fields:</label>
                            <div class="row">
                                <label class="form-check-label col-2" v-for="field in tableFields" :key="field">
                                    <input class="form-check-input" type="checkbox" :value="field"
                                        v-model="selectedTableFields"> {{ field }}
                                </label>
                            </div>
                        </div>
                    </div>
                    <div class="row mb-3">
                        <!-- Apply Filters Button -->
                        <div class="col-md-12 text-end">
                            <button class="btn hwss-btn" @click="applyFilters">Apply Filters</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
  
<script setup>
import { ref } from 'vue';
import Datepicker from 'vue3-datepicker';

// eslint-disable-next-line no-unused-vars
const props = defineProps({
  // Define any props if needed
});

const emits = defineEmits(['filtersApplied']); // Define custom event

const severityOptions = ['Severe', 'Moderately Severe', 'Moderate', 'Mild', 'High Risk', 'Moderate Risk', 'Low Risk'];
const tableFields = ['Date', 'Name', 'Gender', 'Age', 'Depression Severity', 'Cocaine', 'Inhalants', 'Sedatives or Sleeping Pills', 'Generalized Anxiety Disorder', 'Adverse Childhood Experience', 'Tobacco products', 'Alcoholic beverages', 'Cannabis'];

let searchQuery = ref('');
let selectedSeverities = ref([]);
let startDate = ref(null);
let endDate = ref(null);
let selectedTableFields = ref([]);

const applyFilters = () => {
  // Emit custom event with selected filter values
  emits('filtersApplied', { searchQuery: searchQuery.value, selectedSeverities: selectedSeverities.value, selectedDateRange: `start: ${startDate.value}, end: ${endDate.value}`, selectedTableFields: selectedTableFields.value });
};
</script>
  