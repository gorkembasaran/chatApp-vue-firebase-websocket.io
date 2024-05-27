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
      messages: [] // Ensure this is an array
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
    initAuth({ commit, dispatch }) {
      const token = localStorage.getItem('token');
      if (token) {
        const expirationDate = localStorage.getItem('expirationDate');
        const time = new Date().getTime();
        if (+expirationDate <= time) {
          dispatch('logout');
        } else {
          commit('setToken', token);
          const timerSecond = +expirationDate - time;
          dispatch('setTimeoutTimer', timerSecond);
          dispatch('fetchUserData');
          router.push('/');
        }
      } else {
        router.push('/login');
      }
    },
    login({ commit, dispatch, state }, authData) {
      const authLink = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${state.apiKey}`;
      return axios.post(authLink, {
        email: authData.email,
        password: authData.password,
        returnSecureToken: true
      })
      .then(response => {
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
      })
      .catch(error => {
        console.error('Error during login:', error);
      });
    },
    register({ commit, state }, authData) {
      return axios.post(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${state.apiKey}`, {
        email: authData.email,
        password: authData.password,
        returnSecureToken: true
      })
      .then(response => {
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
        console.error('Error during sign up:', error);
      });
    },
    logout({ commit }) {
      commit('clearToken');
      commit('clearUser');
      localStorage.removeItem('token');
      localStorage.removeItem('expirationDate');
      localStorage.removeItem('email');
      router.replace('/login');
    },
    setTimeoutTimer({ dispatch }, expiresIn) {
      setTimeout(() => {
        dispatch('logout');
      }, expiresIn);
    },
    async fetchUserData({ commit }) {
      const email = localStorage.getItem('email');
      if (!email) {
        return;
      }
      try {
        const response = await axios.get('users.json');
        const data = Object.values(response.data);
        const user = data.find(user => user.email === email);
        if (user) {
          commit('setUser', user);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    },
    fetchMessages({ commit }) {
      return axios.get('messages.json')
        .then(response => {
          const messagesArray = Object.values(response.data || {});
          commit('SET_MESSAGES', messagesArray);
        })
        .catch(error => {
          console.error("Error fetching messages:", error);
        });
    },
    sendMessages({ commit }, messageData) {
      return axios.post('messages.json', {
        username: messageData.username,
        message: messageData.message,
        date: new Date().toLocaleString()
      })
      .then(response => {
        commit('ADD_MESSAGE', {
          username: messageData.username,
          message: messageData.message,
          date: new Date().toLocaleString()
        });
        console.log(response);
      })
      .catch(error => {
        console.error("Error sending message:", error);
      });
    },
    initializeSocket({ commit }) {
      const socket = io('http://172.20.10.2:3131');
      socket.on('chatHistory', (messages) => {
        const messagesArray = Object.values(messages);
        commit('SET_MESSAGES', messagesArray);
      });
      socket.on('newMessage', (message) => {
        commit('ADD_MESSAGE', message);
      });
      socket.on('connect', () => {
        console.log('Socket.IO connection opened');
      });
      socket.on('disconnect', () => {
        console.log('Socket.IO connection closed');
      });
      socket.on('error', (error) => {
        console.error('Socket.IO error', error);
      });
    }
  },
  getters: {
    isAuthenticated(state) {
      return state.token !== '';
    },
    allMessages: state => state.messages,
  }
});

export default store;
