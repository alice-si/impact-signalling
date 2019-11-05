<template>
  <div class="page-container">
    <md-content>
      <md-card v-for="(market, index) in this.$store.state.gnosis.markets" :key="market.outcome">
        <md-card-content>

          {{market.project}}

          <span class="card-buttons">
            <md-card-expand-trigger v-if="market.allowance > 0">
              <md-button class="md-icon-button">
                <md-icon>keyboard_arrow_down</md-icon>
              </md-button>
            </md-card-expand-trigger>

            <md-button @click="joinMarket(market)" class="md-icon-button md-dense" v-else>
              <md-icon>vpn_key</md-icon>
              <md-tooltip md-direction="right">Join market</md-tooltip>
            </md-button>
          </span>

        </md-card-content>

        <md-card-expand>


          <md-card-expand-content>
            <md-card-content style="text-align:center;">

              <PriceChart :market="market" />

              <div style="margin-left:50px;">
                <div style="float: left">
                  <md-button class="buy-sell" @click="buyNo(market)"> Buy @ {{market.costBuyNo}}</md-button>
                  <br/>
                  <md-button class="buy-sell" @click="sellNo(market)"> Sell @ {{market.costSellNo}}</md-button>
                </div>

                <md-badge class="md-primary" md-position="bottom" :md-content="market.noBalance" style="float:left;">
                  <md-button @click="buyNo(market)" class="md-icon-button md-raised md-accent market-icon">
                    <md-icon style="color: white;">thumb_down</md-icon>
                  </md-button>
                </md-badge>
              </div>

              <span style="line-height: 60px;">
                Address: <b>{{market.address}}</b>
              </span>


              <div style="float: right; margin-right: 50px;">
                <md-button class="buy-sell" @click="buyYes(market)"> Buy @ {{market.costBuyYes}}</md-button>
                <br/>
                <md-button class="buy-sell" @click="sellYes(market)"> Sell @ {{market.costSellYes}}</md-button>
              </div>

              <md-badge class="md-primary" md-position="bottom" :md-content="market.yesBalance" style="float:right;">
                <md-button @click="buyYes(market)"  class="md-icon-button md-raised md-yes market-icon">
                  <md-icon style="color: white;">thumb_up</md-icon>
                </md-button>
              </md-badge>

            </md-card-content>
          </md-card-expand-content>
        </md-card-expand>


      </md-card>
    </md-content>

  </div>
</template>


<script>
  const ethers = require('ethers');
  import {
    updateMarket
  } from '../store/gnosis/contracts';
  import PriceChart from '../components/PriceChart';

  const ONE = ethers.utils.parseEther("1");
  const MIN_ONE = ethers.utils.parseEther("-1");

  export default {
    name: 'Trade',

    components: {
      PriceChart,
    },

    data: () => ({
      newMarket: {},
      showAddPanel: false,
      sending: false
    }),
    methods: {
      joinMarket: function (market) {
        console.log("Joining market: " + market.address);
        this.$store.dispatch('gnosis/joinMarket', market);
      },

      buyYes: function (market) {
        console.log("Buying YES tokens");
        this.$store.dispatch('gnosis/trade', {market: market, yesAmount: ONE, noAmount: 0});
      },
      buyNo: function (market) {
        this.$store.dispatch('gnosis/trade', {market: market, yesAmount: 0, noAmount: ONE});
      },
      sellYes: function (market) {
        this.$store.dispatch('gnosis/trade', {market: market, yesAmount: MIN_ONE, noAmount: ONE});
      },
      sellNo: function (market) {
        this.$store.dispatch('gnosis/trade', {market: market, yesAmount: 0, noAmount: MIN_ONE});
      },

    }
  }
</script>

<style scoped>


  .page-container {
    min-height: 600px;
    overflow: hidden;
    position: relative;
  }

  .md-drawer {
    width: 400px;
    max-width: calc(100vw - 125px);
    border: 1px solid gray;
    height: 400px;
  }

  .md-card {
    margin-top: 20px;
  }

  .md-card-content {
    line-height: 40px !important;
    padding: 10px !important;
  }

  .card-buttons {
    float: right;
  }

  .md-yes {
    background-color: #42b983 !important;
    color: white !important;
    float: right;

  }

  .market-icon {
    margin-top: 15px;
  }

  .buy-sell {
    margin: 0px !important;
  }


</style>
