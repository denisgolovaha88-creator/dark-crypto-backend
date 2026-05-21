const COINDESK_API_KEY =
  "ВСТАВЬ_СЮДА_COINDESK_КЛЮЧ";

async function getNews() {

  try {

    const response =
      await fetch(
        "https://data-api.coindesk.com/news/v1/article/list?lang=EN&limit=5",
        {
          headers: {
            authorization:
              `Apikey ${COINDESK_API_KEY}`
          }
        }
      );

    const json =
      await response.json();

    const articles =
      json.Data || [];

    return articles.map(
      article => ({

        title:
          article.TITLE ||

          "Туманы скрывают заголовок.",

        url:
          article.URL ||

          "https://coindesk.com"
      })
    );

  } catch (e) {

    console.log(
      "NEWS ERROR",
      e
    );

    return [

      {
        title:
          "🌫 Потоки новостей скрыты туманом.",
        url:
          "https://coindesk.com"
      }
    ];
  }
}

function getMarketMood() {

  const moods = [

    "🌕 Бычья энергия усиливается",

    "🌑 Рынок погружается в туман неопределённости",

    "⚡ Высокая волатильность наполняет рынок",

    "🔥 Потоки капитала усиливают импульс BTC",

    "🌊 Альткоины начинают пробуждаться",

    "🩸 Медвежьи силы усиливают давление",

    "🌌 Рынок находится между страхом и жадностью"
  ];

  return moods[
    Math.floor(
      Math.random() *
      moods.length
    )
  ];
}

module.exports = {
  getNews,
  getMarketMood
};
