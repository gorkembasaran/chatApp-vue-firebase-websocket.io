import { createApp } from 'vue'
import App from './App.vue'
import store from './store/store'
import router from './router/router'
import axios from 'axios'

axios.defaults.baseURL = "https://chatapp-a4449-default-rtdb.firebaseio.com/"


export const app = createApp(App);
app.use(store);
app.use(router);
app.provide('axios', axios);
app.mount('#app');
