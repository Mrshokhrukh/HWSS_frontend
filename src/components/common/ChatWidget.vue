<template>
    <div class="chat-widget card" v-if="isOpen">
        <div class="chat-header">
            <span>Chat Widget</span>
            <div class="header-icons">
                <span @click="minimizeChat" class="text-lg">&#8211;</span> <span @click="closeChat">&times;</span>
            </div>
        </div>
        <div class="chat-messages p-4">
            <div class="message received">
                <p>Hello, how can I help you today?</p>
            </div>
            <div v-for="(message, index) in messages" :key="index"
                :class="{ 'message': true, 'sent': message.sentByUser, 'received': !message.sentByUser }">
                <p>{{ message.text }}</p>
            </div>
            <div v-if="showTypingIndicator" class="typing-indicator">Nado is typing...</div>
        </div>
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
    emit('minimize') // Emit event to parent
}

const closeChat = () => {
    emit('close') // Emit event to parent
}

const sendMessage = () => {
    if (newMessage.value.trim() !== '') {
        messages.value.push({ text: newMessage.value, sentByUser: true });
        showTypingIndicator.value = true;
        simulateResponse();
        newMessage.value = '';
    }
}

const simulateResponse = () => {
    setTimeout(() => {
        const userMessage = newMessage.value.toLowerCase();
        let response = "I'm still under development and learning.";

        // Improved matching logic using regular expressions
        const greetings = /^(hi|hello|hey)/;
        const questions = /.*\?$/;

        // Check for greetings first
        if (greetings.test(userMessage)) {
            response = responsesDictionary[userMessage.match(greetings)[0]];
        } else {
            // Then check for questions   
            if (questions.test(userMessage)) {
                response = responsesDictionary["?"] || response;
            } else {
                // Finally, check for keywords in the dictionary
                const words = userMessage.split(' ');
                for (const word of words) {
                    // eslint-disable-next-line no-prototype-builtins
                    if (responsesDictionary.hasOwnProperty(word)) {
                        response = responsesDictionary[word];
                        break;
                    }
                }
            }
        }

        messages.value.push({ text: response, sentByUser: false });
        showTypingIndicator.value = false;
    }, 1000);
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
  