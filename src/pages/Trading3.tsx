import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../charts/apiConfig";
import { Badge, Button, Card, EmptyState, MetricCard, PageHeader } from "../components/ui";

export function StrategiesPage() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Trading — Strategies" description={<>Versioned strategy placeholders. <Badge>DEMO</Badge></>} />
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-semibold">SMA cross (demo) · v1</h2>
          <Badge tone="info">VERSIONED</Badge>
        </div>
        <p className="mt-1 text-sm text-[var(--color-nes-ink-2)] nes-dark:text-[var(--color-nes-d-ink-2)]">
          Rules (illustrative): buy when 20-bar SMA crosses above 50-bar SMA on
          demo daily bars; exit on reverse cross. Parameters are placeholders.
        </p>
        <div className="mt-3">
          <Link to="/trading/backtesting"><Button>Open in backtesting</Button></Link>
        </div>
      </Card>
      <EmptyState title="No more strategies yet" body="Strategy authoring arrives in a later phase. This placeholder lists the single demo strategy used by the backtest fixture." />
    </div>
  );
}

interface Instrument { id: number; exchange: string; symbol: string; name: string; currency: string; }
interface Coverage {
  candle_count: number; first_ts: number | null; last_ts: number | null; duplicate_records: number;
  invalid_records: number; gaps: { from_ts: number; to_ts: number; gap_ms: number }[];
  warnings: string[]; limitations: string[]; status: string; source: string; is_live: boolean;
}
interface BacktestMetrics {
  initial_capital: number; final_equity: number; net_profit: number; net_return_pct: number;
  gross_profit: number; total_costs: number; completed_trades: number; win_rate: number | null;
  avg_win: number | null; avg_loss: number | null; max_drawdown_pct: number; exposure_pct: number;
  sharpe_ratio: number | null;
}
interface BacktestTrade {
  entry_ts: number; exit_ts: number; entry_price: number; exit_price: number; quantity: number;
  gross_pnl: number; costs: number; net_pnl: number;
}
interface BacktestResult {
  id: number; status: string; error_message: string | null; candle_count: number;
  dataset_first_ts: number | null; dataset_last_ts: number | null; split_ts: number | null;
  metrics: BacktestMetrics | null; equity_curve: { ts: number; equity: number }[];
  trades: BacktestTrade[]; assumptions: string[]; warnings: string[];
}

