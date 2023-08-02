let selectedChart;
let chartInterval;

const colors = ["red", "green", "blue", "yellow", "magenta"];

function clearChartData() {
  if (selectedChart) {
    selectedChart.destroy();
    selectedChart = null; 
  }
}

function chartData() {
  selectedChart = Highcharts.chart('liveReportsChart', {
    chart: {
      type: 'line'
    },
    title: {
      text: 'Live Reports'
    },
    xAxis: {
      type: 'datetime',
    },
    yAxis: {
      title: {
        text: 'Price (USD)'
      }
    },
    series: selectedCoins.map((coin, index) => ({
      name: coin,
      data: [],
      color: colors[index % colors.length],
    })),
  });
}

function loadReports() {
  $("#search-form").attr("style", "display: none !important;");
  $("#container").empty();
  $("#container").html(
    '<div id="liveReportsChart" style="width:100%;max-width:800px"></div>'
  );

  selectedCoins = getSessionStorage(SELECTED_COINS) ?? [];

  clearChartData();

  if (selectedCoins && selectedCoins.length > 0) {
    chartData();
    chartDataItems(); 
    chartInterval = setInterval(chartDataItems, 5000);
  } else {
    $("#container").html(
      `<p class="bg-dark text-warning">Please select coins to view reports.</p>`
    );
  }
}

$(document).ready(function () {
  $("#liveRepotsPage").click(function (event) {
    event.preventDefault();
    loadReports();
  });

  $("#homePage").click(function (event) {
    event.preventDefault();
    clearInterval(chartInterval);
    $("#search-form").show();
    $("#container").empty();
    window.mount();
  });
});

async function chartDataItems() {
  if (!selectedCoins || selectedCoins.length === 0) {
    $("#container").html(
      `<p class="text-white">Please select coins to view reports.</p>`
    );
    return;
  }

  for (const [index, coin] of selectedCoins.entries()) {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/${coin}`
    );
    const data = await response.json();
    const price = data.market_data.current_price.usd;

    selectedChart.series[index].addPoint({
      x: new Date().getTime(),
      y: price,
    }, false);
  }

  selectedChart.redraw();
}
