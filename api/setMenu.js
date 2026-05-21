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
            description: "📊 Глобальный сигнал рынка"
          },

          {
            command: "btc",
            description: "₿ Пророчество Bitcoin"
          },

          {
            command: "eth",
            description: "⚡ Пророчество Ethereum"
          },

          {
            command: "bnb",
            description: "🟡 Пророчество BNB"
          },

          {
            command: "sol",
            description: "🟣 Пророчество Solana"
          },

          {
            command: "xrp",
            description: "🔵 Пророчество XRP"
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

  res.status(200).json(data);
};
