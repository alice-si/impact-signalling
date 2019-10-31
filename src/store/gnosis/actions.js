/* eslint-disable */
import {
  onBoardUser,
  createMarket,
  deployOrchestrator,
  initContracts,
  trade,
  joinMarket
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

  async joinMarket(ctx, market) {
    await joinMarket(market);
  },

  async trade(ctx, {market, yesAmount, noAmount}) {
    await trade(market, [yesAmount, noAmount]);
  }
}
