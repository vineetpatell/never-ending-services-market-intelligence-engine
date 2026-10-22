/**
 * Demo fixtures part 1/2 — quotes and watchlist.
 * Synthetic only — ADR-0005. Envelope follows NES-API-007 §3.
 */

export const DEMO_SOURCE = "DEMO_DATA" as const;

export interface DemoQuote {
  symbol: string;
  exchange: "NSE" | "BSE";
  price: number;
  /** Illustrative day-move percent — synthetic, not a market move. */
  dayMovePct: number;
  currency: "INR";
  source: typeof DEMO_SOURCE;
  status: "demo";
  is_live: false;
}

export interface WatchlistEntry {
  id: string;
  symbol: string;
  exchange: "NSE" | "BSE";
  note: string;
  addedAt: string;
}

export const demoQuotes: DemoQuote[] = [
  { symbol: "DEMO Bank", exchange: "NSE", price: 123.45, dayMovePct: 0.8, currency: "INR", source: DEMO_SOURCE, status: "demo", is_live: false },
  { symbol: "DEMO Energy", exchange: "NSE", price: 678.9, dayMovePct: -0.4, currency: "INR", source: DEMO_SOURCE, status: "demo", is_live: false },
  { symbol: "DEMO Motors", exchange: "BSE", price: 2345.6, dayMovePct: 1.2, currency: "INR", source: DEMO_SOURCE, status: "demo", is_live: false },
  { symbol: "DEMO Pharma", exchange: "NSE", price: 456.78, dayMovePct: 0.0, currency: "INR", source: DEMO_SOURCE, status: "demo", is_live: false },
  { symbol: "DEMO Infra", exchange: "BSE", price: 89.1, dayMovePct: -1.1, currency: "INR", source: DEMO_SOURCE, status: "demo", is_live: false },
  { symbol: "DEMO Foods", exchange: "NSE", price: 1502.33, dayMovePct: 0.3, currency: "INR", source: DEMO_SOURCE, status: "demo", is_live: false },
];

export const initialWatchlist: WatchlistEntry[] = [
  { id: "wl-1", symbol: "DEMO Bank", exchange: "NSE", note: "Sample large-cap placeholder", addedAt: "2026-10-01" },
  { id: "wl-2", symbol: "DEMO Motors", exchange: "BSE", note: "Sample auto placeholder", addedAt: "2026-10-03" },
];

export function formatINR(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(value);
}
