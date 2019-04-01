<template>
    .row
    <div class="row">
        <div class="col-md-12">
            <ag-grid-vue class="ag-theme-quartz" style="height: 500px" :columnDefs="columnDefs"
                :defaultColDef="defaultColDef" :rowData="reportData"></ag-grid-vue>
        </div>
    </div>
</template>
  
<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios';
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import endpoints from '@/api';
import { AgGridVue } from "ag-grid-vue3";

const reportData = ref([]);

const columnDefs = ref([
    { field: 'user_id', headerName: 'User ID', sortable: true },
    { field: 'username', headerName: 'Username', sortable: true },
    { field: 'present_dzongkhag', headerName: 'Present Dzongkhag', sortable: true },
    // Add more column definitions as needed for other fields
]);

const defaultColDef = ref({
    sortable: true,
    resizable: true,
    filter: true,
});

onMounted(async () => {
    try {
        const response = await axios.get(endpoints.generateReport);
        if (response.data) {
            reportData.value = response.data;
            console.log(reportData.value);
        }
    } catch (error) {
        console.error(error);
    }
})

</script>
