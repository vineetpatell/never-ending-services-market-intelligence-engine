import type { IndicatorConfig, IndicatorSeries } from "./types";

/**
 * Technical indicator calculation layer.
 *
 * Pure, deterministic, dependency-free functions. All outputs are aligned
 * 1:1 with the input bar count and use `null` for "not yet calculable"
 * (insufficient history, malformed nearby bar). We deliberately do not
 * fabricate values for missing candles or warm-up periods.
 *
 * Calculations are based ONLY on available data and never look ahead. No
 * indicator predicts price ΓÇö each is a history-based statistical measure.
 *
 * @see src/charts/__tests__/indicators.test.ts
 */

/** Deterministic, side-effect-free color palette for indicator series. */
export const INDICATOR_COLORS: Record<string, string> = {
  sma: "#7C5CFF",
  ema: "#14B8A6",
  rsi: "#F97316",
  macd: "#6366F1",
  bb: "#94A3B8",
};

export interface MacdResult {
  macd: (number | null)[];
  signal: (number | null)[];
  histogram: (number | null)[];
}

export interface BollingerResult {
  upper: (number | null)[];
  middle: (number | null)[];
  lower: (number | null)[];
}

/**
 * Simple Moving Average. `null` until `period` bars are available.
 */
export function sma(values: (number | null)[], period: number): (number | null)[] {
  if ( period < 2 ) return values.map(() => null);
  const out: (number | null)[] = new Array(values.length).fill(null);
  for ( let i = period - 1; i < values.length; i++ ) {
    const window = values.slice(i - period + 1, i + 1);
    if ( window.some((v) => v === null || v === undefined || !Number.isFinite(v) ) ) {
      out[i] = null;
      continue;
    }
    out[i] = (window as number[]).reduce((sum, v) => sum + v, 0) / period;
  }
  return out;
}

/**
 * Exponential Moving Average (Wilder-style smoothing). `null` during the
 * warm-up window of `period - 1` bars; then a weighted average following.
 */
export function ema(values: (number | null)[], period: number): (number | null)[] {
  if ( period < 2 ) return values.map(() => null);
  const out: (number | null)[] = new Array(values.length).fill(null);
  const multiplier = 2 / (period + 1);
  const warm = values.slice(0, period);
  if ( !warm.some((v) => v === null || v === undefined || !Number.isFinite(v) ) ) {
    out[period - 1] = (warm as number[]).reduce((sum, v) => sum + v, 0) / period;
  }
  for ( let i = period; i < values.length; i++ ) {
    const v = values[i];
    if ( v === null || v === undefined || !Number.isFinite(v) ) { out[i] = null; continue; }
    const prev = out[i - 1];
    if ( prev === null || prev === undefined || !Number.isFinite(prev) ) { out[i] = null; continue; }
    out[i] = v * multiplier + prev * (1 - multiplier);
  }
  return out;
}

/**
 * Relative Strength Index (Wilder's smoothing, 14 by default). Returns
 * `null` while there is insufficient history, and is bounded to [0, 100].
 */
export function rsi(values: number[], period: number = 14): (number | null)[] {
  if ( period < 2 || values.length < period ) return values.map(() => null);
  const out: (number | null)[] = new Array(values.length).fill(null);
  const deltas = values.map( (v, i) => (i === 0 ? 0 : v - values[i - 1]) );
  let gainSum = 0;
  let lossSum = 0;
  for ( let i = 1; i <= period; i++ ) {
    const d = deltas[i];
    if ( !Number.isFinite(d) ) { out[i] = null; continue; }
    gainSum += Math.max(d, 0);
    lossSum += Math.max(-d, 0);
  }
  let avgGain = gainSum / period;
  let avgLoss = lossSum / period;
  out[period] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);
  for ( let i = period + 1; i < values.length; i++ ) {
    const d = deltas[i];
    if ( !Number.isFinite(d) ) { out[i] = null; continue; }
    avgGain = (avgGain * (period - 1) + Math.max(d, 0)) / period;
    avgLoss = (avgLoss * (period - 1) + Math.max(-d, 0)) / period;
    out[i] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);
  }
  return out;
}

/**
 * MACD (12, 26, 9 by default). Returns the MACD line, signal line (EMA of
 * the MACD), and histogram = MACD - signal.
 */
