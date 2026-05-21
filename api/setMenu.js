module.exports = async (req, res) => {

  const telegramToken = "ТВОЙ_TELEGRAM_TOKEN";

  const response = await fetch(
    `https://api.telegram.org/bot${telegramToken}/setMyCommands`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({

        commands: [

          {
            command: "start",
            description: "🌌 Открыть Crypto Oracle"
          },

          {
            command: "signal",
            description: "📊 Сигнал рынка"
          },

          {
            command: "btc",
            description: "₿ Bitcoin Oracle"
          },

          {
            command: "eth",
            description: "⚡ Ethereum Oracle"
          },

          {
            command: "bnb",
            description: "🟡 BNB Oracle"
          },

          {
            command: "sol",
            description: "🟣 Solana Oracle"
          },

          {
            command: "xrp",
            description: "🔵 XRP Oracle"
          },

          {
            command: "horoscope",
            description: "♈ Крипто-гороскоп"
          },

          {
            command: "runes",
            description: "🪬 Руны дня"
          }
        ]
      })
    }
  );

  const data = await response.json();

  return res.status(200).json(data);
};
