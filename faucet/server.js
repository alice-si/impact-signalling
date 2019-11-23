const express = require("express");
const morgan = require("morgan");
const moment = require("moment");
const bodyParser = require("body-parser");
const cors = require("cors");
const asyncHandler = require("express-async-handler");

const {
  sendEthersToAddress,
  sendTokensToAddress,
  getTxStatus } = require("./contracts");

const {
  faucetSecretKey
} = require("../secrets");

const PORT = 3000;
const app = express();

// let state = {
//   ethersRequests: {},
//   tokensRequests: {},
// };

// function listenOnTxUpdates(tx, requestType) {
//   state[requestType][tx.hash] = {
//     status: 'started'
//   };
//   tx.wait().then(() => {
//     state[requestType][tx.hash] = {
//       status: 'completed'
//     };
//   }).catch((err) => {
//     state[requestType][tx.hash] = {
//       status: 'error',
//       msg: JSON.stringify(err) + '|||' + err.toString()
//     };
//   });
// }

//////////// App configuration ////////////

app.use(bodyParser.json()); // parse application/json
morgan.token('date', function() {
  return '[' + moment().format('DD/MMM/YYYY:HH:mm:ss') + '] ';
});
app.use(morgan(':date :method :url :status :response-time ms - :res[content-length]'));
app.use(cors());

//////////// App endpoints ////////////

app.get("/api/giveMeEthers/:address/:secretKey", asyncHandler(async (req, res, next) => {
  if (req.params.secretKey !== faucetSecretKey) {
    return res.status(401).send();
  }
  let tx = await sendEthersToAddress(req.params.address);
  return res.json({hash: tx.hash});
}));

app.get("/api/giveMeTokens/:address/:secretKey", asyncHandler(async (req, res, next) => {
  if (req.params.secretKey !== faucetSecretKey) {
    return res.status(401).send();
  }
  let tx = await sendTokensToAddress(req.params.address);
  // listenOnTxUpdates(tx, 'tokensRequests');
  return res.json({hash: tx.hash});
}));

app.get("/api/getTxStatus/:txHash", asyncHandler(async (req, res, next) => {
  let status = await getTxStatus(req.params.txHash);
  return res.json({ status });
}));

//////////// App running ////////////

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
