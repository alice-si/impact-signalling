function getEnv(name, defaultVal) {
  let res = process.env[name];
  if (!res) {
    if (defaultVal) {
      return defaultVal;
    } else {
      throw new Error(`Env variable ${name} was not found`);
    }
  } else {
    return res;
  }
}

const conf = {
  aws: {
    region: getEnv('REGION', 'eu-west-1'),
    sender: getEnv('SENDER', 'alice@alice.si'),
  },
  mnemonic: getEnv('MNEMONIC'),
  faucetSecretKey: getEnv('FAUCET_SECRET_KEY'),
};

module.exports = conf;
