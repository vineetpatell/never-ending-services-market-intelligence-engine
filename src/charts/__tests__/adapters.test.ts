import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { createDemoProvider } from "../provider";
import { createBackendProvider } from "../backendProvider";
import { isCandleLike } from "../validation";
import { candleSeriesData, volumeSeriesData } from "../chartSeriesData";

describe("demo adapter compatibility", () => {
  it("returns candles that pass validation and map to series shapes", async () => {
    const provider = createDemoProvider();
    const ds = await provider.getHistory({ symbol: "DEMO Bank", exchange: "NSE", fromMs: null, toMs: null });
    expect(ds.status).toBe("DEMO");
    expect(ds.isLive).toBe(false);
    expect(ds.candles.length).toBeGreaterThan(0);
    expect(ds.candles.every(isCandleLike)).toBe(true);
    for (const c of ds.candles) {
      const cs = candleSeriesData(c);
      expect(typeof cs.open).toBe("number");
      expect(typeof cs.high).toBe("number");
      expect(typeof cs.low).toBe("number");
      expect(typeof cs.close).toBe("number");
      const vs = volumeSeriesData(c);
      expect(typeof vs.value).toBe("number");
      expect(vs).not.toHaveProperty("open");
    }
  });
});

describe("backend adapter compatibility", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    globalThis.fetch = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("/api/v1/instruments")) {
        return new Response(JSON.stringify([{ id: 1, exchange: "NSE", symbol: "E2E", name: "E2E", currency: "INR" }]), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      if (url.includes("/api/v1/candles")) {
        return new Response(
          JSON.stringify({
            exchange: "NSE",
            symbol: "E2E",
            source: "IMPORTED_CSV",
            status: "IMPORTED",
            is_live: false,
            count: 2,
            candles: [
              { exchange: "NSE", symbol: "E2E", time: 1704067200000, open: 10, high: 12, low: 9, close: 11, volume: 100, status: "IMPORTED", source: "IMPORTED_CSV", ingested_at: null },
              { exchange: "NSE", symbol: "E2E", time: 1704153600000, open: 11, high: 13, low: 10, close: 12, volume: 120, status: "IMPORTED", source: "IMPORTED_CSV", ingested_at: null },
            ],
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      }
      return new Response("not found", { status: 404 });
    }) as typeof fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("maps backend candles, preserves IMPORTED status, and maps series shapes", async () => {
    const provider = createBackendProvider();
    const symbols = await provider.getSymbols();
    expect(symbols).toHaveLength(1);
    const ds = await provider.getHistory({ symbol: "E2E", exchange: "NSE", fromMs: null, toMs: null });
    expect(ds.status).toBe("IMPORTED");
    expect(ds.isLive).toBe(false);
    expect(ds.source).toBe("IMPORTED_CSV");
    expect(ds.candles.every(isCandleLike)).toBe(true);
    expect(ds.candles.map(candleSeriesData).every((d) => typeof d.open === "number" && typeof d.close === "number")).toBe(true);
    expect(ds.candles.map(volumeSeriesData).every((d) => typeof d.value === "number" && !("open" in d))).toBe(true);
  });
});