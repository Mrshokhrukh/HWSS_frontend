<template>
  <div class="row justify-content-center mb-3">
    <div class=" col-md-3 text-center" >
      <div class="card option">
        <div class="card-body">
          <p class="card-text">Rescreening Count</p>
          <h1 class="textfont">{{ Rescreening_count }}</h1>
        </div>
      </div>
    </div>
    <div class="col-md-6 text-center">
      <div class="card option">
        <div class="card-body">
          <p class="card-text">Counseling</p>
          <div class="row justify-content-center">
            <div class="col-md-4 text-center">
              <div class="nestedcard">
                <div class="card-body">
                  <p class="card-text">Availed</p>
                  <h1>{{ Availed_Count }}</h1>
                </div>
              </div>
            </div>
            <div class="col-md-4 text-center">
              <div class="nestedcard">
                <div class="card-body">
                  <p class="card-text">Waiting List</p>
                  <h1>{{ WaitingList_Count }}</h1>
                </div>
              </div>
            </div>
            <div class="col-md-4 text-center">
              <div class="nestedcard">
                <div class="card-body">
                  <p class="card-text">Not Required</p>
                  <h1>{{ NotRequired_Count }}</h1>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="col-md-3 text-center" >
      <div class="card option">
        <div class="card-body">
          <p class="card-text">Assement</p>
          <div class="flex justify-center">
            <div class="col-md text-center mb-2">
              <div class="nestedcard">
                <div class="card-body">
                  <p class="card-text">Condcuted : {{ Conducted_Count }}</p>
                 
                </div>
              </div>
            </div>
            <div class="col-md text-center">
              <div class="nestedcard">
                <div class="card-body">
                  <p class="card-text">Not Conducted : {{ NotConducted_Count }}</p>
                 
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// Inject filteredData from parent component
import { inject } from 'vue'

// Inject the filteredData
const reportData = inject('filteredData')
// Rescreening
const Rescreening_count = ref(0);
const Rescreening_filter = ref([]);
Rescreening_filter.value = reportData.value.filter(item => item.rescreened === false);
Rescreening_count.value = Rescreening_filter.value.length;


// Counseling
//WaitingList
const WaitingList_Count = ref(0);
const WaitingListCount_filter = ref([]);
WaitingListCount_filter.value = reportData.value.filter(item => item.service_and_treatment?.counseling === 'Waiting List');
WaitingList_Count.value = WaitingListCount_filter.value.length;

//Not Required
const NotRequired_Count = ref(0);
const NotRequiredCount_filter = ref([]);
NotRequiredCount_filter.value = reportData.value.filter(item => item.service_and_treatment?.counseling === 'Not Required');
NotRequired_Count.value = NotRequiredCount_filter.value.length;

//Availed
const Availed_Count = ref(0);
const AvailedCount_filter = ref([]);
AvailedCount_filter.value = reportData.value.filter(item => item.service_and_treatment?.counseling === 'Availed');
Availed_Count.value = AvailedCount_filter.value.length;

//assement
// Not conducted
const Conducted_Count = ref(0);
const ConductedCount_filter = ref([]);
ConductedCount_filter.value = reportData.value.filter(item => item.service_and_treatment?.assessment_status === 'Conducted');
Conducted_Count.value = ConductedCount_filter.value.length;


//Coducted
const NotConducted_Count = ref(0);
const NotConductedCount_filter = ref([]);
NotConductedCount_filter.value = reportData.value.filter(item => item.service_and_treatment?.assessment_status === 'Not Conducted');
NotConducted_Count.value = NotConductedCount_filter.value.length;


</script>

<style scoped>
.card{
    border: 1.5px solid #2c6975;
     color: #2c6975;
     height: 250px;
}
.nestedcard{
    border: 2px solid #2c6975;
     color: #2c6975; 
     border-radius: 10px;
}
.textfont{
    font-size: 120px;
     
}
</style>