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
    body.message?.text ||
    body.callback_query?.data ||
    "";

  const lowerText =
    text.toLowerCase();

  if (!chatId) {
    return res.status(200).end();
  }

  // =====================
  // LOAD DATA
  // =====================

  let prices = {};
  let market = {};
  let fearGreed = {};
  let news = [];

  try {

    const now = Date.now();

    if (
      cryptoCache.prices &&
      cryptoCache.market &&
      now - cryptoCache.timestamp < 30000
    ) {

      prices = cryptoCache.prices;
      market = cryptoCache.market;
      fearGreed = cryptoCache.fearGreed;
      news = cryptoCache.news;

    } else {

      const pricesRes = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,binancecoin,solana,ripple&vs_currencies=usd"
      );

      prices = await pricesRes.json();

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
  // INDICATORS
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
  // COINS
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
  // STRONGEST COIN
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

  async function generateSignal(coin, key) {

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
      rsi > 55 &&
      trend > 0
    ) {
      recommendation =
        "🟢 ПОКУПАТЬ";
    }

    if (
      ema20 < ema50 &&
      rsi < 45 &&
      trend < 0
    ) {
      recommendation =
        "🔴 ПРОДАВАТЬ";
    }

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

    let entryPrice;
    let targetPrice;
    let stopLoss;

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

    } else if (
      recommendation ===
      "🔴 ПРОДАВАТЬ"
    ) {

      entryPrice =
        last + atr * 0.2;

      targetPrice =
        last - atr * 2;

      stopLoss =
        last + atr;

    } else {

      entryPrice = last;

      targetPrice =
        last + atr * 0.5;

      stopLoss =
        last - atr * 0.5;
    }

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

    let oracleText = "";

    try {

      const prompt = `
Ты древний крипто-оракул.

Монета:
${coin.name}

Цена:
${last.toFixed(2)}

Сигнал:
${recommendation}

Уверенность:
${confidence}%

Напиши короткое мистическое пророчество.
`;

      const groqRes = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
            Authorization:
              `Bearer ${groqKey}`
          },
          body: JSON.stringify({
            model:
              "llama3-70b-8192",
            messages: [
              {
                role: "user",
                content: prompt
              }
            ],
            temperature: 0.9
          })
        }
      );

      const groqJson =
        await groqRes.json();

      oracleText =
        groqJson.choices?.[0]
          ?.message?.content ||
        "🌫 Оракул молчит.";

    } catch {

      oracleText =
        "🌫 Потоки будущего скрыты.";
    }

    return `
🔮 ${coin.name.toUpperCase()} ORACLE

━━━━━━━━━━

💰 Цена:
$${last.toFixed(2)}

📈 Изменение:
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

🧠 Сигнал:
${recommendation}

🎯 Уверенность:
${confidence}%

━━━━━━━━━━

⏰ Вход:
${entryTime}

💰 Точка входа:
$${entryPrice.toFixed(2)}

🎯 Цель:
$${targetPrice.toFixed(2)}

🛡 Стоп:
$${stopLoss.toFixed(2)}

━━━━━━━━━━

${oracleText}
`;
  }

  // =====================
  // RUNES
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
  // HOROSCOPE
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
  // KEYBOARD
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
  // DEFAULT
  // =====================

  let reply = `
🌌 CRYPTO NOSTRADAMUS

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
  // START
  // =====================

  if (
    lowerText === "/start"
  ) {

    reply = `
🌌 CRYPTO NOSTRADAMUS

━━━━━━━━━━

🌑 Потоки рынка активны.

Используй панель
оракула для анализа.
`;
  }

  // =====================
  // SIGNALS
  // =====================

  else if (
    lowerText.includes("btc")
  ) {

    reply =
      await generateSignal(
        coins.btc,
        "btc"
      );
  }

  else if (
    lowerText.includes("eth")
  ) {

    reply =
      await generateSignal(
        coins.eth,
        "eth"
      );
  }

  else if (
    lowerText.includes("bnb")
  ) {

    reply =
      await generateSignal(
        coins.bnb,
        "bnb"
      );
  }

  else if (
    lowerText.includes("sol")
  ) {

    reply =
      await generateSignal(
        coins.sol,
        "sol"
      );
  }

  else if (
    lowerText.includes("xrp")
  ) {

    reply =
      await generateSignal(
        coins.xrp,
        "xrp"
      );
  }

  // =====================
  // NEWS
  // =====================

  else if (
    lowerText.includes("news")
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

  else if (
    lowerText.includes("horoscope")
  ) {

    reply = `
♈ CRYPTO HOROSCOPE

Выбери знак зодиака.
`;

    currentKeyboard =
      zodiacKeyboard;
  }

  else {

    for (const sign in horoscopeTexts) {

      if (
        lowerText.includes(sign)
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

        break;
      }
    }
  }

  // =====================
  // RUNES
  // =====================

  if (
    lowerText.includes("runes")
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
