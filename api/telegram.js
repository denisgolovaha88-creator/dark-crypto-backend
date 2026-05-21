const { getMarketData } = require("../lib/market");
const { buildSignal } = require("../lib/signals");
const { getNews, getMarketMood } = require("../lib/news");

const horoscope = require("../lib/horoscope");
const runes = require("../lib/runes");

const TELEGRAM_TOKEN =
  "8821653271:AAEHIe7QhmcOOjxQFJ6DT5WPjZU9hczuVP8";

const BASE =
  `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;

const runeCooldowns = {};

async function sendMessage(
  chatId,
  text,
  keyboard = null
) {

  try {

    await fetch(
      `${BASE}/sendMessage`,
      {

        method: "POST",

        headers: {
          "Content-Type":
            "application/json"
        },

        body: JSON.stringify({

          chat_id: chatId,

          text,

          reply_markup:
            keyboard
        })
      }
    );

  } catch (e) {

    console.log(
      "SEND ERROR",
      e
    );
  }
}

function buildKeyboard(
  market
) {

  return {

    keyboard: [

      [
        {
          text:
            `₿ BTC $${market.BTC}`
        },

        {
          text:
            `⚡ ETH $${market.ETH}`
        }
      ],

      [
        {
          text:
            `🟡 BNB $${market.BNB}`
        },

        {
          text:
            `🟣 SOL $${market.SOL}`
        }
      ],

      [
        {
          text:
            `🔵 XRP $${market.XRP}`
        },

        {
          text:
            "🌑 SIGNAL"
        }
      ],

      [
        {
          text:
            "📰 NEWS"
        },

        {
          text:
            "🔮 RUNES"
        }
      ],

      [
        {
          text:
            "♈ HOROSCOPE"
        },

        {
          text:
            "👥 INVITE"
        }
      ]
    ],

    resize_keyboard: true
  };
}

function getCoinOfDay(
  market
) {

  const coins = [

    {
      name:
        "Bitcoin",

      value:
        market.BTC
    },

    {
      name:
        "Ethereum",

      value:
        market.ETH
    },

    {
      name:
        "BNB",

      value:
        market.BNB
    },

    {
      name:
        "Solana",

      value:
        market.SOL
    },

    {
      name:
        "XRP",

      value:
        market.XRP
    }
  ];

  coins.sort(
    (a, b) =>
      b.value - a.value
  );

  return coins[0].name;
}

module.exports =
async function handler(
  req,
  res
) {

  if (
    req.method !== "POST"
  ) {

    return res
      .status(200)
      .send(
        "CRYPTO ORACLE ONLINE"
      );
  }

  try {

    const body =
      req.body;

    if (
      !body.message
    ) {

      return res
        .status(200)
        .send("ok");
    }

    const message =
      body.message;

    const chatId =
      message.chat.id;

    const text =
      message.text || "";

    const market =
      await getMarketData();

    const keyboard =
      buildKeyboard(
        market
      );

    // START

    if (
      text === "/start"
    ) {

      const mood =
        getMarketMood();

      const coin =
        getCoinOfDay(
          market
        );

      await sendMessage(

        chatId,

`
🌌 CRYPTO NOSTRADAMUS

━━━━━━━━━━

🌑 День проходит
под знаком:

${coin}

━━━━━━━━━━

${mood}

━━━━━━━━━━

📡 Потоки рынка открыты.

Используй панель
оракула для анализа.
`,

        keyboard
      );
    }

    // BTC

    else if (
      text.includes("BTC")
    ) {

      const signal =
        await buildSignal(
          "BTC",
          market.BTC
        );

      await sendMessage(
        chatId,
        signal
      );
    }

    // ETH

    else if (
      text.includes("ETH")
    ) {

      const signal =
        await buildSignal(
          "ETH",
          market.ETH
        );

      await sendMessage(
        chatId,
        signal
      );
    }

    // BNB

    else if (
      text.includes("BNB")
    ) {

      const signal =
        await buildSignal(
          "BNB",
          market.BNB
        );

      await sendMessage(
        chatId,
        signal
      );
    }

    // SOL

    else if (
      text.includes("SOL")
    ) {

      const signal =
        await buildSignal(
          "SOL",
          market.SOL
        );

      await sendMessage(
        chatId,
        signal
      );
    }

    // XRP

    else if (
      text.includes("XRP")
    ) {

      const signal =
        await buildSignal(
          "XRP",
          market.XRP
        );

      await sendMessage(
        chatId,
        signal
      );
    }

    // SIGNAL

    else if (
      text === "🌑 SIGNAL"
    ) {

      await sendMessage(

        chatId,

`
🌌 Выбери монету:

BTC
ETH
BNB
SOL
XRP
`
      );
    }

    // NEWS

    else if (
      text === "📰 NEWS"
    ) {

      const news =
        await getNews();

      let newsText =
`
📰 CRYPTO NEWS STREAM

━━━━━━━━━━

`;

      news.forEach(
        item => {

          newsText +=
            `• ${item.title}\n\n`;
        }
      );

      await sendMessage(
        chatId,
        newsText
      );
    }

    // RUNES

    else if (
      text === "🔮 RUNES"
    ) {

      const today =
        new Date()
          .toDateString();

      if (

        runeCooldowns[
          chatId
        ] &&

        runeCooldowns[
          chatId
        ].date === today
      ) {

        await sendMessage(

          chatId,

          runeCooldowns[
            chatId
          ].text
        );

        return res
          .status(200)
          .send("ok");
      }

      const rune =
        runes[
          Math.floor(
            Math.random() *
            runes.length
          )
        ];

      const runeText =
`
🔮 РУНА ДНЯ

━━━━━━━━━━

${rune.symbol}
${rune.name}

━━━━━━━━━━

${rune.text}
`;

      runeCooldowns[
        chatId
      ] = {

        date:
          today,

        text:
          runeText
      };

      await sendMessage(
        chatId,
        runeText
      );
    }

    // HOROSCOPE

    else if (
      text === "♈ HOROSCOPE"
    ) {

      await sendMessage(

        chatId,

`
♈ Выбери знак:

Овен
Телец
Близнецы
Рак
Лев
Дева
Весы
Скорпион
Стрелец
Козерог
Водолей
Рыбы
`
      );
    }

    // HOROSCOPE SIGNS

    else if (
      horoscope[text]
    ) {

      const mood =
        getMarketMood();

      await sendMessage(

        chatId,

`
♈ ${text}

━━━━━━━━━━

${horoscope[text]}

━━━━━━━━━━

🌌 Энергия рынка:

${mood}
`
      );
    }

    // INVITE

    else if (
      text === "👥 INVITE"
    ) {

      await sendMessage(

        chatId,

`
👥 Приглашение:

https://t.me/ТВОЙ_БОТ

━━━━━━━━━━

🌌 Открой доступ
к потокам пророчества.
`
      );
    }

    return res
      .status(200)
      .send("ok");

  } catch (e) {

    console.log(
  "GLOBAL ERROR",
  e.message,
  e.stack
);

    return res
      .status(200)
      .send("error");
  }
};
