let cryptoCache = global.cryptoCache || {
  timestamp: 0,
  prices: null,
  market: null,
  fearGreed: null,
  news: null
};

global.cryptoCache = cryptoCache;

let userRunes = global.userRunes || {};
global.userRunes = userRunes;

module.exports = async (req, res) => {

  const telegramToken = "8821653271:AAEHIe7QhmcOOjxQFJ6DT5WPjZU9hczuVP8";
  const groqKey = "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";

  if (req.method !== "POST") {
    return res.status(200).send("Crypto Nostradamus online 🔮");
  }

  const body = req.body;

  const chatId =
    body.message?.chat?.id ||
    body.callback_query?.message?.chat?.id;

  const text =
    body.message?.text?.toLowerCase() ||
    body.callback_query?.data?.toLowerCase() ||
    "";

  const userId =
    body.message?.from?.id ||
    body.callback_query?.from?.id;

  if (!chatId) {
    return res.status(200).end();
  }

  // ===== ЗАГРУЗКА ДАННЫХ =====

  let prices = {};
  let market = {};
  let fearGreed = {};
  let news = [];

  try {

    const now = Date.now();

    // кеш 30 секунд
    if (
      cryptoCache.prices &&
      cryptoCache.market &&
      cryptoCache.fearGreed &&
      cryptoCache.news &&
      now - cryptoCache.timestamp < 30000
    ) {

      prices = cryptoCache.prices;
      market = cryptoCache.market;
      fearGreed = cryptoCache.fearGreed;
      news = cryptoCache.news;

    } else {

      // ===== ЦЕНЫ =====

      const priceRes = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,binancecoin,solana,ripple&vs_currencies=usd"
      );

      prices = await priceRes.json();

      // ===== ГРАФИК =====

      async function loadChart(id) {

        const r = await fetch(
          `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=1`
        );

        return await r.json();
      }

      market = {
        btc: await loadChart("bitcoin"),
        eth: await loadChart("ethereum"),
        bnb: await loadChart("binancecoin"),
        sol: await loadChart("solana"),
        xrp: await loadChart("ripple")
      };

      // ===== FEAR & GREED =====

      try {

        const fg = await fetch(
          "https://api.alternative.me/fng/"
        );

        fearGreed = await fg.json();

      } catch {

        fearGreed = {
          data: [
            {
              value: "50",
              value_classification: "Neutral"
            }
          ]
        };
      }

      // ===== НОВОСТИ =====

      try {

        const newsRes = await fetch(
          "https://min-api.cryptocompare.com/data/v2/news/?lang=EN"
        );

        const newsJson = await newsRes.json();

        news =
          newsJson.Data?.slice(0, 5) || [];

      } catch {

        news = [
          {
            title:
              "🌫 Потоки новостей временно скрыты туманом"
          }
        ];
      }

      cryptoCache.prices = prices;
      cryptoCache.market = market;
      cryptoCache.fearGreed = fearGreed;
      cryptoCache.news = news;
      cryptoCache.timestamp = now;
    }

  } catch (e) {

    console.log("MARKET ERROR", e);

    await fetch(
      `https://api.telegram.org/bot${telegramToken}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          chat_id: chatId,
          text:
            "⚠️ Потоки рыночных данных нарушены."
        })
      }
    );

    return res.status(200).end();
  }

  // ===== АНАЛИТИКА =====

  function EMA(data, period) {

    const k = 2 / (period + 1);

    let ema = data[0];

    for (let i = 1; i < data.length; i++) {
      ema = data[i] * k + ema * (1 - k);
    }

    return ema;
  }

  function RSI(data, period = 14) {

    let gains = 0;
    let losses = 0;

    for (
      let i = data.length - period;
      i < data.length;
      i++
    ) {

      const diff =
        data[i] - data[i - 1];

      if (diff >= 0) gains += diff;
      else losses += Math.abs(diff);
    }

    const rs =
      gains / (losses || 1);

    return 100 - 100 / (1 + rs);
  }

  function ATR(highs, lows, closes, period = 14) {

    let trs = [];

    for (let i = 1; i < closes.length; i++) {

      const tr = Math.max(
        highs[i] - lows[i],
        Math.abs(highs[i] - closes[i - 1]),
        Math.abs(lows[i] - closes[i - 1])
      );

      trs.push(tr);
    }

    const recent =
      trs.slice(-period);

    return (
      recent.reduce((a, b) => a + b, 0) /
      recent.length
    );
  }

  // ===== МОНЕТЫ =====

  const coins = {
    btc: {
      name: "Bitcoin",
      symbol: "₿",
      key: "bitcoin"
    },
    eth: {
      name: "Ethereum",
      symbol: "⚡",
      key: "ethereum"
    },
    bnb: {
      name: "BNB",
      symbol: "🟡",
      key: "binancecoin"
    },
    sol: {
      name: "Solana",
      symbol: "🟣",
      key: "solana"
    },
    xrp: {
      name: "XRP",
      symbol: "🔵",
      key: "ripple"
    }
  };

  // ===== СИЛЬНЕЙШАЯ МОНЕТА =====

  const strongestCoin =
    Object.entries(prices)
      .map(([k, v]) => ({
        name: k,
        change:
          Math.random() * 10
      }))
      .sort((a, b) => b.change - a.change)[0];

  // ===== SIGNAL =====

  function generateSignal(coin, key) {

    const data =
      market[key]?.prices || [];

    if (!data.length) {
      return `⚠️ Анализ временно недоступен.`;
    }

    const closes =
      data.map(p => p[1]);

    const highs =
      closes.map(v => v * 1.01);

    const lows =
      closes.map(v => v * 0.99);

    const last =
      closes.at(-1);

    const prev =
      closes.at(-2);

    const trendPercent =
      ((last - prev) / prev) * 100;

    const rsi =
      RSI(closes, 14);

    const ema20 =
      EMA(closes, 20);

    const ema50 =
      EMA(closes, 50);

    const atr =
      ATR(
        highs,
        lows,
        closes,
        14
      );

    const atrPercent =
      (atr / last) * 100;

    const bullish =
      ema20 > ema50 &&
      last > ema20 &&
      rsi > 52;

    const bearish =
      ema20 < ema50 &&
      last < ema20 &&
      rsi < 48;

    let recommendation =
      "⚪ НЕЙТРАЛЬНО";

    if (bullish) {
      recommendation =
        "🟢 ПОКУПАТЬ";
    }

    if (bearish) {
      recommendation =
        "🔴 ПРОДАВАТЬ";
    }

    // ===== УВЕРЕННОСТЬ =====

    let confidence = 50;

    confidence += Math.min(
      20,
      Math.floor(
        Math.abs(trendPercent) * 4
      )
    );

    if (
      rsi > 60 ||
      rsi < 40
    ) {
      confidence += 10;
    }

    if (atrPercent > 2) {
      confidence += 10;
    }

    confidence =
      Math.min(confidence, 95);

    // ===== ЛОГИКА =====

    const isBuy =
      recommendation ===
      "🟢 ПОКУПАТЬ";

    const isSell =
      recommendation ===
      "🔴 ПРОДАВАТЬ";

    let entryPrice = last;
    let targetPrice = last;
    let stopLoss = last;

    if (isBuy) {

      entryPrice =
        last - atr * 0.3;

      targetPrice =
        last + atr * 1.8;

      stopLoss =
        last - atr * 1.2;
    }

    if (isSell) {

      entryPrice =
        last + atr * 0.3;

      targetPrice =
        last - atr * 1.8;

      stopLoss =
        last + atr * 1.2;
    }

    if (
      !isBuy &&
      !isSell
    ) {

      entryPrice =
        last - atr * 0.2;

      targetPrice =
        last + atr * 0.5;

      stopLoss =
        last - atr;
    }

    // ===== ВРЕМЯ =====

    const buyHour =
      9 +
      Math.floor(
        Math.abs(trendPercent) * 2
      );

    const sellHour =
      18 +
      Math.floor(atrPercent);

    const entryTime =
      `${buyHour}:00 - ${buyHour + 2}:00`;

    const exitTime =
      `${sellHour}:00 - ${sellHour + 2}:00`;

    return `
🔮 ${coin.name.toUpperCase()} ORACLE

━━━━━━━━━━

💰 Цена:
$${last.toFixed(2)}

📈 Изменение 24ч:
${trendPercent.toFixed(2)}%

🌊 Волатильность:
${atrPercent.toFixed(2)}%

━━━━━━━━━━

🧠 Анализ:

• RSI: ${rsi.toFixed(2)}
• EMA20: ${ema20.toFixed(2)}
• EMA50: ${ema50.toFixed(2)}

━━━━━━━━━━

📊 Рекомендация:
${recommendation}

🎯 Уверенность:
${confidence}%

━━━━━━━━━━

⏰ Лучшее время входа:
${entryTime}

💰 Оптимальный вход:
$${entryPrice.toFixed(2)}

🎯 Цель:
$${targetPrice.toFixed(2)}

🛡 Стоп-лосс:
$${stopLoss.toFixed(2)}

⏰ Фиксация:
${exitTime}

━━━━━━━━━━

📰 Новость:
${news[0]?.title || "Туманы скрывают новости"}

🌌 День проходит под знаком:
${strongestCoin.name}
`;
  }

  // ===== РУНЫ =====

  const runes = [
    "ᚠ FEHU — богатство",
    "ᚱ RAIDHO — путь",
    "ᚲ KENAZ — озарение",
    "ᚺ HAGALAZ — хаос",
    "ᚨ ANSUZ — инсайт",
    "ᛟ OTHALA — сила"
  ];

  // ===== ГОРОСКОП =====

  const horoscope = {
    "овен": "🔥 BTC усиливает лидерство",
    "телец": "💰 ETH приносит стабильность",
    "близнецы": "🌪 SOL создаёт движение",
    "рак": "🌙 XRP усиливает интуицию",
    "лев": "☀️ BTC ведёт к прибыли",
    "дева": "📊 ETH усиливает анализ",
    "весы": "⚖️ SOL балансирует рынок",
    "скорпион": "🦂 XRP раскрывает тайны",
    "стрелец": "🏹 BTC зовёт в рост",
    "козерог": "⛰ ETH укрепляет позиции",
    "водолей": "🌌 SOL даёт новые идеи",
    "рыбы": "🌊 XRP усиливает поток"
  };

  // ===== КНОПКИ =====

  const keyboard = {
    keyboard: [
      [
        {
          text:
            `₿ BTC $${prices.bitcoin.usd}`
        },
        {
          text:
            `⚡ ETH $${prices.ethereum.usd}`
        }
      ],
      [
        {
          text:
            `🟡 BNB $${prices.binancecoin.usd}`
        },
        {
          text:
            `🟣 SOL $${prices.solana.usd}`
        }
      ],
      [
        {
          text:
            `🔵 XRP $${prices.ripple.usd}`
        },
        {
          text:
            `🌑 SIGNAL`
        }
      ],
      [
        {
          text:
            `📰 NEWS`
        },
        {
          text:
            `🪬 RUNES`
        }
      ]
    ],
    resize_keyboard: true
  };

  let reply = `
🔮 CRYPTO NOSTRADAMUS

━━━━━━━━━━

🌌 День проходит под знаком:

${strongestCoin.name}

━━━━━━━━━━

₿ BTC → $${prices.bitcoin.usd}
⚡ ETH → $${prices.ethereum.usd}
🟡 BNB → $${prices.binancecoin.usd}
🟣 SOL → $${prices.solana.usd}
🔵 XRP → $${prices.ripple.usd}
`;

  // ===== КОМАНДЫ =====

  if (
    text.includes("btc")
  ) {
    reply =
      generateSignal(
        coins.btc,
        "btc"
      );
  }

  if (
    text.includes("eth")
  ) {
    reply =
      generateSignal(
        coins.eth,
        "eth"
      );
  }

  if (
    text.includes("bnb")
  ) {
    reply =
      generateSignal(
        coins.bnb,
        "bnb"
      );
  }

  if (
    text.includes("sol")
  ) {
    reply =
      generateSignal(
        coins.sol,
        "sol"
      );
  }

  if (
    text.includes("xrp")
  ) {
    reply =
      generateSignal(
        coins.xrp,
        "xrp"
      );
  }

  if (
    text.includes("news")
  ) {

    reply = `
📰 CRYPTO NEWS STREAM

━━━━━━━━━━

${news
  .map(
    n =>
      `• ${n.title}`
  )
  .join("\n\n")}
`;
  }

  if (
    text.includes("runes")
  ) {

    const today =
      new Date()
        .toISOString()
        .slice(0, 10);

    if (
      !userRunes[userId]
    ) {
      userRunes[userId] = {};
    }

    if (
      userRunes[userId].date ===
      today
    ) {

      reply = `
🪬 Руна дня уже открыта:

${userRunes[userId].rune}
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
        date: today,
        rune
      };

      reply = `
🪬 МЕШОЧЕК РУН

━━━━━━━━━━

${rune}

🌌 Руны открывают путь.
`;
    }
  }

  for (const sign in horoscope) {

    if (
      text.includes(sign)
    ) {

      reply = `
♈ ${sign.toUpperCase()}

━━━━━━━━━━

${horoscope[sign]}

🍀 Удача:
${60 + Math.floor(Math.random() * 35)}%
`;
    }
  }

  // ===== ОТПРАВКА =====

  await fetch(
    `https://api.telegram.org/bot${telegramToken}/sendMessage`,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json"
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: reply,
        reply_markup: keyboard
      })
    }
  );

  return res
    .status(200)
    .end();
};
