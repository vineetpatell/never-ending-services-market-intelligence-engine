/**
 * Domain calculations — kept OUTSIDE presentation components (AGENTS.md §3).
 * Pure functions over demo fixtures; documented assumptions inline.
 * Decimal-safe: money rounded to paise at display boundaries via formatINR.
 */

export interface QuoteLike {
  price: number;
  dayMovePct: number;
}

/** Signed illustrative day move in INR. Assumption: linear % of price. */
export function dayMoveValue(q: QuoteLike): number {
  return (q.price * q.dayMovePct) / 100;
}

/** Paper portfolio valuation. Assumption: positions marked at demo prices. */
export interface PositionLike {
  symbol: string;
  quantity: number;
  averagePrice: number;
}

export interface Valuation {
  invested: number;
  marketValue: number;
  unrealised: number;
}

export function valuePositions(
  positions: PositionLike[],
  prices: Record<string, number>,
): Valuation {
  let invested = 0;
  let marketValue = 0;
  for (const p of positions) {
    invested += p.quantity * p.averagePrice;
    marketValue += p.quantity * (prices[p.symbol] ?? p.averagePrice);
  }
  return { invested, marketValue, unrealised: marketValue - invested };
}

/**
 * Max drawdown from an equity curve. Assumption: peak-to-trough on the
 * supplied curve (doc-12 definition requirement surfaced in UI).
 */
export function maxDrawdown(equity: number[]): number {
  if (equity.length === 0) return 0;
  let peak = equity[0];
  let worst = 0;
  for (const v of equity) {
    if (v > peak) peak = v;
    if (peak > 0) worst = Math.min(worst, (v - peak) / peak);
  }
  return worst * 100;
}
