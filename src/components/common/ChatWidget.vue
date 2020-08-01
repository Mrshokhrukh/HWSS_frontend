<template>
    <div v-if="showWidget" class="chat-widget-container">
        <!-- Chat Widget Icon -->
        <div v-if="isStudent || isPublic" class="chat-icon" :class="{ 'active': isChatOpen }" @click="toggleChat">
            <i class="bi bi-chat-dots-fill"></i>
        </div>

        <!-- Chat Widget -->
        <div v-if="isStudent || isPublic" class="chat-widget card shadow" v-show="isChatOpen">
            <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                <span>Chat with HWSS</span>
                <div>
                    <i class="bi bi-dash-lg me-2" @click="minimizeChat"></i>
                    <i class="bi bi-x-lg" @click="closeChat"></i>
                </div>
            </div>
            <div class="card-body chat-messages">
                <div v-for="(message, index) in messages" :key="index" :class="getMessageClass(message)">
                    <p>{{ message.text }}</p>
                </div>
                <div v-if="showCounselorLink" class="message received">
                    <p>If you'd like to proceed with chatting, we have a dedicated platform to chat with a real
                        counselor anonymously.
                        <a href="https://thepemachat.gov.bt" target="_blank"
                            class="btn btn-sm btn-outline-primary mt-2">Chat with a Counselor</a>
                    </p>
                </div>
            </div>
            <div class="card-footer">
                <div class="input-group">
                    <input type="text" class="form-control" v-model="newMessage" @keyup.enter="sendMessage"
                        placeholder="Type your message...">
                    <button class="btn btn-primary" @click="sendMessage">
                        <i class="bi bi-send-fill"></i>
                    </button>
                </div>
            </div>
        </div>

        <!-- Message for admins and counselors -->
        <div v-if="isAdmin || isCounselor" class="chat-unavailable alert alert-info">
            <i class="bi bi-info-circle me-2"></i>
            Chat feature is not available for admins and counselors.
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const showWidget = ref(true)
const isChatOpen = ref(false)
const messages = ref([])
const newMessage = ref('')
const messageCount = ref(0)
const showCounselorLink = ref(false)

// User type flags (you'll need to implement the logic to set these based on your authentication system)
const isStudent = ref(true) // Placeholder, set this based on your auth logic
const isPublic = ref(false) // Placeholder, set this based on your auth logic
const isAdmin = ref(false) // Placeholder, set this based on your auth logic
const isCounselor = ref(false) // Placeholder, set this based on your auth logic

const toggleChat = () => {
    isChatOpen.value = !isChatOpen.value
    if (isChatOpen.value && messages.value.length === 0) {
        messages.value.push({ text: "Kuzu zangpo La! I am The PEMA ChatBot. How can I assist you today?", sentByUser: false })
    }
}

const minimizeChat = () => {
    isChatOpen.value = false
}

const closeChat = () => {
    isChatOpen.value = false
    messages.value = []
    messageCount.value = 0
    showCounselorLink.value = false
}

const getMessageClass = (message) => {
    return {
        'message': true,
        'sent': message.sentByUser,
        'received': !message.sentByUser
    }
}

const sendMessage = () => {
    if (newMessage.value.trim() !== '') {
        messages.value.push({ text: newMessage.value, sentByUser: true })
        newMessage.value = ''
        messageCount.value++

        if (messageCount.value === 1) {
            setTimeout(() => {
                messages.value.push({ text: "I'm still learning and may not have all the answers. Is there anything specific you'd like to know?", sentByUser: false })
            }, 1000)
        } else if (messageCount.value === 2) {
            setTimeout(() => {
                showCounselorLink.value = true
            }, 1000)
        }
    }
}

onMounted(() => {
    watch(() => route.path, (newPath) => {
        const lowercasePath = newPath.toLowerCase()
        showWidget.value = lowercasePath.includes('public-dashboard') || lowercasePath.includes('student-dashboard')
    }, { immediate: true })
})
</script>

<style scoped>
.chat-widget-container {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 9999;
}

.chat-icon {
    width: 60px;
    height: 60px;
    background-color: #007bff;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    transition: all 0.3s ease;
}

.chat-icon:hover {
    transform: scale(1.1);
}

.chat-icon i {
    font-size: 24px;
    color: white;
}

.chat-widget {
    width: 350px;
    height: 500px;
    position: absolute;
    bottom: 80px;
    right: 0;
}

.chat-messages {
    height: 380px;
    overflow-y: auto;
    padding: 15px;
}

.message {
    max-width: 80%;
    margin-bottom: 15px;
    padding: 10px 15px;
    border-radius: 20px;
    line-height: 1.4;
}

.sent {
    background-color: #007bff;
    color: white;
    align-self: flex-end;
    margin-left: auto;
    border-bottom-right-radius: 5px;
}

.received {
    background-color: #f0f0f0;
    color: #333;
    align-self: flex-start;
    border-bottom-left-radius: 5px;
}

.card-header i {
    cursor: pointer;
    transition: color 0.3s ease;
}

.card-header i:hover {
    color: #ccc;
}

.chat-unavailable {
    position: fixed;
    bottom: 20px;
    right: 20px;
    max-width: 300px;
}

@keyframes float {
    0% {
        transform: translateY(0px);
    }

    50% {
        transform: translateY(-10px);
    }

    100% {
        transform: translateY(0px);
    }
}

.chat-icon {
    animation: float 3s ease-in-out infinite;
}
</style>