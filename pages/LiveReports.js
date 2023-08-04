let chartData;
let chartInterval;

const CHART_COLORS = ["#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF"];
const CHART_INTERVAL_TIME = 5_000;

$(document).ready(mountLiveReportPage);

function mountLiveReportPage() {
  $("#liveReportsPage").click(function (event) {
    event.preventDefault();
    loadLiveReportPage();
  });

  $("#homePage").click(moveToHomePage);
}

function moveToHomePage(event) {
  event.preventDefault();
  if (chartInterval) clearInterval(chartInterval);
  $("#search-form").show();
  $("#container").empty();
  mountHomePage();
}

function loadLiveReportPage() {
  moveToLiveReportPage();

  selectedCoins = getSessionStorage(SELECTED_COINS) ?? [];

  if (!selectedCoins || !selectedCoins.length) {
    renderEmptyChartMessage();
    return;
  }

  initializeChat();
  fillSelectedCoinsToChart();
  chartInterval = setInterval(fillSelectedCoinsToChart, CHART_INTERVAL_TIME);
}

function renderEmptyChartMessage() {
  $("#container").html(
    `<p class="bg-dark text-warning">Please select coins to view reports.</p>`
  );
}

function moveToLiveReportPage() {
  $("#search-form").attr("style", "display: none !important;");
  $("#container").empty();
  $("#container").html(
    '<div id="live-reports-chart" style="width:100%;max-width:800px"></div>'
  );
  clearChartData();
}

function initializeChat() {
  chartData = Highcharts.chart("live-reports-chart", {
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
      color: CHART_COLORS[index % CHART_COLORS.length],
    })),
  });
}

async function fillSelectedCoinsToChart() {
  const symbolsSelectedCoins = selectedCoins.map((sc) =>
    coinsData
      .find((coinsDataItem) => coinsDataItem.id === sc)
      .symbol.toUpperCase()
  );
  // Creating a comma-separated string of coin symbols
  const symbols = symbolsSelectedCoins.join(",");

  // Making one API call to get all the selected coins' data
  const response = await fetch(
    `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${symbols}&tsyms=USD`
  );
  const data = await response.json();

  // Adding the new data to the chart
  symbolsSelectedCoins.forEach((symbolsSelectedCoin, index) => {
    const price = data[symbolsSelectedCoin].USD;

    chartData.series[index].addPoint(
      {
        x: new Date().getTime(),
        y: price,
      },
      false
    );
  });

  chartData.redraw();
}

function clearChartData() {
  if (!chartData) return;
  chartData.destroy();
  chartData = null;
}
