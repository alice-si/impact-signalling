import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/pages/HelloWorld'
import Admin from '@/pages/Admin'
import Users from '@/pages/Users'
import Markets from '@/pages/Markets'

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Home',
      component: HelloWorld
    },
    {
      path: "/users",
      name: "Users",
      component: Users
    },
    {
      path: "/markets",
      name: "Markets",
      component: Markets
    },
    {
      path: "/monitor",
      name: "Monitor",
      component: Admin
    },
    {
      path: "/trade",
      name: "Trade",
      component: Admin
    },
  ]
})
