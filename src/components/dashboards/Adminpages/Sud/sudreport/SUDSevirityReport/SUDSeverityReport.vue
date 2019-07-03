<template>

  <div>
    <SUDLIfeTimeGraph />
  </div>
  <div>
    <SUDCurrentUseGraph />
  </div>
  <div>
    <SUDSeverityGraph />
  </div>

  <div>
    <SUDSeverityTable />
  </div>
</template>

<script setup>
import SUDSeverityGraph from './SUDSeverityGraph.vue'
import SUDSeverityTable from './SUDSeverityTable.vue'
import SUDLIfeTimeGraph from './SUDLIfeTimeGraph.vue'
import SUDCurrentUseGraph from './SUDCurrentUseGraph.vue'
</script>