<template>
  <md-card>
    <md-card-header>
      <div class="md-title">Smart prediction markets</div>
      <div class="md-subhead">by Alice</div>
    </md-card-header>
    <md-card-content>


      <md-button class="md-raised md-primary" v-on:click="getTokens()">Get tokens</md-button>
      <br/>
      <md-table>
        <md-table-row>
          <md-table-head md-numeric>ID</md-table-head>
          <md-table-head>Contract</md-table-head>
          <md-table-head>Address</md-table-head>
          <md-table-head>Action</md-table-head>
        </md-table-row>

        <md-table-row>
          <md-table-cell md-numeric>1</md-table-cell>
          <md-table-cell>Signalling orchestrator</md-table-cell>
          <md-table-cell>{{this.$store.state.gnosis.orchestratorAddress}}</md-table-cell>
          <md-table-cell>
            <md-button class="md-icon-button md-dense md-primary md-raised" v-on:click="deployOrchestrator()">
              <md-icon>cloud_upload</md-icon>
            </md-button>
          </md-table-cell>
        </md-table-row>

        <md-table-row>
          <md-table-cell md-numeric>2</md-table-cell>
          <md-table-cell>Collateral token</md-table-cell>
          <md-table-cell>{{this.$store.state.gnosis.collateralAddress}}</md-table-cell>
        </md-table-row>

        <md-table-row>
          <md-table-cell md-numeric>3</md-table-cell>
          <md-table-cell>Whitelist</md-table-cell>
          <md-table-cell>{{this.$store.state.gnosis.whitelistAddress}}</md-table-cell>
        </md-table-row>

      </md-table>

    </md-card-content>
  </md-card>
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
      deployOrchestrator: function() {
        this.$store.dispatch('gnosis/deployOrchestrator');
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

</style>
