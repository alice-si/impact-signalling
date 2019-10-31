require("./test-setup");
const { time } = require('@openzeppelin/test-helpers');
const SimpleMonitoringService = artifacts.require("SimpleMonitoringService");
const toBN = require('number-to-bn');


contract('Simple Monitoring Service', function ([owner, serviceProvider, client, market]) {

  const GNOSIS_PROTOCOL = 0;
  const GREATER_THAN_CONDITION = 0;
  const EMAIL_MESSAGE_TYPE = 0;

  const ONE = web3.utils.toWei('1', 'ether');
  const WEEKLY_FEE = web3.utils.toWei('0.01', 'ether');
  const BI_WEEKLY_FEE = web3.utils.toWei('0.02', 'ether');
  const WEEK = 60*60*24*7;

  var sms;


  step("should setup sms contract", async function () {
    sms = await SimpleMonitoringService.new();
  });


  step("should register service provider", async function () {
    (await sms.getProvidersCount()).should.be.bignumber.equal("0");

    await sms.registerServiceProvider(WEEKLY_FEE, {value: ONE, from: serviceProvider});

    (await sms.getProvidersCount()).should.be.bignumber.equal("1");
  });

  step("should register monitoring request", async function () {
    (await sms.getRequestsCount()).should.be.bignumber.equal("0");

    await sms.registerMonitoringRequest(
      GNOSIS_PROTOCOL,
      market,
      "price", GREATER_THAN_CONDITION, 60,
      EMAIL_MESSAGE_TYPE, 'jakub@alice.si',
      0, //providerId
      {from: client, value: BI_WEEKLY_FEE}
    );

    (await sms.getRequestsCount()).should.be.bignumber.equal("1");

    let request = await sms.getRequestDetails(0);
    request.protocol.should.be.equal(GNOSIS_PROTOCOL.toString());
    request.target.should.be.equal(market);

    request.variable.should.be.equal("price");
    request.condition.should.be.equal(GREATER_THAN_CONDITION.toString());
    request.value.should.be.equal("60");

    request.messageType.should.be.equal(EMAIL_MESSAGE_TYPE.toString());
    request.messageTarget.should.be.equal('jakub@alice.si');

    request.client.should.be.equal(client);
    request.providerId.should.be.equal("0");
    request.deposited.should.be.equal(BI_WEEKLY_FEE);
    request.collected.should.be.equal("0");
  });


  step("should report being funded for a new request", async function () {
    let funded = await sms.isRequestFunded(0);
    funded.should.be.true;
  });


  step("should calculate zero fee without any service period", async function () {
    let fee = await sms.calculateFee(0, {from: serviceProvider});
    fee.should.be.bignumber.equal("0");
  });


  step("should calculate the fee after a week of service", async function () {
    await time.increase(WEEK);
    let fee = await sms.calculateFee(0, {from: serviceProvider});
    fee.should.be.bignumber.equal(WEEKLY_FEE);
  });


  step("should not allow collecting fee for other than service provider", async function () {
    await sms.collectFee(0, {from: client}).shouldBeReverted();
  });


  step("should collect the fee", async function () {
    let smsBalanceBefore = toBN(await web3.eth.getBalance(sms.address));
    let providerBalanceBefore = toBN(await web3.eth.getBalance(serviceProvider));

    await sms.collectFee(0, {from: serviceProvider, gasPrice: 0});

    let smsLoss = smsBalanceBefore.sub(toBN(await web3.eth.getBalance(sms.address)));
    let providerGain = toBN(await web3.eth.getBalance(serviceProvider)).sub(providerBalanceBefore);
    smsLoss.should.be.bignumber.equal(WEEKLY_FEE);
    providerGain.should.be.bignumber.equal(WEEKLY_FEE);
  });


  step("should update accounting after the fee collection", async function () {
    let request = await sms.getRequestDetails(0);

    request.collected.should.be.bignumber.equal(WEEKLY_FEE);
    request.deposited.should.be.bignumber.equal(WEEKLY_FEE);
    (await sms.calculateFee(0)).should.be.bignumber.equal("0");
  });


  step("should not allow cancelling the request for other than the client", async function () {
    await sms.cancelRequest(0, {from: serviceProvider}).shouldBeReverted();
  });


  step("should cancel the request", async function () {
    await sms.cancelRequest(0, {from: client});
  });


  step("should calculate the fee after a second week of service", async function () {
    await time.increase(WEEK);
    let fee = await sms.calculateFee(0, {from: serviceProvider});
    fee.should.be.bignumber.equal(WEEKLY_FEE);
  });


  step("should collect the 2nd week fee", async function () {
    let smsBalanceBefore = toBN(await web3.eth.getBalance(sms.address));
    let providerBalanceBefore = toBN(await web3.eth.getBalance(serviceProvider));

    await sms.collectFee(0, {from: serviceProvider, gasPrice: 0});

    let smsLoss = smsBalanceBefore.sub(toBN(await web3.eth.getBalance(sms.address)));
    let providerGain = toBN(await web3.eth.getBalance(serviceProvider)).sub(providerBalanceBefore);
    smsLoss.should.be.bignumber.equal(WEEKLY_FEE);
    providerGain.should.be.bignumber.equal(WEEKLY_FEE);
  });


  step("should update accounting after the 2nd week fee collection", async function () {
    let request = await sms.getRequestDetails(0);

    request.collected.should.be.bignumber.equal(BI_WEEKLY_FEE);
    request.deposited.should.be.bignumber.equal("0");
    (await sms.calculateFee(0)).should.be.bignumber.equal("0");
  });


  step("should report being unfunded after all of deposit is spent", async function () {
    let funded = await sms.isRequestFunded(0);
    funded.should.be.false;
  });


  step("should not allow cancelling unfunded request", async function () {
    await sms.cancelRequest(0, {from: client}).shouldBeReverted();
  });


});
