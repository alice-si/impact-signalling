const awsSesConfig = require('./awsSesConfig');
// aws will automatically load credentials from env variables:
// AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY
const aws = require('aws-sdk');
const mustache = require('mustache');
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));

const API_VERSION = '2010-12-01';
const CHARSET = 'UTF-8';
const templateDir = __dirname + '/templates/';

aws.config.update({region: awsSesConfig.region});


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
    Source: awsSesConfig.sender,
    ReplyToAddresses: [],
  };

  let sendResult = await new aws.SES({apiVersion: API_VERSION})
    .sendEmail(params).promise();

  console.log('Email sent: ' + sendResult.MessageId);
}

async function sendPriceChangedNotificationByEmail(to, token, curPrice) {
  let subject = `Price for ${token} has been changed. Current price: ${curPrice}`;
  let template = await fs.readFileAsync(templateDir + 'price-changed.mustache', 'utf8');
  let html = mustache.render(template, { token, curPrice });
  await send({
    to,
    subject,
    html,
  });
}

module.exports = {
  sendPriceChangedNotificationByEmail,
};