export function macd(
  values: number[],
  fast = 12,
  slow = 26,
  signal = 9,
): MacdResult {
  const eFast = ema(values, fast);
  const eSlow = ema(values, slow);
  const macdLine: (number | null)[] = new Array(values.length).fill(null);
  for ( let i = 0; i < values.length; i++ ) {
    const f = eFast[i];
    const s = eSlow[i];
    if ( f === null || s === null ) { macdLine[i] = null; continue; }
    macdLine[i] = f - s;
  }
  const signalLine = ema(macdLine, signal);
  const histogram: (number | null)[] = new Array(values.length).fill(null);
  for ( let i = 0; i < values.length; i++ ) {
    if ( macdLine[i] === null || signalLine[i] === null ) { histogram[i] = null; continue; }
    histogram[i] = macdLine[i]! - signalLine[i]!;
  }
  return { macd: macdLine, signal: signalLine, histogram };
}

/**
 * Bollinger Bands (SMA ┬▒ k┬╖╧â). `middle` is the 20-bar SMA; `upper` and
 * `lower` use sample standard deviation of the window.
 */
export function bollingerBands(
  values: number[],
  period = 20,
  k = 2,
): BollingerResult {
  if ( period < 2 ) {
    return { upper: values.map(() => null), middle: values.map(() => null), lower: values.map(() => null) };
  }
  const middle = sma(values, period);
  const upper: (number | null)[] = new Array(values.length).fill(null);
  const lower: (number | null)[] = new Array(values.length).fill(null);
  for ( let i = 0; i < values.length; i++ ) {
    const m = middle[i];
    if ( m === null ) { upper[i] = null; lower[i] = null; continue; }
    const window = values.slice(i - period + 1, i + 1);
    const variance = window.reduce( (sum, v) => sum + (v - m) ** 2, 0 ) / ( window.length - 1 );
    const std = Math.sqrt( variance );
    upper[i] = m + k * std;
    lower[i] = m - k * std;
  }
  return { upper, middle, lower };
}

/**
 * Build a `(time, value)` data item, mapping `null` to a gap.
 */
export function toLineData<T>(time: T, value: number | null): { time: T; value: number } | null {
  if ( value === null ) return null;
  return { time, value };
}

export type IndicatorResult =
  | { kind: "sma"; data: (number | null)[] }
  | { kind: "ema"; data: (number | null)[] }
  | { kind: "rsi"; data: (number | null)[] }
  | { kind: "macd"; result: MacdResult }
  | { kind: "bb"; result: BollingerResult };

/**
 * Compute enabled indicator series from close prices, aligned 1:1 to the
 * input bars. `null` marks "not yet calculable". No fabricated values.
 */
export function calculateIndicators(
  values: number[],
  configs: IndicatorConfig[],
): IndicatorSeries[] {
  const series: IndicatorSeries[] = [];
  for ( const cfg of configs ) {
    if ( !cfg.enabled ) continue;
    if ( cfg.id === "sma" ) {
      series.push({ id: "sma", label: cfg.label, color: INDICATOR_COLORS.sma, data: sma(values, cfg.period), pane: "price", render: "line", scale: null, precision: 2 });
    } else if ( cfg.id === "ema" ) {
      series.push({ id: "ema", label: cfg.label, color: INDICATOR_COLORS.ema, data: ema(values, cfg.period), pane: "price", render: "line", scale: null, precision: 2 });
    } else if ( cfg.id === "rsi" ) {
      series.push({ id: "rsi", label: cfg.label, color: INDICATOR_COLORS.rsi, data: rsi(values, cfg.period), pane: "rsi", render: "line", scale: { min: 0, max: 100 }, precision: 2 });
    } else if ( cfg.id === "macd" ) {
      const r = macd(values, cfg.fast, cfg.slow, cfg.signal);
      series.push({ id: "macd", label: cfg.label, color: INDICATOR_COLORS.macd, data: r.macd, pane: "macd", render: "line", scale: null, precision: 3 });
      series.push({ id: "macd-signal", label: "MACD signal", color: "#A5B4FC", data: r.signal, pane: "macd", render: "line", scale: null, precision: 3 });
      series.push({ id: "macd-hist", label: "MACD histogram", color: "#FB923C", data: r.histogram, pane: "macd", render: "histogram", scale: null, precision: 3 });
    } else if ( cfg.id === "bb" ) {
      const r = bollingerBands(values, cfg.period, cfg.k);
      series.push({ id: "bb-upper", label: `${cfg.label} upper`, color: INDICATOR_COLORS.bb, data: r.upper, pane: "price", render: "line", scale: null, precision: 2 });
      series.push({ id: "bb-middle", label: `${cfg.label} middle`, color: "#CBD5E1", data: r.middle, pane: "price", render: "line", scale: null, precision: 2 });
      series.push({ id: "bb-lower", label: `${cfg.label} lower`, color: INDICATOR_COLORS.bb, data: r.lower, pane: "price", render: "line", scale: null, precision: 2 });
    }
  }
  return series;
}

