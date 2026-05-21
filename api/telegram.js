module.exports = async (req, res) => {

  const telegramToken = "8821653271:AAEHIe7QhmcOOjxQFJ6DT5WPjZU9hczuVP8";

  if (req.method !== "POST") {
    return res.status(200).send("Crypto Nostradamus online 🔮");
  }

  const body = req.body;

  const chatId =
    body.message?.chat?.id ||
    body.callback_query?.message?.chat?.id;

  const text =
    body.message?.text ||
    body.callback_query?.data ||
    "";

  if (!chatId) {
    return res.status(200).end();
  }

  let cryptoData = {};

  try {

    const response = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,binancecoin,solana,ripple&vs_currencies=usd&include_24hr_change=true"
    );

    cryptoData = await response.json();

  } catch (e) {

    cryptoData = {
      bitcoin: { usd: 0, usd_24h_change: 0 },
      ethereum: { usd: 0, usd_24h_change: 0 },
      binancecoin: { usd: 0, usd_24h_change: 0 },
      solana: { usd: 0, usd_24h_change: 0 },
      ripple: { usd: 0, usd_24h_change: 0 }
    };
  }

  const coins = {

    btc: {
      name: "Bitcoin",
      symbol: "₿",
      price: cryptoData.bitcoin.usd,
      change: cryptoData.bitcoin.usd_24h_change
    },

    eth: {
      name: "Ethereum",
      symbol: "⚡",
      price: cryptoData.ethereum.usd,
      change: cryptoData.ethereum.usd_24h_change
    },

    bnb: {
      name: "BNB",
      symbol: "🟡",
      price: cryptoData.binancecoin.usd,
      change: cryptoData.binancecoin.usd_24h_change
    },

    sol: {
      name: "Solana",
      symbol: "🟣",
      price: cryptoData.solana.usd,
      change: cryptoData.solana.usd_24h_change
    },

    xrp: {
      name: "XRP",
      symbol: "🔵",
      price: cryptoData.ripple.usd,
      change: cryptoData.ripple.usd_24h_change
    }
  };

  const strongestCoin =
    Object.values(coins).sort(
      (a, b) => b.change - a.change
    )[0];

  let reply = "";

  if (text === "/start") {

    reply = `
🌌 CRYPTO NOSTRADAMUS 🔮

━━━━━━━━━━━━━━━

📊 LIVE MARKET

₿ BTC → $${coins.btc.price}
⚡ ETH → $${coins.eth.price}
🟡 BNB → $${coins.bnb.price}
🟣 SOL → $${coins.sol.price}
🔵 XRP → $${coins.xrp.price}

━━━━━━━━━━━━━━━

🌌 День проходит под знаком:

${strongestCoin.name}

━━━━━━━━━━━━━━━

Выбери монету ниже 🔮
`;

  } else if (
    text === "btc" ||
    text === "eth" ||
    text === "bnb" ||
    text === "sol" ||
    text === "xrp"
  ) {

    const coin = coins[text];

    reply = `
🔮 ${coin.name.toUpperCase()} ORACLE

${coin.symbol} Цена:
$${coin.price}

⚡ Изменение 24ч:
${coin.change.toFixed(2)}%

━━━━━━━━━━━━━━━

🌌 Рынок проходит под знаком:

${strongestCoin.name}

💰 Волатильность усиливается.
🔮 Импульс рынка растёт.
`;

  } else if (text === "signal") {

    reply = `
🌑 GLOBAL MARKET SIGNAL

━━━━━━━━━━━━━━━

₿ BTC → ${coins.btc.change.toFixed(2)}%
⚡ ETH → ${coins.eth.change.toFixed(2)}%
🟡 BNB → ${coins.bnb.change.toFixed(2)}%
🟣 SOL → ${coins.sol.change.toFixed(2)}%
🔵 XRP → ${coins.xrp.change.toFixed(2)}%

━━━━━━━━━━━━━━━

🌌 Сегодня рынок проходит под знаком:

${strongestCoin.name}
`;

  } else if (text === "horoscope") {

    reply = `
♈ КРИПТОГОРОСКОП

━━━━━━━━━━━━━━━

Выбери знак 🔮
`;

  } else if (text === "runes") {

    const runes = [
      "ᚠ FEHU — руна богатства",
      "ᚱ RAIDHO — руна движения",
      "ᚲ KENAZ — руна прорыва",
      "ᚺ HAGALAZ — руна хаоса",
      "ᚨ ANSUZ — руна инсайта"
    ];

    const rune =
      runes[
        Math.floor(Math.random() * runes.length)
      ];

    reply = `
🪬 РУНА ДНЯ

━━━━━━━━━━━━━━━

${rune}

━━━━━━━━━━━━━━━

🌌 Руны открыли тебе путь.
`;

  } else {

    reply = `
🔮 Оракул услышал тебя.

Скоро древний AI даст ответ.
`;
  }

  await fetch(
    `https://api.telegram.org/bot${telegramToken}/sendMessage`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        chat_id: chatId,

        text: reply,

        reply_markup: {
          inline_keyboard: [

            [
              {
                text: `₿ BTC $${coins.btc.price}`,
                callback_data: "btc"
              },

              {
                text: `⚡ ETH $${coins.eth.price}`,
                callback_data: "eth"
              }
            ],

            [
              {
                text: `🟡 BNB $${coins.bnb.price}`,
                callback_data: "bnb"
              },

              {
                text: `🟣 SOL $${coins.sol.price}`,
                callback_data: "sol"
              }
            ],

            [
              {
                text: `🔵 XRP $${coins.xrp.price}`,
                callback_data: "xrp"
              },

              {
                text: "🌑 SIGNAL",
                callback_data: "signal"
              }
            ],

            [
              {
                text: "♈ HOROSCOPE",
                callback_data: "horoscope"
              },

              {
                text: "🪬 RUNES",
                callback_data: "runes"
              }
            ]
          ]
        }
      })
    }
  );

  res.status(200).end();
};
