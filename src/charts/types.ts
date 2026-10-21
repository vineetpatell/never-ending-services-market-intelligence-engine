/**
 * Chart domain contracts.
 *
 * Provenance and status metadata live with the data (not as separate
 * hoisted flags) so a future backend adapter can carry a full
 * source/timestamp trail alongside every bar. All market values are
 * DEMO-synthetic unless a verified provider is integrated.
 *
 * @see docs/adr/ADR-0005.md (demo-only market data)
 */

/** Allowed exchanges for the local prototype. */
export type Exchange = "NSE" | "BSE";

/** Local trading currency. */
export type Currency = "INR";

/** Freshness/providence state carried by every dataset and candle. */
export type DataStatus = "DEMO" | "DELAYED" | "LIVE";

/** Fixed provenance tag for synthetic fixtures. */
export type DataSource = "DEMO_DATA";

/** Identifier for a symbol as shown in the picker. */
export interface SymbolRecord {
  symbol: string;
  exchange: Exchange;
  name: string;
  currency: Currency;
}

/**
 * A single OHLCV bar. `time` is epoch milliseconds on the UTC timeline.
 * The display layer converts it to Asia/Kolkata for presentation.
 *
 * Convention: bars are dated by IST session start (London open of the
 * trading day). `IST midnight = Date.UTC(y, m, d) - 5.5 * 3600_000`.
 * See `src/charts/demo.ts` for the generator and
 * `src/charts/date.ts` for format helpers.
 */
export interface Candle {
  /** Epoch ms, UTC (IST-session based). */
  time: number;
  /** Entry price. */
  open: number;
  /** True high of the session (never fabricated). */
  high: number;
  /** True low of the session (never fabricated). */
  low: number;
  /** Closure price. */
  close: number;
  /** Traded volume for the session. Non-negative. */
  volume: number;
}

/**
 * Market-source metadata attached to every dataset. `is_live: false` is
 * the explicit non-live marker required by ADR-0005.
 */
export interface MarketDataSource {
  source: DataSource;
  status: DataStatus;
  isLive: boolean;
  lastUpdatedAt: number;
  /** Free-text note shown to the user (e.g. "All values synthetic"). */
  note: string;
}

/**
 * Complete, validated market dataset used by the chart.
 * Scene 3 (ISO) of the layered data contract.
 */
export interface ChartDataSet {
  symbol: string;
  exchange: Exchange;
  candles: Candle[];
  source: DataSource;
  status: DataStatus;
  isLive: boolean;
  lastUpdatedAt: number;
  note: string;
  /** True range of available bars (UTC ms). Used to detect unavailable periods. */
  availableStart: number;
  availableEnd: number;
}

/**
 * Absolute date window requested from a provider. Both bounds inclusive,
 * epoch milliseconds UTC. Either bound may be null to mean "unbounded".
 */
export interface ChartDataRange {
  fromMs: number | null;
  toMs: number | null;
}

/** Identifier for a timeframe button. */
export type TimeframeId = "1D" | "1W" | "1M" | "6M" | "1Y" | "5Y" | "10Y";

/**
 * Query passed to a provider (`getHistory`) so a future backend adapter
 * can fetch exactly the requested window.
 */
export interface ChartDataQuery {
  symbol: string;
  exchange: Exchange;
  /** UTC ms; inclusive. null = use the provider's full dataset. */
  fromMs: number | null;
  /** UTC ms; inclusive. null = "to the end". */
  toMs: number | null;
}

/**
 * Authoritative identifier for a technical indicator series.
 */
export type IndicatorId =
  | "sma"
  | "ema"
  | "rsi"
  | "macd"
  | "macd-signal"
  | "macd-hist"
  | "bb-upper"
  | "bb-middle"
  | "bb-lower";

/**
 * How a series is drawn inside its pane.
 *
 * - `line`      — a single stroked line.
 * - `histogram` — per-bar columns (MACD histogram).
 */
export type IndicatorRender = "line" | "histogram";

/**
 * Which chart pane an indicator series belongs to.
 *
 * - `price`  — overlay on the main price axis (SMA, EMA, Bollinger).
 * - `rsi`    — own pane with a 0–100 scale.
 * - `macd`   — own pane (MACD line, signal, histogram).
 *
 * Keeping this on the contract means the chart layer never has to guess
 * which scale an indicator belongs on, and a value is never presented on
 * a misleading axis.
 */
export type IndicatorPane = "price" | "rsi" | "macd";

/**
 * Per-indicator configuration. Variants keep variant-specific periods
 * typed. `true` = shown; `false` = hidden.
 */
export interface SmaConfig {
  id: "sma";
  label: string;
  enabled: boolean;
  /** Fixed window; must be >= 2. */
  period: number;
}

export interface EmaConfig {
  id: "ema";
  label: string;
  enabled: boolean;
  /** Fixed window; must be >= 2. */
  period: number;
}

export interface RsiConfig {
  id: "rsi";
  label: string;
  enabled: boolean;
  /** Fixed window; 14 is the market convention. */
  period: number;
}

export interface MacdConfig {
  id: "macd";
  label: string;
  enabled: boolean;
  fast: number;
  slow: number;
  signal: number;
}

export interface BollingerConfig {
  id: "bb";
  label: string;
  enabled: boolean;
  period: number;
  k: number;
}

export type IndicatorConfig =
  | SmaConfig
  | EmaConfig
  | RsiConfig
  | MacdConfig
  | BollingerConfig;

/**
 * A single computed indicator series, aligned 1:1 with the input bars.
 * `null` marks "not yet calculable": insufficient history, a malformed
 * nearby bar, or an entirely empty window. We deliberately do NOT
 * fabricate a value.
 */
export interface IndicatorSeries {
  id: IndicatorId;
  label: string;
  color: string;
  /** Same length as the bar count; null where not calculable. */
  data: (number | null)[];
  /** Pane the series renders in. */
  pane: IndicatorPane;
  /** How the series is drawn. */
  render: IndicatorRender;
  /** Fixed pane scale bounds (e.g. RSI 0–100). null = auto-scale. */
  scale: { min: number; max: number } | null;
  /** Decimal places used when this series is shown as a numeric value. */
  precision: number;
}

/** Constant for the synthetic series (never a live provider). */
export const DEMO_SOURCE: DataSource = "DEMO_DATA" as const;
export const DEMO_STATUS: DataStatus = "DEMO" as const;
export const DEMO_IS_LIVE = false as const;

export interface IndicatorValueRow {
  id: string;
  label: string;
  color: string;
  params: string;
  latest: string;
  /** Pane the value belongs to (shown so the user can match it to the chart). */
  pane: IndicatorPane;
  /** Unit/scale hint, e.g. "0–100" for RSI. Empty when not applicable. */
  unit: string;
}

/**
 * Contract for a market-data provider. Only the demo adapter exists in
 * this phase; a future backend adapter implements the same interface.
 */
export interface MarketDataProvider {
  getSymbols(): SymbolRecord[];
  getHistory(query: ChartDataQuery): Promise<ChartDataSet>;
  getAvailableRange(symbol: string, exchange: Exchange): { from: number; to: number } | null;
  isDemo(): boolean;
}

