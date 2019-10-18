import Vue from 'vue'
import Vuex from 'vuex'

import ethers from './ethers'
import gnosis from './gnosis'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    ethers,
    gnosis
  }
})

store.dispatch('ethers/init')

export default store
