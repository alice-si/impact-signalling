<template>
  <div class="page-container">
    <md-content>
      <md-card>
        <md-card-header>
          <div class="md-title">Active Markets</div>
          <div class="md-subhead">on which users can signal the changes of success</div>
        </md-card-header>
        <md-card-content>

          <md-table>
            <md-table-row>
              <md-table-head md-numeric>ID</md-table-head>
              <md-table-head>Project</md-table-head>
              <md-table-head>Outcome</md-table-head>
              <md-table-head>Address</md-table-head>
              <md-table-head>Ratio</md-table-head>
            </md-table-row>

            <md-table-row v-for="(market, index) in this.$store.state.gnosis.markets" :key="market.outcome">
              <md-table-cell md-numeric>{{index + 1}}</md-table-cell>
              <md-table-cell>{{market.project}}</md-table-cell>
              <md-table-cell>{{market.outcome}}</md-table-cell>
              <md-table-cell>{{market.address}}</md-table-cell>
              <md-table-cell>{{market.ratio}}%</md-table-cell>
            </md-table-row>
          </md-table>

          <md-button class="md-primary" @click="addMarket()">Add Market</md-button>

        </md-card-content>
      </md-card>
    </md-content>

    <md-drawer class="md-drawer md-right" :md-active.sync="showAddPanel" md-swipeable>
      <md-toolbar class="md-primary">
        <span class="md-title">Add market</span>
      </md-toolbar>


      <div class="form">
        <div class="md-layout-item md-small-size-100">
          <md-field>
            <label for="project">Project</label>
            <md-input name="project" id="project" v-model="newMarket.project" :disabled="sending"/>
          </md-field>
        </div>

        <div class="md-layout-item md-small-size-100">
          <md-field>
            <label for="address">Ethereum address</label>
            <md-input name="address" id="address" v-model="newMarket.address" :disabled="sending"/>
          </md-field>
        </div>

        <div class="md-layout-item md-small-size-100">
          <md-field>
            <label for="tokens">Tokens</label>
            <md-input name="tokens" id="tokens" v-model="newMarket.tokens" :disabled="sending"/>
          </md-field>
        </div>

        <md-button class="md-primary" @click="deployMarket()">Deploy Market</md-button>
      </div>


    </md-drawer>

  </div>
</template>


<script>
  import {gql} from "apollo-boost";
  import axios from 'axios'

  let data = {
    query: '{allProjects {title} }'
  };

  function sendQuery() {
    $.post( "https://api.stage.alice.si/graphql", data).done(function( data ) {
      console.log('Sent successfully');
      console.log(data);
      console.log('Hey :)');
    });
  }

  export default {
    name: 'Markets',

    // apollo: {
    //   // Simple query that will update the 'hello' vue property
    //   projects: gql`{allProjects {title} }`,
    // },

    data: () => ({

      newMarket: {},
      showAddPanel: false,
      sending: false
    }),
    methods: {
      addMarket: async function () {
        //this.showAddPanel = true;

        //APOLLO QUERY
        //this.projects = await this.$apollo.query.projects;

        //AXIOS QUERY
        // axios.post('https://api.stage.alice.si/graphql/', {
        //   query: '{allProjects {title} }'
        // })

        //JQUERY QUERY
        sendQuery();
      },
      deployMarket: function () {
        this.$store.dispatch('gnosis/addMarket', JSON.parse(JSON.stringify(this.newMarket)));
        this.showAddPanel = false;
        this.newMarket = {};
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
