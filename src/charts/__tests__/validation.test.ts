import { describe, expect, it } from "vitest";
import {
  makeDataSource,
  makeChartDataSet,
  isCandleLike,
  validateCandle,
  validateCandles,
} from "../validation";

describe("makeDataSource", () => {
  it("carries demo provenance", () => {
    const d = makeDataSource("DEMO");
    expect(d.source).toBe("DEMO_DATA");
    expect(d.isLive).toBe(false);
    expect(d.status).toBe("DEMO");
  });
});

describe("makeChartDataSet", () => {
  it("empty candles → zero range", () => {
    const ds = makeChartDataSet("X", "NSE", [], "DEMO");
    expect(ds.candles).toEqual([]);
    expect(ds.availableStart).toBe(0);
    expect(ds.availableEnd).toBe(0);
    expect(ds.isLive).toBe(false);
  });
  it("non-empty → range from first/last", () => {
    const candles = [
      { time: 10, open: 1, high: 2, low: 0.5, close: 1.5, volume: 5 },
      { time: 20, open: 1.5, high: 2.5, low: 1, close: 2, volume: 6 },
    ];
    const ds = makeChartDataSet("X", "NSE", candles, "DEMO");
    expect(ds.availableStart).toBe(10);
    expect(ds.availableEnd).toBe(20);
  });
});

describe("isCandleLike", () => {
  it("accepts valid candle", () => {
    expect(isCandleLike({ time: 1, open: 1, high: 2, low: 0.5, close: 1.5, volume: 5 })).toBe(true);
  });
  it("rejects null", () => {
    expect(isCandleLike(null)).toBe(false);
  });
  it("rejects bad OHLC", () => {
    expect(isCandleLike({ time: 1, open: 1, high: 0.5, low: 2, close: 1.5, volume: 5 })).toBe(false);
  });
  it("rejects negative volume", () => {
    expect(isCandleLike({ time: 1, open: 1, high: 2, low: 0.5, close: 1.5, volume: -1 })).toBe(false);
  });
});

describe("validateCandle", () => {
  it("ok for valid", () => {
    const r = validateCandle({ time: 1, open: 1, high: 2, low: 0.5, close: 1.5, volume: 5 });
    expect(r.ok).toBe(true);
    expect(r.errors).toEqual([]);
  });
  it("not ok for invalid", () => {
    const r = validateCandle({ time: 1, open: 1, high: 2, low: 0.5, close: 1.5, volume: -1 });
    expect(r.ok).toBe(false);
    expect(r.errors.length).toBeGreaterThan(0);
  });
});

describe("validateCandles", () => {
  it("empty → ok", () => {
    expect(validateCandles([]).ok).toBe(true);
  });
  it("detects non-increasing timestamps", () => {
    const c = [
      { time: 10, open: 1, high: 2, low: 0.5, close: 1.5, volume: 5 },
      { time: 5, open: 1, high: 2, low: 0.5, close: 1.5, volume: 5 },
    ];
    const r = validateCandles(c);
    expect(r.ok).toBe(false);
    expect(r.errors.some((e) => e.includes("strictly increasing"))).toBe(true);
  });
  it("ok for increasing", () => {
    const c = [
      { time: 10, open: 1, high: 2, low: 0.5, close: 1.5, volume: 5 },
      { time: 20, open: 1, high: 2, low: 0.5, close: 1.5, volume: 5 },
    ];
    expect(validateCandles(c).ok).toBe(true);
  });
});