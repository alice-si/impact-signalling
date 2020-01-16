import CONDITIONAL_TOKENS_JSON from '@gnosis-contracts/conditional-tokens-contracts/build/contracts/ConditionalTokens.json'
import WHITELIST_JSON from '@contracts//Whitelist.json'
import ORCHESTRATOR_JSON from '@contracts/SignallingOrchestrator.json'
import MM_JSON from '@contracts/MarketMaker.json'
import SMS_JSON from '@contracts/SimpleMonitoringService.json'
import COLLATERAL_JSON from '@contracts/CollateralToken.json'
const ethers = require('ethers');


//FIXME: Please replace with your own deployed SignallingOrchestrator
const SIGNALLING_ORCHESTRATOR = '0x6D2Ed4F01bB9b426fD911F047508588DEc050283';
//FIXME: Please replace with your own deployed SimpleMonitoringService
const SIMPLE_MONITORING_SERVICE = '0xF194D142A47D4c783775AfE86F7d38Ca611Ba490';
const DEFAULT_RATIO = 50;

import {
  MSGS,
  EVENT_CHANNEL,
  event,
  getProvider,
  getWallet,
  getWalletAddress,
} from '../ethers/ethersConnect';

var commit, state;
var orchestrator, collateral, whitelist, conditionalTokens, marketMakerFactoryAddress;

const GNOSIS_PROTOCOL = 0;
const EMAIL_MESSAGE_TYPE = 0;

const ONE = ethers.utils.parseEther("1");
const MIN_ONE = ethers.utils.parseEther("-1");
const HUNDRED = ethers.utils.parseEther("100");
const BI_WEEKLY_FEE = ethers.utils.parseEther("0.02");

// NOT USED (because we moved orchestrator deployment to truffle migrations)
// export async function deployOrchestrator() {
//   let wallet = await getWallet();
//   let address = await wallet.getAddress();
//   let factory = new ethers.ContractFactory(ORCHESTRATOR_JSON.abi, ORCHESTRATOR_JSON.bytecode, wallet);
//   orchestrator = await factory.deploy(address, MARKET_MAKER_FACTORY, CONDITIONAL_TOKENS);

//   //Update local storage
//   localStorage.orchestratorAddress = orchestrator.address;
//   localStorage.users = [];
//   localStorage.markets = [];

//   commit('orchestratorAddress', orchestrator.address);
//   console.log("Signalling Orchestrator deployed to: " + orchestrator.address);
// }

export async function onBoardUser(newUser) {
  let wei = ethers.utils.parseEther(newUser.tokens.toString());
  await orchestrator.onBoard(newUser.address, wei);
  commit('addUser', newUser);
  console.log("Added new user: " + newUser.address);
  localStorage.users = JSON.stringify(state.users);
  await updateBalance();
}

export async function createMarket(newMarket) {
  let wallet = await getWallet();
  newMarket.id = ethers.utils.id(newMarket.project + newMarket.outcome + Date.now());
  let tx = await orchestrator.createMarket(newMarket.id, HUNDRED, newMarket.project, newMarket.outcome, {gasLimit: 2000000});

  let receipt = await getProvider().getTransactionReceipt(tx.hash);
  newMarket.address = getMarketIdFromTx(receipt);
  newMarket.ratio = DEFAULT_RATIO;

  let mm = new ethers.Contract(newMarket.address, MM_JSON.abi, wallet);
  newMarket.yesPosition  = await mm.generateAtomicPositionId(0);
  newMarket.noPosition  = await mm.generateAtomicPositionId(1);

  updateMarket(newMarket);

  commit('addMarket', newMarket);
  console.log("Adderd market: " + newMarket.address);
  localStorage.markets = JSON.stringify(state.markets);
  await updateMarkets();
}

export async function getMarkets() {
  let wallet = await getWallet();
  let walletAddress = await wallet.getAddress();
  let orchestrator = new ethers.Contract(SIGNALLING_ORCHESTRATOR, ORCHESTRATOR_JSON.abi, wallet);
  let marketsCount = await orchestrator.getMarketsCount();
  let collateralAddress = await orchestrator.collateralToken();
  let collateral = new ethers.Contract(collateralAddress, COLLATERAL_JSON.abi, wallet);
  let markets = [];
  for (let marketNr = 0; marketNr < marketsCount; marketNr++) {
    let [address, project, outcome] = await orchestrator.getMarketDetails(marketNr);
    let mm = new ethers.Contract(address, MM_JSON.abi, wallet);
    let allowance = await collateral.allowance(walletAddress, address);
    let yesPosition = await mm.generateAtomicPositionId(0);
    let noPosition = await mm.generateAtomicPositionId(1);
    let market = {
      // Details
      address,
      project,
      outcome,
      ratio: DEFAULT_RATIO,

      allowance: ethers.utils.formatEther(allowance),

      // Prices
      costBuyYes: Number.parseFloat(ethers.utils.formatEther(await mm.calcNetCost([ONE, 0]))).toPrecision(3),
      costSellYes: (-Number.parseFloat(ethers.utils.formatEther(await mm.calcNetCost([MIN_ONE, 0])))).toPrecision(3),
      costBuyNo: Number.parseFloat(ethers.utils.formatEther(await mm.calcNetCost([0, ONE]))).toPrecision(3),
      costSellNo: (-Number.parseFloat(ethers.utils.formatEther(await mm.calcNetCost([0, MIN_ONE])))).toPrecision(3),

      // Position Ids
      yesPosition,
      noPosition,

      // Holdings
      yesBalance: ethers.utils.formatEther(await orchestrator.getOutcomeBalance(walletAddress, yesPosition)),
      noBalance: ethers.utils.formatEther(await orchestrator.getOutcomeBalance(walletAddress, noPosition)),
    };
    markets.push(market);
  }
  return JSON.parse(JSON.stringify(markets));
}

