module.exports = async (req, res) => {
  const token = process.env.BOT_TOKEN;

  const webhookUrl =
    "https://dark-crypto-backend.vercel.app/api/telegram";

  const response = await fetch(
    `https://api.telegram.org/bot${token}/setWebhook?url=${webhookUrl}`
  );

  const data = await response.json();

  res.status(200).json(data);
};
