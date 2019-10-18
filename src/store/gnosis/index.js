/* eslint-disable */
// import getters from './getters';
import actions from './actions';
import mutations from './mutations';

const state = () => ({
  pms: null,
  sTokenBalance: 0
});

export default {
  namespaced: true,
  state,
  actions,
  mutations
}
