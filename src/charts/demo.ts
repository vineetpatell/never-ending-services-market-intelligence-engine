import { Candle, Exchange } from "./types";

/** IST session offset in milliseconds (UTC midnight -> IST midnight). */
export const IST_OFFSET_MS = 5.5 * 3600_000;

/** Effective "today" for the synthetic demo dataset (last available bar end). */
export const FIXED_TODAY_IST = Date.UTC(2026, 8, 30) - IST_OFFSET_MS;

/**
 * Deterministic pseudorandom generator (mulberry32). Seeded by the symbol
 * so every symbol's synthetic series is reproducible without shared state.
 */
export function mulberry32(a: number): () => number {
  return () => {
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const randomBetween = (rng: () => number, lo: number, hi: number): number =>
  lo + rng() * (hi - lo);

/** Plausible base price per demo symbol (synthetic only). */
const BASE_PRICES: Record<string, number> = {
  "DEMO Bank": 125,
  "DEMO Motors": 2450,
  "DEMO Pharma": 320,
  "DEMO Infra": 62,
  "DEMO Foods": 1560,
  "DEMO Energy": 415,
};

const EXCHANGE_MULT: Record<Exchange, number> = { NSE: 1, BSE: 1.08 };

/**
 * Generate a deterministic, synthetic daily OHLCV history for one demo
 * symbol. Bars run from 2013-12-30 (IST session) through 2026-09-30.
 *
 * Plausible trending + mean-reverting noise; never labelled live and
 * never offered as real market history. Used only for the demo fixture.
 */
export function createDemoHistory(
  symbol: string,
  exchange: Exchange,
): Candle[] {
  const key = `${exchange}|${symbol}`;
  // Cache so repeated lookups (timeframes, indicators, re-renders) do not
  // regenerate the same deterministic series.
  if ( DemoHistory._cache.has(key) ) {
    return DemoHistory._cache.get(key)!;
  }

  const rng = mulberry32(hashString(`${key}-v1`));
  const bars: Candle[] = [];
  const start = new Date(2013, 11, 30); // Monday
  const end = new Date(2026, 8, 30); // 2026-09-30
  const cursor = new Date(start);

  while ( cursor <= end ) {
    const day = cursor.getDay();
    if ( day !== 0 && day !== 6 ) {
      const time = Date.UTC(cursor.getFullYear(), cursor.getMonth(), cursor.getDate()) - IST_OFFSET_MS;
      const base = BASE_PRICES[symbol] ?? 100;
      const idx = EXCHANGE_MULT[exchange];
      const trend =
        (cursor.getTime() - start.getTime()) / (365.25 * 24 * 3600_000) * 0.06;
      const open = Math.max(1, base * idx * (1 + trend * 0.02));
      const shock = randomBetween(rng, -0.018, 0.022);
      const close = Math.max(open * 0.5, open * (1 + shock));
      const drift = randomBetween(rng, 0, 0.012);
      const high = Math.max(open, close) * (1 + drift);
      const low = Math.min(open, close) * (1 - randomBetween(rng, 0, 0.012));
      const volume = Math.max(0, Math.round(randomBetween(rng, 100_000, 1_200_000)));
      bars.push({ time, open, high, low, close, volume });
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  DemoHistory._cache.set(key, bars);
  return bars;
}

const DemoHistory = { _cache: new Map<string, Candle[]>() };

/** Deterministic string hash (djb2), small and side-effect free. */
function hashString(str: string): number {
  let h = 5381;
  for ( let i = 0; i < str.length; i++ ) {
    h = ((h << 5) + h + str.charCodeAt(i)) | 0;
  }
  return h >>> 0;
}
