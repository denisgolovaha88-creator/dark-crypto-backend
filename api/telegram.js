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
    body.message?.text ||
    body.callback_query?.data ||
    "";

  if (!chatId) {
    return res.status(200).end();
  }

  let cryptoData = {};
  let marketData = {};

  try {

    const response = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,binancecoin,solana,ripple&vs_currencies=usd&include_24hr_change=true"
    );

    cryptoData = await response.json();

    const btcKlines = await fetch(
      "https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1h&limit=24"
    );

    const ethKlines = await fetch(
      "https://api.binance.com/api/v3/klines?symbol=ETHUSDT&interval=1h&limit=24"
    );

    const bnbKlines = await fetch(
      "https://api.binance.com/api/v3/klines?symbol=BNBUSDT&interval=1h&limit=24"
    );

    const solKlines = await fetch(
      "https://api.binance.com/api/v3/klines?symbol=SOLUSDT&interval=1h&limit=24"
    );

    const xrpKlines = await fetch(
      "https://api.binance.com/api/v3/klines?symbol=XRPUSDT&interval=1h&limit=24"
    );

    marketData = {
      btc: await btcKlines.json(),
      eth: await ethKlines.json(),
      bnb: await bnbKlines.json(),
      sol: await solKlines.json(),
      xrp: await xrpKlines.json()
    };

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

  function generateSignal(coin, symbol) {

    const candles = marketData[symbol];

    if (!candles || !candles.length) {

      return `
⚠️ Анализ временно недоступен.
`;
    }

    const closes = candles.map(c =>
      parseFloat(c[4])
    );

    const first = closes[0];
    const last = closes[closes.length - 1];

    const trendPercent =
      ((last - first) / first) * 100;

    const bullish = trendPercent > 0;

    const volatility =
      Math.max(...closes) -
      Math.min(...closes);

    const confidence = Math.min(
      97,
      Math.max(
        52,
        Math.floor(
          55 +
          Math.abs(trendPercent) * 6 +
          (volatility / last) * 100
        )
      )
    );

    let recommendation = "🟡 НЕЙТРАЛЬНО";

    if (bullish && confidence > 75) {
      recommendation = "🟢 ПОКУПАТЬ";
    }

    if (!bullish && confidence > 75) {
      recommendation = "🔴 ПРОДАВАТЬ";
    }

    const entryPrice = bullish
      ? (last * 0.995).toFixed(2)
      : (last * 0.985).toFixed(2);

    const targetPrice = bullish
      ? (last * 1.03).toFixed(2)
      : (last * 0.97).toFixed(2);

    const stopLoss = bullish
      ? (last * 0.98).toFixed(2)
      : (last * 1.02).toFixed(2);

    let entryTime = "15:00 — 18:00 UTC";
    let exitTime = "20:00 — 00:00 UTC";

    if ((volatility / last) > 0.04) {
      entryTime = "12:00 — 15:00 UTC";
      exitTime = "18:00 — 22:00 UTC";
    }

    return `
🔮 ${coin.name.toUpperCase()} ORACLE

━━━━━━━━━━━━━━━

${coin.symbol} Цена:
$${last.toFixed(2)}

📈 Тренд:
${trendPercent.toFixed(2)}%

⚡ Волатильность:
${volatility.toFixed(2)}

━━━━━━━━━━━━━━━

🜂 Рекомендация:
${recommendation}

🔮 Уверенность:
${confidence}%

━━━━━━━━━━━━━━━

💰 Оптимальный вход:
$${entryPrice}

⏳ Лучшее время входа:
${entryTime}

🎯 Цель:
$${targetPrice}

🚪 Лучшее время фиксации:
${exitTime}

🛡 Стоп-лосс:
$${stopLoss}

━━━━━━━━━━━━━━━

🌌 Сегодня рынок проходит под знаком:

${strongestCoin.name}

🌑 Анализ основан на:
• Binance candles
• Momentum
• Volatility
• Trend energy
`;
  }

  const zodiacPredictions = {

    zodiac_oven: `
♈ Овен

⚡ BTC усиливает энергию роста.

💰 Благоприятны быстрые сделки.

🍀 Удача: 78%
`,

    zodiac_telec: `
♉ Телец

🟡 ETH стабилизирует рынок.

💰 Подходят спокойные входы.

🍀 Удача: 81%
`,

    zodiac_bliz: `
♊ Близнецы

🟣 Волатильность возрастает.

⚡ Возможны резкие импульсы.

🍀 Удача: 69%
`,

    zodiac_rak: `
♋ Рак

🌌 День проходит под знаком Ethereum.

💰 Благоприятно накопление.

🍀 Удача: 74%
`,

    zodiac_lev: `
♌ Лев

🔥 BTC привлекает внимание китов.

💰 Высока вероятность пампа.

🍀 Удача: 88%
`,

    zodiac_deva: `
♍ Дева

🟡 День осторожных решений.

💰 Не гонись за FOMO.

🍀 Удача: 73%
`,

    zodiac_vesi: `
♎ Весы

⚡ ETH и SOL усиливают рынок.

💰 Благоприятны swing-сделки.

🍀 Удача: 84%
`,

    zodiac_scorp: `
♏ Скорпион

🌌 Волатильность усиливается.

💰 Возможны скрытые движения китов.

🍀 Удача: 79%
`,

    zodiac_strel: `
♐ Стрелец

🔥 День агрессивного рынка.

⚡ Подходят короткие сделки.

🍀 Удача: 77%
`,

    zodiac_kozerog: `
♑ Козерог

🟡 Рынок требует терпения.

💰 Сильны накопительные позиции.

🍀 Удача: 75%
`,

    zodiac_vodoley: `
♒ Водолей

🟣 Solana усиливает влияние.

💰 Благоприятны вечерние сделки.

🍀 Удача: 86%
`,

    zodiac_ribi: `
♓ Рыбы

🌌 Интуиция сегодня особенно сильна.

💰 Возможен скрытый рост.

🍀 Удача: 80%
`
  };

  const runes = [
    "ᚠ FEHU — руна богатства",
    "ᚱ RAIDHO — руна движения",
    "ᚲ KENAZ — руна прорыва",
    "ᚺ HAGALAZ — руна хаоса",
    "ᚨ ANSUZ — руна инсайта"
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
    text === "/horoscope" ||
    text === "/runes"
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

🌌 Сегодня рынок проходит под знаком:

${strongestCoin.name}

━━━━━━━━━━━━━━━

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

🌌 Сегодня рынок проходит под знаком:

${strongestCoin.name}

⚡ Волатильность усиливается
🌑 Momentum растёт
`;

  } else if (text === "horoscope") {

    reply = `
♈ КРИПТОГОРОСКОП

━━━━━━━━━━━━━━━

Выбери знак 🔮
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

          text: reply,

          reply_markup: {
            inline_keyboard: [

              [
                {
                  text: "♈ Овен",
                  callback_data: "zodiac_oven"
                },

                {
                  text: "♉ Телец",
                  callback_data: "zodiac_telec"
                }
              ],

              [
                {
                  text: "♊ Близнецы",
                  callback_data: "zodiac_bliz"
                },

                {
                  text: "♋ Рак",
                  callback_data: "zodiac_rak"
                }
              ],

              [
                {
                  text: "♌ Лев",
                  callback_data: "zodiac_lev"
                },

                {
                  text: "♍ Дева",
                  callback_data: "zodiac_deva"
                }
              ],

              [
                {
                  text: "♎ Весы",
                  callback_data: "zodiac_vesi"
                },

                {
                  text: "♏ Скорпион",
                  callback_data: "zodiac_scorp"
                }
              ],

              [
                {
                  text: "♐ Стрелец",
                  callback_data: "zodiac_strel"
                },

                {
                  text: "♑ Козерог",
                  callback_data: "zodiac_kozerog"
                }
              ],

              [
                {
                  text: "♒ Водолей",
                  callback_data: "zodiac_vodoley"
                },

                {
                  text: "♓ Рыбы",
                  callback_data: "zodiac_ribi"
                }
              ]
            ]
          }
        })
      }
    );

    return res.status(200).end();

  } else if (text.startsWith("zodiac_")) {

    reply =
      zodiacPredictions[text] ||
      "🔮 Звёзды скрыли ответ.";

  } else if (text === "runes") {

    const rune =
      runes[
        Math.floor(Math.random() * runes.length)
      ];

    reply = `
🪬 РУНА ДНЯ

━━━━━━━━━━━━━━━

${rune}

━━━━━━━━━━━━━━━

🌌 Руны открыли путь.
`;

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
                  "Ты Crypto Nostradamus — мистический AI-оракул крипторынка. Отвечай только на русском языке."
              },

              {
                role: "user",

                content:
                  `
BTC: $${coins.btc.price}
ETH: $${coins.eth.price}
BNB: $${coins.bnb.price}
SOL: $${coins.sol.price}
XRP: $${coins.xrp.price}

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

      const data = await aiResponse.json();

      reply =
        data.choices?.[0]?.message?.content ||
        "🔮 Оракул временно молчит.";

    } catch (e) {

      reply =
        "⚠️ Энергия AI временно недоступна.";
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
