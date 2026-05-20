module.exports = async (req, res) => {
  const telegramToken = "8821653271:AAEHIe7QhmcOOjxQFJ6DT5WPjZU9hczuVP8";
  const groqKey = "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";

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
BTC: $${cryptoData.bitcoin.usd} (${cryptoData.bitcoin.usd_24h_change.toFixed(2)}%)
ETH: $${cryptoData.ethereum.usd} (${cryptoData.ethereum.usd_24h_change.toFixed(2)}%)
BNB: $${cryptoData.binancecoin.usd} (${cryptoData.binancecoin.usd_24h_change.toFixed(2)}%)
SOL: $${cryptoData.solana.usd} (${cryptoData.solana.usd_24h_change.toFixed(2)}%)
LTC: $${cryptoData.litecoin.usd} (${cryptoData.litecoin.usd_24h_change.toFixed(2)}%)
XRP: $${cryptoData.ripple.usd} (${cryptoData.ripple.usd_24h_change.toFixed(2)}%)
`;
  } catch (e) {
    marketData = "Market data unavailable.";
  }

  if if (
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

  const trend = coin.change > 2
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

  const entryStart = "10:30";
  const entryEnd = "13:00";

  const exitStart = "18:00";
  const exitEnd = "22:00";

  reply = `
🔮 ${coin.name} ORACLE

${coin.icon} Цена: $${coin.price}
⚡ 24ч: ${coin.change.toFixed(2)}%

━━━━━━━━━━━━━━━

🜂 Рекомендация:
${trend}

🔮 Уровень уверенности:
${confidence}%

━━━━━━━━━━━━━━━

⏳ Лучшее время входа:
${entryStart} — ${entryEnd}

🚪 Лучшее время выхода:
${exitStart} — ${exitEnd}

💰 Оптимальный вход:
$${entryPrice}

🎯 Цель:
$${targetPrice}

🛡 Стоп-лосс:
$${stopLoss}

━━━━━━━━━━━━━━━

🌌 Анализ оракула:

Киты начинают движение в тени.
Индикаторы импульса усиливаются.
Скрытые потоки ликвидности пробуждаются.

⚠️ Возможны резкие движения после открытия американской сессии.

🔮 Инсайдерская энергия рынка становится нестабильной.
`;

} else if (text === "signal") {
  reply = `
🌑 GLOBAL MARKET SIGNAL

━━━━━━━━━━━━━━━

₿ BTC → ${cryptoData.bitcoin.usd_24h_change > 0 ? "🟢 BULLISH" : "🔴 BEARISH"}
⚡ ETH → ${cryptoData.ethereum.usd_24h_change > 0 ? "🟢 BULLISH" : "🔴 BEARISH"}
🟡 BNB → ${cryptoData.binancecoin.usd_24h_change > 0 ? "🟢 BULLISH" : "🔴 BEARISH"}
🟣 SOL → ${cryptoData.solana.usd_24h_change > 0 ? "🟢 BULLISH" : "🔴 BEARISH"}
🔵 XRP → ${cryptoData.ripple.usd_24h_change > 0 ? "🟢 BULLISH" : "🔴 BEARISH"}

━━━━━━━━━━━━━━━

🌌 Общая энергия рынка:

⚡ Волатильность усиливается
💰 Крупный капитал перемещается
🌑 Рынок готовится к импульсу

🔮 Оракул предупреждает:
Следующие 24 часа могут стать переломными.
`;

} else if (text === "/start") {
    reply = `
🌑 MARKET SIGNAL

🔮 Current vibration:
BULLISH

${marketData}
`;
  } else if (text === "/start") {
    reply = `
🌌 CRYPTO NOSTRADAMUS 🔮

━━━━━━━━━━━━━━━

Добро пожаловать, искатель прибыли.

Я — древний AI-оракул крипторынка.

━━━━━━━━━━━━━━━

📊 Монеты:
BTC • ETH • BNB • SOL • XRP • LTC

🔮 Спроси о будущем рынка...
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
                  "Ты Crypto Nostradamus — мистический крипто-оракул. Отвечай всегда на русском языке. Используй мистический стиль и полезный крипто-анализ."
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
          ]
        ]
      }
    })
  });

  res.status(200).end();
};
