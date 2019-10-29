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

          <div class="button-space">
            <md-button class="md-primary" @click="addMarket()"> + Add Market</md-button>
          </div>

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
            <md-select v-model="selectedProject" name="project" id="project">
              <md-option v-for="(p, index) in allProjects" :value="index" :key="p.title">{{p.title}}</md-option>
            </md-select>
          </md-field>
        </div>

        <div class="md-layout-item md-small-size-100">
          <md-field v-if="selectedProject">
            <label for="outcome">Outcome</label>
            <md-select v-model="newMarket.outcome" name="outcome" id="outcome">
              <md-option v-for="(o, index) in allProjects[selectedProject]._outcomes" :value="o.title" :key="o.title">{{o.title}}</md-option>
            </md-select>
          </md-field>
        </div>

        <div class="button-space">
          <md-button class="md-primary md-raised" @click="deployMarket()">Deploy Market</md-button>
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
      selectedProject: null,
    }),

    methods: {
      addMarket: async function () {
        this.showAddPanel = true;

      },
      deployMarket: function () {
        this.newMarket.project = this.allProjects[this.selectedProject].title;
        console.log(this.newMarket);
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

  .button-space {
    text-align: center;
  }

</style>
