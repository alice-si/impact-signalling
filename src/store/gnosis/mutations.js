/* eslint-disable */
import Vue from 'vue'

export default {
  orchestratorAddress: function (state, value) {
    state.orchestratorAddress = value;
  },
  collateralAddress: function (state, value) {
    state.collateralAddress = value;
  },
  whitelistAddress: function (state, value) {
    state.whitelistAddress = value;
  },
  conditionalTokensAddress: function (state, value) {
    state.conditionalTokensAddress = value;
  },
  addUser: function (state, newUser) {
    state.users.push(newUser);
  },
  addMarket: function (state, newMarket) {
    state.markets.push(newMarket);
  },
  // addMonitoringRequest: function (state, newMonitoringRequest) {
  //   state.monitoringRequests.push(newMonitoringRequest);
  // },
  collateralBalance: function (state, value) {
    state.collateralBalance = value;
  },
  updateMarket: function(state, updatedMarket) {
  state.markets.forEach((market, index) => {
    if (market.address === updatedMarket.address) {
      Vue.set(state.markets, index, updatedMarket);
    }
  });
}
}
