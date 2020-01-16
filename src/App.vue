<template>
  <md-app>
    <md-app-toolbar class="md-primary">
      <span class="md-title">Social Impact Signalling</span>


      <div class="md-toolbar-row">

        <!--<md-tabs class="md-primary" md-sync-route>-->
          <!--<md-tab id="tab-home" md-label="Home" to="/" exact></md-tab>-->
          <!--<md-tab id="tab-admin" md-label="Admin" to="/admin" exact></md-tab>-->
        <!--</md-tabs>-->

        <md-tabs class="md-primary" md-sync-route>
          <md-tab v-for="route in $router.options.routes"
                  :key="route.path"
                  v-if="route.path != '*' && ($store.state.gnosis.myWalletAddress == ownerAddress || ['Trade', 'Monitor', 'Home'].includes(route.name))"
                  :to="route.path"

                  :md-label="route.name"
                  exact
          >

          </md-tab>
        </md-tabs>

      </div>

      <div class="md-toolbar-section-end">
        Balance:  {{$store.state.gnosis.collateralBalance}}
      </div>
    </md-app-toolbar>

    <md-app-content>
      <router-view></router-view>

    </md-app-content>
  </md-app>
</template>



<script>
  export default {
    computed: {
      ownerAddress() {
        // TODO
        // Currently it's hardcoded
        // Later we can get owner's address directly from contracts
        return '0x6Cb6334f3fc8Dc2b8e04311f7897D427FA96325A';
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

  .md-toolbar-row {
    width: auto;
  }

  .warning-notification {
    background: #f58c00;
    border-radius: 5px;
    color: white;
    padding-left: 10px;
    padding-top: 10px;
    padding-bottom: 10px;
    /* width: 600px; */
  }
</style>

