<template>
    <el-table :data="rowData" :row-height="50" :header-cell-style="{ 'height': '50px' }" height="500px" stripe
        :default-sort="{ prop: 'date', order: 'descending' }" @selection-change="onSelectionChanged"
        style="width: 100%">
        <el-table-column prop="date" label="Date" sortable show-overflow-tooltip
            :formatter="formatDate"></el-table-column>
        <el-table-column prop="user_data.name" label="Name" sortable show-overflow-tooltip></el-table-column>
        <el-table-column prop="user_data.age" label="Age" sortable show-overflow-tooltip></el-table-column>
        <el-table-column prop="user_data.gender" label="Sex" sortable show-overflow-tooltip></el-table-column>
        <el-table-column prop="referred_to_name" label="Referred To" sortable show-overflow-tooltip
            :formatter="formatEmpty"></el-table-column>
        <el-table-column prop="referred_by_name" label="Referred By" sortable show-overflow-tooltip
            :formatter="formatEmpty"></el-table-column>
        <el-table-column prop="referral_status" label="Referral Status" sortable show-overflow-tooltip
            :formatter="formatEmpty"></el-table-column>
        <el-table-column prop="referral_remarks" label="Referral Remarks" sortable show-overflow-tooltip
            :formatter="formatEmpty"></el-table-column>
    </el-table>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import endpoints from '@/api';
import { ElTable, ElTableColumn } from 'element-plus';

const referrals = ref([]);
const rowData = ref([]);

const formatDate = (row, column) => {
  // Assuming the 'date' property contains a Unix timestamp
  const timestamp = row[column.property];
  const date = new Date(timestamp * 1000); // Multiply by 1000 to convert seconds to milliseconds

  // Format the date as desired (e.g., "YYYY-MM-DD HH:MM:SS")
  const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;

  return formattedDate;
};


const formatEmpty = (row, column) => {
  if (!row[column.property] || row[column.property].trim() === '') {
    return '----';
  }
  return row[column.property];
};

const onSelectionChanged = () => {
    // Implement selectionChanged logic
};

const loadData = async () => {
  try {
    const response = await axios.get(endpoints.getReferralList);
    referrals.value = response.data.referral_list;
  } catch (error) {
    console.error('Error loading data:', error);
  }
};

onMounted(async () => {
  await loadData();
});
</script>
