<template>
  <div class="chat-feature none">
    <div class="groupName">
      Chat:
    </div>
    <div class="chatHistory">
      <div class="messages" v-for="message in allMessages" :key="message.date">
        <strong class="message">{{ message.username }}:</strong> {{ message.message }}
      </div>
    </div>
    <div class="chatInput">
      <input class="textInput" @keyup.enter="sendMessage" v-model="message" placeholder="Mesajınızı yazın..." />
      <button class="textButton" @click="sendMessage">Gönder</button>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import io from 'socket.io-client';

export default {
  data() {
    return {
      message: '',
      socket: null
    };
  },
  computed: {
    ...mapGetters(['allMessages'])
  },
  methods: {
    ...mapActions(['sendMessages']),
    initializeSocket() {
      this.socket = io('http://172.20.10.2:3131');

      this.socket.on('chatHistory', (messages) => {
        this.$store.commit('SET_MESSAGES', messages);
      });

      this.socket.on('newMessage', (message) => {
        this.$store.commit('ADD_MESSAGE', message);
      });

      this.socket.on('connect', () => {
        console.log('Socket.IO connection opened');
      });

      this.socket.on('disconnect', () => {
        console.log('Socket.IO connection closed');
      });

      this.socket.on('error', (error) => {
        console.error('Socket.IO error', error);
      });
    },
    sendMessage() {
      const messageData = {
        username: localStorage.getItem('username'),
        message: this.message
      };

      if (this.socket && this.socket.connected) {
        this.socket.emit('sendMessage', messageData);
        this.message = ''; // Mesaj gönderildikten sonra giriş kutusunu temizler
      } else {
        console.error('Socket.IO connection is not open');
      }
    }
  },
  mounted() {
    this.$store.dispatch('fetchMessages');
    this.initializeSocket();
  }
};
</script>

<style scoped>
  .chat-feature {
    display: flex;
    flex-direction: column;
    height: 600px;
    width: 80%;
  }
  .groupName {
    font-size: 20px;
    font-weight: bold;
    padding: 10px;
  }
  .chatHistory {
    flex-grow: 1;
    overflow-y: auto;
    padding: 10px;
    background-color: #5bac9e6b;
    border-radius: 20px;
    display: flex;
    width: 100%;
    flex-direction: column;
    justify-content: end;
    align-items: start;
  }
  .messages {
    margin-bottom: 20px;
    margin-left: 10px;
    font-size: 14px;
    background-color: #c5d6d2a0;
    padding: 5px;
    border-radius: 5px;
  }
  .message {
    font-size: 15px;
  }
  .chatInput {
    display: flex;
    width: 100%;
    padding: 10px;
  }
  .textInput {
    flex-grow: 1;
    padding: 10px;
    border-radius: 5px;
    border: 1px solid #ccc;
  }
  .textButton {
    padding: 10px;
    border-radius: 5px;
    border: 1px solid rgba(0, 0, 0, 0.161);
    background-color: rgba(216, 159, 83, 0.497);
    border: 1px solid rgba(0, 0, 0, 0.519);
    transition: background 0.5s ease;
  }
  .textButton:hover {
    background-color: rgba(156, 246, 176, 0.512);
    cursor: pointer;
  }
  </style>
  