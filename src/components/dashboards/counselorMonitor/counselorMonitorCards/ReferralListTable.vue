<template>
    <ag-grid-vue style="width: 100%; height: 500px;" class="ag-theme-quartz" :rowData="rowData" :columnDefs="columnDefs"
        :defaultColDef="defaultColDef" :rowSelection="'multiple'" :headerCheckboxSelection="true" :pagination="true"
        :paginationPageSize="50" :rowHeight="50" @selectionChanged="onSelectionChanged">
        <ag-grid-vue-viewport-header select-all="true"></ag-grid-vue-viewport-header>
    </ag-grid-vue>
</template>
  
<script setup>
import { ref, onMounted, watch } from 'vue';
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { AgGridVue } from "ag-grid-vue3";
import axios from 'axios';
import endpoints from '@/api';

const referrals = ref([]);

const rowData = ref([]);
const columnDefs = ref([
    { headerName: 'Date', field: 'date', filter: true, },
    { headerName: 'Name', field: 'user_data.name', filter: true, },
    { headerName: 'Age', field: 'user_data.age', filter: true, },
    { headerName: 'Sex', field: 'user_data.gender', filter: true, },
    {
        headerName: 'Referred To', field: 'referred_to_name', filter: true, valueFormatter: function (params) {
            if (!params.value || params.value.trim() === '') {
                return '----';
            }
            return params.value;
        }
    },
    {
        headerName: 'Referred By', field: 'referred_by_name', filter: true, valueFormatter: function (params) {
            if (!params.value || params.value.trim() === '') {
                return '----';
            }
            return params.value;
        }
    },
    {
        headerName: 'Referral Status', field: 'referral_status', filter: true, valueFormatter: function (params) {
            if (!params.value || params.value.trim() === '') {
                return '----';
            }
            return params.value;
        }
    },
    {
        headerName: 'Referral Remarks', field: 'referral_remarks', filter: true, valueFormatter: function (params) {
            if (!params.value || params.value.trim() === '') {
                return '----';
            }
            return params.value;
        }
    }
]);
const defaultColDef = ref({ sortable: true, resizable: true });

const onSelectionChanged = () => {
    // Implement selectionChanged logic
};

watch(referrals, (newValue) => {
    rowData.value = newValue.referral_list;
});

const loadData = async () => {
    try {
        const response = await axios.get(endpoints.getReferralList);
        referrals.value = response.data;
    } catch (error) {
        console.error('Error loading data:', error);
    }
};

onMounted(async () => {
    loadData();
});
</script>
