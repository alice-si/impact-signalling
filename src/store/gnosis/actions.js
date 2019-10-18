/* eslint-disable */
// import {
//   MSGS,
//   EVENT_CHANNEL,
//   event,
//   ready,
//   getProvider,
//   getWallet,
//   getWalletAddress,
//   getNetName,
//   hasEns
// } from './ethersConnect';

export default {
  async deployPms(ctx) {
    ctx.commit('pms', 'DEPLOYED');
  }
}
