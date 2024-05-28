const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

// Express uygulamasını oluşturuyoruz.
const app = express();

// Express uygulamasını http sunucusuna bağlıyoruz.
const server = http.createServer(app);

// Oluşturduğumuz http sunucusu üzerinde Socket.IO bağlantısını kuruyoruz.
const io = socketIo(server, {
  // CORS ayarları. Tüm isteklere herhangi bir kaynaktan izin verilir.
  cors: {
    origin: '*',
  }
});

// Mesajların saklanacağı bir dizi oluşturuyoruz.
let messages = [];

// Bir soket bağlantısı oluşturulduğunda çalışacak fonksiyon.
io.on('connection', (socket) => {
  // Bağlı bir kullanıcı olduğunda konsola bağlantı mesajı yazdırılır.
  console.log('Bir kullanıcı bağlandı');

  // Yeni bir kullanıcı bağlandığında, mevcut mesajları gönderir.
  socket.emit('chatHistory', messages);

  // 'sendMessage' olayı dinlenir ve yeni bir mesaj alındığında çalışır.
  socket.on('sendMessage', (message) => {
    // Alınan mesaj, mesajlar dizisine eklenir.
    messages.push(message);
    // Alınan mesaj, tüm bağlı istemcilere iletilir.
    io.emit('newMessage', message);
  });

  // Kullanıcı bağlantısını kesince çalışacak fonksiyon.
  socket.on('disconnect', () => {
    // Kullanıcı bağlantısı kesildiğinde konsola bağlantı kesildi mesajı yazdırılır.
    console.log('User disconnected');
  });
});

// Sunucunun dinleyeceği port numarası belirlenir.
const PORT = process.env.PORT || 8080;

// Sunucu belirlenen port numarasında dinlemeye başlar.
server.listen(PORT, () => {
  // Sunucunun dinlemeye başladığı port numarası konsola yazdırılır.
  console.log(`Sunucu bu portta dinleniyor : ${PORT}`);
});
