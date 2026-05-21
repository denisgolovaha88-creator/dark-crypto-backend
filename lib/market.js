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

    function getPrice(
      symbol
    ) {

      const coin =
        assets.find(
          c =>
            c.symbol === symbol
        );

      if (!coin) {
        return "0";
      }

      return Number(
        coin.priceUsd
      ).toFixed(2);
    }

    return {

      BTC:
        getPrice("BTC"),

      ETH:
        getPrice("ETH"),

      BNB:
        getPrice("BNB"),

      SOL:
        getPrice("SOL"),

      XRP:
        getPrice("XRP")
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
