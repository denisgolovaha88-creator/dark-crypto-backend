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

  let reply = "";
  let cryptoData = {};

  try {

    const response = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,binancecoin,solana,ripple,litecoin&vs_currencies=usd&include_24hr_change=true"
    );

    cryptoData = await response.json();

  } catch (e) {
    console.log(e);
  }

  const coins = {

    btc: {
      symbol: "₿",
      name: "Bitcoin",
      price: cryptoData.bitcoin?.usd || 0,
      change: cryptoData.bitcoin?.usd_24h_change || 0
    },

    eth: {
      symbol: "⚡",
      name: "Ethereum",
      price: cryptoData.ethereum?.usd || 0,
      change: cryptoData.ethereum?.usd_24h_change || 0
    },

    bnb: {
      symbol: "🟡",
      name: "BNB",
      price: cryptoData.binancecoin?.usd || 0,
      change: cryptoData.binancecoin?.usd_24h_change || 0
    },

    sol: {
      symbol: "🟣",
      name: "Solana",
      price: cryptoData.solana?.usd || 0,
      change: cryptoData.solana?.usd_24h_change || 0
    },

    xrp: {
      symbol: "🔵",
      name: "XRP",
      price: cryptoData.ripple?.usd || 0,
      change: cryptoData.ripple?.usd_24h_change || 0
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
        52,
        Math.floor(
          60 + Math.abs(coin.change) * 6
        )
      )
    );

    const bullish = coin.change > 0;

    const recommendation =
      confidence > 80
        ? bullish
          ? "🟢 СИЛЬНО ПОКУПАТЬ"
          : "🔴 СИЛЬНО ПРОДАВАТЬ"
        : bullish
        ? "🟢 ПОКУПАТЬ"
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

    const volatility = Math.abs(coin.change);

    let entryTime = "14:00 — 16:00 UTC";
    let exitTime = "20:00 — 23:00 UTC";

    if (volatility > 5) {
      entryTime = "12:00 — 15:00 UTC";
      exitTime = "18:00 — 21:00 UTC";
    }

    if (volatility < 2) {
      entryTime = "16:00 — 19:00 UTC";
      exitTime = "22:00 — 01:00 UTC";
    }

    return `
🔮 ${coin.name.toUpperCase()} ORACLE

${coin.symbol} Цена:
$${coin.price}

⚡ 24ч:
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

${strongestCoin.name.toUpperCase()}

⚡ Анализ импульса:
${
  bullish
    ? "Покупатели усиливают давление."
    : "Рынок уходит в защитную фазу."
}

💰 Активность китов усиливается.

🔮 Оракул ощущает приближение движения.
`;
  }

  const zodiacPredictions = {

    zodiac_oven: `
♈ Овен

⚡ Сегодня особенно сильны:
BTC • SOL

💰 Высокая вероятность импульсной прибыли.

🌑 Избегай входов после 22:00 UTC.

🍀 Удача: 78%
`,

    zodiac_telec: `
♉ Телец

🟡 Благоприятны:
ETH • BNB

⚡ Рынок стабилизируется.

💰 Возможна прибыль на спокойных сделках.

🍀 Удача: 81%
`,

    zodiac_bliz: `
♊ Близнецы

🟣 Сегодня рынок нестабилен.

⚡ Подходят быстрые сделки.

🚫 Избегай XRP.

🍀 Удача: 69%
`,

    zodiac_rak: `
♋ Рак

🌌 День проходит под энергией Ethereum.

💰 Хорошее время для накопления.

⚡ Избегай эмоциональных входов.

🍀 Удача: 74%
`,

    zodiac_lev: `
♌ Лев

🔥 Высокая вероятность сильного движения BTC.

⚡ Сегодня можно рисковать осторожно.

💰 Возможен мощный вечерний импульс.

🍀 Удача: 88%
`,

    zodiac_deva: `
♍ Дева

🟡 День аналитики и осторожности.

⚡ Подходят сделки по тренду.

🚫 Не доверяй пампам.

🍀 Удача: 73%
`,

    zodiac_vesi: `
♎ Весы

⚡ ETH и SOL усиливаются.

💰 Благоприятны среднесрочные сделки.

🌑 Возможны скрытые возможности.

🍀 Удача: 84%
`,

    zodiac_scorp: `
♏ Скорпион

🌌 Волатильность возрастает.

⚡ Возможны резкие движения.

💰 Сегодня особенно активны киты.

🍀 Удача: 79%
`,

    zodiac_strel: `
♐ Стрелец

🔥 День агрессивного рынка.

⚡ Хорошо работают быстрые входы.

🚫 Не держи позиции слишком долго.

🍀 Удача: 77%
`,

    zodiac_kozerog: `
♑ Козерог

🟡 Рынок склонен к накоплению.

💰 Хороший день для анализа.

⚡ Не спеши с фиксацией прибыли.

🍀 Удача: 75%
`,

    zodiac_vodoley: `
♒ Водолей

🟣 Solana усиливает своё влияние.

⚡ Возможны неожиданные новости.

💰 Благоприятны вечерние сделки.

🍀 Удача: 86%
`,

    zodiac_ribi: `
♓ Рыбы

🌌 Интуиция сегодня особенно сильна.

⚡ Подходят спокойные входы.

💰 Рынок готовит скрытый импульс.

🍀 Удача: 80%
`
  };

  const runes = [

    {
      name: "ᚠ FEHU",
      text:
        "💰 Руна прибыли и финансового потока.\n\nСегодня особенно сильна энергия накопления."
    },

    {
      name: "ᚱ RAIDHO",
      text:
        "⚡ Руна движения.\n\nРынок готовится к смене направления."
    },

    {
      name: "ᚲ KENAZ",
      text:
        "🔥 Руна прорыва.\n\nВозможен неожиданный рост объёмов."
    },

    {
      name: "ᚺ HAGALAZ",
      text:
        "🌑 Руна хаоса.\n\nСегодня рынок особенно волатилен."
    },

    {
      name: "ᚨ ANSUZ",
      text:
        "🔮 Руна инсайта.\n\nВажная информация может изменить рынок."
    }
  ];

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