export function BacktestingPage() {
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [exchange, setExchange] = useState("NSE");
  const [symbol, setSymbol] = useState("");
  const [shortPeriod, setShortPeriod] = useState(5);
  const [longPeriod, setLongPeriod] = useState(20);
  const [initialCapital, setInitialCapital] = useState(100000);
  const [allocation, setAllocation] = useState(1);
  const [costBps, setCostBps] = useState(10);
  const [slippageBps, setSlippageBps] = useState(5);
  const [split, setSplit] = useState(false);
  const [coverage, setCoverage] = useState<Coverage | null>(null);
  const [result, setResult] = useState<BacktestResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/v1/instruments`)
      .then((r) => r.json())
      .then((data: Instrument[]) => {
        setInstruments(data);
        if (data.length) {
          setExchange(data[0].exchange);
          setSymbol(data[0].symbol);
        }
      })
      .catch(() => setError("Backend unavailable."));
  }, []);

  const filtered = instruments.filter((i) => i.exchange === exchange);

  useEffect(() => {
    if (!symbol) return;
    let cancelled = false;
    fetch(`${API_BASE_URL}/api/v1/coverage?exchange=${exchange}&symbol=${encodeURIComponent(symbol)}`)
      .then((r) => r.json())
      .then((data: Coverage) => { if (!cancelled) setCoverage(data); })
      .catch(() => { if (!cancelled) setCoverage(null); });
    return () => { cancelled = true; };
  }, [exchange, symbol]);

  const activeCoverage = symbol ? coverage : null;

  async function run() {
    if (!activeCoverage || activeCoverage.candle_count === 0) {
      setError("No imported history for selected instrument.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    const body: Record<string, unknown> = {
      exchange,
      symbol,
      strategy: "sma_crossover",
      short_period: shortPeriod,
      long_period: longPeriod,
      start_ms: activeCoverage.first_ts,
      end_ms: activeCoverage.last_ts,
      initial_capital: initialCapital,
      allocation_pct: allocation,
      cost_bps: costBps,
      slippage_bps: slippageBps,
    };
    if (split && activeCoverage.first_ts && activeCoverage.last_ts) {
      body.split_ms = activeCoverage.first_ts + Math.floor((activeCoverage.last_ts - activeCoverage.first_ts) / 2);
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/backtests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.detail || `HTTP ${res.status}`);
      }
      setResult(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Backtest failed.");
    } finally {
      setLoading(false);
    }
  }

  const insufficient = !activeCoverage || activeCoverage.candle_count < longPeriod + 2;

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Trading — Backtesting" description={<>Reproducible historical runs using imported data. <Badge>IMPORTED · NOT PREDICTIVE</Badge></>} />
      <Card>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="flex flex-col gap-1 text-sm">
            <span>Exchange</span>
            <select className="rounded border border-[var(--color-nes-line)] bg-transparent p-2" value={exchange} onChange={(e) => { setExchange(e.target.value); setSymbol(""); }}>
              {"NSE,BSE".split(",").map((x) => <option key={x} value={x}>{x}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span>Symbol</span>
            <select className="rounded border border-[var(--color-nes-line)] bg-transparent p-2" value={symbol} onChange={(e) => setSymbol(e.target.value)}>
              <option value="">Select…</option>
              {filtered.map((i) => <option key={i.id} value={i.symbol}>{i.symbol}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span>Short period</span>
            <input type="number" className="rounded border border-[var(--color-nes-line)] bg-transparent p-2" value={shortPeriod} onChange={(e) => setShortPeriod(Number(e.target.value))} />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span>Long period</span>
            <input type="number" className="rounded border border-[var(--color-nes-line)] bg-transparent p-2" value={longPeriod} onChange={(e) => setLongPeriod(Number(e.target.value))} />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span>Initial capital</span>
            <input type="number" className="rounded border border-[var(--color-nes-line)] bg-transparent p-2" value={initialCapital} onChange={(e) => setInitialCapital(Number(e.target.value))} />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span>Allocation (0-1)</span>
            <input type="number" step="0.1" className="rounded border border-[var(--color-nes-line)] bg-transparent p-2" value={allocation} onChange={(e) => setAllocation(Number(e.target.value))} />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span>Cost (bps)</span>
            <input type="number" className="rounded border border-[var(--color-nes-line)] bg-transparent p-2" value={costBps} onChange={(e) => setCostBps(Number(e.target.value))} />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span>Slippage (bps)</span>
            <input type="number" className="rounded border border-[var(--color-nes-line)] bg-transparent p-2" value={slippageBps} onChange={(e) => setSlippageBps(Number(e.target.value))} />
          </label>
        </div>
        <label className="mt-3 flex items-center gap-2 text-sm">
          <input type="checkbox" checked={split} onChange={(e) => setSplit(e.target.checked)} />
          Walk-forward split (train/test, out-of-sample only)
        </label>
        {activeCoverage && (
          <div className="mt-3 text-xs text-[var(--color-nes-ink-2)] nes-dark:text-[var(--color-nes-d-ink-2)]">
            activeCoverage: {activeCoverage.candle_count} candles · {activeCoverage.first_ts} → {activeCoverage.last_ts}
            {activeCoverage.warnings.length > 0 && <span className="ml-2 text-amber-600">{activeCoverage.warnings.join("; ")}</span>}
          </div>
        )}
        {insufficient && (
          <div className="mt-3 rounded border border-amber-500/40 bg-amber-500/10 p-2 text-sm text-amber-700 dark:text-amber-300">
            Selected history is insufficient for the chosen long period.
          </div>
        )}
        <div className="mt-4 flex gap-2">
          <Button onClick={run} disabled={loading || insufficient || !symbol}>
            {loading ? "Running…" : "Run backtest"}
          </Button>
        </div>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </Card>
      {result && result.metrics && (
        <Card>
          <h2 className="text-base font-semibold">Results · run {result.id} · {result.status}</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard label="Net return" value={`${result.metrics.net_return_pct.toFixed(2)}%`} badge={<Badge>IMPORTED</Badge>} />
            <MetricCard label="Net profit" value={result.metrics.net_profit.toFixed(2)} />
            <MetricCard label="Max drawdown" value={`${result.metrics.max_drawdown_pct.toFixed(2)}%`} />
            <MetricCard label="Trades" value={String(result.metrics.completed_trades)} />
            <MetricCard label="Win rate" value={result.metrics.win_rate !== null ? `${(result.metrics.win_rate * 100).toFixed(1)}%` : "n/a"} />
            <MetricCard label="Total costs" value={result.metrics.total_costs.toFixed(2)} />
            <MetricCard label="Exposure" value={`${result.metrics.exposure_pct.toFixed(1)}%`} />
            <MetricCard label="Final equity" value={result.metrics.final_equity.toFixed(2)} />
          </div>
          <p className="mt-4 text-xs text-[var(--color-nes-ink-2)] nes-dark:text-[var(--color-nes-d-ink-2)]">
            Assumptions: {result.assumptions.join(" ")}
          </p>
          {result.warnings.length > 0 && <p className="mt-2 text-xs text-amber-600">{result.warnings.join("; ")}</p>}
          <p className="mt-2 text-xs text-[var(--color-nes-ink-2)] nes-dark:text-[var(--color-nes-d-ink-2)]">
            Historical performance does not guarantee future results. Simulation is an approximation.
          </p>
          {result.trades.length > 0 && (
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-xs">
                <thead><tr><th className="px-2 py-1 text-left">Entry</th><th className="px-2 py-1 text-left">Exit</th><th className="px-2 py-1 text-right">Qty</th><th className="px-2 py-1 text-right">Net PnL</th></tr></thead>
                <tbody>
                  {result.trades.map((t, i) => (
                    <tr key={i} className="border-t border-[var(--color-nes-line)]">
                      <td className="px-2 py-1">{t.entry_ts}</td>
                      <td className="px-2 py-1">{t.exit_ts}</td>
                      <td className="px-2 py-1 text-right">{t.quantity}</td>
                      <td className="px-2 py-1 text-right">{t.net_pnl.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
      {!result && (
        <EmptyState title="No run yet" body="Configure parameters and run a backtest against imported history." />
      )}
    </div>
  );
}

export function MotionLabPage() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Trading — Motion Lab" description={<>Structured placeholder. <Badge>DEMO</Badge></>} />
    </div>
  );
}

