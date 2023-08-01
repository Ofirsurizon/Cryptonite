const COINS_URL =
  "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1";

const COINS_DATA = "coinsData";

let selectedCoins = getSessionStorage("selectedCoins") ?? [];
let currentItem;

$(document).ready(mount);

// mount the page
async function mount() {
  $("#modal-container").hide();
  await loadCoinsPage();
  $(".search-coins-input").off("input", onSearch).on("input", onSearch);
}
window.mount = mount;

function onSearch() {
  displayLoader();
  const searchTerm = $(this).val();
  searchInCoins(searchTerm);
  hideLoader();
}

async function loadCoinsPage() {
  displayLoader();
  const data = await getCoinsData();
  if (Array.isArray(data)) renderCoins(data);
  hideLoader();
}

async function getCoinsData() {
  const storageData = getSessionStorage(COINS_DATA);
  if (storageData) return storageData;

  const coinsData = await getCoinData();
  if (coinsData) saveSessionStorage(COINS_DATA, coinsData);
  return coinsData;
}

async function getCoinData() {
  try {
    displayLoader();
    const data = await fetchCoins();
    return data;
  } catch (err) {
    handleCoinError();
  } finally {
    hideLoader();
  }
}

async function fetchCoins() {
  const response = await fetch(COINS_URL);
  const data = await response.json();
  return data;
}

function searchInCoins(item) {
  let data = getSessionStorage(COINS_DATA);
  $("#container").empty();
  if (item === "") {
    renderCoins(data);
  } else {
    let filteredData = data.filter((coin) =>
      coin.name.toLowerCase().includes(item.toLowerCase())
    );
    renderCoins(filteredData);
  }
}

$("form").on("submit", function (event) {
  event.preventDefault();
});

function renderCoins(coins) {
  $("#container").empty()
  for (const coin of coins) {
    renderCoin(coin);
  }
}

function renderCoin(coin) {
  $("#container").append(
    `
    <div class="mt-5 card border" style="width: 18rem;">  
      <div class="text-center">
        <img class="crypto-logo card-img-top w-25" src="${coin.image}" alt="Card image cap">
      </div>
        
      <div class="card-body d-flex flex-column align-items-center">
        <h5 class="card-title text-center">${coin.symbol}</h5>
        <p class="card-text text-center ">${coin.name}</p>
        <a id="${coin.id}" class="btn btn-primary more-info">More info</a>
              <div class="mt-2 toggle-button">
          <label class="switch">
          <input type="checkbox" id="toggle-${coin.id}">
            <span class="slider round"></span>
          </label>
        </div>
      </div>
      <div class="coin-details" style="display: none;"></div>
  </div>
            </div>
        
        <div class="coin-details" style="display: none;"></div>
        </div>
        `
  );
  $("#" + coin.id).on("click", () => {
    $("#container").empty();
    displayLoader();
    moreInfo(coin);
    hideLoader();
  });

  $(() => {
    if (selectedCoins.find((id) => id == coin.id))
      $("#toggle-" + coin.id).prop("checked", true);
  });

  $("#toggle-" + coin.id).on("change", function () {
    if (this.checked) {
      if (selectedCoins.length >= 5) {
        this.checked = false;
        currentItem = coin;
        showCoinReplacementModal();
      } else {
        selectedCoins.push(coin.id);
      }
      saveSessionStorage("selectedCoins", selectedCoins);
    } else {
      selectedCoins = selectedCoins.filter((coinId) => coinId !== coin.id);
      saveSessionStorage("selectedCoins", selectedCoins);
    }
  });
}

//Session storage \\
function getSessionStorage(key) {
  const coinsData = sessionStorage.getItem(key);
  return coinsData ? JSON.parse(coinsData) : null;
}

function saveSessionStorage(key, value) {
  sessionStorage.setItem(key, JSON.stringify(value));
}

// loader Funcs \\
function hideLoader() {
  document.getElementById("loader").style.display = "none";
}

function displayLoader() {
  document.getElementById("loader").style.display = "block";
}

// Error handling

function handleCoinError() {
  $("#container").html("Had a network error").css({
    color: "white",
    margin: "0px auto",
    "text-align": "center",
    display: "block",
    "font-size": "20px",
  });
}

function showCoinReplacementModal() {
  $("#selectedCoinList").empty();

  selectedCoins.forEach((coinId) => {
    $("#selectedCoinList").append(
      `<li class="deselect-coin-item"><button class="deselect-coin" data-id="${coinId}">Deselect ${coinId}</button></li>`
    );
  });

  $("#selectedCoinList").append(
    `<li class="modal-close-div"><button class="modal-close">Close</button></li>`
  );

  $("#modal-container").show();
}

// coins selecting

$("#selectedCoinList").on("click", ".deselect-coin", function () {
  const coinId = $(this).data("id");

  $("#toggle-" + coinId)
    .prop("checked", false)
    .trigger("change");

  selectedCoins = selectedCoins.filter((Id) => Id !== coinId);

  if (currentItem) {
    selectedCoins.push(currentItem.id);

    $("#toggle-" + currentItem.id).prop("checked", true);
    currentItem = null;
  }

  $(this).parent().remove();
  $("#toggle-" + coinId).trigger("change");
});

// if has nothing hide
$("#modal-container").on("click", function (item) {
  if (!$(item.target).closest(".modal-content").length) {
    $("#modal-container").hide();
  }
});

//
$("#selectedCoinList").on("click", ".modal-close-div", function () {
  $("#modal-container").hide();
});

async function moreInfo(item) {
  const response = await fetch(
    `https://api.coingecko.com/api/v3/coins/${item.id}`
  );
  const coinData = await response.json();

  $("#container").html(
    `
    <div class="mt-5 card border">
      <div class="text-center">
        <img class="crypto-logo card-img-top w-25" src="${item.image}" alt="Card image cap">
     </div>
      <div class="card-body">
        <a class="custom-close"></a>
        <h5 class="card-title">${item.symbol}</h5>
        <p class="card-text">${item.name}</p>
        <table class="table">
          <tbody>
             <tr>
              <th>Price in ILS:</th>
              <td>${coinData.market_data.current_price.ils}₪</td>
            </tr>
             <tr>
              <th>Price in USD:</th>
              <td>${coinData.market_data.current_price.usd}$</td>
            </tr>
            <tr>
               <th>Price in EUR:</th>
                <td>${coinData.market_data.current_price.eur}€</td>
            </tr>
            <tr>
              <th>Last Updated:</th>
                <td>${item.last_updated}</td>
            </tr>
          </tbody>
        </table>
      </div>
          <div class="coin-details" style="display: none;"></div>
    </div>
      `
  );
}

// close btn

$("body").on("click", ".custom-close", async function () {
  $("#container").empty();
  await mount();
});
