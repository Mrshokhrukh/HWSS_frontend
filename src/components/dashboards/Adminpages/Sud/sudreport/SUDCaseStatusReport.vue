<template>
  <div>
    <div class="card p-4">
      <TotalCaseOngoing />
    </div>
    <div class="card p-4 mt-5">
      <TotalcaseDiscontinue />
    </div>
    <div class="card p-4 mt-5">
      <TotalcaseClosed />
    </div>
  </div>
</template>

<script setup>
import TotalCaseOngoing from "./CSR_TotalCaseOngoing.vue"
import TotalcaseDiscontinue from "./CSR_TotalCaseDiscontinued.vue"
import TotalcaseClosed from "./CSR_TotalCaseClosed.vue"
</script>
