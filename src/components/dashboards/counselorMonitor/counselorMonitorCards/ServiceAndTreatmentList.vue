<template>
    <div>
        <div class="row">
            <h5 class="card-title">Service and Treatment List</h5>
            <ag-grid-vue style="width: 100%; height: 500px;" class="ag-theme-quartz" :rowData="filteredRows"
                :columnDefs="columnDefs" :defaultColDef="defaultColDef" :rowSelection="'multiple'"
                :headerCheckboxSelection="true" :pagination="true" :paginationPageSize="50" :rowHeight="50"
                @selectionChanged="onSelectionChanged">
                <ag-grid-vue-viewport-header select-all="true"></ag-grid-vue-viewport-header>
            </ag-grid-vue>
            <!-- Button to save changes -->
        </div>
        <div class="row mt-4 d-flex justify-content-end">
            <button class="btn hwss-btn col-1" @click="saveChanges">Save Changes</button>
        </div>
    </div>
</template>
  
<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import endpoints from '@/api';
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { AgGridVue } from "ag-grid-vue3";
// import { useModal } from '../composables/useModal'

const gridOptions = ref(null);


const followUpList = ref([
    'Treatment Completed',
    'Undergoing Treatment',
    'Completed Counselling Sessions',
    'Unwilling to Undergo Treatment',
    'Undergone Rehabilitation',
    'Undergoing Rehabilitation',
    'Hospital-based Outpatient SUD Treatment and Care (Primary Phase)',
    'Hospital-based Outpatient SUD Treatment and Care (Continuing Care)',
    'School-based SUD Treatment and Care',
    'Institution-based SUD Treatment and Care',
    'Follow-up Drug Test Conducted',
    'Detention-based SUD Treatment and Care',
]);

const viewDetailsRenderer = (params) => {
    return `<button class="btn hwss-btn" @click="viewDetails(${params.data.id})">View Details</button>`;
};

const columnDefs = ref([
    { headerName: 'Date', field: 'date', filter: true, },
    { headerName: 'Name', field: 'user_data.name', filter: true, },
    { headerName: 'Age', field: 'user_data.age', filter: true, },
    { headerName: 'Sex', field: 'user_data.gender', filter: true, },
    {
        headerName: 'Assessment Status', field: 'assessment_status', filter: true,
        cellEditor: 'agSelectCellEditor', cellEditorParams: { values: ['Not Conducted', 'Conducted'] }, enableCellChangeFlash: true, editable: true,
        valueFormatter: function (params) {
            // Check if the value is null or empty
            if (!params.value || params.value.trim() === '') {
                return '----';
            }
            return params.value;
        }
    },
    {
        headerName: 'Case Status', field: 'case_status', filter: true,
        cellEditor: 'agSelectCellEditor', cellEditorParams: { values: ['On Going', 'Case Discontinued', 'Case Closed'] }, enableCellChangeFlash: true, editable: true,
        valueFormatter: function (params) {
            // Check if the value is null or empty
            if (!params.value || params.value.trim() === '') {
                return '----';
            }
            return params.value;
        }
    },
    {
        headerName: 'Counseling', field: 'counseling', filter: true, enableCellChangeFlash: true, editable: true,
        cellEditor: 'agSelectCellEditor', cellEditorParams: { values: ['Availed', 'Not Required', 'Waiting List'] },
        valueFormatter: function (params) {
            // Check if the value is null or empty
            if (!params.value || params.value.trim() === '') {
                return '----';
            }
            return params.value;
        }
    },
    {
        headerName: 'Follow Up', field: 'follow_up', filter: true, enableCellChangeFlash: true, editable: true,
        cellEditor: 'agSelectCellEditor', cellEditorParams: { values: followUpList.value, defaultValue: '' },
        valueFormatter: function (params) {
            // Check if the value is null or empty
            if (!params.value || params.value.trim() === '') {
                return '----';
            }
            return params.value;
        }
    },
    {
        headerName: 'Comments',
        field: 'comments',

        filter: true,

        cellEditor: 'agLargeTextCellEditor',
        cellEditorParams: { maxLength: 250, rows: 10, cols: 50 }, enableCellChangeFlash: true, editable: true,
        valueFormatter: function (params) {
            // Check if the value is null or empty
            if (!params.value || params.value.trim() === '') {
                return '----';
            }
            return params.value;
        }
    },
    { headerName: 'Actions', cellRenderer: viewDetailsRenderer }
]);


const rowData = ref([]);
const defaultColDef = ref({ sortable: true, resizable: true });

const searchQuery = ref('');
const selectedFields = ref(columnDefs.value.map(column => column.field));

const filteredRows = computed(() => {
    if (!searchQuery.value.trim() || !Array.isArray(rowData.value) || rowData.value.length === 0) {
        return rowData.value;
    }

    return rowData.value.filter(row => {
        return selectedFields.value.some(field => {
            const fieldValue = row[field.split('.').pop()];
            return fieldValue !== undefined && fieldValue.toString().toLowerCase().includes(searchQuery.value.toLowerCase());
        });
    });
});

const saveChanges = async () => {
    try {
        const updatedData = gridOptions.value.api.getRowData();
        // Implement logic to send updatedData to backend for saving
        console.log("Updated Data:", updatedData);
        // Optionally, you can show a success message or perform other actions here
    } catch (error) {
        console.error("Error saving changes:", error);
        // Optionally, you can show an error message or perform other error handling here
    }
}

onMounted(async () => {
    try {
        const response = await axios.get(endpoints.getServiceAndTreatmentList);
        console.log("Response:", response.data);
        if (response && response.data && Array.isArray(response.data.service_and_treatment_data)) {
            rowData.value = response.data.service_and_treatment_data;
            console.log("rowData:", rowData.value);
        } else {
            console.error("Invalid response format:", response);
        }
    } catch (error) {
        console.error(error);
    }
});
</script>
  