/**
 * Timezone conventions for the charting layer.
 *
 * Bars are dated by the IST trading session (London open of the day in
 * India). Internally timestamps are epoch milliseconds UTC; display
 * converts to Asia/Kolkata. Nothing here fabricates a price — only dates
 * and labels.
 */

/** 5.5 hours in milliseconds. */
export const IST_OFFSET_MS = 5.5 * 3600_000;

/**
 * IST midnight as UTC epoch milliseconds (used as the canvas time for a
 * daily bar). This keeps daily bars aligned to IST calendar dates.
 */
export function istMidnight(year: number, month: number, day: number): number {
  return Date.UTC(year, month, day) - IST_OFFSET_MS;
}

/** Format a UTC timestamp as an IST calendar date, e.g. "2026-09-30". */
export function formatISODate(ts: number): string {
  const parts = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(ts));
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

/**
 * Format a UTC timestamp with the IST wall-clock time, e.g.
 * "2026-09-30 09:15" plus an IST offset suffix.
 */
export function formatISOTimestamp(ts: number): string {
  const parts = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date(ts));

  const get = (type: string) => {
    const part = parts.find((p) => p.type === type);
    return part?.value ?? "";
  };

  return `${get("year")}-${get("month")}-${get("day")} ${get("hour")}:${get("minute")} IST`;
}

/** Format a UTC timestamp as an IST date-time for tooltip/detail display. */
export function formatDateValue(ts: number): string {
  return `${formatISODate(ts)} ${formatISOTimestamp(ts).split(" ")[1]}`;
}

/**
 * Return a human-readable "true available range" string derived from a
 * dataset's actual bar timestamps (not the requested range).
 */
export function availableRangeText(
  dataset: { availableStart: number; availableEnd: number },
): string {
  return `${formatISODate(dataset.availableStart)} → ${formatISODate(dataset.availableEnd)}`;
}
