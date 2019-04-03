<template>
  <div class="container my-5">
    <el-input v-model="searchQuery" placeholder="Search" class="mb-3" clearable @clear="searchRecords" />
    <el-table :data="filteredRecords" stripe border>
      <el-table-column prop="date" label="Date" width="120" sortable />
      <el-table-column prop="eventName" label="Event Name" sortable />
      <el-table-column prop="toolsUsed" label="Tools to be Used" sortable />
      <el-table-column prop="duration" label="Duration" sortable />
      <el-table-column prop="submittedBy" label="Submitted By" sortable />
      <el-table-column label="Status" width="150">
        <template #default="{ row }">
          <el-tag :type="getStatusTagType(row.status)">{{ row.status }}</el-tag>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { ElInput, ElTable, ElTableColumn, ElTag } from 'element-plus';

// Sample data
const records = ref([
  {
    id: 1,
    date: '21/02/24',
    eventName: 'Empower Wellness Summit',
    toolsUsed: 'Mental Health, SUD',
    duration: '5 days',
    submittedBy: 'Ms. Nangay Tshering, Clinical Counselor',
    status: 'Accepted'
  },
  {
    id: 2,
    date: '23/02/24',
    eventName: 'Mental Health Awareness Day',
    toolsUsed: 'Mental Health, SUD',
    duration: '7 days',
    submittedBy: 'Ms. Sonam Chorden, Clinical Counselor',
    status: 'Rejected'
  },
  // Add more records as needed
]);

const searchQuery = ref('');

const filteredRecords = computed(() => {
  return records.value.filter(record =>
    record.eventName.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const searchRecords = () => {
  // Perform search operation
};

const getStatusTagType = (status) => {
  return status === 'Accepted' ? 'success' : 'danger';
};
</script>

<style scoped>
.container {
  margin-top: 20px;
}
</style>
