import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/pages/Home'
import Admin from '@/pages/Admin'
import Users from '@/pages/Users'
import Markets from '@/pages/Markets'
import Monitor from '@/pages/Monitor'
import Trade from '@/pages/Trade'

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
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
      component: Monitor
    },
    {
      path: "/trade",
      name: "Trade",
      component: Trade
    },
    {
      path: "/admin",
      name: "Admin",
      component: Admin
    },
  ]
})
