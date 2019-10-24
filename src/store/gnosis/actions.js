/* eslint-disable */
import {
  onBoardUser,
  createMarket,
  deployOrchestrator,
  initContracts
} from './contracts';

export default {
  async initContracts(ctx) {
    initContracts(ctx);
  },

  async deployOrchestrator(ctx) {
    await deployOrchestrator();
  },

  async addUser(ctx, newUser) {
    await onBoardUser(newUser);
  },

  async addMarket(ctx, newMarket) {
    await createMarket(newMarket);
  },
}
