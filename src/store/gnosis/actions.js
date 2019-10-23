/* eslint-disable */
import {
  deploySignallingToken,
  deployOrchestrator,
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

  async deployOrchestrator(ctx) {
    await deployOrchestrator();
  },

  async getSignallingTokens(ctx, amount) {
    await getTokens(amount);
  },

  async deployPms(ctx) {
    ctx.commit('pms', 'DEPLOYED');
  }
}
