import { describe, expect, it } from "vitest";
import {
  sma,
  ema,
  rsi,
  macd,
  bollingerBands,
  calculateIndicators,
  INDICATOR_COLORS,
} from "../indicators";
import type { IndicatorConfig } from "../types";

describe("sma", () => {
  it("returns nulls for period < 2", () => {
    expect(sma([1, 2, 3], 1)).toEqual([null, null, null]);
  });
  it("computes simple moving average aligned 1:1", () => {
    const out = sma([1, 2, 3, 4], 2);
    expect(out).toEqual([null, 1.5, 2.5, 3.5]);
  });
});

describe("ema", () => {
  it("returns nulls for period < 2", () => {
    expect(ema([1, 2, 3], 1)).toEqual([null, null, null]);
  });
  it("first value at period-1 is SMA seed", () => {
    const out = ema([1, 2, 3, 4], 2);
    expect(out[0]).toBeNull();
    expect(out[1]).toBeCloseTo(1.5, 5);
  });
});

describe("rsi", () => {
  it("returns all nulls when insufficient history", () => {
    const out = rsi([1, 2, 3], 14);
    expect(out.every((v) => v === null)).toBe(true);
  });
  it("bounded to [0,100]", () => {
    const vals = Array.from({ length: 20 }, (_, i) => 100 + i);
    const out = rsi(vals, 5);
    const last = out[out.length - 1];
    expect(last).not.toBeNull();
    expect(last!).toBeGreaterThanOrEqual(0);
    expect(last!).toBeLessThanOrEqual(100);
  });
  it("all gains → 100", () => {
    const vals = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
    const out = rsi(vals, 5);
    expect(out[out.length - 1]).toBe(100);
  });
});

describe("macd", () => {
  it("returns aligned arrays", () => {
    const vals = Array.from({ length: 40 }, (_, i) => 100 + Math.sin(i / 3) * 5);
    const r = macd(vals, 12, 26, 9);
    expect(r.macd.length).toBe(vals.length);
    expect(r.signal.length).toBe(vals.length);
    expect(r.histogram.length).toBe(vals.length);
  });
});

describe("bollingerBands", () => {
  it("upper >= middle >= lower", () => {
    const vals = Array.from({ length: 25 }, (_, i) => 100 + i);
    const r = bollingerBands(vals, 5, 2);
    const i = 24;
    expect(r.upper[i]!).toBeGreaterThanOrEqual(r.middle[i]!);
    expect(r.middle[i]!).toBeGreaterThanOrEqual(r.lower[i]!);
  });
});

describe("calculateIndicators", () => {
  const cfgs: IndicatorConfig[] = [
    { id: "sma", label: "SMA 5", enabled: true, period: 5 },
    { id: "rsi", label: "RSI 5", enabled: true, period: 5 },
    { id: "bb", label: "BB 5", enabled: false, period: 5, k: 2 },
  ];
  it("skips disabled indicators", () => {
    const vals = Array.from({ length: 20 }, (_, i) => 100 + i);
    const series = calculateIndicators(vals, cfgs);
    expect(series.map((s) => s.id)).toEqual(["sma", "rsi"]);
  });
  it("attaches pane/render/scale/precision", () => {
    const vals = Array.from({ length: 20 }, (_, i) => 100 + i);
    const series = calculateIndicators(vals, cfgs);
    const smaS = series.find((s) => s.id === "sma")!;
    expect(smaS.pane).toBe("price");
    expect(smaS.render).toBe("line");
    expect(smaS.scale).toBeNull();
    expect(smaS.precision).toBe(2);
    const rsiS = series.find((s) => s.id === "rsi")!;
    expect(rsiS.pane).toBe("rsi");
    expect(rsiS.scale).toEqual({ min: 0, max: 100 });
  });
  it("INDICATOR_COLORS has entries", () => {
    expect(INDICATOR_COLORS.sma).toBeDefined();
    expect(INDICATOR_COLORS["bb-upper"]).toBeDefined();
  });
});