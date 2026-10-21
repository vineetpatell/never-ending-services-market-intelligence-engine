import type { ChartDataQuery, ChartDataRange, TimeframeId } from "./types";

/** Timeframe controls for the chart explorer. */

export const TIMEFRAMES: TimeframeId[] = [
  "1D",
  "1W",
  "1M",
  "6M",
  "1Y",
  "5Y",
  "10Y",
] as const;

/**
 * Default visible range: the last ~two years of the synthetic dataset.
 * "1Y" is the most useful default for a demo sweep of available history.
 */
export function defaultRange(availableTo: number): ChartDataRange {
  return toTimeframeRange("1Y", availableTo);
}

export function timeframeLabel(id: TimeframeId): string {
  return id;
}

export function toTimeframeRange(
  timeframe: TimeframeId,
  end: number,
): ChartDataRange {
  const day = 86_400_000;
  const spans: Record<TimeframeId, number> = {
    "1D": day,
    "1W": 7 * day,
    "1M": 31 * day,
    "6M": 183 * day,
    "1Y": 365 * day,
    "5Y": 5 * 365 * day,
    "10Y": 10 * 365 * day,
  };
  const span = spans[timeframe];
  return { fromMs: end - span, toMs: end };
}

/**
 * Resolve the effective date window for a request, relative to the latest
 * available bar. Returns the *requested* range so callers can compare it
 * against the dataset's true range and surface an "unavailable" message.
 */
export function resolveRange({
  timeframe,
  customFrom,
  customTo,
  availableTo,
}: {
  timeframe: TimeframeId | "custom";
  customFrom: number | null;
  customTo: number | null;
  availableTo: number;
}): { fromMs: number | null; toMs: number | null; usedTimeframe: TimeframeId | "custom" } {
  if ( timeframe === "custom" ) {
    if ( customFrom === null || customTo === null || customTo <= customFrom ) {
      // Fall back to a 1Y window anchored at the latest bar.
      return { ...toTimeframeRange("1Y", availableTo), usedTimeframe: "1Y" };
    }
    return { fromMs: customFrom, toMs: customTo, usedTimeframe: "custom" };
  }
  return { ...toTimeframeRange(timeframe, availableTo), usedTimeframe: timeframe };
}

export function rangeForStore({
  timeframe,
  customFrom,
  customTo,
  availableTo,
}: {
  timeframe: TimeframeId | "custom";
  customFrom: number | null;
  customTo: number | null;
  availableTo: number;
}): ChartDataQuery {
  const { fromMs, toMs } = resolveRange({ timeframe, customFrom, customTo, availableTo });
  return { symbol: "", exchange: "NSE", fromMs, toMs };
}
