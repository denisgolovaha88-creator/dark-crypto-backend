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

  if (text === "btc") {
  reply = `
🔮 BITCOIN ORACLE

₿ BTC: $${cryptoData.bitcoin.usd}
⚡ 24h: ${cryptoData.bitcoin.usd_24h_change.toFixed(2)}%

🌌 Биткоин входит в зону высокой волатильности.

Тени рынка становятся нестабильными.
Киты начинают движение в глубинах.

🔮 Оракул чувствует приближение сильного импульса.
`;
} else if (text === "eth") {
  reply = `
⚡ ETHEREUM VISION

Ξ ETH: $${cryptoData.ethereum.usd}
⚡ 24h: ${cryptoData.ethereum.usd_24h_change.toFixed(2)}%

🜂 Энергия Ethereum усиливается.

Сеть оживает.
Активность смарт-контрактов растёт.

🌌 Альткоины начинают пробуждаться.
`;
} else if (text === "bnb") {
  reply = `
🟡 BNB SIGNAL

🟡 BNB: $${cryptoData.binancecoin.usd}
⚡ 24h: ${cryptoData.binancecoin.usd_24h_change.toFixed(2)}%

🔥 Binance сохраняет доминирование.

Ликвидность течёт через скрытые каналы.
Рынок ощущает устойчивость BNB.

🔮 Империя Binance пока стоит крепко.
`;
} else if (text === "sol") {
  reply = `
🟣 SOLANA PROPHECY

🟣 SOL: $${cryptoData.solana.usd}
⚡ 24h: ${cryptoData.solana.usd_24h_change.toFixed(2)}%

⚡ Solana пылает высокой скоростью.

Трейдеры собираются вокруг её энергии.
Возможны резкие движения цены.

🌌 Волатильность усиливается.
`;
} else if (text === "xrp") {
  reply = `
🔵 XRP ORACLE

🔵 XRP: $${cryptoData.ripple.usd}
⚡ 24h: ${cryptoData.ripple.usd_24h_change.toFixed(2)}%

🌑 XRP движется в тумане неопределённости.

Но древние сигналы начинают усиливаться.
Рынок ожидает неожиданного импульса.

🔮 Тишина перед движением.
`;
} else if (text === "signal") {
  reply = `
🌑 MARKET SIGNAL

━━━━━━━━━━━━━━━

₿ BTC → ${cryptoData.bitcoin.usd_24h_change > 0 ? "🟢 BULLISH" : "🔴 BEARISH"}
⚡ ETH → ${cryptoData.ethereum.usd_24h_change > 0 ? "🟢 BULLISH" : "🔴 BEARISH"}
🟡 BNB → ${cryptoData.binancecoin.usd_24h_change > 0 ? "🟢 BULLISH" : "🔴 BEARISH"}
🟣 SOL → ${cryptoData.solana.usd_24h_change > 0 ? "🟢 BULLISH" : "🔴 BEARISH"}
🔵 XRP → ${cryptoData.ripple.usd_24h_change > 0 ? "🟢 BULLISH" : "🔴 BEARISH"}

━━━━━━━━━━━━━━━

🔮 Рыночная энергия постоянно меняется.
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
