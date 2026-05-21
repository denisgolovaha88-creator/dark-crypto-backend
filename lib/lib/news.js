async function getNews() {

  try {

    const response = await fetch(
      "https://min-api.cryptocompare.com/data/v2/news/?lang=EN"
    );

    const json =
      await response.json();

    return (
      json.Data?.slice(0, 5) || []
    );

  } catch {

    return [
      {
        title:
          "🌫 Потоки новостей скрыты древним туманом"
      }
    ];
  }
}

module.exports = getNews;
