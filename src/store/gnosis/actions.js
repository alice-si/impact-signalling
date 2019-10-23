/* eslint-disable */
import {
  deploySignallingToken,
  deployConditionalTokens,
  getTokens,
  initContracts
} from './contracts';

export default {
  async initContracts(ctx) {
    initContracts(ctx);
  },

  async deploySignallingToken(ctx) {
    await deploySignallingToken();
  },

  async deployConditionalTokens(ctx) {
    await deployConditionalTokens();
  },

  async getSignallingTokens(ctx, amount) {
    await getTokens(amount);
  },

  async deployPms(ctx) {
    ctx.commit('pms', 'DEPLOYED');
  }
}
