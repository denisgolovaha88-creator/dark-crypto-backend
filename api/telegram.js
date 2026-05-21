import TelegramBot from "node-telegram-bot-api";

const TOKEN = "8821653271:AAEHIe7QhmcOOjxQFJ6DT5WPjZU9hczuVP8";

const GROQ_API_KEY =
  "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";

const GNEWS_API_KEY =
  "80d3a911a8c4d3ffe9d4b2dce9b8fdc8";

const COINDESK_API_KEY =
  "3cb3bc0dde8ee347745043db6ab2b5b06bb4e6fd55205549f6e6452dfc590f2a";

const bot = new TelegramBot(TOKEN);

const userRuneCooldown = {};

const RUNES = [
  {
    rune: "ᚠ FEHU",
    text:
      "Руна богатства открывает денежные потоки. Но жадность способна разрушить путь. Сегодня прибыль любит терпеливых."
  },

  {
    rune: "ᚱ RAIDHO",
    text:
      "Руна пути говорит о скором изменении направления рынка. Следи за импульсами и не игнорируй сигналы."
  },

  {
    rune: "ᚲ KENAZ",
    text:
      "Руна озарения. Туманы начинают рассеиваться. День подходит для поиска сильных точек входа."
  },

  {
    rune: "ᚺ HAGALAZ",
    text:
      "Руна хаоса предупреждает о высокой волатильности. Рынок способен резко изменить направление."
  }
];

const HOROSCOPES = {

  "Овен":
    "🔥 BTC усиливает импульс дня. Благоприятны быстрые сделки. Но рынок не прощает поспешность.",

  "Телец":
    "💰 ETH стабилизирует потоки капитала. День подходит для накопления и осторожных входов.",

  "Близнецы":
    "⚡ SOL усиливает хаотичную энергию рынка. Возможны неожиданные импульсы.",

  "Рак":
    "🌙 XRP усиливает интуицию. Сегодня важно чувствовать настроение рынка.",

  "Лев":
    "☀️ BTC открывает возможности для сильных движений. Контролируй риск.",

  "Дева":
    "📊 ETH усиливает аналитическое мышление. День подходит для расчётливых сделок.",

  "Весы":
    "⚖️ SOL помогает удерживать баланс между риском и прибылью.",

  "Скорпион":
    "🦂 XRP раскрывает скрытые импульсы рынка. Следи за новостями.",

  "Стрелец":
    "🏹 BTC даёт энергию роста. Возможны сильные движения вверх.",

  "Козерог":
    "⛰ ETH укрепляет долгосрочные позиции. Терпение принесёт результат.",

  "Водолей":
    "🌌 SOL создаёт нестабильную, но перспективную энергию.",

  "Рыбы":
    "🌊 XRP усиливает эмоциональность рынка. Не входи импульсивно."
};

async function getMarketData() {

  try {

    const response = await fetch(
      "https://min-api.cryptocompare.com/data/pricemulti?fsyms=BTC,ETH,BNB,SOL,XRP&tsyms=USD",
      {
        headers: {
          authorization:
            `Apikey ${CRYPTOCOMPARE_API_KEY}`
        }
      }
    );

    const data =
      await response.json();

    return {

      BTC:
        data.BTC?.USD || 0,

      ETH:
        data.ETH?.USD || 0,

      BNB:
        data.BNB?.USD || 0,

      SOL:
        data.SOL?.USD || 0,

      XRP:
        data.XRP?.USD || 0
    };

  } catch {

    return {

      BTC: 0,
      ETH: 0,
      BNB: 0,
      SOL: 0,
      XRP: 0
    };
  }
}

async function getNews() {

  try {

    const response =
      await fetch(
        `https://gnews.io/api/v4/search?q=crypto&lang=en&max=5&apikey=${GNEWS_API_KEY}`
      );

    const data =
      await response.json();

    if (!data.articles) {
      throw new Error();
    }

    return data.articles;

  } catch {

    return [
      {
        title:
          "🌫 Потоки новостей скрыты древним туманом."
      }
    ];
  }
}

