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
  GREATER_THAN: 'GREATER_THAN',
  LESS_THAN: 'LESS_THAN',
  EQUAL: 'EQUAL', // I am not sure if this condition type is useful
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

// TODO
// Current version of SimpleMonitoringService doesn't allow to
// pass information about price type, so we use
// costSellYes for GREATER_THAN condition and
// costBuyYes for LESS_THAN condition
function isConditionFulfilled(condition, curPrices) {
  if (condition.type == CONDITION_TYPES.GREATER_THAN) {
    return curPrices.costSellYes > condition.price;
  }
  if (condition.type == CONDITION_TYPES.LESS_THAN) {
    return curPrices.costBuyYes < condition.price;
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
        curPrices);
    } else {
      console.log('Condition is not fulfilled. Skipping.');
    }
  });
}

async function runMonitoringService() {
  console.log('Registering a new monitoring service provider');
  await registerServiceProvider();
  listenOnMonitoringRequestCreation(async function({ requestId }) {
    console.log(JSON.stringify(requestId));
    monitoringRequest.activate(requestId);
    console.log(await getMonitoringRequestDetails(requestId));
    // TODO alex uncomment when getMonitoringRequestDetails is debugged
    // const {
    //   contractAddress,
    //   condition,
    //   emailTo } = await getMonitoringRequestDetails(requestId);
    // runNotifier(params.requestId, contractAddress, condition, emailTo);
  });

  // TODO implement cancellation handling later
  // listenOnMonitoringRequestCancellation(function({ requestId })) {
  //   monitoringRequest.cancell(requestId);
  // }
}

// Example code of running notifier
runNotifier(0, '0x4c2ba32ce9a06c380e9b954298e2959c35a17921', {
  type: CONDITION_TYPES.GREATER_THAN,
  price: 0.504},
 'alex@alice.si'
);
monitoringRequestStatuses[0] = 'active';