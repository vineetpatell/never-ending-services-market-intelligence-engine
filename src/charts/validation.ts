import type { Candle, ChartDataSet, DataStatus, Exchange, MarketDataSource } from "./types";

/** Shared metadata carried with any market dataset. */
export function makeDataSource(status: DataStatus): MarketDataSource {
  return {
    source: "DEMO_DATA",
    status,
    isLive: false,
    lastUpdatedAt: Date.now(),
    note: "Synthetic demo values only — not live market data.",
  };
}

/** Build a `ChartDataSet` with a fixed provenance + timezone metadata. */
export function makeChartDataSet(
  symbol: string,
  exchange: Exchange,
  candles: Candle[],
  status: DataStatus,
): ChartDataSet {
  if ( candles.length === 0 ) {
    return {
      symbol,
      exchange,
      candles: [],
      source: "DEMO_DATA",
      status,
      isLive: false,
      lastUpdatedAt: Date.now(),
      note: "No synthetic bars available for the requested range.",
      availableStart: 0,
      availableEnd: 0,
    };
  }
  const availableStart = candles[0].time;
  const availableEnd = candles[candles.length - 1].time;
  return {
    symbol,
    exchange,
    candles,
    source: "DEMO_DATA",
    status,
    isLive: false,
    lastUpdatedAt: Date.now(),
    note: "Synthetic demo values only — not live market data.",
    availableStart,
    availableEnd,
  };
}

/**
 * Validate an unknown input value against the Candle contract at the
 * system boundary. Returns OK/failure WITHOUT mutating or fabricating
 * the record — the caller decides whether to render, skip, or flag it.
 */
export interface CandleValidationResult {
  ok: boolean;
  /** Malformed records (e.g. bad OHLC relationship, NaN, negative volume). */
  errors: string[];
  /** Surprising but tolerant issues (e.g. unsorted time). */
  warnings: string[];
}

const isFiniteNumber = (v: unknown): v is number =>
  typeof v === "number" && Number.isFinite(v);

export function isCandleLike(value: unknown): value is Candle {
  if ( typeof value !== "object" || value === null ) return false;
  const o = value as Record<string, unknown>;
  return (
    isFiniteNumber(o.time) &&
    isFiniteNumber(o.open) &&
    isFiniteNumber(o.high) &&
    isFiniteNumber(o.low) &&
    isFiniteNumber(o.close) &&
    isFiniteNumber(o.volume) &&
    o.volume >= 0 &&
    o.high >= Math.min(o.open, o.close) &&
    o.low <= Math.max(o.open, o.close)
  );
}

export function validateCandle(c: unknown): CandleValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  if ( !isCandleLike(c) ) {
    errors.push( "record is not a valid Candle (time, open, high, low, close, volume all required; volume >= 0; OHLC relationship must hold)" );
    return { ok: false, errors, warnings };
  }
  const o = c as Candle;
  if ( o.volume < 0 ) {
    errors.push( `volume must be non-negative (got ${o.volume})` );
  }
  if ( o.volume === 0 ) warnings.push( "zero volume on a bar with a price change is unusual; flagged for review" );
  return { ok: errors.length === 0, errors, warnings };
}

/**
 * Validate an array of candles. Enforces a strictly increasing, non-duplicate
 * timestamp sequence and forecasts any OHLC/value problems.
 */
export function validateCandles(candles: unknown[]): CandleValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  if ( candles.length === 0 ) {
    return { ok: true, errors, warnings }; // nothing to validate
  }
  for ( let i = 0; i < candles.length; i++ ) {
    const result = validateCandle(candles[i]);
    if ( !result.ok ) {
      errors.push( `candle[${i}]: ${result.errors.join("; ")}` );
    }
    warnings.push( ...result.warnings );
  }
  // Strictly increasing timestamps (no duplicates), which matters for charts.
  for ( let i = 1; i < candles.length; i++ ) {
    if ( candles[i] && candles[i - 1] && isCandleLike(candles[i]) && isCandleLike(candles[i - 1]) ) {
      const a = (candles[i - 1] as Candle).time;
      const b = (candles[i] as Candle).time;
      if ( b <= a ) {
        errors.push( `timestamp must be strictly increasing: candle[${i - 1}]=${a} >= candle[${i}]=${b}` );
      }
    } else {
      // Structure already reported by validateCandle; still surface ordering issue.
      warnings.push( `candle[${i}] or candle[${i - 1}] is malformed; timestamp ordering not checked` );
    }
  }
  return { ok: errors.length === 0, errors, warnings };
}
