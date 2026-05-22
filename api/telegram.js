let cache = global.cache || {
  timestamp: 0,
  prices: null,
  charts: null,
  news: null,
  sentiment: null
};

global.cache = cache;

let userRunes = global.userRunes || {};
global.userRunes = userRunes;

module.exports = async (req, res) => {

  // =========================
  // KEYS
  // =========================

  const TELEGRAM_TOKEN =
    "8821653271:AAEHIe7QhmcOOjxQFJ6DT5WPjZU9hczuVP8";

  const GROQ_API_KEY =
    "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";

  const GNEWS_API_KEY =
    "80d3a911a8c4d3ffe9d4b2dce9b8fdc8";

  const COININDEX_API_KEY =
    "3cb3bc0dde8ee347745043db6ab2b5b06bb4e6fd55205549f6e6452dfc590f2a";

  // =========================

  if (req.method !== "POST") {
    return res
      .status(200)
      .send("CRYPTO NOSTRADAMUS ONLINE");
  }

  const body = req.body;

  const chatId =
    body.message?.chat?.id ||
    body.callback_query?.message?.chat?.id;

  const userId =
    body.message?.from?.id ||
    body.callback_query?.from?.id;

  const text =
    (
      body.message?.text ||
      body.callback_query?.data ||
      ""
    ).toLowerCase();

  if (!chatId) {
    return res.status(200).end();
  }

  // =========================
  // MARKET LOAD
  // =========================

  let prices;
  let charts;
  let news;
  let sentiment;

  try {

    const now = Date.now();

    if (
      cache.prices &&
      now - cache.timestamp < 30000
    ) {

      prices = cache.prices;
      charts = cache.charts;
      news = cache.news;
      sentiment = cache.sentiment;

    } else {

      // =====================
      // PRICES
      // =====================

      const pricesRes =
        await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,binancecoin,solana,ripple&vs_currencies=usd"
        );

      prices =
        await pricesRes.json();

      // =====================
      // CHARTS
      // =====================

      async function loadChart(id) {

        const r =
          await fetch(
            `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=1`
          );

        return await r.json();
      }

      charts = {

        btc:
          await loadChart("bitcoin"),

        eth:
          await loadChart("ethereum"),

        bnb:
          await loadChart("binancecoin"),

        sol:
          await loadChart("solana"),

        xrp:
          await loadChart("ripple")
      };

      // =====================
      // GNEWS
      // =====================

      try {

        const gnewsRes =
          await fetch(
            `https://gnews.io/api/v4/search?q=crypto OR bitcoin OR ethereum&lang=en&max=5&apikey=${GNEWS_API_KEY}`
          );

        const gnews =
          await gnewsRes.json();

        news =
          gnews.articles || [];

      } catch {

        news = [
          {
            title:
              "🌫 Потоки новостей нестабильны."
          }
        ];
      }

      // =====================
      // SENTIMENT
      // =====================

      try {

        const sentimentRes =
          await fetch(
            `https://api.coinindex.io/v1/market/sentiment?apikey=${COININDEX_API_KEY}`
          );

        sentiment =
          await sentimentRes.json();

      } catch {

        sentiment = {
          value: 52,
          mood: "NEUTRAL"
        };
      }

      cache.prices = prices;
      cache.charts = charts;
      cache.news = news;
      cache.sentiment = sentiment;
      cache.timestamp = now;
    }

  } catch (e) {

    console.log(
      "MARKET ERROR",
      e
    );

    await sendMessage(
      chatId,
      "⚠️ Потоки рынка разрушены."
    );

    return res.status(200).end();
  }

  // =========================
  // SEND MESSAGE
  // =========================

  async function sendMessage(
    chatId,
    text,
    keyboard = null
  ) {

    try {

      await fetch(
        `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({

            chat_id: chatId,

            text,

            reply_markup:
              keyboard
          })
        }
      );

    } catch (e) {

      console.log(
        "SEND ERROR",
        e
      );
    }
  }

  // =========================
  // KEYBOARD
  // =========================

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
            "🌑 SIGNAL"
        }
      ],

      [
        {
          text:
            "📰 NEWS"
        },

        {
          text:
            "🔮 RUNES"
        }
      ],

      [
        {
          text:
            "♈ HOROSCOPE"
        }
      ]
    ],

    resize_keyboard: true
  };

  // =========================
  // INDICATORS
  // =========================

  function EMA(data, period) {

    const k =
      2 / (period + 1);

    let ema =
      data[0];

    for (
      let i = 1;
      i < data.length;
      i++
    ) {

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

      if (diff > 0) {
        gains += diff;
      } else {
        losses += Math.abs(diff);
      }
    }

    const rs =
      gains / (losses || 1);

    return (
      100 -
      100 / (1 + rs)
    );
  }

  function ATR(
    highs,
    lows,
    closes,
    period = 14
  ) {

    let trs = [];

    for (
      let i = 1;
      i < closes.length;
      i++
    ) {

      const tr = Math.max(

        highs[i] - lows[i],

        Math.abs(
          highs[i] -
          closes[i - 1]
        ),

        Math.abs(
          lows[i] -
          closes[i - 1]
        )
      );

      trs.push(tr);
    }

    const recent =
      trs.slice(-period);

    return (
      recent.reduce(
        (a, b) => a + b,
        0
      ) / recent.length
    );
  }

  // =========================
  // SIGNAL ENGINE
  // =========================

  async function buildSignal(
    symbol,
    key
  ) {

    const chart =
      charts[key];

    if (
      !chart?.prices?.length
    ) {

      return `
⚠️ Анализ недоступен.
`;
    }

    const closes =
      chart.prices.map(
        p => p[1]
      );

    const highs =
      closes.map(
        c => c * 1.01
      );

    const lows =
      closes.map(
        c => c * 0.99
      );

    const price =
      closes.at(-1);

    const ema20 =
      EMA(closes, 20);

    const ema50 =
      EMA(closes, 50);

    const rsi =
      RSI(closes);

    const atr =
      ATR(
        highs,
        lows,
        closes
      );

    const support =
      Math.min(
        ...closes.slice(-20)
      );

    const resistance =
      Math.max(
        ...closes.slice(-20)
      );

    const bullish =
      ema20 > ema50;

    const direction =
      bullish
        ? "LONG"
        : "SHORT";

    let entry;
    let target;
    let stop;

    if (bullish) {

      entry =
        support + atr * 0.3;

      target =
        resistance;

      stop =
        support - atr * 0.5;

    } else {

      entry =
        resistance - atr * 0.3;

      target =
        support;

      stop =
        resistance + atr * 0.5;
    }

    const rr =
      (
        Math.abs(
          target - entry
        ) /

        Math.abs(
          entry - stop
        )
      ).toFixed(2);

    const confidence =
      Math.min(
        95,
        Math.floor(
          60 +
          Math.abs(
            ema20 - ema50
          ) / 10
        )
      );

    // =====================
    // ENTRY TIME
    // =====================

    const volatility =
      (
        atr / price * 100
      );

    let entryWindow =
      "Низкая активность";

    let fixWindow =
      "Не определено";

    if (volatility < 1) {

      entryWindow =
        "В течение 6-12 часов";

      fixWindow =
        "12-24 часа";
    }

    else if (
      volatility < 2
    ) {

      entryWindow =
        "В течение 2-6 часов";

      fixWindow =
        "6-12 часов";
    }

    else {

      entryWindow =
        "В течение 1-3 часов";

      fixWindow =
        "3-6 часов";
    }

    // =====================
    // AI ORACLE
    // =====================

    let oracleText =
      "";

    try {

      const prompt = `
Ты крипто-оракул.

Монета:
${symbol}

Цена:
${price}

RSI:
${rsi}

EMA20:
${ema20}

EMA50:
${ema50}

ATR:
${atr}

Направление:
${direction}

Новости:
${news[0]?.title}

Сделай:
- настроение рынка
- опасности
- импульс
- ожидания
- совет трейдеру

Стиль:
мистический,
мрачный,
крипто,
атмосферный.
`;

      const groqRes =
        await fetch(
          "https://api.groq.com/openai/v1/chat/completions",
          {
            method: "POST",

            headers: {

              Authorization:
                `Bearer ${GROQ_API_KEY}`,

              "Content-Type":
                "application/json"
            },

            body: JSON.stringify({

              model:
                "llama3-70b-8192",

              messages: [
                {
                  role:
                    "user",

                  content:
                    prompt
                }
              ],

              temperature:
                0.9
            })
          }
        );

      const groq =
        await groqRes.json();

      oracleText =
        groq
          .choices?.[0]
          ?.message?.content ||

        "Туманы скрывают пророчество.";

    } catch {

      oracleText =
`
🌫 Потоки будущего нестабильны.
`;
    }

    return `
🌌 ${symbol} ORACLE

━━━━━━━━━━

💰 Цена:
$${price.toFixed(2)}

📈 Направление:
${direction}

📊 RSI:
${rsi.toFixed(2)}

🌊 Волатильность:
${volatility.toFixed(2)}%

━━━━━━━━━━

🎯 Вход:
$${entry.toFixed(2)}

🛡 Стоп:
$${stop.toFixed(2)}

💎 Цель:
$${target.toFixed(2)}

⚖️ Risk/Reward:
${rr}

━━━━━━━━━━

⏰ Вход:
${entryWindow}

⏰ Фиксация:
${fixWindow}

━━━━━━━━━━

🔥 Уверенность:
${confidence}%

━━━━━━━━━━

${oracleText}
`;
  }

  // =========================
  // RUNES
  // =========================

  const runeList = [

    {
      symbol: "ᚠ",
      name: "FEHU",

      text:
`
ᚠ FEHU

Руна богатства и потока капитала.

Рынок начинает движение
в сторону накопления силы.

⚠️ Опасность:
жадность может ослепить трейдеров.

💰 Совет:
фиксируй прибыль частями.
`
    },

    {
      symbol: "ᚺ",
      name: "HAGALAZ",

      text:
`
ᚺ HAGALAZ

Руна хаоса и разрушения.

Волатильность усиливается.
Слабые позиции будут уничтожены.

⚠️ Опасность:
эмоциональные сделки.

🛡 Совет:
уменьши риск.
`
    }
  ];

  // =========================
  // HOROSCOPE
  // =========================

  const horoscope = {

    "овен":
`
♈ ОВЕН

Рынок усиливает импульс.
BTC создаёт давление на альты.

⚡ Энергия:
агрессивная.

💰 Удача:
78%

⚠️ Риск:
эмоциональные входы.

🧠 Совет:
не входи на пике импульса.
`
  };

  // =========================
  // START
  // =========================

  if (
    text === "/start"
  ) {

    await sendMessage(

      chatId,

`
🌌 CRYPTO NOSTRADAMUS

━━━━━━━━━━

📊 BTC:
$${prices.bitcoin.usd}

⚡ ETH:
$${prices.ethereum.usd}

🟡 BNB:
$${prices.binancecoin.usd}

🟣 SOL:
$${prices.solana.usd}

🔵 XRP:
$${prices.ripple.usd}

━━━━━━━━━━

🌡 Market Sentiment:
${sentiment.mood || "NEUTRAL"}

━━━━━━━━━━

📡 Потоки рынка активны.
`,

      keyboard
    );

    return res.status(200).end();
  }

  // =========================
  // SIGNALS
  // =========================

  if (
    text.includes("btc")
  ) {

    await sendMessage(
      chatId,
      await buildSignal(
        "BTC",
        "btc"
      )
    );
  }

  else if (
    text.includes("eth")
  ) {

    await sendMessage(
      chatId,
      await buildSignal(
        "ETH",
        "eth"
      )
    );
  }

  else if (
    text.includes("bnb")
  ) {

    await sendMessage(
      chatId,
      await buildSignal(
        "BNB",
        "bnb"
      )
    );
  }

  else if (
    text.includes("sol")
  ) {

    await sendMessage(
      chatId,
      await buildSignal(
        "SOL",
        "sol"
      )
    );
  }

  else if (
    text.includes("xrp")
  ) {

    await sendMessage(
      chatId,
      await buildSignal(
        "XRP",
        "xrp"
      )
    );
  }

  // =========================
  // NEWS
  // =========================

  else if (
    text.includes("news")
  ) {

    let newsText =
`
📰 CRYPTO NEWS

━━━━━━━━━━

`;

    news.forEach(n => {

      newsText +=
        `• ${n.title}\n\n`;
    });

    await sendMessage(
      chatId,
      newsText
    );
  }

  // =========================
  // RUNES
  // =========================

  else if (
    text.includes("runes")
  ) {

    const today =
      new Date()
        .toISOString()
        .slice(0, 10);

    if (
      userRunes[userId]?.date ===
      today
    ) {

      await sendMessage(
        chatId,
        userRunes[userId].text
      );

    } else {

      const rune =
        runeList[
          Math.floor(
            Math.random() *
            runeList.length
          )
        ];

      userRunes[userId] = {

        date:
          today,

        text:
          rune.text
      };

      await sendMessage(
        chatId,
        rune.text
      );
    }
  }

  // =========================
  // HOROSCOPE
  // =========================

  else if (
    text.includes("horoscope")
  ) {

    await sendMessage(

      chatId,

`
♈ Выбери знак:

Овен
`,
      keyboard
    );
  }

  else if (
    horoscope[text]
  ) {

    await sendMessage(
      chatId,
      horoscope[text]
    );
  }
