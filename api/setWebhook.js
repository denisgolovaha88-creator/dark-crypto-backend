module.exports = async (req, res) => {
  const token = "8821653271:AAEHIe7QhmcOOjxQFJ6DT5WPjZU9hczuVP8";

  const webhookUrl =
    "https://dark-crypto-backend.vercel.app/api/telegram";

  const response = await fetch(
    `https://api.telegram.org/bot${token}/setWebhook`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        url: webhookUrl
      })
    }
  );

  const data = await response.json();

  res.status(200).json(data);
};
