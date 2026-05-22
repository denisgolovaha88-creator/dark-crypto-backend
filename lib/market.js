async function getMarketData() {

  try {

    const response =
      await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,binancecoin,solana,ripple&vs_currencies=usd"
      );

    const data =
      await response.json();

    return {

      BTC:
        data.bitcoin?.usd || "0",

      ETH:
        data.ethereum?.usd || "0",

      BNB:
        data.binancecoin?.usd || "0",

      SOL:
        data.solana?.usd || "0",

      XRP:
        data.ripple?.usd || "0"
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
