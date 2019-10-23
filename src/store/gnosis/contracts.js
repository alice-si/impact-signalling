import S_TOKEN_JSON from '@contracts/SignallingToken.json'
import CONDITIONAL_TOKENS_JSON from '@gnosis-contracts/conditional-tokens-contracts/build/contracts/ConditionalTokens'
import WHITELIST_JSON from '@gnosis-contracts/conditional-tokens-contracts/build/contracts/ConditionalTokens'
const ethers = require('ethers');

import {
  MSGS,
  EVENT_CHANNEL,
  event,
  getProvider,
  getWallet,
  getWalletAddress,
} from '../ethers/ethersConnect';

var commit, sToken, conditionalTokens;

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

export async function deployConditionalTokens() {
  let wallet = await getWallet();
  let factory = new ethers.ContractFactory(CONDITIONAL_TOKENS_JSON.abi, CONDITIONAL_TOKENS_JSON.bytecode, wallet);
  conditionalTokens = await factory.deploy();
  localStorage.conditionalTokensAddress = conditionalTokens.address;
  commit('conditionalTokensAddress', conditionalTokens.address);
  console.log("Conditional tokens deployed to: " + conditionalTokens.address);
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

  if (localStorage.conditionalTokensAddress) {
    conditionalTokens = new ethers.Contract(localStorage.conditionalTokensAddress, CONDITIONAL_TOKENS_JSON.abi, wallet);
    commit('conditionalTokensAddress', conditionalTokens.address);
    console.log("Linking Conditional Tokens: " + conditionalTokens.address);
  }


}

//


