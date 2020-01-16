const { sendPriceChangedNotificationByEmail } = require('./mail-sender');
const {
  listenOnTradeEvents,
  getCurPrices,
  registerServiceProvider,
  getMonitoringRequestDetails,
  listenOnMonitoringRequestCreation,
  listenOnMonitoringRequestCancellation } = require('./contracts');

const TIMEOUT_BEFORE_PRICE_CHECKING = 2000;
const CONDITION_TYPES = {
  GREATER_THAN: 0,
  LESS_THAN: 2,
  EQUAL: 1, // I am not sure if this condition type is useful
};

let monitoringRequestStatuses = {};
const monitoringRequest = {
  activate(requestId) {
    monitoringRequestStatuses[requestId] = 'active';
  },
  cancel(requestId) {
    monitoringRequestStatuses[requestId] = 'cancelled';
  }
}

function isConditionFulfilled(condition, curPrices) {
  const priceKeys = {
    'BUY_YES': 'costBuyYes',
    'SELL_YES': 'costSellYes',
    'BUY_NO': 'costBuyNo',
    'SELL_NO': 'costSellNo',
  };

  const priceKey = priceKeys[condition.variable];
  const price = curPrices[priceKey];

  if (condition.type == CONDITION_TYPES.GREATER_THAN) {
    return price > condition.price;
  }
  if (condition.type == CONDITION_TYPES.LESS_THAN) {
    return price < condition.price;
  }

  return false;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function notifierIsDisabled(monitoringRequestId) {
  let status = monitoringRequestStatuses[monitoringRequestId];
  return !status || status == 'cancelled';
}

// TODO
// In future we could fetch information about markets from smart contracts
// Currently we use hardcoded mapping "marketsTitles"
function getNiceTokenName(address) {
  let marketsTitles = {
    '0xA837648E8E9A93b50Db0bC670c9E46683d3a8026': 'CARE CHECK | Plant the seed of change in South Africa',
    '0x34Ff635fa22D0D6C3511cBB31A8243811c59cd78': 'PLANT TREES | Plant the seed of change in South Africa',
  };

  if (marketsTitles[address]) {
    return marketsTitles[address];
  }
  return address;
}

function runNotifier(monitoringRequestId, mmContractAddress, condition, emailTo) {
  function notifierLog(msg) {
    console.log(`MonitoringRequestId: ${monitoringRequestId}: ${msg}`);
  }

  notifierLog(
    `Notifier started for: ${mmContractAddress} with the condition: ${JSON.stringify(condition)}`);
  listenOnTradeEvents(mmContractAddress, async function() {
    // We skip every event if current notifier is disabled
    if (notifierIsDisabled(monitoringRequestId)) {
      notifierLog('This notifier is disabled, skipping');
      return;
    }

    notifierLog('Trade event dispatched');
    await sleep(TIMEOUT_BEFORE_PRICE_CHECKING); // We need to wait a bit for price to be updated

    notifierLog('Checking if condition is fulfilled.');
    let curPrices = await getCurPrices(mmContractAddress);

    if (isConditionFulfilled(condition, curPrices)) {
      notifierLog('Condition is fulfilled. Sending email notification.');
      await sendPriceChangedNotificationByEmail(
        emailTo,
        getNiceTokenName(mmContractAddress),
        curPrices,
        monitoringRequestId);
    } else {
      notifierLog('Condition is not fulfilled. Skipping.');
    }
  });
}

// TODO later we can implement checking if we should process this request
// by checking providerId
async function runMonitoringService() {
  console.log('Registering a new monitoring service provider');
  await registerServiceProvider();
  console.log('New service provider registered. Listening on MonitoringRequest events..');
  listenOnMonitoringRequestCreation(async function({ requestId }) {
    console.log(`Got new monitoring request: ${requestId}`);
    monitoringRequest.activate(requestId);
    const {
      contractAddress,
      condition,
      emailTo } = await getMonitoringRequestDetails(requestId);
    runNotifier(requestId, contractAddress, condition, emailTo);
  });

  // TODO implement cancellation handling later
  // listenOnMonitoringRequestCancellation(function({ requestId })) {
  //   monitoringRequest.cancell(requestId);
  // }
}

runMonitoringService();

// Example code of running notifier
// runNotifier(0, '0x4c2ba32ce9a06c380e9b954298e2959c35a17921', {
//   type: CONDITION_TYPES.GREATER_THAN,
//   price: 0.504},
//  'alex@alice.si'
// );
// monitoringRequestStatuses[0] = 'active';