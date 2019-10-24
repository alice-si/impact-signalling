<template>
  <div class="page-container">
    <md-content>
      <md-card>
        <md-card-header>
          <div class="md-title">Registered users</div>
          <div class="md-subhead">Allowed to trade on impact prediction markets</div>
        </md-card-header>
        <md-card-content>


          <md-table>
            <md-table-row>
              <md-table-head md-numeric>ID</md-table-head>
              <md-table-head>Name</md-table-head>
              <md-table-head>Address</md-table-head>
              <md-table-head>Balance</md-table-head>
            </md-table-row>

            <md-table-row v-for="(user, index) in this.$store.state.gnosis.users" :key="user.name">
              <md-table-cell md-numeric>{{index + 1}}</md-table-cell>
              <md-table-cell>{{user.name}}</md-table-cell>
              <md-table-cell>{{user.address}}</md-table-cell>
              <md-table-cell>{{user.tokens}}</md-table-cell>
            </md-table-row>
          </md-table>

          <md-button class="md-primary" @click="addUser()">Add User</md-button>

        </md-card-content>
      </md-card>
    </md-content>

    <md-drawer class="md-drawer md-right" :md-active.sync="showAddPanel" md-swipeable>
      <md-toolbar class="md-primary" >
        <span class="md-title">Add user</span>
      </md-toolbar>


      <div class="form">
        <div class="md-layout-item md-small-size-100">
          <md-field>
            <label for="name">Name</label>
            <md-input name="name" id="name" v-model="newUser.name" :disabled="sending" />
          </md-field>
        </div>

        <div class="md-layout-item md-small-size-100">
          <md-field>
            <label for="address">Ethereum address</label>
            <md-input name="address" id="address" v-model="newUser.address" :disabled="sending" />
          </md-field>
        </div>

        <div class="md-layout-item md-small-size-100">
          <md-field>
            <label for="tokens">Tokens</label>
            <md-input name="tokens" id="tokens" v-model="newUser.tokens" :disabled="sending" />
          </md-field>
        </div>

        <md-button class="md-primary" @click="saveUser()">Save User</md-button>
      </div>


    </md-drawer>

  </div>
</template>


<script>
  import {mapState} from 'vuex';

  export default {
    name: 'users',

    data: () => ({
      newUser: {tokens: 10},
      showAddPanel: false,
      sending: false
    }),
    methods: {
      addUser: function () {
        this.showAddPanel = true;
        //this.$store.dispatch('gnosis/addUser', JSON.parse(JSON.stringify(this.newUser)));
      },
      saveUser: function () {
        this.$store.dispatch('gnosis/addUser', JSON.parse(JSON.stringify(this.newUser)));
        this.showAddPanel = false;
        this.newUser = {tokens: 10};
      }
    },
    mounted: function () {
      this.$store.dispatch('gnosis/initContracts');
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
