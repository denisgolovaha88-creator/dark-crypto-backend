const GROQ_API_KEY =
  "ВСТАВЬ_СЮДА_GROQ_КЛЮЧ";

async function generateOracle({
  symbol,
  price,
  direction,
  confidence
}) {

  try {

    const prompt = `
Ты древний крипто-оракул.

Сделай мистическое пророчество для ${symbol}.

Текущая цена:
${price}

Направление:
${direction}

Уверенность:
${confidence}%

Нужно написать:

- настроение рынка
- энергия монеты
- опасности
- что ждёт цену
- совет трейдеру

Стиль:
тёмный,
мистический,
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
            ],

            temperature: 0.9
          })
        }
      );

    const json =
      await response.json();

    return (
      json.choices?.[0]
        ?.message?.content ||

      "Туманы скрывают пророчество."
    );

  } catch (e) {

    console.log(
      "GROQ ERROR",
      e
    );

    return `
🌫 Потоки будущего
временно скрыты.

Оракул не может
увидеть движение рынка.
`;
  }
}

module.exports = {
  generateOracle
};
