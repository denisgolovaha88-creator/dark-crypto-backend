async function getMarketData() {

  try {

    const response =
      await fetch(
        "https://api.binance.com/api/v3/ticker/24hr"
      );

    const data =
      await response.json();

    if (
      !Array.isArray(data)
    ) {

      console.log(
        "BINANCE RESPONSE",
        data
      );

      return {

        BTC: "0",
        ETH: "0",
        BNB: "0",
        SOL: "0",
        XRP: "0"
      };
    }

    function getPrice(symbol) {

      const coin =
        data.find(
          item =>
            item.symbol === symbol
        );

      if (!coin) {
        return "0";
      }

      return Number(
        coin.lastPrice
      ).toFixed(2);
    }

    return {

      BTC:
        getPrice("BTCUSDT"),

      ETH:
        getPrice("ETHUSDT"),

      BNB:
        getPrice("BNBUSDT"),

      SOL:
        getPrice("SOLUSDT"),

      XRP:
        getPrice("XRPUSDT")
    };

  } catch (e) {

    console.log(
      "MARKET ERROR",
      e
    );

    return {

      BTC: "0",
      ETH: "0",
      BNB: "0",
      SOL: "0",
      XRP: "0"
    };
  }
}

module.exports = {
  getMarketData
};
