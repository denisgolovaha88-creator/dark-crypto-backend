function EMA(data, period) {

  const k = 2 / (period + 1);

  let ema = data[0];

  for (let i = 1; i < data.length; i++) {
    ema =
      data[i] * k +
      ema * (1 - k);
  }

  return ema;
}

function RSI(data, period = 14) {

  let gains = 0;
  let losses = 0;

  for (
    let i = data.length - period;
    i < data.length;
    i++
  ) {

    const diff =
      data[i] - data[i - 1];

    if (diff >= 0) {
      gains += diff;
    } else {
      losses += Math.abs(diff);
    }
  }

  const rs =
    gains / (losses || 1);

  return 100 - 100 / (1 + rs);
}

function ATR(
  highs,
  lows,
  closes,
  period = 14
) {

  let trs = [];

  for (let i = 1; i < closes.length; i++) {

    const tr = Math.max(
      highs[i] - lows[i],
      Math.abs(
        highs[i] - closes[i - 1]
      ),
      Math.abs(
        lows[i] - closes[i - 1]
      )
    );

    trs.push(tr);
  }

  const recent =
    trs.slice(-period);

  return (
    recent.reduce((a, b) => a + b, 0) /
    recent.length
  );
}

module.exports = {
  EMA,
  RSI,
  ATR
};