async function updateMarkets() {
  state.markets = await getMarkets();
}

export async function updateMarket(market) {
  let wallet = await getWallet();
  let mm = new ethers.Contract(market.address, MM_JSON.abi, wallet);
  let address = await wallet.getAddress();

  //Prices
  market.costBuyYes = Number.parseFloat(ethers.utils.formatEther(await mm.calcNetCost([ONE, 0]))).toPrecision(3);
  market.costSellYes = (-Number.parseFloat(ethers.utils.formatEther(await mm.calcNetCost([MIN_ONE, 0])))).toPrecision(3);

  market.costBuyNo = Number.parseFloat(ethers.utils.formatEther(await mm.calcNetCost([0, ONE]))).toPrecision(3);
  market.costSellNo = (-Number.parseFloat(ethers.utils.formatEther(await mm.calcNetCost([0, MIN_ONE])))).toPrecision(3);

  //Holdings
  market.yesBalance = ethers.utils.formatEther(await orchestrator.getOutcomeBalance(address, market.yesPosition));
  market.noBalance = ethers.utils.formatEther(await orchestrator.getOutcomeBalance(address, market.noPosition));

  commit('updateMarket', market);
  localStorage.markets = JSON.stringify(state.markets);
}

export async function joinMarket(market) {
  await conditionalTokens.setApprovalForAll(market.address, true, {gasLimit: 1000000});
  await collateral.approve(market.address, HUNDRED, {gasLimit: 1000000});
  market.allowance = 100;
  commit('updateMarket', market);
  console.log("Collateral approved for: " + market.address);
}

export async function trade(market, order) {
  console.log(market);
  console.log(order);
  let wallet = await getWallet();
  let mm = new ethers.Contract(market.address, MM_JSON.abi, wallet);
  await mm.trade(order, 0, {gasLimit: 1000000});
  console.log("Traded on : " + market.address);
  await updateMarket(market);
  // await updateBalance();
}

export async function listenOnPriceChanges(market, onPriceChangedCallback) {
  function convertPriceToNumber(price) {
    return Number.parseFloat(ethers.utils.formatEther(price)).toPrecision(3);
  }

  let provider = getProvider();
  provider.resetEventsBlock(0); // <- it allows to get all events
  let mm = new ethers.Contract(market.address, MM_JSON.abi, provider);
  let filter = mm.filters.AMMPriceChanged();
  mm.on(filter, async (priceBuyYes, priceSellYes, priceBuyNo, priceSellNo, timestamp) => {
    console.log('AMMPriceChanged, calling onPriceChangedCallback...');
    onPriceChangedCallback({
      priceBuyYes: +convertPriceToNumber(priceBuyYes),
      priceSellYes: -convertPriceToNumber(priceSellYes),
      priceBuyNo: +convertPriceToNumber(priceBuyNo),
      priceSellNo: -convertPriceToNumber(priceSellNo),
      timestamp: timestamp.toNumber(),
    });
    console.log('Calling market update')
    await updateMarket(market);
  });
}

async function getSMSContract() {
  let wallet = await getWallet();
  let sms = new ethers.Contract(SIMPLE_MONITORING_SERVICE, SMS_JSON.abi, wallet);
  return sms;
}

// TODO implement this function later to allow user select from different service providers
// export async function getMonitoringServiceProviders() {
  // let sms = await getSMSContract();
  // return await sms.
// }

// TODO check if it works correctly
// TODO maybe try to find more readable ways to
function getCondition({ condition }) {
  // We don't use EQUAL codnition
  if (condition == 'GREATER_THAN') {
    return 0;
  } else {
    return 2; // LESS_THAN
  }
}

function getConditionText(num) {
  if (num == 0) {
    return 'GREATER_THAN';
  }
  if (num == 1) {
    return 'EQUAL';
  }
  if (num == 2) {
    return 'LESS_THAN';
  }
}

