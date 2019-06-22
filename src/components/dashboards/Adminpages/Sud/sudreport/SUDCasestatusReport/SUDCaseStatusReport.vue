<template>
  <div>
    <div class="card p-4">
      <SUDCaseStatusGraph />
    </div>
    <div class="card p-4 mt-5">
      <SUDCSR_Table />
    </div>
  </div>
</template>

<script setup>
import SUDCaseStatusGraph from './SUDCaseStatusGraph.vue'
import SUDCSR_Table from './SUDCSR_TotalCaseOngoing.vue'
</script>
