import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  EmptyState,
  PageHeader,
} from "../components/ui";
import { IndicatorValues } from "./IndicatorValues";
import { LightweightChart } from "../charts/LightweightChart";
import {
  useChartStore,
  type ChartDataQuery,
  type ChartDataSet,
  type Candle,
  type Exchange,
  type IndicatorConfig,
  type IndicatorSeries,
  type IndicatorValueRow,
  type SymbolRecord,
  type TimeframeId,
} from "../charts/types";
import {
  INDICATOR_COLORS,
  calculateIndicators,
} from "../charts/indicators";
import { TIMEFRAMES, timeframeLabel } from "../charts/timeframes";
import {
  formatDateValue,
  formatISODate,
  availableRangeText,
} from "../charts/date";
import { createDemoProvider } from "../charts/provider";

const DEMO_BADGE_CLASS =
  "inline-flex items-center gap-1.5 rounded-full border border-[var(--color-nes-accent)]/40 bg-[var(--color-nes-accent)]/15 px-3 py-1 text-xs font-bold tracking-wide text-[var(--color-nes-accent)]";

function paramsText(cfg: IndicatorConfig): string {
  switch (cfg.id) {
    case "sma":
    case "ema":
    case "rsi":
      return `period ${cfg.period}`;
    case "macd":
return `fast ${cfg.fast} · slow ${cfg.slow} · signal ${cfg.signal}`;
    case "bb":
      return `period ${cfg.period} · k ${cfg.k}`;
    default:
      return "";
  }
}

function latestValue(
  series: IndicatorSeries,
  candles: Candle[],
): string | null {
  const data = series.data;
  for (let i = data.length - 1; i >= 0; i--) {
    const v = data[i];
    if (v !== null && v !== undefined) {
      return v.toFixed(2);
    }
  }
  return null;
}

function buildIndicatorRows(
  indicators: IndicatorSeries[],
  candles: Candle[],
): { rows: IndicatorValueRow[] } {
  const rows: IndicatorValueRow[] = indicators.map((s) => {
    const latest = latestValue(s, candles);
    return {
      id: s.id,
      label: s.label,
      color: s.color,
      params: paramsText(
        indicators.find((i) => i.id === s.id) as IndicatorConfig,
      ),
      latest: latest ?? "—",
    };
  });
  return { rows };
}

