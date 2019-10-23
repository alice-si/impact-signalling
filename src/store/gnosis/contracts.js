import S_TOKEN_JSON from '@contracts/SignallingToken.json'
import CONDITIONAL_TOKENS_JSON from '@gnosis-contracts/conditional-tokens-contracts/build/contracts/ConditionalTokens'
import WHITELIST_JSON from '@gnosis-contracts/conditional-tokens-contracts/build/contracts/ConditionalTokens'
import ORCHESTRATOR_JSON from '@contracts/SignallingOrchestrator.json'
import COLLATERAL_JSON from '@contracts/CollateralToken.json'
const ethers = require('ethers');

const MARKET_MAKER_FACTORY = '0x51f7B16705845181df7c36F084ad4265B878AD0c';

import {
  MSGS,
  EVENT_CHANNEL,
  event,
  getProvider,
  getWallet,
  getWalletAddress,
} from '../ethers/ethersConnect';

var commit, sToken, orchestrator, collateral, whitelist;

var linkContract = function(json, provider) {
  let c = Contract(json);
  c.setProvider(provider);
  return c;
};

export async function deploySignallingToken() {
  let wallet = await getWallet();
  let factory = new ethers.ContractFactory(S_TOKEN_JSON.abi, S_TOKEN_JSON.bytecode, wallet);
  sToken = await factory.deploy();
  localStorage.sTokenAddress = sToken.address;
  commit('sTokenAddress', sToken.address);
  console.log("Signalling token deployed to: " + sToken.address);
}

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


export async function getTokens(amount) {
  let wallet = await getWallet();
  let address = await wallet.getAddress();
  await sToken.mint(address, amount);

  console.log("Signalling tokens minted: " + amount);
}

export async function initContracts(_ctx) {
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

  let balance = await sToken.balanceOf(address);
  commit('sTokenBalance', balance.valueOf());
};

var linkContracts = async function() {
  let wallet = await getWallet();

  if (localStorage.sTokenAddress) {
    sToken = new ethers.Contract(localStorage.sTokenAddress, S_TOKEN_JSON.abi, wallet);
    commit('sTokenAddress', sToken.address);
    console.log("Linking sToken: " + sToken.address);
    updateBalance();
    sToken.on("Transfer", (from, to, value) => {
      console.log("Signalling token transfer from: " + from + " to: " + to +  " value: " + value);
      updateBalance();
    });
  }

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


  }


}

//


