const {
  createClient
} = require("@supabase/supabase-js");

// ======================================================
// GLOBAL CACHE
// ======================================================

let cache = global.cache || {
  timestamp: 0,
  prices: null,
  charts: null,
  news: null,
  sentiment: null
};

global.cache = cache;

// ======================================================
// GLOBAL RUNES
// ======================================================

let userRunes = global.userRunes || {};
global.userRunes = userRunes;

// ======================================================
// HOROSCOPE COOLDOWN
// ======================================================

let userHoroscope =
  global.userHoroscope || {};

global.userHoroscope =
  userHoroscope;

// ======================================================
// API KEYS
// ======================================================

const TELEGRAM_TOKEN =
  process.env.TELEGRAM_TOKEN ||
  "8821653271:AAEHIe7QhmcOOjxQFJ6DT5WPjZU9hczuVP8";

const GROQ_API_KEY =
  process.env.GROQ_API_KEY ||
  "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";

const GNEWS_API_KEY =
  process.env.GNEWS_API_KEY ||
  "80d3a911a8c4d3ffe9d4b2dce9b8fdc8";

const COININDEX_API_KEY =
  process.env.COININDEX_API_KEY ||
  "3cb3bc0dde8ee347745043db6ab2b5b06bb4e6fd55205549f6e6452dfc590f2a";

// ======================================================
// SUPABASE
// ======================================================

const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  "https://zosntsrvmbvehfpbicgx.supabase.co/rest/v1/";

const SUPABASE_KEY =
  process.env.SUPABASE_KEY ||
  "sb_secret_DCjobBLXrRXHYJ4gFh2L5g_mX52vd7n";

const supabase =
  createClient(
    SUPABASE_URL,
    SUPABASE_KEY
  );

// ======================================================

module.exports = async (req, res) => {

  if (req.method !== "POST") {

    return res
      .status(200)
      .send(
        "🌌 CRYPTO NOSTRADAMUS ONLINE"
      );
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

  // ======================================================
  // MARKET LOAD
  // ======================================================

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

      prices =
        cache.prices;

      charts =
        cache.charts;

      news =
        cache.news;

      sentiment =
        cache.sentiment;

    } else {

      // ==================================================
      // PRICES
      // ==================================================

      const pricesRes =
        await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,binancecoin,solana,ripple&vs_currencies=usd"
        );

      prices =
        await pricesRes.json();

      // ==================================================
      // CHARTS
      // ==================================================

      async function loadChart(id) {

        const r =
          await fetch(
            `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=1`
          );

        return await r.json();
      }

      charts = {

        btc:
          await loadChart(
            "bitcoin"
          ),

        eth:
          await loadChart(
            "ethereum"
          ),

        bnb:
          await loadChart(
            "binancecoin"
          ),

        sol:
          await loadChart(
            "solana"
          ),

        xrp:
          await loadChart(
            "ripple"
          )
      };

      // ==================================================
      // NEWS
      // ==================================================

      try {

        const gnewsRes =
          await fetch(
            `https://gnews.io/api/v4/search?q=crypto OR bitcoin OR ethereum&lang=ru&max=5&apikey=${GNEWS_API_KEY}`
          );

        const gnews =
          await gnewsRes.json();

        news =
          gnews.articles || [];

      } catch {

        news = [
          {
            title:
              "🌫 Тени скрывают новости."
          }
        ];
      }

      // ==================================================
      // SENTIMENT
      // ==================================================

      try {

        const sentimentRes =
          await fetch(
            `https://api.coinindex.io/v1/market/sentiment?apikey=${COININDEX_API_KEY}`
          );

        sentiment =
          await sentimentRes.json();

      } catch {

        sentiment = {
          value: 50,
          mood: "NEUTRAL"
        };
      }

      cache.prices =
        prices;

      cache.charts =
        charts;

      cache.news =
        news;

      cache.sentiment =
        sentiment;

      cache.timestamp =
        now;
    }

  } catch (e) {

    console.log(
      "MARKET ERROR",
      e
    );

    await sendMessage(

      chatId,

      "🌫 Потоки рынка разрушены."
    );

    return res
      .status(200)
      .end();
  }

  // ======================================================
  // SEND MESSAGE
  // ======================================================

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

            chat_id:
              chatId,

            text,

            parse_mode:
              "HTML",

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

  // ======================================================
  // KEYBOARD
  // ======================================================

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
            "🌑 СИГНАЛ"
        }
      ],

      [
        {
          text:
            "📰 НОВОСТИ"
        },

        {
          text:
            "🔮 РУНЫ"
        }
      ],

      [
        {
          text:
            "♈ ГОРОСКОП"
        }
      ],

      [
        {
          text:
            "🌌 ПРИЗВАТЬ ТРЕЙДЕРА"
        }
      ]
    ],

    resize_keyboard: true
  };

  // ======================================================
  // EMA
  // ======================================================

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

  // ======================================================
  // RSI
  // ======================================================

  function RSI(
    data,
    period = 14
  ) {

    let gains = 0;
    let losses = 0;

    for (
      let i = data.length - period;
      i < data.length;
      i++
    ) {

      const diff =
        data[i] -
        data[i - 1];

      if (diff > 0) {

        gains += diff;

      } else {

        losses +=
          Math.abs(diff);
      }
    }

    const rs =
      gains / (losses || 1);

    return (
      100 -
      100 / (1 + rs)
    );
  }

  // ======================================================
  // ATR
  // ======================================================

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

  // ======================================================
  // SIGNAL ENGINE
  // ======================================================

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
🌫 Потоки анализа недоступны.
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

    let oracleText =