export function ChartExplorerPage() {
  const navigate = useNavigate();
  const store = useChartStore();
  const {
    symbol,
    exchange,
    timeframe,
    fromMs,
    toMs,
    candles,
    availableFrom,
    availableTo,
    status,
    source,
    isLive,
    indicators,
    volumeVisible,
    loading,
    error,
    setSymbol,
    setTimeframe,
    setCustomRange,
    setIndicators,
    toggleVolume,
    refresh,
  } = store;

  const [symbols, setSymbols] = useState<SymbolRecord[]>([]);
  const [customFrom, setCustomFrom] = useState<string>("");
  const [customTo, setCustomTo] = useState<string>("");
  const [crosshair, setCrosshair] = useState<{
    time: number;
    price: number;
    candle: Candle | null;
  } | null>(null);

  useEffect(() => {
    const provider = createDemoProvider();
    setSymbols(provider.getSymbols());
  }, []);

  const enabledIndicators = useMemo(
    () => indicators.filter((i) => i.enabled),
    [indicators],
  );

  const indicatorSeries = useMemo(
    () => calculateIndicators(candles.map((c) => c.close), enabledIndicators),
    [candles, enabledIndicators],
  );

  const { rows } = useMemo(
    () => buildIndicatorRows(indicatorSeries, candles),
    [indicatorSeries, candles],
  );

  const timeframeOptions = useMemo(
    () => TIMEFRAMES.map((tf) => ({ id: tf, label: timeframeLabel(tf) })),
    [],
  );

  const handleSymbolChange = (sym: string, ex: Exchange) => {
    setSymbol(sym, ex);
    setCustomFrom("");
    setCustomTo("");
    if (timeframe !== "custom") setTimeframe(timeframe);
  };

  const handleTimeframeChange = (tf: TimeframeId | "custom") => {
    setTimeframe(tf);
    if (tf !== "custom") {
      setCustomFrom("");
      setCustomTo("");
    }
  };

  const handleRangeChange = () => {
    if (timeframe !== "custom") return;
    const f = customFrom ? new Date(customFrom).getTime() : null;
    const t = customTo ? new Date(customTo).getTime() : null;
    setCustomRange(f, t);
  };

  const query: ChartDataQuery = {
    symbol,
    exchange,
    fromMs: timeframe === "custom" ? (fromMs ?? null) : null,
    toMs: timeframe === "custom" ? (toMs ?? null) : null,
  };

  useEffect(() => {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Chart Explorer"
        description={
          <>
            Demo candlestick explorer with provider-independent data contracts.{" "}
            <span className={DEMO_BADGE_CLASS}>DEMO</span>
          </>
        }
        actions={
          <Button variant="ghost" onClick={() => refresh()} disabled={loading}>
            {loading ? "Loading…" : "Refresh"}
          </Button>
        }
      />

      <Card className="overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--color-nes-line)] nes-dark:border-[var(--color-nes-d-line)] flex flex-wrap items-center justify-between gap-3 sm:justify-end">
          <div className="flex items-center gap-3">
            <label className="text-xs font-semibold uppercase tracking-wide text-[var(--color-nes-ink-2)] nes-dark:text-[var(--color-nes-d-ink-2)]">
              Symbol
            </label>
            <select
              value={symbol}
              onChange={(e) => {
                const sel = symbols.find((s) => s.symbol === e.target.value);
                if (sel) handleSymbolChange(sel.symbol, sel.exchange);
              }}
              className="rounded-lg border border-[var(--color-nes-line)] bg-[var(--color-nes-surface)] px-3 py-2 text-sm nes-dark:border-[var(--color-nes-d-line)] nes-dark:bg-[var(--color-nes-d-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-nes-primary)]"
            >
              {symbols.map((s) => (
                <option key={`${s.exchange}|${s.symbol}`} value={s.symbol}>
                  {s.symbol} ({s.exchange})
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-[var(--color-nes-ink-2)] nes-dark:text-[var(--color-nes-d-ink-2)]">
              Timeframe
            </span>
            <div className="flex gap-1 rounded-lg border border-[var(--color-nes-line)] bg-[var(--color-nes-surface)] nes-dark:border-[var(--color-nes-d-line)] nes-dark:bg-[var(--color-nes-d-surface)]">
              {timeframeOptions.map((tf) => (
                <button
                  key={tf.id}
                  onClick={() => handleTimeframeChange(tf.id)}
                  className={`px-3 py-1.5 text-xs font-medium transition ${
                    timeframe === tf.id
                      ? "bg-[var(--color-nes-primary)] text-white"
                      : "text-[var(--color-nes-ink-2)] hover:bg-black/5 nes-dark:text-[var(--color-nes-d-ink-2)] nes-dark:hover:bg-white/5"
                  }`}
                >
                  {tf.label}
                </button>
              ))}
              <button
                onClick={() => handleTimeframeChange("custom")}
                className={`px-3 py-1.5 text-xs font-medium transition ${
                  timeframe === "custom"
                    ? "bg-[var(--color-nes-primary)] text-white"
                    : "text-[var(--color-nes-ink-2)] hover:bg-black/5 nes-dark:text-[var(--color-nes-d-ink-2)] nes-dark:hover:bg-white/5"
                }`}
              >
                Custom
              </button>
            </div>
          </div>
        </div>
        {timeframe === "custom" && (
          <div className="px-4 py-2 border-b border-[var(--color-nes-line)] nes-dark:border-[var(--color-nes-d-line)] flex items-center gap-4">
            <label className="text-xs font-semibold text-[var(--color-nes-ink-2)] nes-dark:text-[var(--color-nes-d-ink-2)]">
              From
            </label>
            <input
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              className="rounded-lg border border-[var(--color-nes-line)] bg-[var(--color-nes-surface)] px-3 py-2 text-sm nes-dark:border-[var(--color-nes-d-line)] nes-dark:bg-[var(--color-nes-d-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-nes-primary)]"
              min={formatISODate(availableFrom)}
              max={formatISODate(availableTo)}
            />
            <label className="text-xs font-semibold text-[var(--color-nes-ink-2)] nes-dark:text-[var(--color-nes-d-ink-2)]">
              To
            </label>
            <input
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              className="rounded-lg border border-[var(--color-nes-line)] bg-[var(--color-nes-surface)] px-3 py-2 text-sm nes-dark:border-[var(--color-nes-d-line)] nes-dark:bg-[var(--color-nes-d-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-nes-primary)]"
              min={formatISODate(availableFrom)}
              max={formatISODate(availableTo)}
            />
            <Button
              variant="ghost"
              onClick={handleRangeChange}
              disabled={!customFrom || !customTo}
            >
              Apply range
            </Button>
          </div>
        )}

        <div className="px-4 py-3 relative">
          {showLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40">
              <div className="flex flex-col items-center gap-2 text-xs text-[var(--color-nes-ink-2)]">
                Loading demo data…
              </div>
            </div>
          )}
          {showEmpty && (
            <div className="flex flex-col items-center justify-center h-full text-center py-10">
              <EmptyState
                title="No chart data"
                description="Select a symbol and timeframe to load demo data."
              />
            </div>
          )}
          {!showLoading && !showEmpty && (
            <LightweightChart
              data={data}
              indicators={indicatorSeries}
              height={520}
              onCrosshair={setCrosshair}
            />
          )}
        </div>
        {error && (
          <div className="px-4 py-3 bg-[var(--color-nes-down)]/10 border border-[var(--color-nes-down)]/30 rounded-xl text-[var(--color-nes-down)] text-sm">
            {error}
            <Button
              variant="ghost"
              onClick={refresh}
              className="ml-3 h-8 px-2 text-[var(--color-nes-down)]"
            >
              Retry
            </Button>
          </div>
        )}
      </Card>

      {crosshair && candles.length > 0 && (
        <Card className="px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-[var(--color-nes-ink-2)] nes-dark:text-[var(--color-nes-d-ink-2)]">
                {formatDateValue(crosshair.time)}
              </span>
              {crosshair.candle && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[var(--color-nes-up)]">O {crosshair.candle.open.toFixed(2)}</span>
                  <span className="text-xs font-semibold text-[var(--color-nes-up)]">H {crosshair.candle.high.toFixed(2)}</span>
                  <span className="text-xs font-semibold text-[var(--color-nes-down)]">L {crosshair.candle.low.toFixed(2)}</span>
                  <span className="text-xs font-semibold tnum">C {crosshair.candle.close.toFixed(2)}</span>
                  <span className="text-xs font-semibold text-[var(--color-nes-ink-2)] nes-dark:text-[var(--color-nes-d-ink-2)]">V {crosshair.candle.volume.toLocaleString()}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-[var(--color-nes-ink-2)] nes-dark:text-[var(--color-nes-d-ink-2)]">
                {status} · {source}
              </span>
              <span className="h-2 w-2 rounded-full bg-current" />
              <span className="text-xs font-bold tracking-wide text-[var(--color-nes-accent)]">
                DEMO
              </span>
              <span className="text-xs text-[var(--color-nes-ink-2)] nes-dark:text-[var(--color-nes-d-ink-2)]">
                {isLive ? "LIVE" : "NOT LIVE"}
              </span>
            </div>
          </div>
        </Card>
      )}

      {rows.length > 0 && (
        <Card>
          <div className="px-4 py-3 border-b border-[var(--color-nes-line)] nes-dark:border-[var(--color-nes-d-line)]">
            <h3 className="text-sm font-semibold">Indicator values</h3>
            <p className="mt-1 text-xs text-[var(--color-nes-ink-2)] nes-dark:text-[var(--color-nes-d-ink-2)]">
              Latest bar-aligned values. null = insufficient history (not fabricated).
            </p>
          </div>
          <IndicatorValues rows={rows} />
        </Card>
      )}

      {availableFrom > 0 && availableTo > 0 && (
        <p className="text-xs text-[var(--color-nes-ink-2)] nes-dark:text-[var(--color-nes-d-ink-2)]">
          Available range: {availableRangeText({
            availableStart: availableFrom,
            availableEnd: availableTo,
          })} · {status === "DEMO" ? "Synthetic fixtures — not live data" : ""}
        </p>
      )}
    </div>
  );
}
        </div>
        </div>
    refresh();
  }, [symbol, exchange, timeframe, fromMs, toMs, refresh]);

  const showEmpty = !loading && !error && candles.length === 0;
  const showLoading = loading && candles.length === 0;

  const data: ChartDataSet = {
    symbol,
    exchange,
    candles,
    source,
    status,
    isLive,
    lastUpdatedAt: Date.now(),
    note: "All values synthetic — demo only.",
    availableStart: availableFrom,
    availableEnd: availableTo,
  };


