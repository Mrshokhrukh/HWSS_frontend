<template>
    <div class="chat-widget card" v-if="isOpen">
        <div class="chat-header">
            <span>Chat Widget</span>
            <div class="header-icons">
                <span @click="minimizeChat" class="fa fa-minus me-3"></span>
            </div>
        </div>
        <div class="chat-messages p-4">
            <!-- Initial info message for user to input alias -->
            <div class="message received" v-if="!aliasInput">
                <p>Hi There, Please input a nick name for the other person to call you.</p>
            </div>
            <!-- Thank you message after alias is input -->
            <div class="message received" v-if="aliasInput && !agentJoined">
                <p>Thank you! Please wait until one of our agents joins in to start the conversation with you...</p>
            </div>
            <!-- Agent joined message -->
            <div class="message received" v-if="agentJoined && !defaultMessageShown">
                <p>{{ agentName }} has joined the chat.</p>
            </div>
            <!-- Display typing indicator when agent is typing -->
            <div v-if="showTypingIndicator" class="typing-indicator">{{ agentName }} is typing...</div>
            <!-- Default welcome message after agent joins -->
            <div class="message received" v-if="defaultMessageShown">
                <p>Hi {{ userAlias }}, welcome to HWSS chat. How can I help?</p>
            </div>
            <!-- Display messages -->
            <div v-for="(message, index) in messages" :key="index"
                :class="{ 'message': true, 'sent': message.sentByUser, 'received': !message.sentByUser }">
                <p>{{ message.text }}</p>
            </div>
        </div>
        <!-- Input field and send button -->
        <div class="chat-footer">
            <input type="text" v-model="newMessage" placeholder="Type your message here..." @keyup.enter="sendMessage" />
            <button @click="sendMessage"><img :src="sendIcon" alt="Send" /></button>
        </div>
    </div>
</template>
  
<script setup>
import { ref } from 'vue'
import sendIcon from '@/assets/images/send.png'

const emit = defineEmits(['minimize', 'close'])
const { isOpen } = defineProps(['isOpen'])

const messages = ref([])
const newMessage = ref('')
const showTypingIndicator = ref(false)
const aliasInput = ref(false)
const agentJoined = ref(false)
const defaultMessageShown = ref(false)
const agentName = ref('')
const userAlias = ref('')

// Improved responsesDictionary with some phrases
const responsesDictionary = {
    "hi": "Hello! How can I assist you today?",
    "hello": "Hi there! How can I help you?",
    "how are you": "I'm doing well, thanks for asking! How can I be of service?",
    "what's up": "Not much, just here to chat with you!",
    "can you help me with": "Sure, I can help you with a few things. What would you like to know?",
    "?": "That's an interesting question! Let me know if you need assistance with anything else."
}

const minimizeChat = () => {
    emit('minimize')
}

const sendMessage = () => {
    if (!aliasInput.value) {
        userAlias.value = newMessage.value.trim();
        aliasInput.value = true;
        newMessage.value = '';
    } else {
        if (newMessage.value.trim() !== '') {
            messages.value.push({ text: newMessage.value, sentByUser: true });
            showTypingIndicator.value = true;
            simulateResponse();
            newMessage.value = '';
        }
    }
}

const simulateResponse = () => {
    setTimeout(() => {
        if (!aliasInput.value) return;
        if (!agentJoined.value) {
            agentJoined.value = true;
            simulateAgentJoin();
        } else {
            defaultMessageShown.value = true;
        }

        const userMessage = newMessage.value.toLowerCase();
        let response = responsesDictionary[userMessage] || "I'm still learning to respond to that.";

        // Check if user's message contains a question mark
        if (userMessage.includes("?")) {
            response = responsesDictionary["?"] || response;
        }

        messages.value.push({ text: response, sentByUser: false });
        showTypingIndicator.value = false;
    }, 3000);
}

const simulateAgentJoin = () => {
    agentName.value = 'Noko';
}

</script>
  
  
<style scoped>
.typing-indicator {
    text-align: center;
    font-style: italic;
    font-size: 12px;
    color: #888;
    margin-top: 20px;
    align-self: flex-start
}

.chat-widget {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 99999;
    width: 300px;
    height: 400px;
    background-color: #fff;
    border: 1px solid #ccc;
    border-radius: 10px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.chat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    background-color: #2B656F;
    color: #fff;
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
}

.chat-header .header-icons {
    display: flex;
    gap: 10px;
    cursor: pointer;
}

.chat-messages {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: calc(100% - 100px);
    overflow-y: auto;
    padding: 10px;
}

.message {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    margin-bottom: 10px;
}

.message p {
    padding: 10px;
    border-radius: 10px;
}

.received {
    background-color: #2B656F;
    align-self: flex-start;
    color: #fff;
    border-radius: 20px 20px 20px 2px;
    max-width: 70%;
}

.sent {
    background-color: #D3D3D3;
    align-self: flex-end;
    color: #000;
    border-radius: 20px 20px 2px 20px;
    max-width: 70%;
}

.chat-footer {
    display: flex;
    align-items: center;
    padding: 10px;
    border-top: 1px solid #ccc;
}

.chat-footer input[type="text"] {
    flex: 1;
    padding: 10px;
    border: 2px solid #e3e3e3;
    border-radius: 5px;
    margin-right: 10px;
}

.chat-footer button {
    border: none;
    cursor: pointer;
    width: 40px;
    background: transparent;
}

.chat-footer button img {
    width: 100%;
}
</style>
  