const secrets = require('./secrets');
// aws will automatically load credentials from env variables:
// AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY
const aws = require('aws-sdk');
const mustache = require('mustache');
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));

const API_VERSION = '2010-12-01';
const CHARSET = 'UTF-8';
const templateDir = __dirname + '/templates/';

aws.config.update({region: secrets.aws.region});


async function send(mail) {
  let params = {
    Destination: {
      CcAddresses: [],
      ToAddresses: [mail.to],
    },
    Message: {
      Body: {
        Html: {
          Charset: CHARSET,
          Data: mail.html
        }
      },
      Subject: {
        Charset: CHARSET,
        Data: mail.subject
      }
    },
    Source: secrets.aws.sender,
    ReplyToAddresses: [],
  };

  let sendResult = await new aws.SES({apiVersion: API_VERSION})
    .sendEmail(params).promise();

  console.log('Email sent: ' + sendResult.MessageId);
}

// TODO update implementation to have result like 0x123...as
function shortenAddress(address) {
  const maxLen = 5;
  if (address.length <= maxLen) {
    return address;
  }
  return address.slice(0, maxLen) + '...';
}

async function sendPriceChangedNotificationByEmail(to, token, curPrices) {
  let subject = `Price for ${shortenAddress(token)} has been changed:`
   + ` ${curPrices.costBuyYes}(buy), ${curPrices.costSellYes}(sell)`;
  let template = await fs.readFileAsync(templateDir + 'price-changed.mustache', 'utf8');
  let html = mustache.render(template, { token, curPrices });
  await send({
    to,
    subject,
    html,
  });
}

module.exports = {
  sendPriceChangedNotificationByEmail,
};