// newRequest should have field "value" which should contain integer number
export async function createNewMonitoringRequest(newRequest) {
  // Currently sms contract has no interface for
  // getting service providers details
  let serviceProviderId = 0; // <- FIXME: now it is hardcoded

  let sms = await getSMSContract();
  await sms.registerMonitoringRequest(
    GNOSIS_PROTOCOL,
    newRequest.targetAddress,
    newRequest.variable, getCondition(newRequest), newRequest.value,
    EMAIL_MESSAGE_TYPE, newRequest.email,
    serviceProviderId, {
      value: BI_WEEKLY_FEE
    });

  await updateMonitoringRequests();
}

async function updateMonitoringRequests() {
  state.monitoringRequests = await getMonitoringRequests();
}

async function getMonitoringRequests() {
  let sms = await getSMSContract();
  let requestsCount = await sms.getRequestsCount();
  let requests = [];
  for (let requestId = 0; requestId < requestsCount; requestId++) {
    let reqDetails = await sms.getRequestDetails(requestId);
    requests.push({
      id: requestId,
      condition: getConditionText(reqDetails[3]),
      price: reqDetails[4].toNumber() / 1000000,
      email: reqDetails[6],
      market: reqDetails[1],
      variable: reqDetails[2],
    });
  }
  return requests;
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

  // Also update wallet address
  commit('myWalletAddress', address);

  commit('balanceLoaded', true);
};

var getMarketIdFromTx = function(tx) {
  console.log(tx);
  for(var i=0; i < tx.logs.length; i++) {
    if (tx.logs[i].address === marketMakerFactoryAddress) {
      let id = '0x' + tx.logs[i].data.substring(26, 66);
      return id;
    }
  }
  return null;
}

var linkContracts = async function() {
  let wallet = await getWallet();
  let address = await wallet.getAddress();

  orchestrator = new ethers.Contract(SIGNALLING_ORCHESTRATOR, ORCHESTRATOR_JSON.abi, wallet);
  commit('orchestratorAddress', orchestrator.address);
  console.log("Signalling Orchestrator linked: " + orchestrator.address);

  let collateralAddress = await orchestrator.collateralToken();
  collateral = new ethers.Contract(collateralAddress, COLLATERAL_JSON.abi, wallet);
  commit('collateralAddress', collateral.address);
  console.log("Collateral token linked: " + collateral.address);

  let whitelistAddress = await orchestrator.whitelist();
  whitelist = new ethers.Contract(whitelistAddress, WHITELIST_JSON.abi, wallet);
  commit('whitelistAddress', whitelist.address);
  console.log("Whitelist linked: " + whitelist.address);

  let conditionalTokensAddress = await orchestrator.conditionalTokens();
  conditionalTokens = new ethers.Contract(conditionalTokensAddress, CONDITIONAL_TOKENS_JSON.abi, wallet);
  commit('conditionalTokensAddress', conditionalTokens.address);
  console.log("Conditional Tokens linked: " + conditionalTokens.address);

  marketMakerFactoryAddress = await orchestrator.marketMakerFactory();

  // Monitoring requests
  await updateMonitoringRequests();
  await updateBalance();
  await updateMarkets();

  if (localStorage.users) {
    console.log(localStorage.users);
    state.users = JSON.parse(localStorage.users);
  }

  // if (localStorage.orchestratorAddress) {
    //Orchestrator
    // orchestrator = new ethers.Contract(localStorage.orchestratorAddress, ORCHESTRATOR_JSON.abi, wallet);
    // commit('orchestratorAddress', orchestrator.address);
    // console.log("Signalling Orchestrator linked: " + orchestrator.address);

    //Collateral
    // let collateralAddress = await orchestrator.collateralToken();
    // collateral = new ethers.Contract(collateralAddress, COLLATERAL_JSON.abi, wallet);
    // commit('collateralAddress', collateral.address);
    // console.log("Collateral token linked: " + collateral.address);

    //Witelist
    // let whitelistAddress = await orchestrator.whitelist();
    // whitelist = new ethers.Contract(whitelistAddress, WHITELIST_JSON.abi, wallet);
    // commit('whitelistAddress', whitelist.address);
    // console.log("Whitelist linked: " + whitelist.address);

    //ConditionalTokens
    // let conditionalTokensAddress = await orchestrator.conditionalTokens();
    // conditionalTokens = new ethers.Contract(conditionalTokensAddress, CONDITIONAL_TOKENS_JSON.abi, wallet);
    // commit('conditionalTokensAddress', conditionalTokens.address);
    // console.log("Conditional Tokens linked: " + conditionalTokens.address);

    //Users
    // if (localStorage.users) {
    //   console.log(localStorage.users);
    //   state.users = JSON.parse(localStorage.users);
    // }

    // Markets
    // if (localStorage.markets) {
    //   console.log(localStorage.markets);
    //   state.markets = JSON.parse(localStorage.markets);
    //   state.markets.forEach(async (market) => {
    //     let allowance = await collateral.allowance(address, market.address);
    //     market.allowance = ethers.utils.formatEther(allowance);
    //     commit('updateMarket', market);
    //   });
    // }
    // await updateMarkets();

    // // Monitoring requests
    // await updateMonitoringRequests();

    // await updateBalance();

  // }


}

//


