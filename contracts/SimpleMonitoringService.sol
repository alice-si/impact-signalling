/*
The contract implements a simple protocol to manage the service for smart contract monitoring.

A service provider register a service offer specifying a weekly fee for notifying customers about smart contracts changes.

A client may submit a MonitoringRequest calling a provider to deliver notification in a specific format
when the given contract parameter matches a certain condition.

The protocol is intentionally a minimal implementation that secures the parties by:

1) Requiring a service provider to put a stake that will secure future claims
2) Giving the right to cancel a service subscription by a customer not satisfied by the quality
3) In case of cancellation, part of the stake will be send to the customer slashing misbehaving service provider and compensating customer
4) To prevent sybil attacks a customer may cancel the service only after the first paid week is over

The protocol doesn't implement any 3rd party validation of the service performance as the due diligence
could be done thanks to the transparent blockchain transaction history of previous actions
and the honest performance is incentivised by the crypto-economic mechanism of staking/slashing and fee setup.

*/

import 'openzeppelin-solidity/contracts/math/SafeMath.sol';

pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

contract SimpleMonitoringService {
  using SafeMath for uint256;


  //ENUMS
  enum Protocol { GNOSIS_PREDICTION_MARKET }
  enum Condition { GREATER_THAN, EQUAL, LESS_THAN}
  enum MessageType { EMAIL, SMS }
  enum Status {CANCELLED, ACTIVE}


  //CONSTANTS
  uint256 constant MIN_STAKE = 1 ether;
  uint256 constant SLASH_PERCENTAGE = 1;


  //EVENTS
  event ServiceProviderAdded(address indexed provider, uint256 indexed providerId, uint256 weeklyFee);
  event MonitoringRequestAdded(address indexed client, uint256 indexed requestId, uint256 indexed providerId, address targetContract, uint256 deposit);
  event MonitoringRequestCancelled(address indexed client, uint256 indexed requestId, uint256 indexed providerId);
  event FeeCollected(address indexed collector, uint256 indexed requestId, uint256 indexed providerId, uint256 fee);


  //STRUCTS
  struct MonitoringRequest {
    Protocol protocol;
    address target;
    string variable;
    Condition condition;
    uint256 value;
    MessageType messageType;
    string messageTarget;

    address client;
    uint256 providerId;
    uint256 from;
    uint256 deposited;
    uint256 collected;
  }

  struct ServiceProvider {
    address account;
    uint256 weeklyFee;
    uint256 stake;
    Status status;
  }


  //STATE
  ServiceProvider[] public providers;
  MonitoringRequest[] public requests;
  Condition public test;

  function registerServiceProvider(uint256 weeklyFee) public payable {
    require(msg.value >= MIN_STAKE);
    providers.push(ServiceProvider(msg.sender, weeklyFee, msg.value, Status.ACTIVE));

    emit ServiceProviderAdded(msg.sender, providers.length.sub(1), weeklyFee);
  }


  function registerMonitoringRequest(
    Protocol protocol,
    address target,
    string memory variable,
    Condition condition,
    uint256 value,
    MessageType messageType,
    string memory messageTarget,
    uint256 providerId) public payable {

    require(providerId < getProvidersCount());
    require(target != address(0));

    ServiceProvider storage provider = providers[providerId];
    require(msg.value >= provider.weeklyFee);

    requests.push(MonitoringRequest(
      protocol,
      target,
      variable,
      condition,
      value,
      messageType,
      messageTarget,
      msg.sender,
      providerId,
      now,
      msg.value,
      0
    ));

    emit MonitoringRequestAdded(msg.sender, requests.length.sub(1), providerId, target, msg.value);
  }


  function collectFee(uint256 requestId) public {
    MonitoringRequest storage request = requests[requestId];
    ServiceProvider storage provider = providers[request.providerId];
    require(msg.sender == provider.account);

    uint256 fee = calculateFee(requestId);

    request.collected = request.collected.add(fee);
    request.deposited = request.deposited.sub(fee);
    msg.sender.transfer(fee);

    emit FeeCollected(msg.sender, requestId, request.providerId, fee);
  }

  function calculateFee(uint256 requestId) public view returns(uint256) {
    MonitoringRequest storage request = requests[requestId];
    ServiceProvider storage provider = providers[request.providerId];


    uint256 offset = request.collected.div(provider.weeklyFee);
    uint256 unpaidFrom = request.from.add(offset.mul(1 weeks));
    uint256 elapsed = now.sub(unpaidFrom);
    uint256 fullWeeks = elapsed.div(1 weeks);

    uint fee = fullWeeks.mul(provider.weeklyFee);
    if (fee > request.deposited) {
      fee = request.deposited;
    }

    return fee;
  }

  function cancelRequest(uint256 requestId) public {
    require(isRequestFunded(requestId));

    MonitoringRequest storage request = requests[requestId];
    ServiceProvider storage provider = providers[request.providerId];
    require(msg.sender == request.client);

    uint256 refund = request.deposited.sub(provider.weeklyFee);
    msg.sender.transfer(refund);
    emit MonitoringRequestCancelled(msg.sender, requestId, request.providerId);

  }

  function isRequestFunded(uint256 requestId) public view returns(bool) {
    MonitoringRequest storage request = requests[requestId];
    ServiceProvider storage provider = providers[request.providerId];
    return request.deposited >= provider.weeklyFee;
  }

  function getRequestsCount() public view returns(uint256) {
    return requests.length;
  }

  function getRequestDetails(uint256 requestId) public view returns(MonitoringRequest memory) {
    return requests[requestId];
  }

  function getProvidersCount() public view returns(uint256) {
    return providers.length;
  }

}
