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
  selectedChart = Highcharts.chart("liveReportsChart", {
    chart: {
      type: "line",
    },
    title: {
      text: "Live Reports",
    },
    xAxis: {
      type: "datetime",
    },
    yAxis: {
      title: {
        text: "Price (USD)",
      },
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
    mountHomePage();
  });
});

async function chartDataItems() {
  if (!selectedCoins || selectedCoins.length === 0) {
    $("#container").html(
      `<p class="text-white">Please select coins to view reports.</p>`
    );
    return;
  }

  // Creating a comma-separated string of coin symbols
  const symbols = selectedCoins
    .map(
      (sc) => coinsData.find((coinsDataItem) => coinsDataItem.id === sc).symbol.toUpperCase()
    )
    .join(",");

  // Making one API call to get all the selected coins' data
  const response = await fetch(
    `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${symbols}&tsyms=USD`
  );
  const data = await response.json();

  // Adding the new data to the chart
  selectedCoins.forEach((coin, index) => {
    const selectedSymbol = coinsData.find(
      (coinsDataItem) => coinsDataItem.id === coin
    ).symbol.toUpperCase();
    const price = data[selectedSymbol].USD;

    selectedChart.series[index].addPoint(
      {
        x: new Date().getTime(),
        y: price,
      },
      false
    );
  });

  selectedChart.redraw();
}
