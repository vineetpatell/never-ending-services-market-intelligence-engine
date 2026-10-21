import { describe, expect, it } from "vitest";
import { useChartStore } from "../store";

describe("chart store switching", () => {
  it("switches symbol and timeframe without crashing and loads candles", async () => {
    const store = useChartStore.getState();
    store.setProviderKind("demo");
    store.setSymbol("DEMO Motors", "BSE");
    store.setTimeframe("1M");
    await store.refresh();
    const after = useChartStore.getState();
    expect(after.candles.length).toBeGreaterThan(0);
    expect(after.status).toBe("DEMO");
    expect(after.isLive).toBe(false);

    store.setSymbol("DEMO Bank", "NSE");
    store.setTimeframe("1Y");
    await store.refresh();
    const after2 = useChartStore.getState();
    expect(after2.candles.length).toBeGreaterThan(0);
  });

  it("empty dataset path does not throw", async () => {
    const store = useChartStore.getState();
    store.setProviderKind("demo");
    // custom range far in future yields no candles
    store.setCustomRange(Date.UTC(2099, 0, 1), Date.UTC(2099, 1, 1));
    await store.refresh();
    const after = useChartStore.getState();
    expect(after.candles).toEqual([]);
  });
});