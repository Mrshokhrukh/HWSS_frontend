<template>

  <h1 class="text-center fw-bold mt-5 mb-4" style="color: #2c6975;">Current Status in Bhutans</h1>
  <div>
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script>
import { defineComponent, onMounted, ref } from 'vue';
import Chart from 'chart.js/auto';

export default defineComponent({
  name: 'App',
  setup() {
    const chartCanvas = ref(null);

    onMounted(() => {
      const ctx = chartCanvas.value.getContext('2d');
      new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: [
            'Primary Phase',
            'Continuing Care',
            'Undergoing Rehabilitation',
            'Treatment Completed',
            'Non-compliance',
          ],
          datasets: [
            {
              label: 'Dummy Data',
              data: [28, 66, 90, 50, 44],
              backgroundColor: [
                'rgba(44, 105, 117, 100%)',
                'rgba(114, 190, 203, 100%)',
                'rgba(104,178, 160, 100%)',
                'rgba(180, 213, 191, 100%)',
                'rgba(0, 0, 0, 100%)',
              ],
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
        },
      });
    });

    return {
      chartCanvas,
    };
  },
});
</script>

<style>
/* Add any custom styles for the chart canvas here */
</style>
