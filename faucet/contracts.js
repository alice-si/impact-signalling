const ethers = require('ethers');

const { mnemonic } = require('../secrets');

const ORCHESTRATOR_JSON = require('../build/contracts/SignallingOrchestrator.json');

// FIXME: update signalling orchestrator address
const SIGNALLING_ORCHESTRATOR = '0x6D2Ed4F01bB9b426fD911F047508588DEc050283';
const DEFAULT_ETHERS_VALUE = ethers.utils.parseEther('0.15');
const DEFAULT_TOKENS_AMOUNT = ethers.utils.parseEther('10');

function getProvider() {
  // Think about updating it for production
  // let defaultProvider = ethers.getDefaultProvider('rinkeby');
  // let httpProvider = new ethers.providers.JsonRpcProvider();
  // return httpProvider;

  // Rinkeby
  return ethers.getDefaultProvider('rinkeby');
}

function getWallet() {
  let wallet = ethers.Wallet.fromMnemonic(mnemonic);
  let provider = getProvider();
  return wallet.connect(provider);
}

function getMMContract(mmContractAddress) {
  let provider = getProvider();
  return new ethers.Contract(mmContractAddress, MM_JSON.abi, provider);
}

// Returns tx
async function sendEthersToAddress(address) {
  let wallet = getWallet();
  let tx = await wallet.sendTransaction({
    to: address,
    value: DEFAULT_ETHERS_VALUE,
  });
  return tx;
}

// Returns tx
async function sendTokensToAddress(address) {
  let wallet = getWallet();
  let orchestrator = new ethers.Contract(SIGNALLING_ORCHESTRATOR, ORCHESTRATOR_JSON.abi, wallet);
  let tx = await orchestrator.onBoard(address, DEFAULT_TOKENS_AMOUNT);
  return tx;
}

// Returns enum ['completed', 'failed', 'sending']
async function getTxStatus(hash) {
  let provider = getProvider();
  let receipt = await provider.getTransactionReceipt(hash);
  if (!receipt) {
    return 'sending';
  }
  return (receipt.status == 1) ? 'completed' : 'failed';
}

module.exports = {
  sendEthersToAddress,
  sendTokensToAddress,
  getTxStatus,
};
