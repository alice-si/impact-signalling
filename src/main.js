// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import VueMaterial from 'vue-material'
import 'vue-material/dist/vue-material.css'
import 'vue-material/dist/theme/default.css'
import store from './store'
import Vuex from 'vuex'
import ApolloClient from "apollo-boost";
import VueApollo from "vue-apollo";


Vue.config.productionTip = false;

Vue.use(VueMaterial)
Vue.use(Vuex)
Vue.use(VueApollo);

const client = new ApolloClient({
  uri: "https://api.stage.alice.si/graphql/",
  connectToDevTools: true
});

const apolloProvider = new VueApollo({
  defaultClient: client
});




/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  router,
  provide: apolloProvider.provide(),
  components: { App },
  template: '<App/>'
})


