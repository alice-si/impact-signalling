<template>
  <div class="page-container">
    <md-content>
      <md-card v-for="(market, index) in this.$store.state.gnosis.markets" :key="market.outcome">
        <md-card-content>

          {{market.address}}

          <md-button @click="joinMarket(market)" class="md-icon-button md-dense md-raised md-primary">
            <md-icon>vpn_key</md-icon>
          </md-button>

          <md-button @click="buy(market)" class="md-icon-button md-dense md-raised md-primary">
            <md-icon>add</md-icon>
          </md-button>

        </md-card-content>
      </md-card>
    </md-content>

    <md-drawer class="md-drawer md-right" :md-active.sync="showAddPanel" md-swipeable>
      <md-toolbar class="md-primary" >
        <span class="md-title">Add market</span>
      </md-toolbar>


      <div class="form">
        <div class="md-layout-item md-small-size-100">
          <md-field>
            <label for="project">Project</label>
            <md-input name="project" id="project" v-model="newMarket.project" :disabled="sending" />
          </md-field>
        </div>

        <div class="md-layout-item md-small-size-100">
          <md-field>
            <label for="address">Ethereum address</label>
            <md-input name="address" id="address" v-model="newMarket.address" :disabled="sending" />
          </md-field>
        </div>

        <div class="md-layout-item md-small-size-100">
          <md-field>
            <label for="tokens">Tokens</label>
            <md-input name="tokens" id="tokens" v-model="newMarket.tokens" :disabled="sending" />
          </md-field>
        </div>

        <md-button class="md-primary" @click="deployMarket()">Deploy Market</md-button>
      </div>


    </md-drawer>

  </div>
</template>


<script>
  import {mapState} from 'vuex';

  export default {
    name: 'Trade',

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

      buy: function (market) {
        console.log("Buying on: " + market.address);
        this.$store.dispatch('gnosis/trade', market);
      }
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

  .form {
    padding: 20px;
  }

</style>
