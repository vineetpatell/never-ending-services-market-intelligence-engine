import { describe, expect, it } from "vitest";
import { candleSeriesData, volumeSeriesData, toChartTime } from "../chartSeriesData";
import { isCandleLike, validateCandle } from "../validation";

describe("chart series data mapping", () => {
  const candle = { time: 1_700_000_000_000, open: 10, high: 12, low: 9, close: 11, volume: 100 };

  it("maps valid candle to candlestick series shape", () => {
    expect(candleSeriesData(candle)).toEqual({
      time: toChartTime(candle.time),
      open: 10,
      high: 12,
      low: 9,
      close: 11,
    });
  });

  it("maps valid candle to volume histogram shape (value, not OHLC)", () => {
    const out = volumeSeriesData(candle);
    expect(out).toEqual({
      time: toChartTime(candle.time),
      value: 100,
      color: "#2DDDBF",
    });
    expect(out).not.toHaveProperty("open");
  });

  it("uses down color when close < open", () => {
    const down = { ...candle, open: 12, close: 10 };
    expect(volumeSeriesData(down).color).toBe("#FF5200");
  });

  it("converts ms timestamps to seconds", () => {
    expect(toChartTime(1_700_000_999)).toBe(1_700_000);
  });
});

describe("invalid candle handling", () => {
  it("rejects missing OHLC", () => {
    const bad = { time: 1, open: 1, high: 2, low: 0.5, close: undefined, volume: 5 };
    expect(isCandleLike(bad as never)).toBe(false);
    expect(validateCandle(bad as never).ok).toBe(false);
  });

  it("rejects invalid OHLC relationship", () => {
    const bad = { time: 1, open: 1, high: 0.5, low: 2, close: 1.5, volume: 5 };
    expect(isCandleLike(bad)).toBe(false);
  });

  it("rejects non-finite values", () => {
    const bad = { time: 1, open: NaN, high: 2, low: 0.5, close: 1.5, volume: 5 };
    expect(isCandleLike(bad)).toBe(false);
  });

  it("rejects negative volume", () => {
    const bad = { time: 1, open: 1, high: 2, low: 0.5, close: 1.5, volume: -1 };
    expect(isCandleLike(bad)).toBe(false);
  });
});