/* eslint-disable */
// import getters from './getters';
import actions from './actions';
import mutations from './mutations';

const state = () => ({
  pms: null,
});

export default {
  namespaced: true,
  state,
  actions,
  mutations
}
