<template>
  <div>
    <div class="card p-4">
      <CaseStatusGraph />
    </div>
    <div class="card p-4">
      <TotalCaseOngoing />
    </div>


  </div>
</template>

<script setup>
import TotalCaseOngoing from "./CSR_TotalCaseOngoing.vue"
import CaseStatusGraph from "./CaseStatusGraph.vue";

</script>
