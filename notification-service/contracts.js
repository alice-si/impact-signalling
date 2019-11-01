const ethers = require('ethers');
const MM_JSON = require('../build/contracts/MarketMaker.json');
const SMS_JSON = require('../build/contracts/SimpleMonitoringService.json');
const { mnemonic } = require('./secrets');

// FIXME: replace with deployed SIMPLE_MONITORING_SERVICE_ADDRESS
const SIMPLE_MONITORING_SERVICE = '0xE237f26fB5242FE8887184BcBeaA866B31E2F1Bb';
const ONE = ethers.utils.parseEther('1');
const MIN_ONE = ethers.utils.parseEther('-1');
const WEEKLY_FEE = ethers.utils.parseEther('0.01');

function getProvider() {
  // Think about updating it for production
  // let defaultProvider = ethers.getDefaultProvider('rinkeby');
  let httpProvider = new ethers.providers.JsonRpcProvider();
  return httpProvider;
}

function getWallet() {
  let wallet = ethers.Wallet.fromMnemonic(mnemonic);
  let provider = getProvider();
  return wallet.connect(provider);
}

function getMMContract(mmContractAddress) {
  let provider = getProvider();
  // provider.resetEventsBlock(0); // <- it allows to get all events from the beginning
  return new ethers.Contract(mmContractAddress, MM_JSON.abi, provider);
}

function getSMSContract(smsContractAddress) {
  let wallet = getWallet();
  return new ethers.Contract(smsContractAddress, SMS_JSON.abi, wallet);
}

function listenOnTradeEvents(mmContractAddress, onTradeCallback) {
  let mmContract = getMMContract(mmContractAddress);
  let filter = mmContract.filters.AMMOutcomeTokenTrade();
  mmContract.on(filter, () => {
    console.log('AMMOutcomeTokenTrade, calling onTradeCallback...');
    onTradeCallback();
  });
}

async function getCurPrices(mmContractAddress) {
  let result = {};
  let mm = getMMContract(mmContractAddress);
  //Prices
  result.costBuyYes = Number.parseFloat(ethers.utils.formatEther(await mm.calcNetCost([ONE, 0]))).toPrecision(3);
  result.costSellYes = (-Number.parseFloat(ethers.utils.formatEther(await mm.calcNetCost([MIN_ONE, 0])))).toPrecision(3);
  result.costBuyNo = Number.parseFloat(ethers.utils.formatEther(await mm.calcNetCost([0, ONE]))).toPrecision(3);
  result.costSellNo = (-Number.parseFloat(ethers.utils.formatEther(await mm.calcNetCost([0, MIN_ONE])))).toPrecision(3);

  return result;
}

async function registerServiceProvider() {
  let sms = getSMSContract(SIMPLE_MONITORING_SERVICE);
  await sms.registerServiceProvider(WEEKLY_FEE, { value: ONE });
}

async function getMonitoringRequestDetails(requestId) {
  let sms = getSMSContract(SIMPLE_MONITORING_SERVICE);
  // TODO FIXME: convert result to Object
  return await sms.getRequestDetails(requestId);
}

function listenOnMonitoringRequestCreation(onRequestAddedCallback) {
  let sms = getSMSContract(SIMPLE_MONITORING_SERVICE);
  let filter = sms.filters.MonitoringRequestAdded();
  sms.on(filter, (client, requestId, providerId, targetContract, deposit) => {
    console.log('MonitoringRequestAdded, calling onRequestAddedCallback...');
    onRequestAddedCallback({ client, requestId, providerId, targetContract, deposit });
  });
}

// TODO implement
function listenOnMonitoringRequestCancellation(onRequestCancelledCallback) {
  throw 'Not implemented';
}

module.exports = {
  // For mm contract
  listenOnTradeEvents,
  getCurPrices,

  // For sms contract
  registerServiceProvider,
  listenOnMonitoringRequestCreation,
  listenOnMonitoringRequestCancellation,
};
