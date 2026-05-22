// ======================================================
// 🌌 CRYPTO NOSTRADAMUS ULTIMATE RU
// ======================================================
// STABLE BUTTON FIX VERSION
// ======================================================
//
// ✅ FIXED BUTTONS
// ✅ FIXED SIGNALS
// ✅ FIXED HOROSCOPE
// ✅ FIXED VIP
// ✅ FIXED REFERRALS
// ✅ FIXED RUNES
// ✅ NORMALIZE TEXT
// ✅ SUPABASE
// ✅ EMA / RSI / ATR
// ✅ ENTRY / TP / SL
// ✅ MYSTIC AI
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

const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  "https://zosntsrvmbvehfpbicgx.supabase.co/rest/v1/";

const SUPABASE_KEY =
  process.env.SUPABASE_KEY ||
  "sb_secret_DCjobBLXrRXHYJ4gFh2L5g_mX52vd7n";

// ======================================================
// IMPORTS
// ======================================================

const {
  createClient
} = require("@supabase/supabase-js");

// ======================================================
// SUPABASE
// ======================================================

const supabase =
  createClient(
    SUPABASE_URL,
    SUPABASE_KEY
  );

// ======================================================
// GLOBALS
// ======================================================

global.marketCache =
  global.marketCache || {};

global.userCooldowns =
  global.userCooldowns || {};

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

  const username =
    body.message?.from?.username ||
    body.callback_query?.from?.username ||
    "unknown";

  // ====================================================
  // NORMALIZE TEXT
  // ====================================================

  const rawText =
    (
      body.message?.text ||
      body.callback_query?.data ||
      ""
    )
      .trim()
      .toLowerCase();

  function normalizeText(str) {

    return str

      .toLowerCase()

      .replace(
        /\$\d+(\.\d+)?/g,
        ""
      )

      .replace(
        /[^\p{L}\p{N}\s]/gu,
        ""
      )

      .replace(/\s+/g, " ")

      .trim();
  }

  const text =
    normalizeText(rawText);

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
  // COOLDOWN
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
  // REGISTER USER
  // ====================================================

  async function registerUser() {

    try {

      await supabase
        .from("users")
        .upsert({
          telegram_id: userId,
          username
        });

    } catch (e) {

      console.log(
        "SUPABASE USER ERROR",
        e
      );
    }
  }

  await registerUser();

  // ====================================================
  // PRICES
  // ====================================================

  async function getPrices() {

    return await getCached(

      "prices",

      15000,

      async () => {

        const r =
          await fetch(
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
          await fetch(
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

      300000,

      async () => {

        try {

          const r =
            await fetch(
              `https://gnews.io/api/v4/search?q=crypto&lang=ru&max=5&apikey=${GNEWS_API_KEY}`
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
  // LOAD DATA
  // ====================================================

  const prices =
    await getPrices();

  const news =
    await getNews();

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
        },

        {
          text:
            `👑 VIP`
        }
      ],

      [
        {
          text:
            `👥 РЕФЕРАЛЫ`
        }
      ]
    ],

    resize_keyboard: true
  };

  // ====================================================
  // ZODIAC
  // ====================================================

  const zodiacKeyboard = {

    keyboard: [

      [
        { text: "♈ Овен" },
        { text: "♉ Телец" }
      ],

      [
        { text: "♊ Близнецы" },
        { text: "♋ Рак" }
      ],

      [
        { text: "♌ Лев" },
        { text: "♍ Дева" }
      ],

      [
        { text: "♎ Весы" },
        { text: "♏ Скорпион" }
      ],

      [
        { text: "♐ Стрелец" },
        { text: "♑ Козерог" }
      ],

      [
        { text: "♒ Водолей" },
        { text: "♓ Рыбы" }
      ]
    ],

    resize_keyboard: true
  };

  // ====================================================
  // INDICATORS
  // ====================================================

  function SMA(data, period) {

    return (
      data
        .slice(0, period)
        .reduce(
          (a, b) => a + b,
          0
        ) / period
    );
  }

  function EMA(data, period) {

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

  async function aiOracle(data) {

    try {

      const prompt = `
Ты мистический крипто-оракул.

Монета: ${data.symbol}
Цена: ${data.price}
RSI: ${data.rsi}
EMA20: ${data.ema20}
EMA50: ${data.ema50}
ATR: ${data.atr}
Направление: ${data.direction}

Создай мистическое пророчество
для трейдера.
`;

      const r =
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
          }
        );

      const json =
        await r.json();

      return (
        json
          ?.choices?.[0]
          ?.message?.content ||

        "🌫 Потоки эфира нестабильны."
      );

    } catch {

      return `
🌫 Потоки эфира дрожат.

Тени китов
двигаются во мраке.
`;
    }
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

    const volatility =
      (
        atr / price * 100
      );

    let entryTime =
      "6-12 часов";

    let profitTime =
      "12-24 часа";

    if (volatility > 2) {

      entryTime =
        "1-3 часа";

      profitTime =
        "3-6 часов";
    }

    else if (
      volatility > 1
    ) {

      entryTime =
        "2-6 часов";

      profitTime =
        "6-12 часов";
    }

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

🌊 Волатильность:
${volatility.toFixed(2)}%

━━━━━━━━━━

🎯 Вход:
$${entry.toFixed(2)}

🛡 Stop Loss:
$${stop.toFixed(2)}

💎 Take Profit:
$${target.toFixed(2)}

⚖️ Risk/Reward:
${rr}

━━━━━━━━━━

⏰ Вход:
${entryTime}

⏰ Фиксация:
${profitTime}

━━━━━━━━━━

🔥 Уверенность:
${confidence}%

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

💰 Потоки капитала
усиливаются.
`,

`
ᚺ HAGALAZ

Руна хаоса.

⚠️ Волатильность
разрушит слабые позиции.
`,

`
ᛉ ALGIZ

Руна защиты.

🛡 Жди подтверждения
движения.
`
  ];

  // ====================================================
  // HOROSCOPE
  // ====================================================

  const horoscope = {

    "овен":
`
♈ ОВЕН

Марс усиливает BTC импульс.
`,

    "телец":
`
♉ ТЕЛЕЦ

Капитал начинает накопление.
`,

    "близнецы":
`
♊ БЛИЗНЕЦЫ

Информационный хаос усиливается.
`,

    "рак":
`
♋ РАК

ETH скрывает накопление.
`,

    "лев":
`
♌ ЛЕВ

BTC доминирует на рынке.
`,

    "дева":
`
♍ ДЕВА

Рынок требует расчёта.
`,

    "весы":
`
♎ ВЕСЫ

Баланс нарушен.
`,

    "скорпион":
`
♏ СКОРПИОН

Тёмные киты активны.
`,

    "стрелец":
`
♐ СТРЕЛЕЦ

SOL усиливает импульс.
`,

    "козерог":
`
♑ КОЗЕРОГ

Сатурн усиливает терпение.
`,

    "водолей":
`
♒ ВОДОЛЕЙ

Цифровой шторм приближается.
`,

    "рыбы":
`
♓ РЫБЫ

Луна усиливает интуицию.
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

    const {
      data: existing
    } = await supabase

      .from("runes")

      .select("*")

      .eq(
        "telegram_id",
        userId
      )

      .eq(
        "date",
        today
      )

      .single();

    if (existing) {

      await sendMessage(

`
🔮 Сегодня руны уже открывали тебе пророчество.
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

    await supabase

      .from("runes")

      .insert({

        telegram_id:
          userId,

        rune,

        date:
          today
      });

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
🔮 Выбери знак:
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
  // VIP
  // ====================================================

  if (
    text.includes("vip")
  ) {

    await sendMessage(

`
👑 VIP ORACLE

🌌 Скоро пробуждение элиты.
`,

      keyboard
    );

    return res
      .status(200)
      .end();
  }

  // ====================================================
  // REFERRALS
  // ====================================================

  if (
    text.includes("реферал")
  ) {

    await sendMessage(

`
👥 REFERRAL SYSTEM

🔗 Твой код:

oracle_${userId}
`,

      keyboard
    );

    return res
      .status(200)
      .end();
  }

  // ====================================================
  // SIGNALS
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
