module.exports = async (req, res) => {
  const telegramToken = "8821653271:AAEHIe7QhmcOOjxQFJ6DT5WPjZU9hczuVP8";
  const geminiKey = "AIzaSyCWMiHrZjQNP-djms-58yCXs_uXFK6V9J8";

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

  if (text === "/start") {
    reply =
      "🌌 Welcome to Crypto Nostradamus 🔮\n\nAsk me about crypto destiny...";
  } else {
    try {
      const aiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text:
                      "You are Crypto Nostradamus, a mystical crypto oracle AI. Reply with dark mystical style but useful crypto insight. User message: " +
                      text
                  }
                ]
              }
            ]
          })
        }
      );

      const data = await aiResponse.json();

      if (data.error) {
        reply = "GEMINI ERROR: " + data.error.message;
      } else {
        reply =
          data.candidates?.[0]?.content?.parts?.[0]?.text ||
          "🔮 The oracle is silent...";
      }
    } catch (error) {
      reply = "⚠️ Gemini connection failed.";
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
