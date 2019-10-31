/* eslint-disable */
// import getters from './getters';
import actions from './actions';
import mutations from './mutations';

const state = () => ({
  orchestratorAddress: null,
  collateralAddress: null,
  whitelistAddress: null,
  conditionalTokensAddress: null,
  collateralBalance: 0,
  users: [],
  markets: []
});

export default {
  namespaced: true,
  state,
  actions,
  mutations
}
