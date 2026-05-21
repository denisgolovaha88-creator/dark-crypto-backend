async function getMarketData() {

  try {

    const response =
      await fetch(
        "https://api.coincap.io/v2/assets"
      );

    const json =
      await response.json();

    const assets =
      json.data || [];

    function find(symbol) {

      const coin =
        assets.find(
          c =>
            c.symbol === symbol
        );

      return coin
        ? Number(
            coin.priceUsd
          ).toFixed(2)
        : "0";
    }

    return {

      BTC: find("BTC"),

      ETH: find("ETH"),

      BNB: find("BNB"),

      SOL: find("SOL"),

      XRP: find("XRP")
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
