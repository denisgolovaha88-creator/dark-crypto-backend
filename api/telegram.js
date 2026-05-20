module.exports = async (req, res) => {
  const token = "8821653271:AAEHIe7QhmcOOjxQFJ6DT5WPjZU9hczuVP8";

  if (req.method !== "POST") {
    return res.status(200).send("Dark Crypto Oracle online 🔮");
  }

  const body = req.body;

  const chatId = body.message?.chat?.id;
  const text = body.message?.text || "";

  if (!chatId) {
    return res.status(200).end();
  }

  let reply = "";

  if (text === "/start") {
    reply =
      "🌌 Welcome to Dark Crypto Oracle 🔮\n\nAsk me about crypto destiny...";
  } else if (text.toLowerCase().includes("btc")) {
    reply =
      "🔮 Bitcoin walks through shadows...\n\nA powerful move may come soon.";
  } else if (text.toLowerCase().includes("eth")) {
    reply =
      "⚡ Ethereum energy grows stronger.\n\nThe charts whisper bullish signs.";
  } else if (text.toLowerCase().includes("sol")) {
    reply =
      "☀️ Solana shines brightly today.\n\nMomentum spirits are awakening.";
  } else {
    const mysticalReplies = [
      "🌑 The crypto moon is uncertain tonight...",
      "🔮 Ancient market spirits sense volatility.",
      "⚡ A hidden signal approaches from the blockchain realm.",
      "🌌 The candles whisper secrets of profit.",
      "🜂 The oracle sees opportunity in darkness."
    ];

    reply =
      mysticalReplies[
        Math.floor(Math.random() * mysticalReplies.length)
      ];
  }

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: reply
    })
  });

  res.status(200).end();
};
