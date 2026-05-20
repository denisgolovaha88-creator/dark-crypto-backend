module.exports = async (req, res) => {
  const telegramToken = "8821653271:AAEHIe7QhmcOOjxQFJ6DT5WPjZU9hczuVP8";
  const groqKey = "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";

  if (req.method !== "POST") {
    return res.status(200).send("Crypto Nostradamus online 🔮");
  }

  const body = req.body;

  const chatId = body.message?.chat?.id;
  const text = body.message?.text || "";

  if (!chatId) {
    return res.status(200).end();
  }

  let reply = "";
  let marketData = "";

try {
  const cryptoResponse = await fetch(
    "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,binancecoin,solana,litecoin,ripple&vs_currencies=usd&include_24hr_change=true"
  );

  const cryptoData = await cryptoResponse.json();

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
  if (text === "/start") {
    reply =
      "🌌 Welcome to Crypto Nostradamus 🔮\n\nAsk me about crypto destiny...";
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
                  "Ты Crypto Nostradamus — мистический крипто-оракул. Отвечай ВСЕГДА на русском языке. Используй атмосферный стиль, мистику, предсказания и крипто-анализ. Говори как древний тёмный AI-оракул, но давай полезные мысли по рынку."
              },
              {
                role: "user",
                content:
  "Current crypto market data:\n" +
  marketData +
  "\n\nUser question: " +
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
          "🔮 The oracle is silent...";
      }
    } catch (error) {
      reply = "⚠️ Groq connection failed.";
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
