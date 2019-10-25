<template>
  <div class="page-container">
    <md-content>
      <md-card v-for="(market, index) in this.$store.state.gnosis.markets" :key="market.outcome">
        <md-card-content>

          {{market.address}}

          <span class="card-buttons">
            <md-card-expand-trigger v-if="market.allowance > 0">
              <md-button class="md-icon-button">
                <md-icon>keyboard_arrow_down</md-icon>
              </md-button>
            </md-card-expand-trigger>

            <md-button @click="joinMarket(market)" class="md-icon-button md-dense" v-else>
              <md-icon>vpn_key</md-icon>
              <md-tooltip md-direction="right">Join market</md-tooltip>
            </md-button>
          </span>

        </md-card-content>

        <md-card-expand>



          <md-card-expand-content>
            <md-card-content>
              <md-button @click="buy(market)" class="md-icon-button md-dense md-raised md-primary">
                <md-icon>add</md-icon>
              </md-button>
              Lorem ipsum dolor sit amet, consectetur adipisicing elit. Optio itaque ea, nostrum odio. Dolores, sed accusantium quasi non, voluptas eius illo quas, saepe voluptate pariatur in deleniti minus sint. Excepturi.
            </md-card-content>
          </md-card-expand-content>
        </md-card-expand>


      </md-card>
    </md-content>

  </div>
</template>


<script>
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

  .md-card {
    margin-top: 20px;
  }

  .md-card-content {
    line-height: 40px !important;
    padding: 10px !important;
  }

  .card-buttons {
    float: right;
  }

</style>
