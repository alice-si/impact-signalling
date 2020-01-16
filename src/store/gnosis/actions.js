/* eslint-disable */
import {
  onBoardUser,
  createMarket,
  deployOrchestrator,
  initContracts,
  trade,
  joinMarket,
  createNewMonitoringRequest,
  // updateMarkets,
} from './contracts';

export default {
  async initContracts(ctx) {
    initContracts(ctx);
  },

  async deployOrchestrator(ctx) {
    throw new Error('We have disabled this feature');
    // await deployOrchestrator();
  },

  async addUser(ctx, newUser) {
    await onBoardUser(newUser);
  },

  async addMarket(ctx, newMarket) {
    await createMarket(newMarket);
  },

  async addMonitoringRequest(ctx, newMonitoringRequest) {
    await createNewMonitoringRequest(newMonitoringRequest);
  },

  async joinMarket(ctx, market) {
    await joinMarket(market);
  },

  async trade(ctx, {market, yesAmount, noAmount}) {
    await trade(market, [yesAmount, noAmount]);
  },

  // async updateMarketsAction() {
  //   await updateMarkets();
  // }
}
