const FixedMath = artifacts.require("Fixed192x64Math");
const MMFactory = artifacts.require("LMSRMarketMakerFactory");

module.exports = function(deployer) {
  deployer.deploy(FixedMath);
  deployer.link(FixedMath, MMFactory);
  deployer.deploy(MMFactory);
};
