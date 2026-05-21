const {
  generateOracle
} = require("./oracle");

function randomBetween(
  min,
  max
) {

  return Math.random() *
    (max - min) + min;
}

async function buildSignal(
  symbol,
  price
) {

  const bullish =
    Math.random() > 0.5;

  const direction =
    bullish
      ? "LONG"
      : "SHORT";

  const volatility =
    randomBetween(1.5, 4.5);

  const confidence =
    Math.floor(
      randomBetween(68, 96)
    );

  let entry;
  let target;
  let stop;

  if (bullish) {

    entry =
      price * 0.995;

    target =
      price * (
        1 + volatility / 100
      );

    stop =
      price * 0.98;

  } else {

    entry =
      price * 1.005;

    target =
      price * (
        1 - volatility / 100
      );

    stop =
      price * 1.02;
  }

  const now =
    new Date();

  const entryHour =
    now.getHours() + 1;

  const targetHour =
    now.getHours() + 4;

  const oracle =
    await generateOracle({

      symbol,

      price,

      direction,

      confidence
    });

  return `
🌌 ${symbol} ORACLE SIGNAL

━━━━━━━━━━

🧭 Направление:
${direction}

🎯 Уверенность:
${confidence}%

🌊 Волатильность:
${volatility.toFixed(2)}%

━━━━━━━━━━

💰 Оптимальный вход:
$${entry.toFixed(2)}

🕒 Время входа:
${entryHour}:00 - ${entryHour + 1}:00

🎯 Цель:
$${target.toFixed(2)}

🕒 Фиксация:
${targetHour}:00 - ${targetHour + 1}:00

🛡 Стоп-лосс:
$${stop.toFixed(2)}

━━━━━━━━━━

${oracle}
`;
}

module.exports = {
  buildSignal
};
