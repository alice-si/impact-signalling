const ENS = artifacts.require('@ensdomains/ens/ENSRegistry.sol');
const PublicResolver = artifacts.require('@ensdomains/resolver/PublicResolver.sol');
const ReverseRegistrar = artifacts.require('@ensdomains/ens/ReverseRegistrar.sol');
const namehash = require('eth-ens-namehash');


module.exports = async function(deployer, network, [owner, kuba]) {
  await deployer.deploy(ENS);
  await deployer.deploy(PublicResolver, ENS.address);

  // let resolver = await PublicResolver.deployed();
  // await ens.setSubnodeOwner("0x0", web3.utils.fromAscii("eth").padEnd(66, '0'), owner);
  // await ens.setResolver("0x0", resolver.address);
  //
  // await resolver.setAddr(namehash.hash("kuba.eth"), kuba);
  //
  // console.log(resolver);

  // await ens.setResolver(hashedname, PublicResolver.address, {from: owner});
  //
  // let res1 = await resolver.addr.call(hashedname);



};
