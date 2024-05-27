import { createRouter, createWebHistory } from "vue-router";
import HomePage from '../components/HomePage.vue'
import LoginPage from '../components/LoginPage.vue'
import RegisterPage from '../components/RegisterPage.vue'
import store from "@/store/store";

const routes = [
  {
    path: '/',
    name: 'HomePage',
    component: HomePage,
    beforeEnter(to, from, next){
      if(store.getters.isAuthenticated){
        next()
      }else {
        next("/login")
      }
    }
  },
  {
    path: '/login',
    name: 'LoginPage',
    component: LoginPage
  },
  {
    path: '/register',
    name: 'RegisterPage',
    component: RegisterPage
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router;