async function generateSignal(
  symbol,
  price
) {

  const direction =
    Math.random() > 0.5
      ? "LONG"
      : "SHORT";

  let entry;
  let target;
  let stop;

  if (direction === "LONG") {

    entry =
      price * 0.995;

    target =
      price * 1.02;

    stop =
      price * 0.98;

  } else {

    entry =
      price * 1.005;

    target =
      price * 0.98;

    stop =
      price * 1.02;
  }

  const confidence =
    Math.floor(
      65 + Math.random() * 25
    );

  try {

    const prompt = `
Ты мистический крипто-оракул.

Сделай красивое крипто-пророчество для ${symbol}.

Цена:
${price}

Направление:
${direction}

Добавь:

- настроение рынка
- анализ энергии рынка
- опасности
- совет трейдеру
- что ждёт монету

Стиль:
мистический,
тёмный,
крипто,
атмосферный.

Не используй markdown.
`;

    const response =
      await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",

          headers: {

            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${GROQ_API_KEY}`
          },

          body: JSON.stringify({

            model:
              "llama3-70b-8192",

            messages: [
              {
                role: "user",
                content: prompt
              }
            ]
          })
        }
      );

    const data =
      await response.json();

    const prophecy =
      data.choices?.[0]
        ?.message?.content ||

      "Туманы скрывают пророчество.";

    return `
🌌 ${symbol} ORACLE

━━━━━━━━━━

🧭 Направление:
${direction}

🎯 Уверенность:
${confidence}%

━━━━━━━━━━

💰 Оптимальный вход:
$${entry.toFixed(2)}

🎯 Цель:
$${target.toFixed(2)}

🛡 Стоп-лосс:
$${stop.toFixed(2)}

━━━━━━━━━━

${prophecy}
`;

  } catch {

    return `
⚠️ Оракул временно
не может открыть
потоки пророчества.
`;
  }
}

function keyboard(data) {

  return {

    reply_markup: {

      keyboard: [

        [
          {
            text:
              `₿ BTC $${data.BTC}`
          },

          {
            text:
              `⚡ ETH $${data.ETH}`
          }
        ],

        [
          {
            text:
              `🟡 BNB $${data.BNB}`
          },

          {
            text:
              `🟣 SOL $${data.SOL}`
          }
        ],

        [
          {
            text:
              `🔵 XRP $${data.XRP}`
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
          }
        ]
      ],

      resize_keyboard: true
    }
  };
}

bot.onText(
  /\/start/,
  async (msg) => {

    const chatId =
      msg.chat.id;

    const market =
      await getMarketData();

    bot.sendMessage(

      chatId,

      `
🌌 CRYPTO NOSTRADAMUS

━━━━━━━━━━

📡 Потоки рынка открыты.

Сегодня рынок наполнен
нестабильной энергией.

⚡ Используй панель оракула
для сигналов и пророчеств.
`,

      keyboard(market)
    );
  }
);

bot.on(
  "message",
  async (msg) => {

    const chatId =
      msg.chat.id;

    const text =
      msg.text;

    const market =
      await getMarketData();

    if (
      text.includes("BTC")
    ) {

      bot.sendMessage(

        chatId,

        await generateSignal(
          "BTC",
          market.BTC
        )
      );
    }

    if (
      text.includes("ETH")
    ) {

      bot.sendMessage(

        chatId,

        await generateSignal(
          "ETH",
          market.ETH
        )
      );
    }

    if (
      text.includes("BNB")
    ) {

      bot.sendMessage(

        chatId,

        await generateSignal(
          "BNB",
          market.BNB
        )
      );
    }

    if (
      text.includes("SOL")
    ) {

      bot.sendMessage(

        chatId,

        await generateSignal(
          "SOL",
          market.SOL
        )
      );
    }

    if (
      text.includes("XRP")
    ) {

      bot.sendMessage(

        chatId,

        await generateSignal(
          "XRP",
          market.XRP
        )
      );
    }

    if (
      text === "📰 NEWS"
    ) {

      const news =
        await getNews();

      let textNews =
        "📰 CRYPTO NEWS STREAM\n\n";

      news.forEach(n => {

        textNews +=
          `• ${n.title}\n\n`;
      });

      bot.sendMessage(
        chatId,
        textNews
      );
    }

    if (
      text === "🔮 RUNES"
    ) {

      const now =
        Date.now();

      if (

        userRuneCooldown[
          chatId
        ] &&

        now -
        userRuneCooldown[
          chatId
        ] < 86400000
      ) {

        bot.sendMessage(

          chatId,

          "⏳ Руны уже открывались сегодня."
        );

        return;
      }

      userRuneCooldown[
        chatId
      ] = now;

      const rune =
        RUNES[
          Math.floor(
            Math.random() *
            RUNES.length
          )
        ];

      bot.sendMessage(

        chatId,

        `
🔮 РУНА ДНЯ

━━━━━━━━━━

${rune.rune}

${rune.text}
`
      );
    }

    if (
      text === "♈ HOROSCOPE"
    ) {

      let horoscopeText =
        "♈ КРИПТО-ГОРОСКОП\n\n";

      Object.entries(
        HOROSCOPES
      ).forEach(

        ([sign, value]) => {

          horoscopeText +=
            `${sign}\n${value}\n\n`;
        }
      );

      bot.sendMessage(
        chatId,
        horoscopeText
      );
    }

    if (
      text === "🌑 SIGNAL"
    ) {

      const coins = [
        "BTC",
        "ETH",
        "BNB",
        "SOL",
        "XRP"
      ];

      const randomCoin =
        coins[
          Math.floor(
            Math.random() *
            coins.length
          )
        ];

      bot.sendMessage(

        chatId,

        await generateSignal(
          randomCoin,
          market[randomCoin]
        )
      );
    }
  }
);

export default async function handler(
  req,
  res
) {

  res.status(200).json({
    ok: true
  });
}
