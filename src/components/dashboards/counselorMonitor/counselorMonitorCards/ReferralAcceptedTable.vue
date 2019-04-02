<template>
    <el-table :data="rowData" :row-class-name="rowClassName" height="500px" stripe
        :default-sort="{ prop: 'date', order: 'descending' }" :selection-change="onSelectionChanged"
        style="width: 100%">
        <el-table-column type="selection" width="50"></el-table-column>
        <el-table-column prop="date" label="Date" sortable show-overflow-tooltip></el-table-column>
        <el-table-column prop="user_data.name" label="Name" sortable show-overflow-tooltip></el-table-column>
        <el-table-column prop="user_data.age" label="Age" sortable show-overflow-tooltip></el-table-column>
        <el-table-column prop="user_data.gender" label="Sex" sortable show-overflow-tooltip></el-table-column>
        <el-table-column prop="referred_to_name" label="Referred To" sortable show-overflow-tooltip></el-table-column>
        <el-table-column prop="referred_by_name" label="Referred By" sortable show-overflow-tooltip></el-table-column>
        <el-table-column prop="referral_status" label="Referral Status" sortable
            show-overflow-tooltip></el-table-column>
        <el-table-column prop="referral_remarks" label="Referral Remarks" sortable
            show-overflow-tooltip></el-table-column>
    </el-table>
</template>

<script setup>
import { ref } from 'vue';

const rowData = ref([]);
const onSelectionChanged = () => {
    // Implement selectionChanged logic
};
</script>