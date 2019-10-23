<template>
  <md-app>
    <md-app-toolbar class="md-primary">
      <span class="md-title">Social Impact Signalling</span>
      <div class="md-toolbar-section-end">
        Balance:  {{this.$store.state.gnosis.sTokenBalance}}
      </div>
    </md-app-toolbar>

    <md-app-content>

    <md-card>
      <md-card-header>
        <div class="md-title">Smart prediction markets</div>
        <div class="md-subhead">by Alice</div>
      </md-card-header>
      <md-card-content>


        <md-button class="md-raised md-primary" v-on:click="getTokens()">Get tokens</md-button>
        <br />
        <md-table>
          <md-table-row>
            <md-table-head md-numeric>ID</md-table-head>
            <md-table-head>Contract</md-table-head>
            <md-table-head>Address</md-table-head>
            <md-table-head>Action</md-table-head>
          </md-table-row>

          <md-table-row>
            <md-table-cell md-numeric>1</md-table-cell>
            <md-table-cell>Signalling token</md-table-cell>
            <md-table-cell>{{this.$store.state.gnosis.sTokenAddress}}</md-table-cell>
            <md-table-cell>
              <md-button class="md-icon-button md-dense md-primary md-raised" v-on:click="deployToken()">
                <md-icon>cloud_upload</md-icon>
              </md-button>
            </md-table-cell>
          </md-table-row>

          <md-table-row>
            <md-table-cell md-numeric>2</md-table-cell>
            <md-table-cell>Conditional Tokens</md-table-cell>
            <md-table-cell>{{this.$store.state.gnosis.conditionalTokensAddress}}</md-table-cell>
            <md-table-cell>
              <md-button class="md-icon-button md-dense md-primary md-raised" v-on:click="deployConditionalTokens()">
                <md-icon>cloud_upload</md-icon>
              </md-button>
            </md-table-cell>
          </md-table-row>

        </md-table>

      </md-card-content>
    </md-card>
    </md-app-content>
  </md-app>
</template>

<script>
  import { mapState } from 'vuex';

  export default {
    name: 'app',

    data: function () {
      return {
        contacts: []
      }
    },
    methods: {
      deployToken: function() {
        this.$store.dispatch('gnosis/deploySignallingToken');
      },
      deployConditionalTokens: function() {
        this.$store.dispatch('gnosis/deployConditionalTokens');
      },
      getTokens: function() {
        this.$store.dispatch('gnosis/getSignallingTokens', 10);
      }
    },
    mounted: function () {
      this.$store.dispatch('gnosis/initContracts');
    }
  }
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
