// ======================================================
// 🌌 CRYPTO NOSTRADAMUS ULTIMATE RU
// ======================================================
// FULL TELEGRAM ORACLE BOT
// ======================================================
//
// ✅ ПОЛНОСТЬЮ РУССКИЙ
// ✅ МИСТИЧЕСКИЙ AI ORACLE
// ✅ ГОРOСКОПЫ 12 ЗНАКОВ
// ✅ РУНЫ 1 РАЗ В ДЕНЬ
// ✅ ЖИВЫЕ ЦЕНЫ
// ✅ SIGNAL ENGINE
// ✅ EMA / RSI / ATR
// ✅ REAL OHLC
// ✅ NEWS
// ✅ RATE LIMIT
// ✅ CACHE
// ✅ TELEGRAM KEYBOARD
//
// ======================================================

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
// GLOBALS
// ======================================================

global.marketCache =
  global.marketCache || {};

global.signalCache =
  global.signalCache || {};

global.userCooldowns =
  global.userCooldowns || {};

global.userRunes =
  global.userRunes || {};

// ======================================================
// EXPORT
// ======================================================

module.exports = async (req, res) => {

  // ====================================================
  // GET
  // ====================================================

  if (req.method !== "POST") {

    return res
      .status(200)
      .send(
        "🌌 CRYPTO NOSTRADAMUS ONLINE"
      );
  }

  // ====================================================
  // BODY
  // ====================================================

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
    )
      .trim()
      .toLowerCase();

  if (!chatId) {

    return res
      .status(200)
      .end();
  }

  // ====================================================
  // TELEGRAM
  // ====================================================

  async function sendMessage(
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

            parse_mode: "HTML",

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

  // ====================================================
  // SAFE FETCH
  // ====================================================

  async function safeFetch(
    url,
    options = {},
    timeout = 10000
  ) {

    const controller =
      new AbortController();

    const timer =
      setTimeout(
        () => controller.abort(),
        timeout
      );

    try {

      const response =
        await fetch(
          url,
          {
            ...options,
            signal:
              controller.signal
          }
        );

      clearTimeout(timer);

      return response;

    } catch (e) {

      clearTimeout(timer);

      throw e;
    }
  }

  // ====================================================
  // CACHE
  // ====================================================

  async function getCached(
    key,
    ttl,
    loader
  ) {

    const now =
      Date.now();

    const cached =
      global.marketCache[key];

    if (
      cached &&
      now - cached.timestamp < ttl
    ) {

      return cached.data;
    }

    const data =
      await loader();

    global.marketCache[key] = {

      timestamp:
        now,

      data
    };

    return data;
  }

  // ====================================================
  // RATE LIMIT
  // ====================================================

  function cooldown(
    userId,
    action,
    seconds
  ) {

    const now =
      Date.now();

    if (
      !global.userCooldowns[userId]
    ) {

      global.userCooldowns[userId] = {};
    }

    const last =
      global.userCooldowns[userId][action] || 0;

    if (
      now - last <
      seconds * 1000
    ) {

      return true;
    }

    global.userCooldowns[userId][action] =
      now;

    return false;
  }

  // ====================================================
  // PRICES
  // ====================================================

  async function getPrices() {

    return await getCached(

      "prices",

      15000,

      async () => {

        const r =
          await safeFetch(
            "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,binancecoin,solana,ripple&vs_currencies=usd"
          );

        return await r.json();
      }
    );
  }

  // ====================================================
  // OHLC
  // ====================================================

  async function getOHLC(id) {

    return await getCached(

      `ohlc_${id}`,

      60000,

      async () => {

        const r =
          await safeFetch(
            `https://api.coingecko.com/api/v3/coins/${id}/ohlc?vs_currency=usd&days=1`
          );

        return await r.json();
      }
    );
  }

  // ====================================================
  // NEWS
  // ====================================================

  async function getNews() {

    return await getCached(

      "news",

      600000,

      async () => {

        try {

          const r =
            await safeFetch(
              `https://gnews.io/api/v4/search?q=crypto OR bitcoin OR ethereum&lang=ru&max=5&apikey=${GNEWS_API_KEY}`
            );

          const data =
            await r.json();

          return (
            data.articles || []
          );

        } catch {

          return [
            {
              title:
                "🌫 Потоки новостей нестабильны."
            }
          ];
        }
      }
    );
  }

  // ====================================================
  // SENTIMENT
  // ====================================================

  async function getSentiment() {

    return await getCached(

      "sentiment",

      300000,

      async () => {

        try {

          const r =
            await safeFetch(
              `https://api.coinindex.io/v1/market/sentiment?apikey=${COININDEX_API_KEY}`
            );

          return await r.json();

        } catch {

          return {

            mood:
              "НЕЙТРАЛЬНО",

            value:
              50
          };
        }
      }
    );
  }

  // ====================================================
  // LOAD DATA
  // ====================================================

  let prices;
  let news;
  let sentiment;

  try {

    [
      prices,
      news,
      sentiment
    ] = await Promise.all([

      getPrices(),

      getNews(),

      getSentiment()
    ]);

  } catch (e) {

    console.log(e);

    await sendMessage(
      "⚠️ Потоки рынка разрушены."
    );

    return res
      .status(200)
      .end();
  }

  // ====================================================
  // KEYBOARD
  // ====================================================

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
            `🌑 СИГНАЛ`
        }
      ],

      [
        {
          text:
            `📰 НОВОСТИ`
        },

        {
          text:
            `🔮 РУНЫ`
        }
      ],

      [
        {
          text:
            `♈ ГОРОСКОП`
        }
      ]
    ],

    resize_keyboard: true
  };

  // ====================================================
  // ZODIAC KEYBOARD
  // ====================================================

  const zodiacKeyboard = {

    keyboard: [

      [
        { text: "♈ овен" },
        { text: "♉ телец" }
      ],

      [
        { text: "♊ близнецы" },
        { text: "♋ рак" }
      ],

      [
        { text: "♌ лев" },
        { text: "♍ дева" }
      ],

      [
        { text: "♎ весы" },
        { text: "♏ скорпион" }
      ],

      [
        { text: "♐ стрелец" },
        { text: "♑ козерог" }
      ],

      [
        { text: "♒ водолей" },
        { text: "♓ рыбы" }
      ]
    ],

    resize_keyboard: true
  };

  // ====================================================
  // INDICATORS
  // ====================================================

  function SMA(
    data,
    period
  ) {

    return (
      data
        .slice(0, period)
        .reduce(
          (a, b) => a + b,
          0
        ) / period
    );
  }

  function EMA(
    data,
    period
  ) {

    if (
      data.length < period
    ) {

      return data.at(-1);
    }

    const k =
      2 / (period + 1);

    let ema =
      SMA(data, period);

    for (
      let i = period;
      i < data.length;
      i++
    ) {

      ema =
        data[i] * k +
        ema * (1 - k);
    }

    return ema;
  }

  function RSI(
    data,
    period = 14
  ) {

    if (
      data.length <= period
    ) {

      return 50;
    }

    let gains = 0;
    let losses = 0;

    for (
      let i =
        data.length - period;
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
    candles,
    period = 14
  ) {

    let trs = [];

    for (
      let i = 1;
      i < candles.length;
      i++
    ) {

      const prevClose =
        candles[i - 1][4];

      const high =
        candles[i][2];

      const low =
        candles[i][3];

      const tr =
        Math.max(

          high - low,

          Math.abs(
            high - prevClose
          ),

          Math.abs(
            low - prevClose
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

  // ====================================================
  // AI ORACLE
  // ====================================================

  async function aiOracle(
    data
  ) {

    try {

      const prompt = `
Ты мистический крипто-оракул.

Монета:
${data.symbol}

Цена:
${data.price}

RSI:
${data.rsi}

EMA20:
${data.ema20}

EMA50:
${data.ema50}

ATR:
${data.atr}

Направление:
${data.direction}

Новости:
${String(
  news[0]?.title || ""
).slice(0, 200)}

Создай мистическое пророчество:
- настроение рынка
- угрозы
- силу тренда
- совет трейдеру
- магическое предсказание

Стиль:
мрачный,
мистический,
крипто,
атмосферный.
`;

      const r =
        await safeFetch(
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

              temperature:
                0.95,

              messages: [
                {
                  role:
                    "user",

                  content:
                    prompt
                }
              ]
            })
          },
          20000
        );

      const json =
        await r.json();

      const aiText =
        json
          ?.choices?.[0]
          ?.message?.content;

      if (
        aiText &&
        aiText.length > 30
      ) {

        return aiText;
      }

    } catch {}

    return `
🌌 ПРОРОЧЕСТВО ТЕНЕЙ

Рынок скрывает истинное направление.

Крупные игроки накапливают силу
в темноте свечей.

⚠️ Опасность:
ложный импульс уничтожит
слабые позиции.

💰 Совет:
жди подтверждения движения.

🔮 Потоки эфира шепчут:
грядущая волатильность
изменит баланс рынка.
`;
  }

  // ====================================================
  // SIGNAL
  // ====================================================

  async function buildSignal(
    symbol,
    id
  ) {

    const candles =
      await getOHLC(id);

    if (
      !candles?.length
    ) {

      return `
⚠️ Анализ недоступен.
`;
    }

    const closes =
      candles.map(
        c => c[4]
      );

    const highs =
      candles.map(
        c => c[2]
      );

    const lows =
      candles.map(
        c => c[3]
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
      ATR(candles);

    const support =
      Math.min(
        ...lows.slice(-20)
      );

    const resistance =
      Math.max(
        ...highs.slice(-20)
      );

    const bullish =
      ema20 > ema50;

    const direction =
      bullish
        ? "ЛОНГ"
        : "ШОРТ";

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
          50 +
          (
            Math.abs(
              ema20 - ema50
            ) / price
          ) * 1000
        )
      );

    const oracle =
      await aiOracle({

        symbol,

        price,

        rsi,

        ema20,

        ema50,

        atr,

        direction
      });

    return `
🌌 ${symbol} ORACLE

━━━━━━━━━━

💰 Цена:
$${price.toFixed(2)}

📈 Направление:
${direction}

📊 RSI:
${rsi.toFixed(2)}

📉 EMA20:
${ema20.toFixed(2)}

📉 EMA50:
${ema50.toFixed(2)}

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

🔥 Уверенность:
${confidence}%

🌡 Настроение рынка:
${sentiment.mood || "НЕЙТРАЛЬНО"}

━━━━━━━━━━

${oracle}
`;
  }

  // ====================================================
  // RUNES
  // ====================================================

  const runeList = [

`
ᚠ FEHU

Руна богатства.

Древние потоки капитала
пробуждаются.

💰 Совет:
фиксируй прибыль частями.

🔮 Пророчество:
золото придёт к терпеливым.
`,

`
ᚺ HAGALAZ

Руна хаоса.

Тьма усиливает волатильность.

⚠️ Совет:
уменьши риск.

🔮 Пророчество:
буря уничтожит слабые позиции.
`
  ];

  // ====================================================
  // HOROSCOPES
  // ====================================================

  const horoscope = {

    "♈ овен":
`
♈ ОВЕН

Марс усиливает волатильность.

🔥 Энергия:
агрессивная.

💰 Удача:
78%

🌌 Пророчество:
алые свечи осветят путь.
`,

    "♉ телец":
`
♉ ТЕЛЕЦ

Крупный капитал
начинает накопление.

💰 Удача:
81%

🌌 Пророчество:
терпение принесёт богатство.
`,

    "♊ близнецы":
`
♊ БЛИЗНЕЦЫ

Информационный хаос
усиливает рынок.

💰 Удача:
69%

🌌 Пророчество:
двойственные тени
попытаются сбить тебя с пути.
`,

    "♋ рак":
`
♋ РАК

ETH формирует
скрытое накопление.

💰 Удача:
74%

🌌 Пророчество:
тишина перед движением
будет обманчивой.
`,

    "♌ лев":
`
♌ ЛЕВ

BTC усиливает доминирование.

💰 Удача:
84%

🌌 Пророчество:
золотое пламя
осветит рынок.
`,

    "♍ дева":
`
♍ ДЕВА

Рынок требует расчёта.

💰 Удача:
72%

🌌 Пророчество:
цифры откроют скрытые потоки.
`,

    "♎ весы":
`
♎ ВЕСЫ

Баланс рынка нарушен.

💰 Удача:
75%

🌌 Пророчество:
одна свеча изменит всё.
`,

    "♏ скорпион":
`
♏ СКОРПИОН

Тёмные киты активны.

💰 Удача:
88%

🌌 Пророчество:
тайные ордера
откроют врата импульса.
`,

    "♐ стрелец":
`
♐ СТРЕЛЕЦ

SOL усиливает импульс.

💰 Удача:
79%

🌌 Пророчество:
дальняя цель станет ближе.
`,

    "♑ козерог":
`
♑ КОЗЕРОГ

Сатурн усиливает терпение.

💰 Удача:
77%

🌌 Пророчество:
время укрепит капитал.
`,

    "♒ водолей":
`
♒ ВОДОЛЕЙ

Цифровой шторм приближается.

💰 Удача:
73%

🌌 Пророчество:
хаос создаст возможности.
`,

    "♓ рыбы":
`
♓ РЫБЫ

Луна усиливает интуицию.

💰 Удача:
82%

🌌 Пророчество:
туман рассеется
после синей свечи.
`
  };

  // ====================================================
  // START
  // ====================================================

  if (
    text === "/start"
  ) {

    await sendMessage(

`
🌌 CRYPTO NOSTRADAMUS

━━━━━━━━━━

₿ BTC:
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
${sentiment.mood || "НЕЙТРАЛЬНО"}

━━━━━━━━━━

📡 Потоки рынка активны.
`,

      keyboard
    );

    return res
      .status(200)
      .end();
  }

  // ====================================================
  // NEWS
  // ====================================================

  if (
    text.includes("новости")
  ) {

    let msg =
`
📰 КРИПТО НОВОСТИ

━━━━━━━━━━

`;

    news.forEach(n => {

      msg +=
        `• ${n.title}\n\n`;
    });

    await sendMessage(
      msg,
      keyboard
    );

    return res
      .status(200)
      .end();
  }

  // ====================================================
  // RUNES
  // ====================================================

  if (
    text.includes("руны")
  ) {

    const today =
      new Date()
        .toISOString()
        .slice(0, 10);

    if (
      global.userRunes[userId]?.date ===
      today
    ) {

      await sendMessage(
`
🔮 Сегодня руны уже открывали тебе пророчество.

Возвращайся после полуночи.
`,
        keyboard
      );

      return res
        .status(200)
        .end();
    }

    const rune =
      runeList[
        Math.floor(
          Math.random() *
          runeList.length
        )
      ];

    global.userRunes[userId] = {

      date:
        today,

      text:
        rune
    };

    await sendMessage(
      rune,
      keyboard
    );

    return res
      .status(200)
      .end();
  }

  // ====================================================
  // HOROSCOPE MENU
  // ====================================================

  if (
    text.includes("гороскоп")
  ) {

    await sendMessage(
`
🔮 Выбери знак зодиака:
`,
      zodiacKeyboard
    );

    return res
      .status(200)
      .end();
  }

  // ====================================================
  // HOROSCOPE ROUTER
  // ====================================================

  if (
    horoscope[text]
  ) {

    await sendMessage(
      horoscope[text],
      keyboard
    );

    return res
      .status(200)
      .end();
  }

  // ====================================================
  // SIGNAL MENU
  // ====================================================

  if (
    text.includes("сигнал")
  ) {

    await sendMessage(
`
🌑 Выбери актив:

BTC
ETH
BNB
SOL
XRP
`,
      keyboard
    );

    return res
      .status(200)
      .end();
  }

  // ====================================================
  // SIGNAL ROUTER
  // ====================================================

  let symbol = null;

  if (
    text.includes("btc")
  ) {

    symbol = "btc";
  }

  else if (
    text.includes("eth")
  ) {

    symbol = "eth";
  }

  else if (
    text.includes("bnb")
  ) {

    symbol = "bnb";
  }

  else if (
    text.includes("sol")
  ) {

    symbol = "sol";
  }

  else if (
    text.includes("xrp")
  ) {

    symbol = "xrp";
  }

  const routes = {

    btc:
      "bitcoin",

    eth:
      "ethereum",

    bnb:
      "binancecoin",

    sol:
      "solana",

    xrp:
      "ripple"
  };

  if (symbol) {

    if (
      cooldown(
        userId,
        "signal",
        10
      )
    ) {

      await sendMessage(
`
⏳ Потоки перегреты.

Подожди 10 секунд.
`,
        keyboard
      );

      return res
        .status(200)
        .end();
    }

    const signal =
      await buildSignal(
        symbol.toUpperCase(),
        routes[symbol]
      );

    await sendMessage(
      signal,
      keyboard
    );

    return res
      .status(200)
      .end();
  }

  // ====================================================
  // FALLBACK
  // ====================================================

  await sendMessage(

`
🌫 Туманы не распознали команду.

Используй клавиатуру.
`,

    keyboard
  );

  return res
    .status(200)
    .end();
};
