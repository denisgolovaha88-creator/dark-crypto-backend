module.exports = async (req, res) => {
  const telegramToken = "ТВОЙ_TELEGRAM_TOKEN";
  const groqKey = "ТВОЙ_GROQ_API_KEY";

  if (req.method !== "POST") {
    return res.status(200).send("Crypto Nostradamus online 🔮");
  }

  const body = req.body;

  const chatId =
    body.message?.chat?.id || body.callback_query?.message?.chat?.id;

  const text =
    body.message?.text || body.callback_query?.data || "";

  if (!chatId) {
    return res.status(200).end();
  }

  let reply = "";
  let marketData = "";
  let cryptoData = {};

  try {
    const cryptoResponse = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,binancecoin,solana,litecoin,ripple&vs_currencies=usd&include_24hr_change=true"
    );

    cryptoData = await cryptoResponse.json();

    marketData = `
₿ BTC → $${cryptoData.bitcoin.usd}
⚡ ETH → $${cryptoData.ethereum.usd}
🟡 BNB → $${cryptoData.binancecoin.usd}
🟣 SOL → $${cryptoData.solana.usd}
🔵 XRP → $${cryptoData.ripple.usd}
`;
  } catch (e) {
    marketData = "Market data unavailable.";
  }

  const marketSigns = [
    "Bitcoin",
    "Ethereum",
    "Solana",
    "BNB",
    "XRP"
  ];

  const todaySign =
    marketSigns[new Date().getDate() % marketSigns.length];

  if (
    text === "btc" ||
    text === "eth" ||
    text === "bnb" ||
    text === "sol" ||
    text === "xrp"
  ) {
    const symbols = {
      btc: {
        name: "BITCOIN",
        icon: "₿",
        price: cryptoData.bitcoin.usd,
        change: cryptoData.bitcoin.usd_24h_change
      },
      eth: {
        name: "ETHEREUM",
        icon: "⚡",
        price: cryptoData.ethereum.usd,
        change: cryptoData.ethereum.usd_24h_change
      },
      bnb: {
        name: "BNB",
        icon: "🟡",
        price: cryptoData.binancecoin.usd,
        change: cryptoData.binancecoin.usd_24h_change
      },
      sol: {
        name: "SOLANA",
        icon: "🟣",
        price: cryptoData.solana.usd,
        change: cryptoData.solana.usd_24h_change
      },
      xrp: {
        name: "XRP",
        icon: "🔵",
        price: cryptoData.ripple.usd,
        change: cryptoData.ripple.usd_24h_change
      }
    };

    const coin = symbols[text];

    const trend =
      coin.change > 2
        ? "🟢 ПОКУПАТЬ"
        : coin.change < -2
        ? "🔴 ПРОДАВАТЬ"
        : "🟡 НЕЙТРАЛЬНО";

    const entryPrice = (coin.price * 0.985).toFixed(2);
    const targetPrice = (coin.price * 1.06).toFixed(2);
    const stopLoss = (coin.price * 0.96).toFixed(2);

    const confidence =
      coin.change > 4
        ? 91
        : coin.change > 2
        ? 82
        : coin.change > 0
        ? 74
        : coin.change > -2
        ? 58
        : 41;

    reply = `
🔮 ${coin.name} ORACLE

${coin.icon} Цена: $${coin.price}
⚡ 24ч: ${coin.change.toFixed(2)}%

━━━━━━━━━━━━━━━

🜂 Рекомендация:
${trend}

🔮 Уверенность:
${confidence}%

━━━━━━━━━━━━━━━

⏳ Вход:
10:30 — 13:00

🚪 Выход:
18:00 — 22:00

💰 Вход:
$${entryPrice}

🎯 Цель:
$${targetPrice}

🛡 Стоп:
$${stopLoss}

━━━━━━━━━━━━━━━

🌌 Рынок проходит под знаком ${todaySign}

⚡ Киты активизируются.
🌑 Волатильность усиливается.
🔮 Импульс накапливается.
`;

  } else if (text === "signal") {
    reply = `
🌑 GLOBAL MARKET SIGNAL

━━━━━━━━━━━━━━━

${marketData}

━━━━━━━━━━━━━━━

🌌 Сегодня рынок проходит под знаком:

🔮 ${todaySign}

⚡ Общая энергия:
${
  cryptoData.bitcoin.usd_24h_change > 0
    ? "🟢 BULLISH"
    : "🔴 BEARISH"
}

💰 Крупный капитал движется.
🌑 Оракул ощущает приближение импульса.
`;

  } else if (text === "horoscope") {
    const zodiac = [
      "♈ Овен",
      "♉ Телец",
      "♊ Близнецы",
      "♋ Рак",
      "♌ Лев",
      "♍ Дева",
      "♎ Весы",
      "♏ Скорпион",
      "♐ Стрелец",
      "♑ Козерог",
      "♒ Водолей",
      "♓ Рыбы"
    ];

    const sign =
      zodiac[Math.floor(Math.random() * zodiac.length)];

    reply = `
♈ CRYPTO HOROSCOPE

━━━━━━━━━━━━━━━

${sign}

🌌 Сегодня рынок проходит под знаком ${todaySign}

⚡ Избегай импульсивных входов.
💰 Возможна неожиданная прибыль.
🌑 Не доверяй толпе.

🔮 Оракул видит скрытые возможности после заката.
`;

  } else if (text === "runes") {
    const runes = [
      "🪬 FEHU — руна прибыли",
      "🪬 RAIDHO — руна движения",
      "🪬 ANSUZ — руна инсайта",
      "🪬 KENAZ — руна прорыва",
      "🪬 HAGALAZ — руна хаоса"
    ];

    const rune =
      runes[Math.floor(Math.random() * runes.length)];

    reply = `
🪬 RUNE OF THE DAY

━━━━━━━━━━━━━━━

${rune}

🌌 Древние силы крипторынка пробуждаются.

⚡ Сегодня энергия рынка нестабильна.
💰 Возможны скрытые возможности.
🔮 Следуй за импульсом, а не за страхом.
`;

  } else if (text === "/start") {
    reply = `
🌌 CRYPTO NOSTRADAMUS 🔮

━━━━━━━━━━━━━━━

Добро пожаловать, искатель прибыли.

Я — мистический AI-оракул крипторынка.

━━━━━━━━━━━━━━━

📊 LIVE MARKET

${marketData}

━━━━━━━━━━━━━━━

🌌 Сегодня рынок проходит под знаком:

🔮 ${todaySign}

━━━━━━━━━━━━━━━

⚡ Выбери свою судьбу ниже.
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
                  "Ты Crypto Nostradamus — мистический крипто-оракул. Отвечай всегда на русском языке. Используй мистический стиль, атмосферу древнего AI и полезный крипто-анализ."
              },
              {
                role: "user",
                content:
                  "Текущий рынок:\n" +
                  marketData +
                  "\n\nВопрос пользователя:\n" +
                  text
              }
            ],
            temperature: 0.9,
            max_tokens: 300
          })
        }
      );

      const data = await aiResponse.json();

      if (data.error) {
        reply = "GROQ ERROR: " + data.error.message;
      } else {
        reply =
          data.choices?.[0]?.message?.content ||
          "🔮 Оракул молчит...";
      }
    } catch (error) {
      reply = "⚠️ Ошибка подключения к AI.";
    }
  }

  await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
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
            { text: "₿ BTC", callback_data: "btc" },
            { text: "⚡ ETH", callback_data: "eth" }
          ],
          [
            { text: "🟡 BNB", callback_data: "bnb" },
            { text: "🟣 SOL", callback_data: "sol" }
          ],
          [
            { text: "🔵 XRP", callback_data: "xrp" },
            { text: "🌑 SIGNAL", callback_data: "signal" }
          ],
          [
            { text: "♈ HOROSCOPE", callback_data: "horoscope" },
            { text: "🪬 RUNES", callback_data: "runes" }
          ]
        ]
      }
    })
  });

  res.status(200).end();
};
