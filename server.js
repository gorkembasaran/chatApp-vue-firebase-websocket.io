// require: Includes and use external modules or files
// const: a keyword used to declare a variable that cannot be reassigned a new value.
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

// Express uygulamasını oluşturuyoruz.
// Creates Express app
const app = express();

// Express uygulamasını http sunucusuna bağlıyoruz.
// Connects Express app to the http server
const server = http.createServer(app);

// Oluşturduğumuz http sunucusu üzerinde Socket.IO bağlantısını kuruyoruz.
// Creates an SocketIO connection on the http server we created
const io = socketIo(server, {
  // CORS ayarları. Tüm isteklere herhangi bir kaynaktan izin verilir.
  // CORS configs. Accepts all requests from a source
  cors: {
    origin: '*',
  }
});

// Mesajların saklanacağı bir dizi oluşturuyoruz.
// Creates an array to store messages
let messages = [];

// Bir soket bağlantısı oluşturulduğunda çalışacak fonksiyon.
// The function that will run when a Socket connection established
io.on('connection', (socket) => {
  // Bağlı bir kullanıcı olduğunda konsola bağlantı mesajı yazdırılır.
  // Print a connection message when a user connects
  console.log('Bir kullanıcı bağlandı');

  // Yeni bir kullanıcı bağlandığında, mevcut mesajları gönderir.
  // Sends the existing messages when a new user connects
  socket.emit('chatHistory', messages);

  // 'sendMessage' olayı dinlenir ve yeni bir mesaj alındığında çalışır.
  // listens 'sendMessage' event and runs when a new message is received
  socket.on('sendMessage', (message) => {
    // Alınan mesaj, mesajlar dizisine eklenir.
    // received message is pushed/added to messages array
    messages.push(message);
    // Alınan mesaj, tüm bağlı istemcilere iletilir.
    // The received message is forwarded to all connected clients.
    io.emit('newMessage', message);
  });

  // Kullanıcı bağlantısını kesince çalışacak fonksiyon.
  // The function that will run when user disconnects
  socket.on('disconnect', () => {
    // Kullanıcı bağlantısı kesildiğinde konsola bağlantı kesildi mesajı yazdırılır.
    // When the user disconnects, a disconnected message is printed on the console.
    console.log('User disconnected');
  });
});

// Sunucunun dinleyeceği port numarası belirlenir.
// Determines The port number that the server will listen to.
const PORT = process.env.PORT || 8080;

// Sunucu belirlenen port numarasında dinlemeye başlar.
// The server starts listening on the specified port number.
server.listen(PORT, () => {
  // Sunucunun dinlemeye başladığı port numarası konsola yazdırılır.
  // The port number on which the server starts listening is printed on the console.
  console.log(`Sunucu bu portta dinleniyor : ${PORT}`);
});
