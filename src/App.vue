<template>
  <md-app>
    <md-app-toolbar class="md-primary">
      <span class="md-title">Social Impact Signalling</span>
      <div class="md-toolbar-section-end">
        Connected to {{this.$store.state.ethers.network}}
      </div>
    </md-app-toolbar>

    <md-app-content>

    <md-card>
      <md-card-header>
        <div class="md-title">Smart prediction markets</div>
        <div class="md-subhead">by Alice</div>
      </md-card-header>
      <md-card-content>

        <md-button class="md-raised md-primary" v-on:click="deploy()">Deploy</md-button>
        <md-button class="md-raised md-primary" v-on:click="clearTable()">Clear table</md-button>
        <br />
        PMS: {{this.$store.state.gnosis.pms}}

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
      deploy: function() {
        console.log("Deploying...");
        this.$store.dispatch('gnosis/deployPms');
      },
      clearTable: function() {
        this.contacts.splice(0, this.contacts.length);
      }
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
