<template>
    <div id="app">
        <div class="aggregates">
            <h3>Aggregates</h3>
            <table>
                <thead>
                    <tr>
                        <th>Field</th>
                        <th>Count</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>RESCREENIN COUNT</td>
                        <td>{{ getTotal('rescreeningCount') }}</td>
                    </tr>
                    <tr>
                        <td>Counseling</td>
                        <td>
                            <ul>
                                <li v-for="item in getCounselingCounts()" :key="item.counseling">
                                    {{ item.counseling }}: {{ item.count }}
                                </li>
                            </ul>
                        </td>
                    </tr>
                    <tr>
                        <td>ASSESSMENT</td>
                        <td>
                            <ul>
                                <li v-for="item in getAssessmentCounts()" :key="item.assessment">
                                    {{ item.assessment }}: {{ item.count }}
                                </li>
                            </ul>
                        </td>
                    </tr>
                    <tr>
                        <td>FOLLOW-UP</td>
                        <td>
                            <ul>
                                <li v-for="item in getFollowUpCounts()" :key="item.followUp">
                                    {{ item.followUp }}: {{ item.count }}
                                </li>
                            </ul>
                        </td>
                    </tr>
                    <tr>
                        <td>CASE STATUS</td>
                        <td>
                            <ul>
                                <li v-for="item in getCaseStatusCounts()" :key="item.caseStatus">
                                    {{ item.caseStatus }}: {{ item.count }}
                                </li>
                            </ul>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';

const data = ref([
    {
        rescreeningCount: 5,
        counseling: 'Availed',
        assessment: 'Conducted',
        followUp: 'Treatment completed',
        caseStatus: 'Open'
    },
    {
        rescreeningCount: 2,
        counseling: 'Not required',
        assessment: 'Not conducted',
        followUp: 'Undergoing treatment',
        caseStatus: 'Closed'
    },
    {
        rescreeningCount: 7,
        counseling: 'Waiting list',
        assessment: 'Conducted',
        followUp: 'Completed counselling sessions',
        caseStatus: 'Open'
    },
    {
        rescreeningCount: 3,
        counseling: 'Availed',
        assessment: 'Conducted',
        followUp: 'Undergoing counselling',
        caseStatus: 'Open'
    },
    {
        rescreeningCount: 1,
        counseling: 'Availed',
        assessment: 'Not conducted',
        followUp: 'Unwilling to undergo treatment (Severity in mental health and SUD)',
        caseStatus: 'Closed'
    },
    {
        rescreeningCount: 4,
        counseling: 'Not required',
        assessment: 'Conducted',
        followUp: 'Undergone Rehabilitation',
        caseStatus: 'Open'
    },
    {
        rescreeningCount: 6,
        counseling: 'Waiting list',
        assessment: 'Conducted',
        followUp: 'Undergoing Rehabilitation',
        caseStatus: 'Open'
    },
    {
        rescreeningCount: 8,
        counseling: 'Availed',
        assessment: 'Conducted',
        followUp: 'Hospital-based Outpatient SUD Treatment and Care (Primary Phase)',
        caseStatus: 'Open'
    },
    {
        rescreeningCount: 9,
        counseling: 'Not required',
        assessment: 'Conducted',
        followUp: 'Hospital-based Outpatient SUD Treatment and Care (Continuing Care)',
        caseStatus: 'Open'
    },
    {
        rescreeningCount: 10,
        counseling: 'Waiting list',
        assessment: 'Conducted',
        followUp: 'School-based SUD Treatment and Care',
        caseStatus: 'Open'
    },
    {
        rescreeningCount: 11,
        counseling: 'Availed',
        assessment: 'Conducted',
        followUp: 'Institution-based SUD Treatment and Care',
        caseStatus: 'Open'
    },
    {
        rescreeningCount: 12,
        counseling: 'Not required',
        assessment: 'Conducted',
        followUp: 'Follow up Drug Test Conducted',
        caseStatus: 'Open'
    },
    {
        rescreeningCount: 13,
        counseling: 'Waiting list',
        assessment: 'Conducted',
        followUp: 'Detention-based SUD Treatment and Care',
        caseStatus: 'Open'
    }
]);

const getCount = (field) => {
    const counts = {};
    data.value.forEach((item) => {
        const value = item[field];
        counts[value] = counts[value] ? counts[value] + 1 : 1;
    });
    return Object.entries(counts).map(([key, value]) => ({ [key]: value }));
};

const getTotal = (field) => {
    const total = data.value.reduce((acc, item) => acc + item[field], 0);
    return `Total: ${total}`;
};

const getCounselingCounts = () => {
    const counts = {};
    data.value.forEach((item) => {
        const value = item['counseling'];
        counts[value] = counts[value] ? counts[value] + 1 : 1;
    });
    return Object.entries(counts).map(([counseling, count]) => ({ counseling, count }));
};

const getAssessmentCounts = () => {
    const counts = {};
    data.value.forEach((item) => {
        const value = item['assessment'];
        counts[value] = counts[value] ? counts[value] + 1 : 1;
    });
    return Object.entries(counts).map(([assessment, count]) => ({ assessment, count }));
};

const getFollowUpCounts = () => {
    const counts = {};
    data.value.forEach((item) => {
        const value = item['followUp'];
        counts[value] = counts[value] ? counts[value] + 1 : 1;
    });
    return Object.entries(counts).map(([followUp, count]) => ({ followUp, count }));
};

const getCaseStatusCounts = () => {
    const counts = {};
    data.value.forEach((item) => {
        const value = item['caseStatus'];
        counts[value] = counts[value] ? counts[value] + 1 : 1;
    });
    return Object.entries(counts).map(([caseStatus, count]) => ({ caseStatus, count }));
};
</script>

<style scoped>
.aggregates {
    margin-top: 20px;
}

.aggregates table {
    width: 100%;
    border-collapse: collapse;
}

.aggregates th,
.aggregates td {
    border: 1px solid #000;
    padding: 8px;
    text-align: left;
}

.aggregates th {
    background-color: hsl(107, 63%, 52%);
}

.aggregates ul {
    list-style-type: none;
    padding: 0;
}

.aggregates li {
    margin-bottom: 4px;
}
</style>
