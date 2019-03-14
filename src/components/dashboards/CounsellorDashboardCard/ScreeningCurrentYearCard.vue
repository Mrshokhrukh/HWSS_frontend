<template>
    <div class="card w-100">
        <div class="card-header">
            <h4 class="text-center">Total screened for the year: {{ getCurrentYear() }}</h4>
        </div>
        <div class="card-body">
            <pie-chart :donut="true" :data="chartData" :colors="chartColors" legend="bottom" />
        </div>
        <div class="card-footer">
            <span class="legend-item">
                <span class="legend-color" style="background-color: #2c6975;"></span> Male ({{ chartData.Male }})
            </span>
            <span class="legend-item">
                <span class="legend-color" style="background-color: #64ac99;"></span> Female ({{ chartData.Female }})
            </span>
            <span><strong>Total: {{ getTotalCount }}</strong></span>
        </div>
    </div>
</template>
  
<script setup>
import { ref, computed } from 'vue';

const chartData = ref({
    'Male': 425,
    'Female': 205
});

const chartColors = ref(['#2c6975', '#64ac99']);

const getCurrentYear = () => {
    return new Date().getFullYear();
};

const getTotalCount = computed(() => {
    return Object.values(chartData.value).reduce((acc, curr) => acc + curr, 0);
});

</script>
  
<style scoped>
.container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
}

.card {
    width: 400px;
}

.card-header {
    color: #2c6975;
    padding: 10px;
}

.card-body {
    padding: 20px;
}

.card-footer {
    padding: 10px;
    display: flex;
    justify-content: space-around;
    align-items: center;
}

.legend-item {
    display: flex;
    align-items: center;
}

.legend-color {
    width: 20px;
    height: 20px;
    margin-right: 5px;
    display: inline-block;
}
</style>
  