<template>
    <div class="card w-100 card-bg h-100">
        <div class="card-header">
            <h4 class="graph-title text-center">Screening Frequency by Gender</h4>
        </div>
        <div class="card-body">
            <column-chart :data="chartData" :colors="chartColors" :xtitle="'Severity'" :ytitle="'Count'"
                :borderSkipped="true" />
        </div>
    </div>
</template>
  
<script setup>
import { ref } from 'vue';

const chartData = ref([
    { name: 'Male', data: { 'Nearly Every Day': 78, 'More than Half the Days': 6, 'Several Days': 68 } },
    { name: 'Female', data: { 'Nearly Every Day': 56, 'More than Half the Days': 72, 'Several Days': 24 } }
]);

const chartColors = ref(['#2c6975', '#64ac99']);
</script>
  
<style scoped>
.graph-title {
    color: #2c6975;
}
</style>
  