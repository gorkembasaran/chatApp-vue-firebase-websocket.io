<template>
  <div class="chat-feature none">
    <div class="groupName">
      Chat:
    </div>
    <div class="chatHistory">
      <div v-for="message in allMessages" :key="message.date">
        <div class="messages" :style="{ background: messageColor(message) }">
          <strong class="message">{{ message.username }}:</strong> {{ message.message }}
        </div>
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
      username: localStorage.getItem('username'),
      message: '', // Kullanıcının girdiği mesajı saklamak için veri
      socket: null // Socket.IO bağlantısını tutmak için değişken
    };
  },
  computed: {
    ...mapGetters(['allMessages']) // Vuex'den tüm mesajları almak için
  },
  methods: {
    ...mapActions(['sendMessages']), // Vuex eylemlerini kullanmak için
    initializeSocket() {
      // Socket.IO bağlantısını başlatmak için
      this.socket = io('http://172.20.10.2:8080');

      // Sunucudan chat geçmişini almak için
      this.socket.on('chatHistory', (messages) => {
        this.$store.commit('SET_MESSAGES', messages); // Vuex'deki mesajları günceller
      });

      // Yeni bir mesaj alındığında
      this.socket.on('newMessage', (message) => {
        this.$store.commit('ADD_MESSAGE', message); // Vuex'deki mesajları günceller
      });

      // Bağlantı başarılı olduğunda
      this.socket.on('connect', () => {
        console.log('Socket.IO connection opened'); // Konsola bağlantı başarılı mesajı yazdırılır
      });

      // Bağlantı kesildiğinde
      this.socket.on('disconnect', () => {
        console.log('Socket.IO connection closed'); // Konsola bağlantı kesildi mesajı yazdırılır
      });

      // Hata oluştuğunda
      this.socket.on('error', (error) => {
        console.error('Socket.IO error', error); // Konsola hata mesajı yazdırılır
      });
    },
    sendMessage() {
      // Gönderilecek mesajın verisi hazırlanır
      const messageData = {
        username: localStorage.getItem('username'), // Kullanıcı adı localStorage'dan alınır
        message: this.message // Kullanıcının girdiği mesaj
      };

      // Socket.IO bağlantısı açıksa
      if (this.socket && this.socket.connected) {
        // sendMessage olayı tetiklenir ve mesaj gönderilir
        this.socket.emit('sendMessage', messageData);
        this.message = ''; // Mesaj gönderildikten sonra giriş kutusu temizlenir
      } else {
        console.error('Socket.IO connection is not open'); // Hata mesajı yazdırılır
      }
    },
    messageColor(message) {
      return this.username === message.username ? '#c6d5e0cd' : '#4f8db93f';
    }
  },
  mounted() {
    // Socket.IO bağlantısını başlatmak için
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
    background-color: #3a524e45;
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
    background-color: #c6d5e0cd;
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
  .colorBlack{
    color: #13e4c26b;
  }
  </style>
  