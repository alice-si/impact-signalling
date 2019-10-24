import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/pages/HelloWorld'
import Admin from '@/pages/Admin'
import Users from '@/pages/Users'

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'HelloWorld',
      component: HelloWorld
    },
    {
      path: "/admin",
      name: "Admin",
      component: Admin
    },
    {
      path: "/users",
      name: "Users",
      component: Users
    },
    {
      path: "/markets",
      name: "Markets",
      component: Admin
    }
  ]
})
