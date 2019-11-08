const FixedMath = artifacts.require("Fixed192x64Math");
const MMFactory = artifacts.require("LMSRMarketMakerFactory");
const ConditionalTokens = artifacts.require("ConditionalTokens");
const SignallingOrchestrator = artifacts.require("SignallingOrchestrator");

const HARDCODED_ADMIN_ADDRESS = "0x6Cb6334f3fc8Dc2b8e04311f7897D427FA96325A";

module.exports = async function(deployer) {
  await deployer.deploy(FixedMath);
  await deployer.link(FixedMath, MMFactory);
  await deployer.deploy(MMFactory);
  await deployer.deploy(ConditionalTokens);
  
  let mmFactory = await MMFactory.deployed();
  let condTokens = await ConditionalTokens.deployed();
  await deployer.deploy(SignallingOrchestrator,
    HARDCODED_ADMIN_ADDRESS,
    mmFactory.address,
    condTokens.address);
};
