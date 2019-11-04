const SMS = artifacts.require("SimpleMonitoringService");

module.exports = function(deployer) {
  deployer.deploy(SMS);
};