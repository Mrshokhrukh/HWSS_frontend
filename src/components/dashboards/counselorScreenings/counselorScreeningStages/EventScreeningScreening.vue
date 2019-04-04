<template>
    <div>
        <div class="row p-4 bg-light">
            <div class="col-3 left-selectors">
                <h5 class="hwss-primary mb-5">Selected Assessment:</h5>
                <div>
                    <ul>
                        <li v-for="menu in menus" :key="menu.id" @click="selectMenu(menu)"
                            :class="{ 'active': selectedMenu && selectedMenu.id === menu.id }">
                            <a href="#" class="p-3">
                                <input type="checkbox" class="form-check-input" :checked="menu.completed"
                                    :disabled="menu.completed">
                                <span class="ms-2">{{ menu.name }}</span>
                            </a>
                        </li>
                    </ul>
                </div>
            </div>

            <div class="col-9">
                <component v-if="currentScreeningComponent" :is="currentScreeningComponent"
                    @goToNext="handleChangeComponent"></component>
                <div v-else>
                    <div class="d-flex justify-content-center">
                        <h4 class="my-5">Select the Accessment Tool you want to begin with!</h4>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import CaseScreeningGAD from '@/components/dashboards/counselorScreenings/counselorScreeningStages/CaseScreeningGAD.vue';
import CaseScreeningPHQ from '@/components/dashboards/counselorScreenings/counselorScreeningStages/CaseScreeningPHQ.vue';
import CaseScreeningASSIST from '@/components/dashboards/counselorScreenings/counselorScreeningStages/CaseScreeningASSIST.vue';
import CaseScreeningACE from '@/components/dashboards/counselorScreenings/counselorScreeningStages/CaseScreeningACE.vue';
import Swal from 'sweetalert2';
import { useRouter } from 'vue-router';

const router = useRouter();

const emit = defineEmits(['goBackToSelectTools', 'goToNext']);

const currentScreeningComponent = ref(null);
const selectedMenu = ref(null);
const menus = ref([]);
const nextMenu = ref(null);

// Define component mapping
const componentMap = {
    'GAD': CaseScreeningGAD,
    'PHQ': CaseScreeningPHQ,
    'ASSIST': CaseScreeningASSIST,
    'ACE': CaseScreeningACE,
};

// Method to select menu
const selectMenu = (menu) => {
    selectedMenu.value = menu;
    const nextMenuIndex = menus.value.findIndex(item => item.id === menu.id) + 1;
    nextMenu.value = nextMenuIndex < menus.value.length ? menus.value[nextMenuIndex] : null;
    emit('goToNext', nextMenu.value); // Pass the value of nextMenu
    currentScreeningComponent.value = componentMap[menu.name];
};

// Initialize selected menu on component mount
onMounted(() => {
    const savedMenus = JSON.parse(localStorage.getItem('selectedTools'));
    if (savedMenus) {
        menus.value = savedMenus.map(menu => ({ ...menu, completed: false }));
        selectedMenu.value = menus.value[0];
    } else {
        console.log('No menu saved');
    }
});

// Watch for changes in selected menu and save to local storage
watch(selectedMenu, (newValue) => {
    localStorage.setItem('selectedMenu', JSON.stringify([newValue])); // Store selected menu as an array
});

const handleChangeComponent = (nextMenuName) => {
    const selectedToolsStr = localStorage.getItem('selectedTools');
    if (!selectedToolsStr) return console.error('selectedTools is not available in local storage');

    const selectedTools = JSON.parse(selectedToolsStr);
    const index = selectedTools.findIndex(tool => tool.name === nextMenuName);

    let nextToolName;
    if (index !== -1 && index < selectedTools.length - 1) nextToolName = selectedTools[index + 1].name;
    else {
        Swal.fire({
            icon: 'question',
            title: 'All tests have been completed',
            text: 'Do you wish to proceed to submission?',
            showCancelButton: true,
            confirmButtonText: 'Yes, submit',
            cancelButtonText: 'No, not yet'
        }).then((result) => {
            if (result.isConfirmed) {
                submitAssessments();
            }
        });
        return;
    }

    if (!componentMap[nextToolName]) return console.error(`Component corresponding to ${nextToolName} is not available`);

    // Mark the previous menu as completed
    if (selectedMenu.value) {
        const completedMenuIndex = menus.value.findIndex(menu => menu.id === selectedMenu.value.id);
        if (completedMenuIndex !== -1) {
            menus.value[completedMenuIndex].completed = true;
        }
    }

    // Update selectedMenu to the next menu
    const nextMenu = menus.value.find(menu => menu.name === nextToolName);
    selectedMenu.value = nextMenu;

    currentScreeningComponent.value = componentMap[nextToolName];
};

const submitAssessments = () => {
    // Perform fake submission (replace with actual submission logic)
    setTimeout(() => {
        // Show success message
        Swal.fire({
            icon: 'success',
            title: 'Assessments Submitted Successfully',
            text: 'Thank you for submitting the assessments.',
            confirmButtonText: 'OK'
        }).then(() => {
            // Redirect to "/counselor-dashboard"
            router.push('/counselor-dashboard');
        });
    }, 1000); // Simulating a delay for submission
};


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