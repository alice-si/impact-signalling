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
                  v-if="route.path != '*'"
                  :to="route.path"

                  :md-label="route.name"
          exact>

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
</style>

