<template>
  <div class="page-container">
    <md-content v-if="$store.state.gnosis.collateralBalance == 0 && $store.state.gnosis.balanceLoaded">
      <div class="warning-notification">
        WARNING: Please contact project admin at alice@alice.si to get access
      </div>
    </md-content>
    <md-content v-if="!$store.state.gnosis.balanceLoaded">
      Loading ...
    </md-content>
    <md-content v-if="$store.state.gnosis.collateralBalance > 0">
      <md-card>
        <md-card-header>
          <div class="md-title">Monitoring requests</div>
          <div class="md-subhead">you can add monitoring requests to be notified by email when price changes</div>
        </md-card-header>
        <md-card-content>

          <md-table>
            <md-table-row>
              <md-table-head md-numeric>ID</md-table-head>
              <md-table-head>Market</md-table-head>
              <md-table-head>Variable</md-table-head>
              <md-table-head>Condition</md-table-head>
              <md-table-head>Price</md-table-head>
              <md-table-head>Email</md-table-head>
            </md-table-row>

            <md-table-row v-for="(request, index) in this.$store.state.gnosis.monitoringRequests" :key="index">
              <md-table-cell md-numeric>{{ request.id }}</md-table-cell>
              <md-table-cell>{{ getMarketTitle(request.market) }}</md-table-cell>
              <md-table-cell>{{ request.variable }}</md-table-cell>
              <md-table-cell>{{ request.condition }}</md-table-cell>
              <md-table-cell>{{ request.price }}</md-table-cell>
              <md-table-cell>{{ request.email }}</md-table-cell>
            </md-table-row>
          </md-table>

          <div class="button-space">
            <md-button class="md-primary" @click="addMonitoringRequest()"> + Add monitoring request</md-button>
          </div>

        </md-card-content>
      </md-card>
    </md-content>

    <md-drawer class="md-drawer md-right" :md-active.sync="showAddPanel" md-swipeable>
      <md-toolbar class="md-primary">
        <span class="md-title">Add monitoring request</span>
      </md-toolbar>


      <div class="form">
        <div class="md-layout-item md-small-size-100">
          <md-field>
            <label for="market">Market</label>
            <md-select v-model="selectedMarket" name="market" id="market">
              <md-option v-for="(market, index) in this.$store.state.gnosis.markets" :value="market.address" :key="index">
                {{ market.outcome }} | {{ market.project }}
              </md-option>
            </md-select>
          </md-field>
        </div>

        <div class="md-layout-item md-small-size-100">
          <md-field>
            <label for="variable">Variable</label>
            <md-select v-model="selectedVariable" name="variable" id="variable">
              <md-option v-for="variable in variables" :value="variable" :key="variable">
                {{ variable }}
              </md-option>
            </md-select>
          </md-field>
        </div>

        <div class="md-layout-item md-small-size-100">
          <md-field>
            <label for="condition">Condition</label>
            <md-select v-model="selectedCondition" name="condition" id="condition">
              <md-option v-for="(condition, index) in conditions" :value="condition" :key="index">
                {{ condition }}
              </md-option>
            </md-select>
          </md-field>
        </div>

        <div class="md-layout-item md-small-size-100">
          <md-field>
            <label for="value">Value</label>
            <md-input type="number" name="value" id="value" v-model="value" />
          </md-field>
        </div>

        <div class="md-layout-item md-small-size-100">
          <md-field>
            <label for="email">Email</label>
            <md-input type="email" name="email" id="email" v-model="email" />
          </md-field>
        </div>

        <div class="button-space">
          <md-button class="md-primary md-raised" @click="sendAdditionTx()">ADD</md-button>
        </div>
      </div>


    </md-drawer>

  </div>
</template>


<script>
  import {gql} from "apollo-boost";

  export default {
    name: 'Markets',

    apollo: {
      // Simple query that will update the 'hello' vue property
      allProjects: gql`{allProjects {title _outcomes {title} } }`,
    },

    data: () => ({
      newMarket: {},
      showAddPanel: false,
      sending: false,
      selectedMarket: null,
      selectedCondition: null,
      selectedVariable: 'BUY_YES',
      value: 0,
      email: null,
      conditions: [
        'GREATER_THAN',
        'LESS_THAN',
      ],
      variables: [
        'BUY_YES',
        'SELL_YES',
        'BUY_NO',
        'SELL_NO'
      ]
    }),

    methods: {
      addMonitoringRequest: async function () {
        this.showAddPanel = true;
        console.log(this.$store.state);
      },
      getMarketTitle: function(address) {
        if (this.$store.state.gnosis.markets) {
          let marketFound = this.$store.state.gnosis.markets.find(el => el.address == address);
          if (marketFound) {
            return marketFound.outcome + ' | ' + marketFound.project;
          }
        }
        return address;
      },
      sendAdditionTx: function () {
        let newMonitoringRequest = {
          targetAddress: this.selectedMarket,
          variable: this.selectedVariable,
          condition: this.selectedCondition,
          value: Math.round(this.value * 1000000), // we divide it by 1000000 in monitoring-service code
          email: this.email,
        };
        this.$store.dispatch('gnosis/addMonitoringRequest', Object.assign(newMonitoringRequest));
        this.showAddPanel = false;
      },
      // deployMarket: function () {
      //   // this.newMarket.project = this.allProjects[this.selectedProject].title;
      //   // console.log(this.newMarket);
      //   this.$store.dispatch('gnosis/addMarket', JSON.parse(JSON.stringify(this.newMarket)));
      //   this.showAddPanel = false;
      //   this.newMarket = {};
      // }
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
    height: 500px;
  }

  .form {
    padding: 20px;
  }

  .button-space {
    text-align: center;
  }

  .market-address {
    font-size: 10px;
    color: gray;
  }
</style>
