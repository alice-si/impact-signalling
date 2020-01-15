<template>
  <div class="price-chart">
    <line-chart :chart-data="chartData" :options="options" :styles="styles" ref="chart"></line-chart>
  </div>
</template>

<script>
import { listenOnPriceChanges } from '../store/gnosis/contracts';
import LineChart from './LineChart.js';
import Vue from 'vue';

export default {

  components: {
    LineChart,
  },

  data() {
    return {
      chartData: {
        datasets: [
          {
            label: 'PriceBuyYes',
            borderColor: '#34eba8',
            backgroundColor: '#34eba8',
            showLine: true,
            fill: false,
            data: [],
          },
          {
            label: 'PriceSellYes',
            borderColor: '#34ebeb',
            backgroundColor: '#34ebeb',
            showLine: true,
            fill: false,
            data: [],
          },
          {
            label: 'PriceBuyNo',
            borderColor: '#f5c842',
            backgroundColor: '#f5c842',
            showLine: true,
            fill: false,
            data: [],
          },
          {
            label: 'PriceSellNo',
            borderColor: '#e8eb34',
            backgroundColor: '#e8eb34',
            showLine: true,
            fill: false,
            data: [],
          },
        ],
      },
      options: {
        scales: {
          yAxes: [
          ],
          xAxes: [
            {
              type: 'time',
              time: {
              },
              ticks: {
                source: 'auto',
              }
            },
          ]
        },
        responsive: true,
        maintainAspectRatio: false,
      },
      styles: {
        height: '300px',
        position: 'relative',
      }
    };
  },

  props: {
    market: Object,
  },

  methods: {
    updateLineData(lineNr, price, timestamp) {
      let lineData = JSON.parse(JSON.stringify(this.chartData.datasets[lineNr].data));
      lineData.push({
        x: timestamp,
        y: price,
      });
      Vue.set(this.chartData.datasets[lineNr], 'data', lineData);
    },
    fillData() {
      let thisComponent = this;
      listenOnPriceChanges(this.market, function({
        priceBuyYes,
        priceSellYes,
        priceBuyNo,
        priceSellNo,
        timestamp,
      }) {
        // We receive timestamp in seconds, but chart js works with miliseconds
        timestamp *= 1000;
        thisComponent.updateLineData(0, priceBuyYes, timestamp);
        thisComponent.updateLineData(1, priceSellYes, timestamp);
        thisComponent.updateLineData(2, priceBuyNo, timestamp);
        thisComponent.updateLineData(3, priceSellNo, timestamp);

        if (thisComponent.$refs['chart']) {
          thisComponent.$refs['chart'].updateChart();
        }
      });
    },
  },

  mounted: function() {
    this.fillData();
  },
};
</script>

<style scoped>
.price-chart {
  height: 300px;
  margin-bottom: 20px;
}
</style>
