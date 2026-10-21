import { describe, expect, it } from "vitest";
import { toTimeframeRange, timeframeLabel, TIMEFRAMES, defaultRange, resolveRange } from "../timeframes";

describe("toTimeframeRange", () => {
  const end = 1_000_000_000_000;
  it("1D spans 1 day", () => {
    const r = toTimeframeRange("1D", end);
    expect(r.toMs).toBe(end);
    expect(r.fromMs).toBe(end - 86_400_000);
  });
  it("1Y spans 365 days", () => {
    const r = toTimeframeRange("1Y", end);
    expect(r.fromMs).toBe(end - 365 * 86_400_000);
  });
  it("toMs equals end", () => {
    for (const tf of TIMEFRAMES) {
      expect(toTimeframeRange(tf, end).toMs).toBe(end);
    }
  });
});

describe("timeframeLabel", () => {
  it("returns the id", () => {
    expect(timeframeLabel("1Y")).toBe("1Y");
  });
});

describe("defaultRange", () => {
  it("equals 1Y range", () => {
    const end = 5000;
    expect(defaultRange(end)).toEqual(toTimeframeRange("1Y", end));
  });
});

describe("resolveRange", () => {
  const availableTo = 10_000;
  it("custom with valid bounds returns them", () => {
    const r = resolveRange({ timeframe: "custom", customFrom: 100, customTo: 200, availableTo });
    expect(r).toEqual({ fromMs: 100, toMs: 200, usedTimeframe: "custom" });
  });
  it("custom with invalid bounds falls back to 1Y", () => {
    const r = resolveRange({ timeframe: "custom", customFrom: null, customTo: null, availableTo });
    expect(r.usedTimeframe).toBe("1Y");
  });
  it("preset timeframe uses toTimeframeRange", () => {
    const r = resolveRange({ timeframe: "1D", customFrom: null, customTo: null, availableTo });
    expect(r).toEqual({ ...toTimeframeRange("1D", availableTo), usedTimeframe: "1D" });
  });
});