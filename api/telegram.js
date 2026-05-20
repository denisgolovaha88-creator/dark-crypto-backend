module.exports = async (req, res) => {
  const telegramToken = "8821653271:AAEHIe7QhmcOOjxQFJ6DT5WPjZU9hczuVP8";
  const openaiKey = "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";

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
      "🌌 Welcome to Crypto Nostradamus 🔮\n\nAsk me about crypto destiny...";
  } else {
    try {
      const aiResponse = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openaiKey}`
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content:
                  "You are Crypto Nostradamus, a mystical AI oracle for cryptocurrency traders. Speak with dark mystical energy, but still give useful insights."
              },
              {
                role: "user",
                content: text
              }
            ],
            max_tokens: 200
          })
        }
      );

      const data = await aiResponse.json();

      if (data.error) {
  reply = "OPENAI ERROR: " + data.error.message;
} else {
  reply =
    data.choices?.[0]?.message?.content ||
    "🔮 The oracle is silent...";
}
        
        
    } catch (error) {
      reply = "⚠️ The mystical connection was interrupted.";
    }
  }

  await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
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
