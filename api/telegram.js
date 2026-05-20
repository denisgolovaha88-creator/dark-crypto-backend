module.exports = async (req, res) => {
  const token = process.env.BOT_TOKEN;

  if (req.method !== "POST") {
    return res.status(200).send("Dark Crypto Oracle online 🔮");
  }

  const body = req.body;

  const chatId = body.message?.chat?.id;
  const text = body.message?.text;

  if (!chatId) {
    return res.status(200).end();
  }

  let reply = "🔮 The crypto spirits are silent...";

  if (text === "/start") {
    reply =
      "🌌 Welcome to Dark Crypto Oracle 🔮\n\nYour mystical crypto guide is now online.";
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