`
🌌 Луна наблюдает за рынком.

Тени ликвидности движутся
в глубинах графика.

⚠️ Не поддавайся эмоциям.

🜂 Терпение сильнее импульса.

🔮 Оракул видит:
рынок готовится
к новому движению.
`;

    return `
🔮 ${symbol} ORACLE

━━━━━━━━━━

💰 Цена:
$${price.toFixed(2)}

📈 Направление:
${direction}

📊 RSI:
${rsi.toFixed(2)}

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

🌡 Настроение рынка:
${sentiment.mood || "NEUTRAL"}

━━━━━━━━━━

${oracleText}
`;
  }

  // ======================================================
  // RUNES
  // ======================================================

  const runeList = [

    {
      symbol: "ᚠ",

      text:
`
ᚠ FEHU

Руна богатства
и движения капитала.

💰 Потоки денег усиливаются.

⚠️ Опасность:
жадность ослепляет.

🜂 Совет:
фиксируй прибыль частями.
`
    },

    {
      symbol: "ᚺ",

      text:
`
ᚺ HAGALAZ

Руна хаоса
и разрушения.

🌪 Волатильность возрастает.

⚠️ Опасность:
эмоциональные сделки.

🛡 Совет:
уменьши риск.
`
    },

    {
      symbol: "ᛟ",

      text:
`
ᛟ ODIN

Тени древнего рынка
пробудились.

🌌 Скоро придёт
сильное движение.

⚠️ Опасность:
ложные пробои.

🔮 Совет:
жди подтверждения.
`
    }
  ];

  // ======================================================
  // HOROSCOPE
  // ======================================================

  const horoscope = {

    "овен":
`
♈ ОВЕН

BTC усиливает давление.

⚡ Импульс:
высокий.

💰 Удача:
78%

🜂 Совет:
не входи в рынок
на эмоциях.
`,

    "телец":
`
♉ ТЕЛЕЦ

Рынок требует терпения.

🌌 Медленные сделки
дадут лучший результат.

💰 Удача:
73%
`,

    "близнецы":
`
♊ БЛИЗНЕЦЫ

Тени альткоинов активны.

⚠️ Возможны
ложные сигналы.

💰 Удача:
69%
`,

    "рак":
`
♋ РАК

Ликвидность усиливается.

🌑 Киты наблюдают.

💰 Удача:
80%
`,

    "лев":
`
♌ ЛЕВ

Волатильность возрастает.

⚡ Смелость принесёт
возможности.

💰 Удача:
82%
`,

    "дева":
`
♍ ДЕВА

Рынок требует расчёта.

🜂 Анализ важнее эмоций.

💰 Удача:
74%
`,

    "весы":
`
♎ ВЕСЫ

Баланс рынка нестабилен.

⚠️ Не торопись
с решениями.

💰 Удача:
70%
`,

    "скорпион":
`
♏ СКОРПИОН

Тени усиливаются.

🌌 Возможен
резкий разворот.

💰 Удача:
85%
`,

    "стрелец":
`
♐ СТРЕЛЕЦ

Импульс рынка растёт.

⚡ Удачны
быстрые сделки.

💰 Удача:
79%
`,

    "козерог":
`
♑ КОЗЕРОГ

Дисциплина приведёт
к прибыли.

🛡 Избегай FOMO.

💰 Удача:
76%
`,

    "водолей":
`
♒ ВОДОЛЕЙ

Альткоины пробуждаются.

🌑 Следи за SOL
и ETH.

💰 Удача:
83%
`,

    "рыбы":
`
♓ РЫБЫ

Туманы рынка сгущаются.

🔮 Интуиция поможет
увидеть движение.

💰 Удача:
77%
`
  };

  // ======================================================
  // START
  // ======================================================

  if (
    text.startsWith("/start")
  ) {

    const startPayload =
      body.message?.text
        ?.split(" ")[1];

    try {

      await supabase
        .from("users")
        .upsert({

          telegram_id:
            String(userId),

          username:
            body.message?.from
              ?.username || "",

          first_name:
            body.message?.from
              ?.first_name || "",

          referrer_id:
            startPayload || null,

          last_seen:
            new Date()
              .toISOString()
        });

      if (
        startPayload &&
        startPayload !==
          String(userId)
      ) {

        const { data: existing } =
          await supabase
            .from("referrals")
            .select("*")
            .eq(
              "invited_id",
              String(userId)
            )
            .single();

        if (!existing) {

          await supabase
            .from("referrals")
            .insert({

              inviter_id:
                startPayload,

              invited_id:
                String(userId)
            });

          const {
            data: inviter
          } =
            await supabase
              .from("users")
              .select("xp")
              .eq(
                "telegram_id",
                startPayload
              )
              .single();

          const currentXP =
            inviter?.xp || 0;

          const newXP =
            currentXP + 50;

          const newLevel =
            Math.floor(
              newXP / 100
            ) + 1;

          await supabase
            .from("users")
            .update({

              xp:
                newXP,

              oracle_level:
                newLevel
            })
            .eq(
              "telegram_id",
              startPayload
            );
        }
      }

    } catch (e) {

      console.log(
        "SUPABASE ERROR",
        e
      );
    }

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

🌡 Настроение рынка:
${sentiment.mood || "NEUTRAL"}

━━━━━━━━━━

📡 Потоки рынка активны.
`,

      keyboard
    );

    return res
      .status(200)
      .end();
  }

  // ======================================================
  // BTC
  // ======================================================

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

  // ======================================================
  // ETH
  // ======================================================

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

  // ======================================================
  // BNB
  // ======================================================

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

  // ======================================================
  // SOL
  // ======================================================

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

  // ======================================================
  // XRP
  // ======================================================

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

  // ======================================================
  // NEWS
  // ======================================================

  else if (
    text.includes("новости")
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

  // ======================================================
  // RUNES
  // ======================================================

  else if (
    text.includes("руны")
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

        userRunes[userId]
          .text
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

      try {

        await supabase
          .from("rune_history")
          .insert({

            user_id:
              String(userId),

            rune:
              rune.symbol
          });

      } catch {}

      await sendMessage(
        chatId,
        rune.text
      );
    }
  }

  // ======================================================
  // HOROSCOPE MENU
  // ======================================================

  else if (
    text.includes("гороскоп")
  ) {

    const zodiacKeyboard = {

      keyboard: [

        [
          {
            text: "Овен"
          },

          {
            text: "Телец"
          }
        ],

        [
          {
            text: "Близнецы"
          },

          {
            text: "Рак"
          }
        ],

        [
          {
            text: "Лев"
          },

          {
            text: "Дева"
          }
        ],

        [
          {
            text: "Весы"
          },

          {
            text: "Скорпион"
          }
        ],

        [
          {
            text: "Стрелец"
          },

          {
            text: "Козерог"
          }
        ],

        [
          {
            text: "Водолей"
          },

          {
            text: "Рыбы"
          }
        ],

        [
          {
            text:
              "🔙 НАЗАД"
          }
        ]
      ],

      resize_keyboard: true
    };

    await sendMessage(

      chatId,

`
♈ ВЫБЕРИ ЗНАК ЗОДИАКА

🌌 Тени подготовили
пророчество для каждого.
`,

      zodiacKeyboard
    );
  }

  // ======================================================
  // HOROSCOPE SIGNS
  // ======================================================

  else if (
    horoscope[text]
  ) {

    await sendMessage(

      chatId,

      horoscope[text],

      keyboard
    );
  }

  // ======================================================
  // REFERRAL
  // ======================================================

  else if (
    text.includes("призвать")
  ) {

    const botName =
      "YOUR_BOT_USERNAME";

    const link =
      `https://t.me/${botName}?start=${userId}`;

    let level = 1;
    let xp = 0;

    try {

      const { data } =
        await supabase
          .from("users")
          .select("*")
          .eq(
            "telegram_id",
            String(userId)
          )
          .single();

      level =
        data?.oracle_level || 1;

      xp =
        data?.xp || 0;

    } catch {}

    await sendMessage(

      chatId,

`
🌌 ТЫ ИЗБРАН ТЕНЯМИ РЫНКА

Передай пророчество
другому трейдеру.

━━━━━━━━━━

⚡ Уровень:
${level}

🔥 Oracle XP:
${xp}

━━━━━━━━━━

За каждого призванного:

💰 +50 XP
🜂 Рост уровня
🌑 Будущие VIP награды
🔮 Редкие руны

━━━━━━━━━━

Твоя ссылка:

${link}
`,

      keyboard
    );
  }

  // ======================================================
  // BACK
  // ======================================================

  else if (
    text.includes("назад")
  ) {

    await sendMessage(

      chatId,

      "🌌 Главное меню",

      keyboard
    );
  }

  // ======================================================
  // SIGNAL
  // ======================================================

  else if (
    text.includes("сигнал")
  ) {

    const randomCoins = [
      "BTC",
      "ETH",
      "SOL",
      "BNB",
      "XRP"
    ];

    const coin =
      randomCoins[
        Math.floor(
          Math.random() *
          randomCoins.length
        )
      ];

    const key =
      coin.toLowerCase();

    await sendMessage(

      chatId,

      await buildSignal(
        coin,
        key
      )
    );
  }

  // ======================================================
  // FALLBACK
  // ======================================================

  else {

    await sendMessage(

      chatId,

`
🌫 Оракул не понял запрос.

Используй клавиатуру теней.
`,

      keyboard
    );
  }

  return res
    .status(200)
    .end();
};
