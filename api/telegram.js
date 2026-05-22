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

  const userId =
    body.message?.from?.id ||
    body.callback_query?.from?.id;

  let text =
    body.message?.text?.toLowerCase() ||
    body.callback_query?.data?.toLowerCase() ||
    "";

  if (!chatId) {
    return res.status(200).end();
  }

  // =====================
  // ЗАГРУЗКА ДАННЫХ
  // =====================

  let prices = {};
  let market = {};
  let fearGreed = {};
  let news = [];

  try {

    const now = Date.now();

    // КЕШ 30 СЕКУНД
    if (
      cryptoCache.prices &&
      cryptoCache.market &&
      cryptoCache.news &&
      now - cryptoCache.timestamp < 30000
    ) {

      prices = cryptoCache.prices;
      market = cryptoCache.market;
      fearGreed = cryptoCache.fearGreed;
      news = cryptoCache.news;

    } else {

      // ===== ЦЕНЫ =====

      const pricesRes = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,binancecoin,solana,ripple&vs_currencies=usd"
      );

      prices = await pricesRes.json();

      // ===== ГРАФИКИ =====

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
              "🌫 Новости скрыты рыночным туманом"
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
          "Content-Type":
            "application/json"
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

  // =====================
  // ИНДИКАТОРЫ
  // =====================

  function EMA(data, period) {

    const k = 2 / (period + 1);

    let ema = data[0];

    for (let i = 1; i < data.length; i++) {
      ema =
        data[i] * k +
        ema * (1 - k);
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

      if (diff >= 0) {
        gains += diff;
      } else {
        losses += Math.abs(diff);
      }
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
        Math.abs(
          highs[i] - closes[i - 1]
        ),
        Math.abs(
          lows[i] - closes[i - 1]
        )
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

  // =====================
  // МОНЕТЫ
  // =====================

  const coins = {
    btc: {
      name: "Bitcoin",
      symbol: "₿"
    },
    eth: {
      name: "Ethereum",
      symbol: "⚡"
    },
    bnb: {
      name: "BNB",
      symbol: "🟡"
    },
    sol: {
      name: "Solana",
      symbol: "🟣"
    },
    xrp: {
      name: "XRP",
      symbol: "🔵"
    }
  };

  // =====================
  // ДЕНЬ ПОД ЗНАКОМ
  // =====================

  const strongestCoin =
    Object.entries(prices)
      .map(([name]) => ({
        name,
        power: Math.random()
      }))
      .sort((a, b) => b.power - a.power)[0];

  // =====================
  // SIGNAL
  // =====================

  
function generateSignal(coin, key) {

  const data =
    market[key]?.prices;

  if (
    !data ||
    !Array.isArray(data) ||
    data.length < 20
  ) {

    return `
⚠️ Потоки рынка
временно скрыты.

Сигнал не может
быть построен.
`;
  }

  const closes =
    data.map(p => p[1]);

  const highs =
    closes.map(v => v * 1.01);

  const lows =
    closes.map(v => v * 0.99);

  const last =
    closes[closes.length - 1];

  const prev =
    closes[closes.length - 2];

  const trend =
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

  let recommendation =
    "⚪ НЕЙТРАЛЬНО";

  if (
    ema20 > ema50 &&
    rsi > 55
  ) {

    recommendation =
      "🟢 ПОКУПАТЬ";
  }

  if (
    ema20 < ema50 &&
    rsi < 45
  ) {

    recommendation =
      "🔴 ПРОДАВАТЬ";
  }

  let confidence =
    Math.floor(
      65 + Math.random() * 25
    );

  const entry =
    last - atr * 0.2;

  const target =
    recommendation ===
    "🔴 ПРОДАВАТЬ"

      ? last - atr * 2

      : last + atr * 2;

  const stop =
    recommendation ===
    "🔴 ПРОДАВАТЬ"

      ? last + atr

      : last - atr;

  return `
🔮 ${coin.name.toUpperCase()} ORACLE

━━━━━━━━━━

💰 Цена:
$${last.toFixed(2)}

📈 Тренд:
${trend.toFixed(2)}%

🌊 Волатильность:
${atrPercent.toFixed(2)}%

━━━━━━━━━━

📊 RSI:
${rsi.toFixed(2)}

📊 EMA20:
${ema20.toFixed(2)}

📊 EMA50:
${ema50.toFixed(2)}

━━━━━━━━━━

🧠 Рекомендация:

${recommendation}

🎯 Уверенность:
${confidence}%

━━━━━━━━━━

💰 Вход:
$${entry.toFixed(2)}

🎯 Цель:
$${target.toFixed(2)}

🛡 Стоп:
$${stop.toFixed(2)}

━━━━━━━━━━

📰 Новости:

${news[0]?.title || "Туманы скрывают новости"}
`;
}
    
      

    
      

    
    

    // ===== УВЕРЕННОСТЬ =====

    let confidence = 55;

    confidence += Math.min(
      15,
      Math.floor(Math.abs(trend) * 4)
    );

    if (
      rsi > 65 ||
      rsi < 35
    ) {
      confidence += 10;
    }

    if (atrPercent > 1.5) {
      confidence += 10;
    }

    confidence =
      Math.min(confidence, 95);

    // ===== ЦЕНЫ =====

    let entryPrice;
    let targetPrice;
    let stopLoss;

    // BUY
    if (
      recommendation ===
      "🟢 ПОКУПАТЬ"
    ) {

      entryPrice =
        last - atr * 0.2;

      targetPrice =
        last + atr * 2;

      stopLoss =
        last - atr;
    }

    // SELL
    else if (
      recommendation ===
      "🔴 ПРОДАВАТЬ"
    ) {

      entryPrice =
        last + atr * 0.2;

      targetPrice =
        last - atr * 2;

      stopLoss =
        last + atr;
    }

    // NEUTRAL
    else {

      entryPrice = last;

      targetPrice =
        last + atr * 0.5;

      stopLoss =
        last - atr * 0.5;
    }

    // ===== ВРЕМЯ =====

    const entryHour =
      8 +
      Math.floor(
        Math.abs(trend) * 3
      );

    const exitHour =
      16 +
      Math.floor(atrPercent);

    const entryTime =
      `${entryHour}:00 - ${entryHour + 2}:00`;

    const exitTime =
      `${exitHour}:00 - ${exitHour + 2}:00`;

    return `
🔮 ${coin.name.toUpperCase()} ORACLE

━━━━━━━━━━

💰 Текущая цена:
$${last.toFixed(2)}

📈 Изменение:
${trend.toFixed(2)}%

🌊 Волатильность:
${atrPercent.toFixed(2)}%

━━━━━━━━━━

📊 Индикаторы:

• RSI → ${rsi.toFixed(2)}
• EMA20 → ${ema20.toFixed(2)}
• EMA50 → ${ema50.toFixed(2)}

━━━━━━━━━━

🧠 Рекомендация:
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

⏰ Фиксация прибыли:
${exitTime}

━━━━━━━━━━

📰 Последняя новость:

${news[0]?.title || "Туманы скрывают новости"}

🌌 День проходит под знаком:

${strongestCoin.name}
`;
  }

  // =====================
  // РУНЫ
  // =====================

  const runes = [
    "ᚠ FEHU — богатство",
    "ᚱ RAIDHO — путь",
    "ᚲ KENAZ — озарение",
    "ᚺ HAGALAZ — хаос",
    "ᚨ ANSUZ — инсайт",
    "ᛟ OTHALA — наследие"
  ];

  // =====================
  // ГОРОСКОП
  // =====================

  const zodiacKeyboard = {
    keyboard: [
      ["♈ Овен", "♉ Телец"],
      ["♊ Близнецы", "♋ Рак"],
      ["♌ Лев", "♍ Дева"],
      ["♎ Весы", "♏ Скорпион"],
      ["♐ Стрелец", "♑ Козерог"],
      ["♒ Водолей", "♓ Рыбы"]
    ],
    resize_keyboard: true
  };

  const horoscopeTexts = {
    "овен": "🔥 BTC усиливает лидерство.",
    "телец": "💰 ETH приносит стабильность.",
    "близнецы": "🌪 SOL создаёт импульс.",
    "рак": "🌙 XRP усиливает интуицию.",
    "лев": "☀️ BTC открывает возможности.",
    "дева": "📊 ETH усиливает анализ.",
    "весы": "⚖️ SOL балансирует рынок.",
    "скорпион": "🦂 XRP раскрывает тайны.",
    "стрелец": "🏹 BTC зовёт к росту.",
    "козерог": "⛰ ETH укрепляет позиции.",
    "водолей": "🌌 SOL даёт идеи.",
    "рыбы": "🌊 XRP усиливает поток."
  };

  // =====================
  // ГЛАВНОЕ МЕНЮ
  // =====================

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
            `♈ HOROSCOPE`
        },
        {
          text:
            `🪬 RUNES`
        }
      ],
      [
        {
          text:
            `📰 NEWS`
        }
      ]
    ],
    resize_keyboard: true
  };

  // =====================
  // DEFAULT SCREEN
  // =====================

  let reply = `
🔮 CRYPTO NOSTRADAMUS

━━━━━━━━━━

🌌 Сегодня рынок проходит под знаком:

${strongestCoin.name.toUpperCase()}

━━━━━━━━━━

₿ BTC → $${prices.bitcoin.usd}
⚡ ETH → $${prices.ethereum.usd}
🟡 BNB → $${prices.binancecoin.usd}
🟣 SOL → $${prices.solana.usd}
🔵 XRP → $${prices.ripple.usd}
`;

  let currentKeyboard = keyboard;

  // =====================
  // SIGNALS
  // =====================

  if (text.includes("btc")) {
    reply =
      generateSignal(
        coins.btc,
        "btc"
      );
  }

  if (text.includes("eth")) {
    reply =
      generateSignal(
        coins.eth,
        "eth"
      );
  }

  if (text.includes("bnb")) {
    reply =
      generateSignal(
        coins.bnb,
        "bnb"
      );
  }

  if (text.includes("sol")) {
    reply =
      generateSignal(
        coins.sol,
        "sol"
      );
  }

  if (text.includes("xrp")) {
    reply =
      generateSignal(
        coins.xrp,
        "xrp"
      );
  }

  // =====================
  // NEWS
  // =====================

  if (
    text.includes("news")
  ) {

    reply = `
📰 CRYPTO NEWS STREAM

━━━━━━━━━━

${news
  .map(
    n => `• ${n.title}`
  )
  .join("\n\n")}
`;
  }

  // =====================
  // HOROSCOPE
  // =====================

  if (
    text.includes("horoscope")
  ) {

    reply = `
♈ CRYPTO HOROSCOPE

Выбери знак зодиака.
`;

    currentKeyboard =
      zodiacKeyboard;
  }

  for (const sign in horoscopeTexts) {

    if (
      text.includes(sign)
    ) {

      reply = `
${sign.toUpperCase()}

━━━━━━━━━━

${horoscopeTexts[sign]}

🍀 Удача:
${60 + Math.floor(Math.random() * 35)}%

🌌 День проходит под знаком:
${strongestCoin.name}
`;

      currentKeyboard =
        keyboard;
    }
  }

  // =====================
  // RUNES
  // =====================

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
🪬 РУНА ДНЯ

━━━━━━━━━━

${userRunes[userId].rune}

⏳ Новая руна откроется завтра.
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

🌌 Руны открывают скрытые пути рынка.
`;
    }
  }

  // =====================
  // SEND
  // =====================

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
        reply_markup: currentKeyboard
      })
    }
  );

  return res
    .status(200)
    .end();
};
