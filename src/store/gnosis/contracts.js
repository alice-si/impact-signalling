import CONDITIONAL_TOKENS_JSON from '@gnosis-contracts/conditional-tokens-contracts/build/contracts/ConditionalTokens'
import WHITELIST_JSON from '@gnosis-contracts/conditional-tokens-contracts/build/contracts/ConditionalTokens'
import ORCHESTRATOR_JSON from '@contracts/SignallingOrchestrator.json'
import MM_JSON from '@contracts/MarketMaker.json'
import COLLATERAL_JSON from '@contracts/CollateralToken.json'
const ethers = require('ethers');

const MARKET_MAKER_FACTORY = '0x2d6FB5b6C13d48176ED24a65c8b25C2D14995271';

import {
  MSGS,
  EVENT_CHANNEL,
  event,
  getProvider,
  getWallet,
  getWalletAddress,
} from '../ethers/ethersConnect';

var commit, state;
var orchestrator, collateral, whitelist;

const ONE = ethers.utils.parseEther("1");
const HUNDRED = ethers.utils.parseEther("100");

export async function deployOrchestrator() {
  let wallet = await getWallet();
  let address = await wallet.getAddress();
  let factory = new ethers.ContractFactory(ORCHESTRATOR_JSON.abi, ORCHESTRATOR_JSON.bytecode, wallet);
  orchestrator = await factory.deploy(address);
  //Connect to Market Maker factory
  await orchestrator.setMarketMakerFactory(MARKET_MAKER_FACTORY);
  localStorage.orchestratorAddress = orchestrator.address;
  commit('orchestratorAddress', orchestrator.address);
  console.log("Signalling Orchestrator deployed to: " + orchestrator.address);
}

export async function onBoardUser(newUser) {
  let wei = ethers.utils.parseEther(newUser.tokens.toString());
  await orchestrator.onBoard(newUser.address, wei);
  commit('addUser', newUser);
  console.log("Added new user: " + newUser.address);
  localStorage.users = JSON.stringify(state.users);
}

export async function createMarket(newMarket) {
  let b32 = ethers.utils.formatBytes32String(newMarket.project);
  console.log(b32);
  console.log(HUNDRED);
  let tx = await orchestrator.createMarket(ethers.utils.formatBytes32String(newMarket.project), HUNDRED, {gasLimit: 1000000});

  let receipt = await getProvider().getTransactionReceipt(tx.hash);
  newMarket.address = getMarketIdFromTx(receipt);
  newMarket.ratio = 50;

  commit('addMarket', newMarket);
  console.log("Adderd market: " + newMarket.address);
  localStorage.markets = JSON.stringify(state.markets);
}

export async function joinMarket(market) {
  await collateral.approve(market.address, HUNDRED, {gasLimit: 1000000});
  market.allowance = 100;
  commit('updateMarket', market);
  console.log("Collateral approved for: " + market.address);
}

export async function trade(market) {
  let wallet = await getWallet();
  let mm = new ethers.Contract(market.address, MM_JSON.abi, wallet);
  await mm.trade([ONE, 0], 0, {gasLimit: 1000000});
  console.log("Traded on : " + market.address);
}

export async function mintTokens(amount) {
  let wei = ethers.utils.parseEther(amount.toString());
  let wallet = await getWallet();
  let address = await wallet.getAddress();
  await collateral.mint(address, wei);

  console.log("Collateral tokens minted: " + amount);
}

export async function initContracts(_ctx) {
  state = _ctx.state;
  commit = _ctx.commit;
  event.$on(EVENT_CHANNEL, async function (msg) {
    if (msg === MSGS.ETHERS_VUEX_READY) {
      await linkContracts();
    }
  });
};

var updateBalance = async function() {
  let wallet = await getWallet();
  let address = await wallet.getAddress();

  let balance = await collateral.balanceOf(address);
  commit('collateralBalance', ethers.utils.formatEther(balance));
};

var getMarketIdFromTx = function(tx) {
  console.log(tx);
  for(var i=0; i < tx.logs.length; i++) {
    if (tx.logs[i].address === MARKET_MAKER_FACTORY) {
      let id = '0x' + tx.logs[i].data.substring(26, 66);
      return id;
    }
  }
  return null;
}

var linkContracts = async function() {
  let wallet = await getWallet();
  let address = await wallet.getAddress();

  if (localStorage.orchestratorAddress) {
    //Orchestrator
    orchestrator = new ethers.Contract(localStorage.orchestratorAddress, ORCHESTRATOR_JSON.abi, wallet);
    commit('orchestratorAddress', orchestrator.address);
    console.log("Signalling Orchestrator linked: " + orchestrator.address);

    //Collateral
    let collateralAddress = await orchestrator.collateralToken();
    collateral = new ethers.Contract(collateralAddress, COLLATERAL_JSON.abi, wallet);
    commit('collateralAddress', collateral.address);
    console.log("Collateral token linked: " + collateral.address);

    //Collateral
    let whitelistAddress = await orchestrator.whitelist();
    whitelist = new ethers.Contract(whitelistAddress, WHITELIST_JSON.abi, wallet);
    commit('whitelistAddress', whitelist.address);
    console.log("Whitelist linked: " + whitelist.address);

    //Users
    if (localStorage.users) {
      console.log(localStorage.users);
      state.users = JSON.parse(localStorage.users);
    }

    if (localStorage.markets) {
      console.log(localStorage.markets);
      state.markets = JSON.parse(localStorage.markets);
      state.markets.forEach(async (market) => {
        let allowance = await collateral.allowance(address, market.address);
        market.allowance = ethers.utils.formatEther(allowance);
        commit('updateMarket', market);
      });
    }

    await updateBalance();

  }


}

//


