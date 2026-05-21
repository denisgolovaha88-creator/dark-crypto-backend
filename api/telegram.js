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

  function generateSignal(coin) {

    const confidence = Math.min(
      95,
      Math.max(
        55,
        Math.floor(
          60 + Math.abs(coin.change) * 5
        )
      )
    );

    const bullish = coin.change > 0;

    const recommendation =
      bullish
        ? confidence > 80
          ? "🟢 СИЛЬНО ПОКУПАТЬ"
          : "🟢 ПОКУПАТЬ"
        : confidence > 80
        ? "🔴 СИЛЬНО ПРОДАВАТЬ"
        : "🟡 ОСТОРОЖНО";

    const entryPrice = bullish
      ? (coin.price * 0.992).toFixed(2)
      : (coin.price * 0.978).toFixed(2);

    const targetPrice = bullish
      ? (coin.price * 1.045).toFixed(2)
      : (coin.price * 0.95).toFixed(2);

    const stopLoss = bullish
      ? (coin.price * 0.97).toFixed(2)
      : (coin.price * 1.02).toFixed(2);

    let entryTime = "14:00 — 16:00 UTC";
    let exitTime = "20:00 — 23:00 UTC";

    if (Math.abs(coin.change) > 5) {
      entryTime = "12:00 — 15:00 UTC";
      exitTime = "18:00 — 21:00 UTC";
    }

    if (Math.abs(coin.change) < 2) {
      entryTime = "16:00 — 19:00 UTC";
      exitTime = "22:00 — 01:00 UTC";
    }

    return `
🔮 ${coin.name.toUpperCase()} ORACLE

━━━━━━━━━━━━━━━

${coin.symbol} Цена:
$${coin.price}

⚡ Изменение 24ч:
${coin.change.toFixed(2)}%

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

💰 Волатильность усиливается.
🔮 Импульс рынка растёт.
`;
  }

  const zodiacPredictions = {

    zodiac_oven: `
♈ Овен

⚡ Сегодня особенно сильны:
BTC • SOL

💰 Высокая вероятность импульсной прибыли.

🍀 Удача: 78%
`,

    zodiac_telec: `
♉ Телец

🟡 Благоприятны:
ETH • BNB

💰 Хороший день для спокойных сделок.

🍀 Удача: 81%
`,

    zodiac_bliz: `
♊ Близнецы

🟣 Рынок нестабилен.

⚡ Подходят быстрые сделки.

🍀 Удача: 69%
`,

    zodiac_rak: `
♋ Рак

🌌 День проходит под энергией Ethereum.

💰 Благоприятно накопление.

🍀 Удача: 74%
`,

    zodiac_lev: `
♌ Лев

🔥 BTC усиливает давление покупателей.

💰 Возможен вечерний импульс.

🍀 Удача: 88%
`,

    zodiac_deva: `
♍ Дева

🟡 День анализа и осторожности.

💰 Не доверяй пампам.

🍀 Удача: 73%
`,

    zodiac_vesi: `
♎ Весы

⚡ ETH и SOL усиливаются.

💰 Благоприятны среднесрочные сделки.

🍀 Удача: 84%
`,

    zodiac_scorp: `
♏ Скорпион

🌌 Волатильность возрастает.

💰 Сегодня особенно активны киты.

🍀 Удача: 79%
`,

    zodiac_strel: `
♐ Стрелец

🔥 День агрессивного рынка.

⚡ Подходят быстрые входы.

🍀 Удача: 77%
`,

    zodiac_kozerog: `
♑ Козерог

🟡 Хороший день для анализа.

💰 Не спеши фиксировать прибыль.

🍀 Удача: 75%
`,

    zodiac_vodoley: `
♒ Водолей

🟣 Solana усиливает своё влияние.

💰 Благоприятны вечерние сделки.

🍀 Удача: 86%
`,

    zodiac_ribi: `
♓ Рыбы

🌌 Интуиция сегодня особенно сильна.

💰 Рынок готовит скрытый импульс.

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

Выбери путь ниже 🔮
`;

  } else if (
    text === "btc" ||
    text === "eth" ||
    text === "bnb" ||
    text === "sol" ||
    text === "xrp"
  ) {

    reply = generateSignal(coins[text]);

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

💰 Волатильность усиливается.
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

🌌 Руны открыли тебе путь.
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
                  "Ты Crypto Nostradamus — мистический AI-оракул крипторынка. Отвечай ТОЛЬКО на русском языке. Используй атмосферу mystical crypto terminal."
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

Вопрос пользователя:
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
