# gnosis-signalling

> Use gnosis prediction market to signal social project performance. 

## To develop

``` bash
# install dependencies
yarn install

# compile smart contracts
truffle compile

# run ganache
ganache-cli --gasLimit 10000000 --mnemonic "spoon uncle park ritual alarm journey matter water apart warrior weird soap"

# deploy MarketMakerFactory contract
truffle migrate --network local

############ IMPORTANT ############

### get address of LMSRMarketMakerFactory contract from deployment output and replace it in src/store/gnosis/contracts.js

### get address of ConditionalTokens contract from deployment output and replace it in src/store/gnosis/contracts.js

### get address of SimpleMonitoringService from deployment output and replace it in notification-service/contracts.js and src/store/gnosis/contracts.js

###################################

# serve with hot reload at localhost:8080
yarn dev
```

## Tests
``` bash
truffle test --network local
```

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report
```

For a detailed explanation on how things work, check out the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).
