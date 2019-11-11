require("./test-setup");
const ENS = artifacts.require('@ensdomains/ens/ENSRegistry.sol');
const PublicResolver = artifacts.require('@ensdomains/resolver/PublicResolver.sol');
const ReverseRegistrar = artifacts.require('@ensdomains/ens/ReverseRegistrar.sol');
const namehash = require('eth-ens-namehash');


contract('ENS', function ([owner, target]) {

  var ens, resolver;

  step("should deploy ENS with Public Resolver sms contract", async function () {
    ens = await ENS.new();
    resolver = await PublicResolver.new(ens.address);
  });


  step("should create a top level node", async function () {
    await ens.setSubnodeOwner("0x0", web3.utils.sha3("eth"), owner);
    await ens.setResolver("0x0", resolver.address);
  });


  step("should register a lower level domain", async function () {
    await ens.setSubnodeOwner(namehash.hash("eth"), web3.utils.sha3("kuba"), owner);

    await resolver.setAddr(namehash.hash("kuba.eth"), target);

    let resolved = await resolver.addr(namehash.hash("kuba.eth"));
    resolved.should.be.equal(target);
  });


});
