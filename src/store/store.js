import { createStore } from 'vuex';
import axios from 'axios';
import router from '@/router/router';
import io from 'socket.io-client';

const store = createStore({
  state() {
    return {
      token: '',
      apiKey: 'AIzaSyCY6h70AQznSLGmy7pIE_12gg_T0Vbs5CM',
      user: null,
      email: '',
      username: localStorage.getItem('username') || '',
      messages: []
    };
  },
  mutations: {
    setToken(state, token) {
      state.token = token;
    },
    clearToken(state) {
      state.token = '';
    },
    setUser(state, user) {
      state.user = user;
      if (user.username) {
        state.username = user.username;
        localStorage.setItem('username', user.username);
      }
    },
    clearUser(state) {
      state.user = null;
      state.username = '';
      localStorage.removeItem('username');
    },
    setUserId(state, userId) {
      if (!state.user) {
        state.user = {};
      }
      state.user.localId = userId;
    },
    setIsMember(state, isMember) {
      state.isMember = isMember;
    },
    ADD_MESSAGE(state, message) {
      state.messages.push(message);
    },
    SET_MESSAGES(state, messages) {
      state.messages = messages;
    }
  },
  actions: {
    // Bu fonksiyon, kullanıcının oturumunu başlatırken veya sayfa yenilendiğinde çağrılır.
    // Kullanıcının tarayıcı belleğinde geçerli bir token varsa ve bu token geçerliyse,
    // kullanıcının oturumu başlatılır, kullanıcı verileri alınır ve kullanıcı yönlendirilir.
    // Aksi takdirde, kullanıcı giriş sayfasına yönlendirilir.
    initAuth({ commit, dispatch }) {
      // LocalStorage'dan token alınır.
      const token = localStorage.getItem('token');
      if (token) {
        // Token varsa ve geçerliyse
        const expirationDate = localStorage.getItem('expirationDate');
        const time = new Date().getTime();
        if (+expirationDate <= time) {
          // Token geçerliliğini yitirmişse
          dispatch('logout');
        } else {
          // Token hala geçerliyse
          commit('setToken', token);
          const timerSecond = +expirationDate - time;
          dispatch('setTimeoutTimer', timerSecond);
          dispatch('fetchUserData');
          router.push('/');
        }
      } else {
        // Token yoksa veya geçerli değilse
        router.push('/login');
      }
    },
    // Bu fonksiyon, kullanıcının oturum açma işlemini gerçekleştirir.
    // Kullanıcının sağladığı kimlik bilgilerini kullanarak kimlik doğrulaması yapar
    // ve ardından kullanıcı bilgilerini ve token'ı saklar.
    login({ commit, dispatch, state }, authData) {
      const authLink = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${state.apiKey}`;
      return axios.post(authLink, {
        email: authData.email,
        password: authData.password,
        returnSecureToken: true
      })
      .then(response => {
        // Başarılı bir şekilde oturum açıldığında yapılacak işlemler
        commit('setToken', response.data.idToken);
        localStorage.setItem('email', authData.email);
        commit('setUser', {
          email: authData.email,
          localId: response.data.localId
        });
        localStorage.setItem('token', response.data.idToken);
        localStorage.setItem('expirationDate', new Date().getTime() + +response.data.expiresIn * 1000);
        dispatch('setTimeoutTimer', +response.data.expiresIn * 1000);
        dispatch('fetchUserData');
        setTimeout(()=>{
          location.reload()
        },1300)
      })
      .catch(error => {
        // Oturum açma sırasında bir hata oluştuğunda yapılacak işlemler
        console.error('Error during login:', error);
      });
    },
    // Bu fonksiyon, yeni bir kullanıcı oluşturur.
    // Kullanıcı sağladığı kimlik bilgileriyle bir hesap oluşturur ve oturum açar.
    register({ commit, state }, authData) {
      return axios.post(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${state.apiKey}`, {
        email: authData.email,
        password: authData.password,
        returnSecureToken: true
      })
      .then(response => {
        // Başarılı bir şekilde kayıt olduğunda yapılacak işlemler
        const localId = response.data.localId;
        commit('setUser', {
          email: authData.email,
          localId: localId,
          username: authData.username
        });
        return axios.post(`users.json`, {
          email: authData.email,
          password: authData.password,
          username: authData.username,
          localId: localId
        });
      })
      .catch(error => {
        // Kayıt sırasında bir hata oluştuğunda yapılacak işlemler
        console.error('Error during sign up:', error);
      });
    },
    // Bu fonksiyon, kullanıcının oturumunu sonlandırır.
    logout({ commit }) {
      // State'teki token ve kullanıcı bilgileri temizlenir.
      commit('clearToken');
      commit('clearUser');
      // LocalStorage'dan token ve kullanıcı bilgileri kaldırılır.
      localStorage.removeItem('token');
      localStorage.removeItem('expirationDate');
      localStorage.removeItem('email');
      // Kullanıcıyı giriş sayfasına yönlendirilir.
      router.replace('/login');
    },
    // Bu fonksiyon, belirtilen süre sonunda oturumu sonlandırmak için bir zamanlayıcı başlatır.
    setTimeoutTimer({ dispatch }, expiresIn) {
      setTimeout(() => {
        dispatch('logout');
      }, expiresIn);
    },
    // Bu fonksiyon, kullanıcıya ait verileri alır ve state'e kaydeder.
    async fetchUserData({ commit }) {
      const email = localStorage.getItem('email');
      if (!email) {
        return;
      }
      try {
        // Kullanıcı verilerini almak için API isteği yapılır.
        const response = await axios.get('users.json');
        const data = Object.values(response.data);
        // LocalStorage'da saklanan e-posta adresine sahip kullanıcı bulunur.
        const user = data.find(user => user.email === email);
        if (user) {
          // Kullanıcı bulunduysa, kullanıcı bilgileri state'e kaydedilir.
          commit('setUser', user);
          localStorage.setItem('username', user.username);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    },
    // Bu fonksiyon, mesajı göndermek için bir API isteği yapar ve gönderilen mesajı state'e ekler.
    sendMessages({ commit }, messageData) {
      return axios.post('messages.json', {
        username: messageData.username,
        message: messageData.message,
        date: new Date().toLocaleString()
      })
      .then(response => {
        // Mesaj başarıyla gönderildiğinde yapılacak işlemler
        commit('ADD_MESSAGE', {
          username: messageData.username,
          message: messageData.message,
          date: new Date().toLocaleString()
        });
        console.log(response);
      })
      .catch(error => {
        // Mesaj gönderme sırasında bir hata oluştuğunda yapılacak işlemler
        console.error("Error sending message:", error);
      });
    },
    initializeSocket({ commit }) {
      // Socket.IO bağlantısı oluşturulur
      const socket = io('http://localhost:8080/');
    
      // Sunucudan alınan tüm sohbet geçmişini Vuex state'ine kaydeden olay dinleyicisi
      socket.on('chatHistory', (messages) => {
        const messagesArray = Object.values(messages);
        commit('SET_MESSAGES', messagesArray);
      });
    
      // Sunucudan gelen yeni mesajları Vuex state'ine ekleyen olay dinleyicisi
      socket.on('newMessage', (message) => {
        commit('ADD_MESSAGE', message);
      });
    
      // WebSocket bağlantısı başarılı bir şekilde açıldığında tetiklenen olay
      socket.on('connect', () => {
        console.log('Socket.IO connection opened');
      });
    
      // WebSocket bağlantısı kesildiğinde tetiklenen olay
      socket.on('disconnect', () => {
        console.log('Socket.IO connection closed');
      });
    
      // WebSocket bağlantısında herhangi bir hata oluştuğunda tetiklenen olay
      socket.on('error', (error) => {
        console.error('Socket.IO error', error);
      });
    }    
  },
  getters: {
    // Kullanıcının oturum açıp açılmadığını belirleyen bir getter
    isAuthenticated(state) {
      return state.token !== '';
    },
    // Vuex state'indeki tüm mesajları döndüren bir getter
    allMessages: state => state.messages,
  }  
});

export default store;
