import type { ChartDataQuery, Exchange, MarketDataProvider, SymbolRecord } from "./types";

/**
 * Synthetic market-data provider.
 *
 * This is the "demo adapter" layer: a future authenticated backend
 * adapter can implement the same `MarketDataProvider` interface and the
 * chart components need no other change. No real market feed is
 * connected in this phase.
 */
import { createDemoHistory } from "./demo";
import { makeChartDataSet } from "./validation";

const DEMO_SYMBOLS: SymbolRecord[] = [
  { symbol: "DEMO Bank", exchange: "NSE", name: "DEMO Bank", currency: "INR" },
  { symbol: "DEMO Motors", exchange: "BSE", name: "DEMO Motors", currency: "INR" },
  { symbol: "DEMO Pharma", exchange: "NSE", name: "DEMO Pharma", currency: "INR" },
  { symbol: "DEMO Infra", exchange: "BSE", name: "DEMO Infra", currency: "INR" },
  { symbol: "DEMO Foods", exchange: "NSE", name: "DEMO Foods", currency: "INR" },
  { symbol: "DEMO Energy", exchange: "NSE", name: "DEMO Energy", currency: "INR" },
];

export function createDemoProvider(): MarketDataProvider {
  return {
    getSymbols() {
      return DEMO_SYMBOLS;
    },

    getHistory(query: ChartDataQuery) {
      const candles = createDemoHistory(query.symbol, query.exchange);
      const fromMs = query.fromMs;
      const toMs = query.toMs;
      const from = fromMs ?? 0;
      const to = toMs ?? candles[candles.length - 1]?.time ?? 0;
      const filtered = candles.filter((b) => b.time >= from && b.time <= to);
      return Promise.resolve(
        makeChartDataSet(query.symbol, query.exchange, filtered, "DEMO"),
      );
    },

    getAvailableRange(symbol: string, exchange: Exchange) {
      const candles = createDemoHistory(symbol, exchange);
      if ( candles.length === 0 ) return null;
      return {
        from: candles[0].time,
        to: candles[candles.length - 1].time,
      };
    },

    isDemo() {
      return true;
    },
  };
}
