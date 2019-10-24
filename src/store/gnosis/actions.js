/* eslint-disable */
import {
  onBoardUser,
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
    onBoardUser(newUser);
  }
}
