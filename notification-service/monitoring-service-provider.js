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
        mmContractAddress,
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