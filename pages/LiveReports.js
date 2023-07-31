let selectedChart;
let chartInterval;
let selectedCoins = [];

const colors = [
  "#FF0000", // Red
  "#00FF00", // Green
  "#0000FF", // Blue
  "#FFFF00", // Yellow
  "#FF00FF", // Magenta
]; // Predefined colors

function clearChartData() {
  if (selectedChart) {
    selectedChart.data.labels = [];
    selectedChart.data.datasets = [];
    selectedChart.update();
  }
}

function loadReports() {
    $("#searchForm").attr("style", "display: none !important;");
    $("#container").empty();
    $("#container").html('<canvas id="liveReportsChart" style="width:100%;max-width:800px"></canvas>');
    selectedCoins = sessionStorage.getItem("selectedCoins");
    selectedCoins = JSON.parse(selectedCoins);
    clearChartData();
  
    if (selectedCoins && selectedCoins.length > 0) {
      chartData();
      chartDataItems(); // Make initial API request immediately
      chartInterval = setInterval(chartDataItems, 5000);
    } else {
      $("#container").html(`<p class="bg-dark text-warning">Please select coins to view reports.</p>`);
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
      $("#searchForm").show();
      $("#container").empty();
      window.mount();
    });
  });

async function chartDataItems() {
  if (!selectedCoins || selectedCoins.length === 0) {
    $("#container").html(`<p class="text-white">Please select coins to view reports.</p>`);
    return;
  }

  for (const [index, coin] of selectedCoins.entries()) {
    const response = await fetch(`https://api.coingecko.com/api/v3/coins/${coin}`);
    const data = await response.json();
    const price = data.market_data.current_price.usd;

    // Display the real value of the coin next to the data point
    const realValueLabel = `${coin}: $${price.toFixed(2)}`;

    selectedChart.data.datasets[index].data.push(price);
    selectedChart.data.datasets[index].data = selectedChart.data.datasets[index].data.slice(-20);
    selectedChart.data.datasets[index].realValueLabel = realValueLabel;
  }

  selectedChart.data.labels.push(new Date().toLocaleTimeString());
  selectedChart.data.labels = selectedChart.data.labels.slice(-20);

  selectedChart.update();
}

function chartData() {
    selectedChart = new Chart("liveReportsChart", {
      type: "line",
      data: {
        labels: [],
        datasets: selectedCoins.map((coin, index) => ({
          label: coin,
          data: [],
          borderColor: colors[index % colors.length],
          fill: false,
          borderWidth: 2,
        })),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        legend: {
          display: true,
          labels: {
            fontColor: "white",
          },
        },
        scales: {
          x: {
            ticks: {
              fontColor: "white",
            },
            grid: {
              color: "rgba(255, 255, 255, 0.1)",
            },
          },
          y: {
            type: "logarithmic", // Use linear scale
            ticks: {
              fontColor: "white",
              callback: function (value, index, values) {
                // Calculate the dynamic step size based on the range of values
                const max = Math.max(...values);
                const min = Math.min(...values);
                const range = max - min;
                const stepSize = range < 1 ? 0.0001 : range / 10;
                return "$" + value.toFixed(stepSize >= 1 ? 2 : 6); // Display values with 2 decimal places if stepSize is >= 1, otherwise 6 decimal places
              },
            },
            grid: {
              color: "rgba(255, 255, 255, 0.1)",
            },
          },
        },
        plugins: {
          legend: {
            labels: {
              color: "rgba(255, 255, 255, 0.87)",
            },
          },
        },
      },
    });
  }