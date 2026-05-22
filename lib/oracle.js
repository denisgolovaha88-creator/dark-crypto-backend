async function generateOracle({
  symbol,
  price,
  direction,
  confidence
}) {

  const darkBull = [

    `🌌 Потоки ${symbol} усиливаются.
Тени рынка склоняются
в сторону роста.`,

    `⚡ Энергия покупателей
становится плотнее.

Монета накапливает силу.`,

    `🜂 Древние сигналы
указывают на продолжение импульса.`
  ];

  const darkBear = [

    `🌑 Вокруг ${symbol}
сгущается туман.

Рынок готовит давление.`,

    `⚠️ Потоки ликвидности
ослабевают.

Продавцы становятся активнее.`,

    `🜄 Оракул видит
опасность резких теней
на графике.`
  ];

  const advice = [

    `🧭 Не открывай
слишком крупную позицию.`,

    `🔮 Следи за объёмами
и не доверяй первым импульсам.`,

    `🌊 Волатильность
может резко усилиться.`,

    `🛡 Рынок любит
ломать ожидания толпы.`
  ];

  const pool =
    direction === "LONG"
      ? darkBull
      : darkBear;

  const prophecy =
    pool[
      Math.floor(
        Math.random() *
        pool.length
      )
    ];

  const traderAdvice =
    advice[
      Math.floor(
        Math.random() *
        advice.length
      )
    ];

  return `

${prophecy}

━━━━━━━━━━

💠 Цена потока:
$${price}

🎯 Уверенность оракула:
${confidence}%

━━━━━━━━━━

${traderAdvice}

🌌 Наблюдай за тенями рынка.
`;
}

module.exports = {
  generateOracle
};