${strongestCoin.name.toUpperCase()}

━━━━━━━━━━━━━━━

🔮 Выбери путь ниже.
`;

  } else if (text === "btc") {

    reply = generateSignal(coins.btc);

  } else if (text === "eth") {

    reply = generateSignal(coins.eth);

  } else if (text === "bnb") {

    reply = generateSignal(coins.bnb);

  } else if (text === "sol") {

    reply = generateSignal(coins.sol);

  } else if (text === "xrp") {

    reply = generateSignal(coins.xrp);

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

${strongestCoin.name.toUpperCase()}

💰 Волатильность усиливается.
`;

  } else if (text === "horoscope") {

    reply = `
♈ КРИПТОГОРОСКОП

━━━━━━━━━━━━━━━

Выбери знак зодиака 🔮
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
      "🔮 Оракул не смог прочитать звёзды.";

      } else if (text === "runes") {

  const rune =
    runes[
      Math.floor(Math.random() * runes.length)
    ];

  reply = `
🪬 РУНА ДНЯ

━━━━━━━━━━━━━━━

${rune.name}

${rune.text}

━━━━━━━━━━━━━━━

🌌 Руны древнего рынка открылись тебе.
`;

} else {

      const rune =
        runes[
          Math.floor(Math.random() * runes.length)
        ];

      updateUser(chatId, {
        lastRuneDate: today,

        lastRune: `
${rune.name}

${rune.text}
`
      });

      reply = `
🪬 РУНА ДНЯ

━━━━━━━━━━━━━━━

${rune.name}

${rune.text}

━━━━━━━━━━━━━━━

🌌 Эта руна будет сопровождать тебя весь день.
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
                  "Ты Crypto Nostradamus — мистический крипто-оракул. Отвечай только на русском языке."
              },

              {
                role: "user",

                content:
                  `BTC ${coins.btc.price}
ETH ${coins.eth.price}
BNB ${coins.bnb.price}
SOL ${coins.sol.price}
XRP ${coins.xrp.price}

Вопрос:
${text}`
              }
            ],

            temperature: 0.9,

            max_tokens: 350
          })
        }
      );

      const data = await aiResponse.json();

      reply =
        data.choices?.[0]?.message?.content ||
        "🔮 Оракул молчит.";

    } catch (e) {

      reply = "⚠️ AI connection failed.";
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
