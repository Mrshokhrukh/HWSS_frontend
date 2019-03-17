<template>
    <div>
        <div class="row p-5 pt-2">
            <div class="col-3 left-selectors">
                <h5 class="hwss-primary mb-5">Screening Tools</h5>
                <div>
                    <ul>
                        <li v-for="(menu, index) in menus" :key="index" @click="selectMenu(index)"
                            :class="{ 'active': selectedMenuIndex === index }">
                            <a href="#" class="p-3">
                                <input type="checkbox" class="form-check-input">
                                <span class="ms-2">{{ menu.name }}</span>
                            </a>
                        </li>
                    </ul>
                </div>
            </div>

            <div class="col-9">
                <component :is="currentScreeningComponent" @goToGAD="changeComponent(CaseScreeningGAD)"
                    @goToASSIST="changeComponent(CaseScreeningASSIST)" @goToPHQ="changeComponent(CaseScreeningPHQ)"
                    @goToACE="changeComponent(CaseScreeningACE)" @goBack="goBack">
                </component>
            </div>
        </div>
    </div>
</template>
  
<script setup>
import { ref} from 'vue';
import CaseScreeningGAD from '@/components/dashboards/counselorScreenings/counselorScreeningStages/CaseScreeningGAD.vue';
import CaseScreeningPHQ from '@/components/dashboards/counselorScreenings/counselorScreeningStages/CaseScreeningPHQ.vue';
import CaseScreeningASSIST from '@/components/dashboards/counselorScreenings/counselorScreeningStages/CaseScreeningASSIST.vue';
import CaseScreeningACE from '@/components/dashboards/counselorScreenings/counselorScreeningStages/CaseScreeningACE.vue';

const menus = ref([
    {
        name: 'GAD7',
    },
    {
        name: 'PHQ9',
    },
    {
        name: 'ACE',
    },
    {
        name: 'ASSIST',
    },

]);

const componentMap = {
    'GAD7': CaseScreeningGAD,
    'PHQ9': CaseScreeningPHQ,
    'ASSIST': CaseScreeningASSIST,
    'ACE': CaseScreeningACE,
};

const currentScreeningComponent = ref(CaseScreeningGAD);
const previousScreeningComponent = ref(null);

const selectedMenuIndex = ref(0);
const selectedMenu = ref(menus.value[selectedMenuIndex.value]);

const selectMenu = (index) => {
    selectedMenuIndex.value = index;
    selectedMenu.value = menus.value[index];
    previousScreeningComponent.value = currentScreeningComponent.value;
    currentScreeningComponent.value = componentMap[selectedMenu.value.name];
};

const goBack = () => {
    if (previousScreeningComponent.value) {
        currentScreeningComponent.value = previousScreeningComponent.value;
        previousScreeningComponent.value = null;
    } else {
        console.log('Cannot go back, no previous component');
    }
};

function changeComponent(component) {
    previousScreeningComponent.value = currentScreeningComponent.value;
    currentScreeningComponent.value = component;
}
</script>

  
<style scoped>
.hwss-icon {
    font-size: 5rem;
    color: #2B656F;
}

.tick-area {
    position: absolute;
    top: 1rem;
    left: 1rem;
    z-index: 10;
    border-radius: 50%;
}

.tick-area input[type="checkbox"] {
    border: 2px solid #2B656F !important;
    border-radius: 50%;
    scale: 1.5;
}

.selectable-card {
    text-align: center;
    border-radius: 8px;
    cursor: pointer;
}

.left-selectors ul {
    padding: 0;
}

.left-selectors ul li {
    list-style: none;
    margin-bottom: 1.5rem;
}

.left-selectors ul li a {
    text-decoration: none;
    color: #5d5d5d;
    font-weight: 500;
    position: relative;
    /* Add relative positioning */
}

.left-selectors ul li.active a {
    color: #2B656F;
    font-weight: 600;
}
</style>
  