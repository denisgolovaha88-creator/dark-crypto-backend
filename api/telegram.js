const {
  EMA,
  RSI,
  ATR
} = require("./indicators");

function getSignal(
  symbol,
  candles,
  currentPrice
) {

  const closes =
    candles.map(c => c.close);

  const highs =
    candles.map(c => c.high);

  const lows =
    candles.map(c => c.low);

  const ema20 =
    EMA(closes.slice(-20), 20);

  const ema50 =
    EMA(closes.slice(-50), 50);

  const rsi =
    RSI(closes, 14);

  const atr =
    ATR(highs, lows, closes);

  const momentum =
    (
      (closes.at(-1) -
        closes.at(-5)) /
      closes.at(-5)
    ) * 100;

  let trend = "NEUTRAL";
  let action = "⚪ WAIT";

  if (
    ema20 > ema50 &&
    rsi < 70 &&
    momentum > 0
  ) {
    trend = "BULLISH";
    action = "🟢 BUY";
  }

  if (
    ema20 < ema50 &&
    rsi > 30 &&
    momentum < 0
  ) {
    trend = "BEARISH";
    action = "🔴 SELL";
  }

  const confidence =
    Math.min(
      95,
      Math.max(
        55,
        Math.floor(
          Math.abs(momentum) * 12 +
          Math.abs(ema20 - ema50) /
          currentPrice *
          1000
        )
      )
    );

  let entry;
  let target;
  let stop;

  if (trend === "BULLISH") {

    entry =
      currentPrice - atr * 0.3;

    target =
      currentPrice + atr * 1.8;

    stop =
      currentPrice - atr * 1.2;

  } else if (
    trend === "BEARISH"
  ) {

    entry =
      currentPrice + atr * 0.3;

    target =
      currentPrice - atr * 1.8;

    stop =
      currentPrice + atr * 1.2;

  } else {

    entry =
      currentPrice;

    target =
      currentPrice + atr;

    stop =
      currentPrice - atr;
  }

  const now =
    new Date();

  const entryHour =
    now.getHours() + 1;

  const exitHour =
    now.getHours() + 4;

  return {

    symbol,

    trend,

    action,

    confidence,

    rsi:
      rsi.toFixed(1),

    ema20:
      ema20.toFixed(2),

    ema50:
      ema50.toFixed(2),

    momentum:
      momentum.toFixed(2),

    volatility:
      atr.toFixed(2),

    entry:
      entry.toFixed(2),

    target:
      target.toFixed(2),

    stop:
      stop.toFixed(2),

    entryTime:
      `${entryHour}:00 - ${entryHour + 1}:00`,

    exitTime:
      `${exitHour}:00 - ${exitHour + 1}:00`
  };
}

module.exports = {
  getSignal
};
