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

    const upperText =
      text.toUpperCase();

    const market =
      await getMarketData();

    const keyboard =
      buildKeyboard(
        market
      );

    // START

    if (
      upperText === "/START"
    ) {

      await sendMessage(

        chatId,

`
🌌 CRYPTO NOSTRADAMUS

━━━━━━━━━━

🌑 День проходит
под знаком:

Bitcoin

━━━━━━━━━━

${getMarketMood()}

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

      upperText === "/BTC" ||
      text.startsWith("₿ BTC")

    ) {

      try {

        const signal =
          await buildSignal(
            "BTC",
            market.BTC
          );

        await sendMessage(
          chatId,
          signal
        );

      } catch (e) {

        console.log(
          "BTC ERROR",
          e
        );

        await sendMessage(

          chatId,

          "⚠️ BTC сигнал скрыт туманом."
        );
      }
    }

    // ETH

    else if (

      upperText === "/ETH" ||
      text.startsWith("⚡ ETH")

    ) {

      try {

        const signal =
          await buildSignal(
            "ETH",
            market.ETH
          );

        await sendMessage(
          chatId,
          signal
        );

      } catch (e) {

        console.log(
          "ETH ERROR",
          e
        );

        await sendMessage(

          chatId,

          "⚠️ ETH сигнал скрыт туманом."
        );
      }
    }

    // BNB

    else if (

      upperText === "/BNB" ||
      text.startsWith("🟡 BNB")

    ) {

      try {

        const signal =
          await buildSignal(
            "BNB",
            market.BNB
          );

        await sendMessage(
          chatId,
          signal
        );

      } catch (e) {

        console.log(
          "BNB ERROR",
          e
        );

        await sendMessage(

          chatId,

          "⚠️ BNB сигнал скрыт туманом."
        );
      }
    }

    // SOL

    else if (

      upperText === "/SOL" ||
      text.startsWith("🟣 SOL")

    ) {

      try {

        const signal =
          await buildSignal(
            "SOL",
            market.SOL
          );

        await sendMessage(
          chatId,
          signal
        );

      } catch (e) {

        console.log(
          "SOL ERROR",
          e
        );

        await sendMessage(

          chatId,

          "⚠️ SOL сигнал скрыт туманом."
        );
      }
    }

    // XRP

    else if (

      upperText === "/XRP" ||
      text.startsWith("🔵 XRP")

    ) {

      try {

        const signal =
          await buildSignal(
            "XRP",
            market.XRP
          );

        await sendMessage(
          chatId,
          signal
        );

      } catch (e) {

        console.log(
          "XRP ERROR",
          e
        );

        await sendMessage(

          chatId,

          "⚠️ XRP сигнал скрыт туманом."
        );
      }
    }

    // SIGNAL

    else if (
      text === "🌑 SIGNAL"
    ) {

      await sendMessage(

        chatId,

`
🌌 Выбери монету:

/BTC
/ETH
/BNB
/SOL
/XRP
`
      );
    }

    // NEWS

    else if (
      text === "📰 NEWS"
    ) {

      try {

        const news =
          await getNews();

        let newsText =
`
📰 CRYPTO NEWS

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

      } catch (e) {

        console.log(
          "NEWS ERROR",
          e
        );

        await sendMessage(

          chatId,

          "⚠️ Новости скрыты туманом."
        );
      }
    }

    // RUNES

    else if (
      text === "🔮 RUNES"
    ) {

      try {

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

      } catch (e) {

        console.log(
          "RUNE ERROR",
          e
        );

        await sendMessage(

          chatId,

          "⚠️ Руны молчат."
        );
      }
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

      await sendMessage(

        chatId,

`
♈ ${text}

━━━━━━━━━━

${horoscope[text]}
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
`
      );
    }

    return res
      .status(200)
      .send("ok");

  } catch (e) {

    console.log(
      "GLOBAL ERROR",
      e
    );

    return res
      .status(200)
      .send("error");
  }
};
