/* eslint-disable */
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
  addUser: function (state, newUser) {
    state.users.push(newUser);
  },
  addMarket: function (state, newMarket) {
    state.markets.push(newMarket);
  },
  collateralBalance: function (state, value) {
    state.collateralBalance = value;
  }
}
