let cache = global.cryptoCache || {
  timestamp: 0,
  cryptoData: null,
  marketData: null,
  fearGreed: null,
  news: null
};

global.cryptoCache = cache;

let userRunes = global.userRunes || {};
global.userRunes = userRunes;

module.exports = async (req, res) => {

  const telegramToken = "8821653271:AAEHIe7QhmcOOjxQFJ6DT5WPjZU9hczuVP8";
  const groqKey = "8821653271:AAEHIe7QhmcOOjxQFJ6DT5WPjZU9hczuVP8";

  if (req.method !== "POST") {
    return res.status(200).send("Crypto Nostradamus online 🔮");
  }

  const body = req.body;

  const chatId =
    body.message?.chat?.id ||
    body.callback_query?.message?.chat?.id;

  const userId =
    body.message?.from?.id ||
    body.callback_query?.from?.id;

  let text =
    body.message?.text ||
    body.callback_query?.data ||
    "";

  if (!chatId) {
    return res.status(200).end();
  }

  let cryptoData = {};
  let marketData = {};
  let fearGreed = {};
  let newsData = [];

  try {

    const now = Date.now();

    if (
      cache.cryptoData &&
      cache.marketData &&
      cache.fearGreed &&
      now - cache.timestamp < 30000
    ) {

      cryptoData = cache.cryptoData;
      marketData = cache.marketData;
      fearGreed = cache.fearGreed;
      newsData = cache.news;

    } else {

      const priceResponse = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,binancecoin,solana,ripple&vs_currencies=usd&include_24hr_change=true"
      );

      cryptoData = await priceResponse.json();

      async function loadChart(id) {

        const response = await fetch(
          `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=1`
        );

        return await response.json();
      }

      marketData = {

        btc: await loadChart("bitcoin"),
        eth: await loadChart("ethereum"),
        bnb: await loadChart("binancecoin"),
        sol: await loadChart("solana"),
        xrp: await loadChart("ripple")
      };

      const fearResponse = await fetch(
        "https://api.alternative.me/fng/"
      );

      fearGreed = await fearResponse.json();

      const newsResponse = await fetch(
        "https://min-api.cryptocompare.com/data/v2/news/?lang=EN"
      );

      const newsJson =
        await newsResponse.json();

      newsData =
        newsJson.Data?.slice(0, 5) || [];

      cache.cryptoData = cryptoData;
      cache.marketData = marketData;
      cache.fearGreed = fearGreed;
      cache.news = newsData;
      cache.timestamp = now;
    }

  } catch (e) {

    console.log(e);

    const reply = `
⚠️ MARKET DATA ERROR

🌌 Потоки рыночных данных нарушены.
`;

    await fetch(
      `https://api.telegram.org/bot${telegramToken}/sendMessage`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          chat_id: chatId,
          text: reply
        })
      }
    );

    return res.status(200).end();
  }

  const fearValue =
    fearGreed?.data?.[0]?.value || 50;

  const fearText =
    fearGreed?.data?.[0]?.value_classification ||
    "Neutral";

  const coins = {

    btc: {
      name: "Bitcoin",
      symbol: "₿",
      price: cryptoData.bitcoin?.usd || 0,
      change: cryptoData.bitcoin?.usd_24h_change || 0
    },

    eth: {
      name: "Ethereum",
      symbol: "⚡",
      price: cryptoData.ethereum?.usd || 0,
      change: cryptoData.ethereum?.usd_24h_change || 0
    },

    bnb: {
      name: "BNB",
      symbol: "🟡",
      price: cryptoData.binancecoin?.usd || 0,
      change: cryptoData.binancecoin?.usd_24h_change || 0
    },

    sol: {
      name: "Solana",
      symbol: "🟣",
      price: cryptoData.solana?.usd || 0,
      change: cryptoData.solana?.usd_24h_change || 0
    },

    xrp: {
      name: "XRP",
      symbol: "🔵",
      price: cryptoData.ripple?.usd || 0,
      change: cryptoData.ripple?.usd_24h_change || 0
    }
  };

  const strongestCoin =
    Object.values(coins).sort(
      (a, b) => b.change - a.change
    )[0];

  function calculateEMA(prices, period) {

    const multiplier =
      2 / (period + 1);

    let ema = prices[0];

    for (let i = 1; i < prices.length; i++) {

      ema =
        (prices[i] - ema) *
        multiplier +
        ema;
    }

    return ema;
  }

  function calculateRSI(prices, period = 14) {

    let gains = 0;
    let losses = 0;

    for (let i = 1; i <= period; i++) {

      const difference =
        prices[i] - prices[i - 1];

      if (difference >= 0) {
        gains += difference;
      } else {
        losses += Math.abs(difference);
      }
    }

    const avgGain =
      gains / period;

    const avgLoss =
      losses / period;

    if (avgLoss === 0) {
      return 100;
    }

    const rs =
      avgGain / avgLoss;

    return (
      100 -
      (100 / (1 + rs))
    );
  }

  function generateSignal(coin, symbol) {

    const prices =
      marketData[symbol]?.prices || [];

    if (!prices.length) {

      return `
⚠️ Анализ временно недоступен.
`;
    }

    const closes = prices.map(
      p => p[1]
    );

    const first = closes[0];
    const last = closes[closes.length - 1];

    const trendPercent =
      ((last - first) / first) * 100;

    const volatility =
      Math.max(...closes) -
      Math.min(...closes);

    const ema20 =
      calculateEMA(
        closes.slice(-20),
        20
      );

    const ema50 =
      calculateEMA(
        closes.slice(-50),
        50
      );

    const rsi =
      calculateRSI(
        closes.slice(-15)
      );

    const bullish =
      ema20 > ema50;

    let recommendation =
      "🟡 НЕЙТРАЛЬНО";

    if (
      bullish &&
      rsi < 70
    ) {
      recommendation =
        "🟢 ПОКУПАТЬ";
    }

    if (
      !bullish &&
      rsi > 40
    ) {
      recommendation =
        "🔴 ПРОДАВАТЬ";
    }

    let confidence =
      55;

    if (bullish) {
      confidence += 12;
    }

    if (rsi < 35 || rsi > 65) {
      confidence += 10;
    }

    if (fearValue < 25 || fearValue > 75) {
      confidence += 8;
    }

    confidence += Math.min(
      18,
      Math.floor(
        Math.abs(trendPercent)
      )
    );

    confidence = Math.min(
      98,
      confidence
    );

    let marketMood =
      "🌑 Рынок нестабилен";

    if (
      bullish &&
      rsi < 70
    ) {
      marketMood =
        "🔥 Бычья энергия усиливается";
    }

    if (
      !bullish &&
      rsi > 60
    ) {
      marketMood =
        "⚠️ Медвежье давление растёт";
    }

    const entryPrice = bullish
      ? (last * 0.994).toFixed(2)
      : (last * 0.985).toFixed(2);

    const targetPrice = bullish
      ? (last * 1.035).toFixed(2)
      : (last * 0.965).toFixed(2);

    const stopLoss = bullish
      ? (last * 0.98).toFixed(2)
      : (last * 1.02).toFixed(2);

    return `
🔮 ${coin.name.toUpperCase()} ORACLE

━━━━━━━━━━━━━━━

${coin.symbol} Цена:
$${last.toFixed(2)}

📈 Тренд:
${trendPercent.toFixed(2)}%

📊 RSI:
${rsi.toFixed(2)}

⚡ EMA20:
$${ema20.toFixed(2)}

🌑 EMA50:
$${ema50.toFixed(2)}

━━━━━━━━━━━━━━━

🜂 Рекомендация:
${recommendation}

🔮 Уверенность:
${confidence}%

━━━━━━━━━━━━━━━

💰 Оптимальный вход:
$${entryPrice}

🎯 Цель:
$${targetPrice}

🛡 Стоп-лосс:
$${stopLoss}

━━━━━━━━━━━━━━━

😱 Fear & Greed:
${fearValue} (${fearText})

${marketMood}

━━━━━━━━━━━━━━━

📰 Последний импульс рынка:

${newsData[0]?.title || "Новости скрыты туманом"}

━━━━━━━━━━━━━━━

🌌 День проходит под знаком:

${strongestCoin.name}
`;
  }

  const runes = [
    "ᚠ FEHU — руна богатства",
    "ᚱ RAIDHO — руна движения",
    "ᚲ KENAZ — руна прорыва",
    "ᚺ HAGALAZ — руна хаоса",
    "ᚨ ANSUZ — руна инсайта",
    "ᛉ ALGIZ — защита капитала",
    "ᛟ OTHALA — накопление силы"
  ];

  let reply = "";

  if (
    text === "/start" ||
    text === "/btc" ||
    text === "/eth" ||
    text === "/bnb" ||
    text === "/sol" ||
    text === "/xrp" ||
    text === "/signal" ||
    text === "/runes" ||
    text === "/news"
  ) {
    text = text.replace("/", "");
  }

  if (text === "start") {

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

😱 Fear & Greed:
${fearValue} (${fearText})

━━━━━━━━━━━━━━━

🌌 Сегодня рынок проходит под знаком:

${strongestCoin.name}

━━━━━━━━━━━━━━━

🐋 Whale energy detected
📰 News streams active
🔮 Mystic AI analysis active
`;

  } else if (
    text === "btc" ||
    text === "eth" ||
    text === "bnb" ||
    text === "sol" ||
    text === "xrp"
  ) {

    reply = generateSignal(
      coins[text],
      text
    );

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

😱 Fear & Greed:
${fearValue} (${fearText})

━━━━━━━━━━━━━━━

🌌 Сегодня рынок проходит под знаком:

${strongestCoin.name}
`;

  } else if (text === "news") {

    reply = `
📰 CRYPTO NEWS STREAM

━━━━━━━━━━━━━━━

${newsData
  .map(
    n => `• ${n.title}`
  )
  .join("\n\n")}
`;

  } else if (text === "runes") {

    const today =
      new Date().toDateString();

    if (
      userRunes[userId] &&
      userRunes[userId].date === today
    ) {

      reply = `
🪬 РУНА ДНЯ

━━━━━━━━━━━━━━━

${userRunes[userId].rune}

━━━━━━━━━━━━━━━

🌌 Руны уже открыли тебе путь сегодня.
`;

    } else {

      const rune =
        runes[
          Math.floor(
            Math.random() *
            runes.length
          )
        ];

      userRunes[userId] = {
        rune,
        date: today
      };

      reply = `
🪬 РУНА ДНЯ

━━━━━━━━━━━━━━━

${rune}

━━━━━━━━━━━━━━━

🌌 Руны открыли твой путь на сегодня.
`;
    }

  } else {

    try {

      const aiResponse = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",

        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${groqKey}`
          },

          body: JSON.stringify({

            model: "llama-3.3-70b-versatile",

            messages: [

              {
                role: "system",

                content:
                  "Ты Crypto Nostradamus — мистический AI оракул крипторынка. Отвечай только на русском."
              },

              {
                role: "user",

                content:
                  `
BTC: $${coins.btc.price}
ETH: $${coins.eth.price}

Fear & Greed:
${fearValue}

Последняя новость:
${newsData[0]?.title}

Вопрос:
${text}
`
              }
            ],

            temperature: 0.9,
            max_tokens: 300
          })
        }
      );

      const data =
        await aiResponse.json();

      reply =
        data.choices?.[0]?.message?.content ||
        "🔮 Оракул молчит.";

    } catch (e) {

      reply =
        "⚠️ AI потоки временно нестабильны.";
    }
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
                text: "📰 NEWS",
                callback_data: "news"
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
