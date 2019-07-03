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
    <SUDGraph />
  </div>
</template>

<script setup>
import SUDSeverityGraph from './SUDSeverityGraph.vue'
import SUDGraph from './SUDGraph.vue'

</script>