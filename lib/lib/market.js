const COINDESK_API_KEY =
  "3cb3bc0dde8ee347745043db6ab2b5b06bb4e6fd55205549f6e6452dfc590f2a";

async function getMarketData() {

  try {

    const response =
      await fetch(
        "https://data-api.coindesk.com/spot/v1/latest/tick?market=binance&instruments=BTC-USDT,ETH-USDT,BNB-USDT,SOL-USDT,XRP-USDT",
        {
          headers: {
            authorization:
              `Apikey ${COINDESK_API_KEY}`
          }
        }
      );

    const json =
      await response.json();

    const data =
      json.Data || {};

    return {

      BTC:
        Number(
          data["BTC-USDT"]?.VALUE || 0
        ),

      ETH:
        Number(
          data["ETH-USDT"]?.VALUE || 0
        ),

      BNB:
        Number(
          data["BNB-USDT"]?.VALUE || 0
        ),

      SOL:
        Number(
          data["SOL-USDT"]?.VALUE || 0
        ),

      XRP:
        Number(
          data["XRP-USDT"]?.VALUE || 0
        )
    };

  } catch (e) {

    console.log(
      "MARKET ERROR",
      e
    );

    return {

      BTC: 0,
      ETH: 0,
      BNB: 0,
      SOL: 0,
      XRP: 0
    };
  }
}

module.exports = {
  getMarketData
};
