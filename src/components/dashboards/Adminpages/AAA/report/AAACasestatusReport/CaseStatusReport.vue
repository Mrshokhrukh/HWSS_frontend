<template>
  <div>
    <div class="card p-4">
      <AAACasestatusGraph />
    </div>
    <div class="card p-4 mt-5">
      <TotalCaseOngoing />
    </div>
  </div>
</template>

<script setup>
import TotalCaseOngoing from "./CSR_TotalCaseOngoing.vue";
import AAACasestatusGraph from "@/components/dashboards/Adminpages/AAA/report/AAACasestatusReport/AAACaseStatusGraph.vue"
</script>
